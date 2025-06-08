import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Request,
  BadRequestException 
} from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('campaigns/create')
  @UseGuards(JwtAuthGuard)
  async createCampaign(
    @Body() createCampaignDto: {
      startup: string;
      title: string;
      description: string;
      goal: string;
      duration: number;
      milestoneDescriptions: string[];
      milestoneAmounts: string[];
    },
    @Request() req: any
  ) {
    try {
      const result = await this.blockchainService.createCampaignOnBlockchain(createCampaignDto);
      return {
        success: true,
        txHash: result.txHash,
        contractAddress: result.contractAddress,
        message: 'Campaign creation transaction submitted'
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('campaigns/:address/contribute')
  @UseGuards(JwtAuthGuard)
  async prepareCampaignContribution(
    @Param('address') campaignAddress: string,
    @Body() contributeDto: { amount: string },
    @Request() req: any
  ) {
    try {
      const transactionData = await this.blockchainService.contributeToCampaign(
        campaignAddress,
        contributeDto.amount,
        req.user.walletAddress
      );
      
      return {
        success: true,
        transactionData,
        to: campaignAddress,
        value: contributeDto.amount,
        message: 'Transaction data prepared for signing'
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('transactions/contribution/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmContribution(
    @Body() confirmDto: {
      txHash: string;
      campaignAddress: string;
      amount: string;
    },
    @Request() req: any
  ) {
    try {
      await this.blockchainService.handleContribution(
        confirmDto.txHash,
        confirmDto.campaignAddress,
        req.user.walletAddress,
        confirmDto.amount
      );
      
      return {
        success: true,
        message: 'Contribution confirmed and processed'
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('campaigns/:address/sync')
  async syncCampaign(@Param('address') campaignAddress: string) {
    try {
      await this.blockchainService.syncCampaignFromBlockchain(campaignAddress);
      return {
        success: true,
        message: 'Campaign synced from blockchain'
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getTransactions(
    @Query('campaignId') campaignId?: string,
    @Query('address') address?: string,
    @Request() req?: any
  ) {
    try {
      const userAddress = address || req.user.walletAddress;
      const transactions = await this.blockchainService.getTransactionHistory(campaignId, userAddress);
      
      return {
        success: true,
        transactions
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('network-info')
  async getNetworkInfo() {
    try {
      const networkInfo = await this.blockchainService.getNetworkInfo();
      return {
        success: true,
        network: networkInfo
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('campaigns/:address/contract')
  async getCampaignContract(@Param('address') campaignAddress: string) {
    try {
      const contract = await this.blockchainService.getCampaignContract(campaignAddress);
      const info = await contract.getCampaignInfo();
      
      return {
        success: true,
        contractAddress: campaignAddress,
        info: {
          startup: info[0],
          title: info[1],
          description: info[2],
          goal: info[3].toString(),
          deadline: info[4].toString(),
          totalRaised: info[5].toString(),
          state: info[6],
          contributorsCount: info[7].toString()
        }
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
