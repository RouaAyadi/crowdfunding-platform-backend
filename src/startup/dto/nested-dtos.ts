import { IsString, IsUrl, IsDate, IsBoolean } from 'class-validator';

export class SocialLinksDto {
  @IsUrl()
  @IsString()
  linkedin?: string;

  @IsUrl()
  @IsString()
  twitter?: string;

  @IsUrl()
  @IsString()
  facebook?: string;
}

export class KeyMetricDto {
  @IsString()
  label: string;

  @IsString()
  value: string;
}

export class MilestoneDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDate()
  date: Date;

  @IsBoolean()
  completed: boolean;
} 