import { IsMongoId, IsNumber, Min } from 'class-validator';

export class AddInvestmentDto {
  @IsMongoId()
  campaignId: string;

  @IsNumber()
  @Min(0)
  amount: number;
} 