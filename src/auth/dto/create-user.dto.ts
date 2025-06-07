import { IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Roles } from '../roles.enum';
import { ApiProperty } from '@nestjs/swagger';

export class StartupDataDto {
  @ApiProperty({ example: 'TechCorp', description: 'Name of the startup' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Silicon Valley, CA', description: 'Location of the startup' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'https://techcorp.com', description: 'Website URL', required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: 'A tech startup focused on blockchain solutions', description: 'Brief description of the startup' })
  @IsString()
  bio: string;

  @ApiProperty({ 
    example: ['Revolutionize blockchain technology', 'Create sustainable solutions'],
    description: 'Mission statements of the startup'
  })
  @IsString({ each: true })
  mission: string[];
}

export class InvestorDataDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the investor' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'crypto_whale', description: 'Nickname of the investor', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: '0x1234...5678', description: 'Ethereum wallet address' })
  @IsString()
  walletAddress: string;

  @ApiProperty({ enum: Roles, example: 'investor', description: 'User role (investor or startup)' })
  @IsEnum(Roles)
  role: Roles;

  @ValidateNested()
  @Type(() => InvestorDataDto)
  @IsOptional()
  investorData?: InvestorDataDto;

  @ValidateNested()
  @Type(() => StartupDataDto)
  @IsOptional()
  startupData?: StartupDataDto;
}
