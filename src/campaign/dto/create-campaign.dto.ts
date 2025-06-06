import { IsString, IsNumber, IsDateString, IsOptional, IsArray, IsMongoId, Min, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCampaignDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsMongoId()
  startup: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  targetAmount: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  address: string; // Blockchain wallet address

  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
