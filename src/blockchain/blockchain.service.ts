import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { Campaign, CampaignDocument } from '../campaign/schemas/campaign.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from './schemas/transaction.schema';
import { CampaignService } from '../campaign/campaign.service';

// Contract ABIs (simplified for this example)
const CAMPAIGN_FACTORY_ABI = [
  "function createCampaign(address startup, string title, string description, uint256 goal, uint256 duration, string[] milestoneDescriptions, uint256[] milestoneAmounts) returns (address)",
  "function getDeployedCampaigns() view returns (address[])",
  "function getCampaignSummary(address campaign) view returns (address startup, string title, uint256 goal, uint256 totalRaised, uint256 deadline, uint8 state, uint256 contributorsCount, uint256 progress)",
  "event CampaignCreated(address indexed campaignAddress, address indexed startup, string title, uint256 goal, uint256 deadline, uint256 timestamp)"
];

const CAMPAIGN_ABI = [
  "function contribute() payable",
  "function getRefund()",
  "function completeMilestone(uint256 milestoneIndex)",
  "function withdrawMilestoneFunds(uint256 milestoneIndex)",
  "function getCampaignInfo() view returns (address startup, string title, string description, uint256 goal, uint256 deadline, uint256 totalRaised, uint8 state, uint256 contributorsCount)",
  "function getProgress() view returns (uint256)",
  "function contributions(address) view returns (uint256)",
  "event ContributionMade(address indexed contributor, uint256 amount, uint256 totalRaised)",
  "event MilestoneCompleted(uint256 indexed milestoneIndex, uint256 amount)",
  "event FundsWithdrawn(uint256 amount, uint256 milestoneIndex)",
  "event RefundIssued(address indexed contributor, uint256 amount)"
];

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private factoryContract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private configService: ConfigService,
    private campaignService: CampaignService,
  ) {
    this.initializeBlockchain();
  }

  private async initializeBlockchain() {
    try {
      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL', 'http://localhost:8545');
      const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
      const factoryAddress = this.configService.get<string>('CAMPAIGN_FACTORY_ADDRESS');

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      if (privateKey) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
      }

      if (factoryAddress) {
        this.factoryContract = new ethers.Contract(
          factoryAddress,
          CAMPAIGN_FACTORY_ABI,
          this.wallet || this.provider
        );
        
        // Listen for campaign creation events
        this.factoryContract.on('CampaignCreated', this.handleCampaignCreated.bind(this));
      }

      this.logger.log('Blockchain service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain service:', error);
    }
  }

  async createCampaignOnBlockchain(campaignData: {
    startup: string;
    title: string;
    description: string;
    goal: string;
    duration: number;
    milestoneDescriptions: string[];
    milestoneAmounts: string[];
  }): Promise<{ txHash: string; contractAddress?: string }> {
    try {
      if (!this.factoryContract || !this.wallet) {
        throw new Error('Blockchain not properly initialized');
      }

      const tx = await this.factoryContract.createCampaign(
        campaignData.startup,
        campaignData.title,
        campaignData.description,
        ethers.parseEther(campaignData.goal),
        campaignData.duration,
        campaignData.milestoneDescriptions,
        campaignData.milestoneAmounts.map(amount => ethers.parseEther(amount))
      );

      // Save transaction to database
      await this.saveTransaction({
        txHash: tx.hash,
        type: TransactionType.CAMPAIGN_CREATION,
        fromAddress: this.wallet.address,
        toAddress: await this.factoryContract.getAddress(),
        amount: '0',
        metadata: campaignData,
      });

      this.logger.log(`Campaign creation transaction sent: ${tx.hash}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract campaign address from events
      const campaignCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.factoryContract.interface.parseLog(log);
          return parsed?.name === 'CampaignCreated';
        } catch {
          return false;
        }
      });

      let contractAddress;
      if (campaignCreatedEvent) {
        const parsed = this.factoryContract.interface.parseLog(campaignCreatedEvent);
        contractAddress = parsed?.args.campaignAddress;
      }

      // Update transaction status
      await this.updateTransactionStatus(tx.hash, TransactionStatus.CONFIRMED, {
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        contractAddress,
      });

      return { txHash: tx.hash, contractAddress };
    } catch (error) {
      this.logger.error('Failed to create campaign on blockchain:', error);
      throw new BadRequestException('Failed to create campaign on blockchain');
    }
  }

  async contributeToCampaign(campaignAddress: string, amount: string, contributorAddress: string): Promise<string> {
    try {
      const campaignContract = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      
      // Create transaction data for frontend to sign
      const data = campaignContract.interface.encodeFunctionData('contribute', []);
      
      return data;
    } catch (error) {
      this.logger.error('Failed to prepare contribution transaction:', error);
      throw new BadRequestException('Failed to prepare contribution transaction');
    }
  }

  async handleContribution(txHash: string, campaignAddress: string, contributorAddress: string, amount: string) {
    try {
      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        throw new Error('Transaction not found');
      }

      // Find the campaign in database
      const campaign = await this.campaignModel.findOne({ address: campaignAddress });
      if (!campaign) {
        throw new Error('Campaign not found in database');
      }

      // Update campaign in database
      await this.campaignService.updateCampaignAmount(campaign._id.toString(), parseFloat(ethers.formatEther(amount)));

      // Save transaction
      await this.saveTransaction({
        txHash,
        type: TransactionType.CONTRIBUTION,
        fromAddress: contributorAddress,
        toAddress: campaignAddress,
        amount: ethers.formatEther(amount),
        status: TransactionStatus.CONFIRMED,
        campaignId: campaign._id as any,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString() || '0',
        gasPrice: receipt.gasPrice?.toString() || '0',
      });

      this.logger.log(`Contribution processed: ${txHash}`);
    } catch (error) {
      this.logger.error('Failed to handle contribution:', error);
      throw error;
    }
  }

  async syncCampaignFromBlockchain(campaignAddress: string): Promise<void> {
    try {
      const campaignContract = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      
      // Get campaign info from blockchain
      const [startup, title, description, goal, deadline, totalRaised, state, contributorsCount] = 
        await campaignContract.getCampaignInfo();

      // Find campaign in database
      const campaign = await this.campaignModel.findOne({ address: campaignAddress });
      if (!campaign) {
        this.logger.warn(`Campaign ${campaignAddress} not found in database`);
        return;
      }

      // Update campaign data
      await this.campaignModel.findByIdAndUpdate(campaign._id, {
        currentAmount: parseFloat(ethers.formatEther(totalRaised)),
        backers: contributorsCount.toString(),
        // Map blockchain state to database state
        status: this.mapBlockchainState(state),
      });

      this.logger.log(`Campaign ${campaignAddress} synced from blockchain`);
    } catch (error) {
      this.logger.error(`Failed to sync campaign ${campaignAddress}:`, error);
    }
  }

  private async saveTransaction(transactionData: Partial<Transaction>): Promise<TransactionDocument> {
    const transaction = new this.transactionModel({
      ...transactionData,
      status: transactionData.status || TransactionStatus.PENDING,
    });
    return transaction.save();
  }

  private async updateTransactionStatus(
    txHash: string, 
    status: TransactionStatus, 
    updateData?: Partial<Transaction>
  ): Promise<void> {
    await this.transactionModel.findOneAndUpdate(
      { txHash },
      { status, ...updateData },
      { new: true }
    );
  }

  private async handleCampaignCreated(
    campaignAddress: string,
    startup: string,
    title: string,
    goal: bigint,
    deadline: bigint,
    timestamp: bigint
  ) {
    this.logger.log(`New campaign created: ${campaignAddress}`);
    
    // Update the campaign in database with the contract address
    await this.campaignModel.findOneAndUpdate(
      { startup, title },
      { address: campaignAddress },
      { sort: { createdAt: -1 } } // Get the most recent campaign
    );
  }

  private mapBlockchainState(state: number): string {
    const stateMap = {
      0: 'active',
      1: 'funded',
      2: 'failed',
      3: 'cancelled',
    };
    return stateMap[state] || 'active';
  }

  // Public methods for frontend integration
  async getCampaignContract(address: string) {
    return new ethers.Contract(address, CAMPAIGN_ABI, this.provider);
  }

  async getTransactionHistory(campaignId?: string, address?: string): Promise<TransactionDocument[]> {
    const filter: any = {};
    
    if (campaignId) {
      filter.campaignId = campaignId;
    }
    
    if (address) {
      filter.$or = [
        { fromAddress: address },
        { toAddress: address }
      ];
    }

    return this.transactionModel
      .find(filter)
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber,
        factoryAddress: await this.factoryContract?.getAddress(),
      };
    } catch (error) {
      this.logger.error('Failed to get network info:', error);
      return null;
    }
  }
}
