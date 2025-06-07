import { IsString, IsNumber, IsOptional, IsUrl, Min, IsArray, IsDateString } from 'class-validator';

export class LaunchCampaignDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  longDescription?: string;

  @IsNumber()
  @Min(0)
  fundingGoal: number;

  @IsDateString()
  endDate: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents?: string[];

  @IsString()
  @IsOptional()
  pitchDeck?: string;

  @IsArray()
  @IsString({ each: true })
  milestones: string[];

  @IsString()
  @IsOptional()
  videoUrl?: string;
} 