import { IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Roles } from '../roles.enum';

export class StartupDataDto {
  @ApiProperty({ description: 'Name of the startup' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Location of the startup' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ description: 'Website URL of the startup' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Bio/description of the startup' })
  @IsString()
  bio: string;

  @ApiProperty({
    description: 'Mission and goals of the startup',
    type: [String],
  })
  @IsString({ each: true })
  mission: string[];
}

export class RegisterDto {
  @ApiProperty({
    description: 'Ethereum wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'User role (investor or startup)',
    enum: Roles,
    example: Roles.INVESTOR,
  })
  @IsEnum(Roles)
  role: Roles;

  @ApiPropertyOptional({
    description: 'Optional nickname for the user',
    example: 'crypto_whale',
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({
    description: 'Required only when registering as a startup',
    type: StartupDataDto,
  })
  @ValidateNested()
  @Type(() => StartupDataDto)
  @IsOptional()
  startupData?: StartupDataDto;
}

export class LoginDto {
  @ApiProperty({
    description: 'Ethereum wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'Signature of the nonce message',
    example: '0x...',
  })
  @IsString()
  signature: string;
}
