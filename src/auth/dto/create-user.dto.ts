import { IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Roles } from '../roles.enum';

export class StartupDataDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  bio: string;

  @IsString({ each: true })
  mission: string[];
}

export class CreateUserDto {
  @IsString()
  walletAddress: string;

  @IsEnum(Roles)
  role: Roles;

  @IsString()
  @IsOptional()
  nickname?: string;

  @ValidateNested()
  @Type(() => StartupDataDto)
  @IsOptional()
  startupData?: StartupDataDto;
}
