import { Expose, Transform, Type } from 'class-transformer';
import { Campaign } from '../../campaign/schemas/campaign.schema';
import { Review } from '../schemas/review.schema';
import { SocialLinks, KeyMetric, Milestone } from '../interfaces/startup.interface';

export class StartupResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  walletAddress: string;

  @Expose()
  location: string;

  @Expose()
  logo?: string;

  @Expose()
  coverImage?: string;

  @Expose()
  field: string;

  @Expose()
  description: string;

  @Expose()
  longDescription?: string;

  @Expose()
  motives: string[];

  @Expose()
  foundedYear: number;

  @Expose()
  teamSize: number;

  @Expose()
  website?: string;

  @Expose()
  socialLinks?: SocialLinks;

  @Expose()
  keyMetrics?: KeyMetric[];

  @Expose()
  milestones?: Milestone[];

  @Expose()
  firstFundedDate?: Date;

  @Expose()
  @Type(() => Campaign)
  campaigns: Campaign[];

  @Expose()
  @Type(() => Review)
  reviews: Review[];

  @Expose()
  @Transform(({ obj }) => {
    return obj.campaigns?.reduce((sum: number, campaign: Campaign) => sum + (campaign.currentAmount || 0), 0) || 0;
  })
  totalFundsRaised: number;

  @Expose()
  @Transform(({ obj }) => 
    obj.campaigns?.filter((campaign: Campaign) => campaign.status === 'active').length || 0
  )
  activeCampaigns: number;

  @Expose()
  @Transform(({ obj }) => 
    obj.campaigns?.filter((campaign: Campaign) => campaign.status === 'completed').length || 0
  )
  completedCampaigns: number;

  @Expose()
  @Transform(({ obj }) => {
    const total = obj.reviews?.length || 0;
    const sum = obj.reviews?.reduce((acc: number, review: Review) => acc + review.rating, 0) || 0;
    return total > 0 ? sum / total : 0;
  })
  averageRating: number;

  @Expose()
  @Transform(({ obj }) => obj.reviews?.length || 0)
  totalReviews: number;
} 