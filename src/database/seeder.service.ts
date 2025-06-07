import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Schemas
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Startup, StartupDocument } from '../startup/schemas/startup.schema';
import { Investor, InvestorDocument } from '../investor/schemas/investor.schema';
import { Campaign, CampaignDocument } from '../campaign/schemas/campaign.schema';
import { Review } from '../startup/schemas/review.schema';

// Enums
import { campaignStatus } from '../campaign/campaign-status.enum';

@Injectable()
export class DatabaseSeederService {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Startup.name) private startupModel: Model<StartupDocument>,
    @InjectModel(Investor.name) private investorModel: Model<InvestorDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
  ) {}

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting database seeding...');

      // Clear existing data
      await this.clearDatabase();

      // Seed data in order
      const investors = await this.seedInvestors();
      const startups = await this.seedStartups();
      const campaigns = await this.seedCampaigns(startups);
      await this.seedCampaignComments(campaigns, investors);
      await this.seedStartupReviews(startups, investors);

      this.logger.log('Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
      throw error;
    }
  }

  private async clearDatabase(): Promise<void> {
    this.logger.log('Clearing existing data...');
    await Promise.all([
      this.campaignModel.deleteMany({}),
      this.startupModel.deleteMany({}),
      this.investorModel.deleteMany({}),
      this.userModel.deleteMany({}),
    ]);
    this.logger.log('Database cleared successfully');
  }

  private async seedInvestors(): Promise<any[]> {
    this.logger.log('Seeding investors...');
    
    const investorsData = [
      {
        walletAddress: '0x1234567890123456789012345678901234567890',
        role: 'investor',
        name: 'Alice Johnson',
        nickname: 'CryptoAlice',
        investments: [],
      },
      {
        walletAddress: '0x2345678901234567890123456789012345678901',
        role: 'investor',
        name: 'Bob Smith',
        nickname: 'BlockchainBob',
        investments: [],
      },
      {
        walletAddress: '0x3456789012345678901234567890123456789012',
        role: 'investor',
        name: 'Carol Davis',
        nickname: 'DeFiCarol',
        investments: [],
      },
      {
        walletAddress: '0x4567890123456789012345678901234567890123',
        role: 'investor',
        name: 'David Wilson',
        nickname: 'TechDavid',
        investments: [],
      },
      {
        walletAddress: '0x5678901234567890123456789012345678901234',
        role: 'investor',
        name: 'Eva Martinez',
        nickname: 'InvestorEva',
        investments: [],
      },
    ];

    const investors = await this.investorModel.insertMany(investorsData);
    this.logger.log(`Created ${investors.length} investors`);
    return investors;
  }

  private async seedStartups(): Promise<any[]> {
    this.logger.log('Seeding startups...');

    const startupsData = [
      {
        walletAddress: '0xa123456789012345678901234567890123456789',
        role: 'startup',
        name: 'EcoTech Solutions',
        location: 'San Francisco, CA',
        field: 'Clean Technology',
        description: 'Revolutionary solar panel technology for urban environments',
        longDescription: 'EcoTech Solutions is pioneering the next generation of solar panel technology specifically designed for urban environments. Our innovative panels are 40% more efficient than traditional solar panels and can be seamlessly integrated into building facades.',
        motives: [
          'Reduce carbon footprint in urban areas',
          'Make renewable energy accessible to everyone',
          'Create sustainable cities of the future'
        ],
        foundedYear: 2021,
        teamSize: 15,
        website: 'https://ecotech-solutions.com',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
        coverImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
        socialLinks: {
          linkedin: 'https://linkedin.com/company/ecotech-solutions',
          twitter: 'https://twitter.com/ecotechsol',
        },
        keyMetrics: [
          { label: 'Energy Efficiency', value: '40% increase' },
          { label: 'Cost Reduction', value: '25% lower' },
          { label: 'Installation Time', value: '50% faster' }
        ],
        milestones: [
          {
            title: 'Prototype Development',
            description: 'Completed first working prototype',
            date: new Date('2021-06-01'),
            completed: true
          },
          {
            title: 'Pilot Testing',
            description: 'Testing with 10 buildings in SF',
            date: new Date('2022-03-01'),
            completed: true
          },
          {
            title: 'Series A Funding',
            description: 'Raise $5M for scaling production',
            date: new Date('2024-06-01'),
            completed: false
          }
        ],
        campaigns: [],
        reviews: [],
        firstFundedDate: new Date('2022-01-15'),
      },
      {
        walletAddress: '0xb234567890123456789012345678901234567890',
        role: 'startup',
        name: 'HealthAI Labs',
        location: 'Boston, MA',
        field: 'Healthcare Technology',
        description: 'AI-powered diagnostic tools for early disease detection',
        longDescription: 'HealthAI Labs develops cutting-edge artificial intelligence solutions for healthcare providers. Our flagship product uses machine learning to analyze medical images and detect early signs of diseases with 95% accuracy.',
        motives: [
          'Improve early disease detection rates',
          'Reduce healthcare costs through prevention',
          'Make advanced diagnostics accessible globally'
        ],
        foundedYear: 2020,
        teamSize: 25,
        website: 'https://healthai-labs.com',
        logo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200',
        coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
        socialLinks: {
          linkedin: 'https://linkedin.com/company/healthai-labs',
          twitter: 'https://twitter.com/healthailabs',
        },
        keyMetrics: [
          { label: 'Diagnostic Accuracy', value: '95%' },
          { label: 'Processing Speed', value: '10x faster' },
          { label: 'Cost Reduction', value: '60% lower' }
        ],
        milestones: [
          {
            title: 'FDA Approval',
            description: 'Received FDA clearance for our AI diagnostic tool',
            date: new Date('2023-01-15'),
            completed: true
          },
          {
            title: 'Hospital Partnerships',
            description: 'Partner with 50 hospitals nationwide',
            date: new Date('2024-12-01'),
            completed: false
          }
        ],
        campaigns: [],
        reviews: [],
        firstFundedDate: new Date('2021-08-20'),
      },
      {
        walletAddress: '0xc345678901234567890123456789012345678901',
        role: 'startup',
        name: 'FoodTech Innovations',
        location: 'Austin, TX',
        field: 'Food Technology',
        description: 'Sustainable food production using vertical farming',
        longDescription: 'FoodTech Innovations revolutionizes agriculture through advanced vertical farming techniques. Our automated systems use 90% less water and produce 10x more food per square foot than traditional farming.',
        motives: [
          'Address global food security challenges',
          'Reduce environmental impact of agriculture',
          'Bring fresh produce to urban areas'
        ],
        foundedYear: 2022,
        teamSize: 12,
        website: 'https://foodtech-innovations.com',
        logo: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200',
        coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
        socialLinks: {
          linkedin: 'https://linkedin.com/company/foodtech-innovations',
          twitter: 'https://twitter.com/foodtechinno',
        },
        keyMetrics: [
          { label: 'Water Usage', value: '90% reduction' },
          { label: 'Yield Increase', value: '10x higher' },
          { label: 'Growth Speed', value: '3x faster' }
        ],
        milestones: [
          {
            title: 'First Facility',
            description: 'Open first commercial vertical farm',
            date: new Date('2023-06-01'),
            completed: true
          },
          {
            title: 'Scale Operations',
            description: 'Expand to 10 cities across the US',
            date: new Date('2025-01-01'),
            completed: false
          }
        ],
        campaigns: [],
        reviews: [],
        firstFundedDate: new Date('2023-03-10'),
      },
    ];

    const startups = await this.startupModel.insertMany(startupsData);
    this.logger.log(`Created ${startups.length} startups`);
    return startups;
  }

  private async seedCampaigns(startups: any[]): Promise<any[]> {
    this.logger.log('Seeding campaigns...');

    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);

    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);

    const campaignsData = [
      {
        title: 'Next-Gen Solar Panels for Smart Cities',
        description: 'Help us revolutionize urban energy with our breakthrough solar panel technology that integrates seamlessly into building facades and delivers 40% higher efficiency.',
        startup: startups[0]._id,
        targetAmount: 500000,
        currentAmount: 325000,
        startDate: pastDate,
        endDate: futureDate,
        status: campaignStatus.ACTIVE,
        address: '0xSolar123456789012345678901234567890123456',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',
        tags: ['clean-tech', 'solar', 'urban', 'sustainability'],
        backers: 156,
        comments: [],
      },
      {
        title: 'AI-Powered Medical Diagnostics Platform',
        description: 'Support the development of our revolutionary AI system that can detect diseases 10x faster than traditional methods with 95% accuracy.',
        startup: startups[1]._id,
        targetAmount: 750000,
        currentAmount: 450000,
        startDate: pastDate,
        endDate: futureDate,
        status: campaignStatus.ACTIVE,
        address: '0xHealth123456789012345678901234567890123456',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600',
        tags: ['healthcare', 'ai', 'diagnostics', 'medical'],
        backers: 203,
        comments: [],
      },
      {
        title: 'Vertical Farming Revolution',
        description: 'Join us in transforming agriculture with our automated vertical farming systems that use 90% less water and produce 10x more food.',
        startup: startups[2]._id,
        targetAmount: 300000,
        currentAmount: 180000,
        startDate: pastDate,
        endDate: futureDate,
        status: campaignStatus.ACTIVE,
        address: '0xFood123456789012345678901234567890123456',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
        tags: ['agriculture', 'sustainability', 'food-tech', 'vertical-farming'],
        backers: 89,
        comments: [],
      },
      {
        title: 'EcoTech Expansion Fund',
        description: 'Help us scale our solar technology to 100 cities worldwide and accelerate the transition to renewable energy.',
        startup: startups[0]._id,
        targetAmount: 1000000,
        currentAmount: 750000,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: campaignStatus.FUNDED,
        address: '0xEcoExpansion123456789012345678901234567890',
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600',
        tags: ['expansion', 'solar', 'global', 'clean-energy'],
        backers: 342,
        comments: [],
      },
      {
        title: 'HealthAI Research Initiative',
        description: 'Fund our next breakthrough in AI-powered cancer detection technology that could save millions of lives.',
        startup: startups[1]._id,
        targetAmount: 2000000,
        currentAmount: 125000,
        startDate: now,
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        status: campaignStatus.ACTIVE,
        address: '0xCancer123456789012345678901234567890123456',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600',
        tags: ['research', 'cancer', 'ai', 'healthcare'],
        backers: 67,
        comments: [],
      },
    ];

    const campaigns = await this.campaignModel.insertMany(campaignsData);
    this.logger.log(`Created ${campaigns.length} campaigns`);

    // Update startup campaigns references
    for (let i = 0; i < startups.length; i++) {
      const startupCampaigns = campaigns.filter(campaign =>
        campaign.startup.toString() === startups[i]._id.toString()
      );
      await this.startupModel.findByIdAndUpdate(
        startups[i]._id,
        { campaigns: startupCampaigns.map(c => c._id) }
      );
    }

    return campaigns;
  }

  private async seedCampaignComments(campaigns: any[], investors: any[]): Promise<void> {
    this.logger.log('Seeding campaign comments...');

    const comments = [
      {
        author: investors[0]._id,
        text: 'This is exactly what the world needs! Solar technology that actually works in urban environments. Count me in!',
        isEdited: false,
      },
      {
        author: investors[1]._id,
        text: 'Amazing progress on the efficiency improvements. Looking forward to seeing this deployed in my city.',
        isEdited: false,
      },
      {
        author: investors[2]._id,
        text: 'The potential impact of this technology is huge. Great work on the prototype testing!',
        isEdited: false,
      },
      {
        author: investors[3]._id,
        text: 'AI in healthcare is the future. This diagnostic tool could revolutionize early detection.',
        isEdited: false,
      },
      {
        author: investors[4]._id,
        text: 'Vertical farming is so important for food security. Love the water efficiency metrics!',
        isEdited: false,
      },
    ];

    // Add comments to campaigns
    for (let i = 0; i < campaigns.length && i < comments.length; i++) {
      await this.campaignModel.findByIdAndUpdate(
        campaigns[i]._id,
        { $push: { comments: comments[i] } }
      );
    }

    this.logger.log('Campaign comments seeded successfully');
  }

  private async seedStartupReviews(startups: any[], investors: any[]): Promise<void> {
    this.logger.log('Seeding startup reviews...');

    const reviews = [
      {
        reviewer: investors[0]._id,
        rating: 5,
        content: 'Outstanding team with a clear vision for the future of clean energy. Their technology is truly innovative.',
      },
      {
        reviewer: investors[1]._id,
        rating: 4,
        content: 'Impressive progress and strong execution. Looking forward to their next milestones.',
      },
      {
        reviewer: investors[2]._id,
        rating: 5,
        content: 'Revolutionary approach to healthcare AI. The team has deep expertise and the results speak for themselves.',
      },
      {
        reviewer: investors[3]._id,
        rating: 4,
        content: 'Great potential in the food tech space. The vertical farming technology is promising.',
      },
    ];

    // Add reviews to startups
    for (let i = 0; i < startups.length && i < reviews.length; i++) {
      await this.startupModel.findByIdAndUpdate(
        startups[i]._id,
        { $push: { reviews: reviews[i] } }
      );
    }

    this.logger.log('Startup reviews seeded successfully');
  }
}
