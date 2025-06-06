import { IsString, IsOptional, IsArray, IsUrl, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SocialLinksDto, KeyMetricDto, MilestoneDto } from './nested-dtos';

export class UpdateStartupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUrl()
  @IsOptional()
  logo?: string;

  @IsUrl()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  field?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  longDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  motives?: string[];

  @IsNumber()
  @IsOptional()
  foundedYear?: number;

  @IsNumber()
  @IsOptional()
  teamSize?: number;

  @IsUrl()
  @IsOptional()
  website?: string;

  @ValidateNested()
  @Type(() => SocialLinksDto)
  @IsOptional()
  socialLinks?: SocialLinksDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyMetricDto)
  @IsOptional()
  keyMetrics?: KeyMetricDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  @IsOptional()
  milestones?: MilestoneDto[];
} 