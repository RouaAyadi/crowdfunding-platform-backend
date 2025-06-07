import { ApiProperty } from '@nestjs/swagger';

export class InvestorDashboardDto {
  @ApiProperty({ description: 'Investor name' })
  name: string;

  @ApiProperty({ description: 'Investor wallet address' })
  walletAddress: string;

  @ApiProperty({ description: 'Total amount invested across all campaigns' })
  totalInvested: number;

  @ApiProperty({ description: 'Total number of campaigns invested in' })
  totalCampaigns: number;

  @ApiProperty({ description: 'Number of successful startups invested in' })
  successfulStartups: number;

  @ApiProperty({ description: 'List of invested campaigns' })
  investedCampaigns: {
    id: string;
    title: string;
    name: string;
    description: string;
    goalAmount: number;
    amountRaised: number;
    currentState: string;
    tags: string[];
    image: string;
    startupId: string;
    startupName: string;
    endDate: string;
    backers: number;
    daysLeft: number;
  }[];
} 