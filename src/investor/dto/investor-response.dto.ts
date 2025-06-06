import { Expose, Transform, Type } from 'class-transformer';
import { Campaign } from '../../campaign/schemas/campaign.schema';

export class InvestorResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  walletAddress: string;

  @Expose()
  @Transform(({ obj }) => {
    return obj.investments?.reduce((sum: number, campaign: Campaign) => sum + (campaign.currentAmount || 0), 0) || 0;
  })
  totalInvested: number;

  @Expose()
  @Transform(({ obj }) => obj.investments?.length || 0)
  totalCampaigns: number;

  @Expose()
  @Transform(({ obj }) => {
    return obj.investments?.filter((campaign: Campaign) => campaign.status === 'funded').length || 0;
  })
  successfulStartups: number;

  @Expose()
  @Type(() => Campaign)
  investments: Campaign[];
} 