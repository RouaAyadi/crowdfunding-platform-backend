import { IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Roles } from '../roles.enum';
import { InvestorDataDto, StartupDataDto } from './create-user.dto';

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
    description: 'Required only when registering as an investor',
    type: InvestorDataDto,
  })
  @ValidateNested()
  @Type(() => InvestorDataDto)
  @IsOptional()
  investorData?: InvestorDataDto;

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
    description: 'User role (investor or startup)',
    enum: Roles,
    example: Roles.INVESTOR,
  })
  @IsEnum(Roles)
  role: Roles;

  @ApiProperty({
    description: 'Signature of the nonce message',
    example: '0x1234...5678',
  })
  @IsString()
  signature: string;
}
