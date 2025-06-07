import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { UserService } from './user.service';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { Roles } from '../roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async generateNonce(walletAddress: string, role: Roles) {
    const nonce = randomUUID();
    await this.userService.updateNonce(
      walletAddress.toLowerCase(),
      nonce,
      role,
    );
    return { nonce };
  }

  async register(dto: RegisterDto) {
    const walletAddress = dto.walletAddress.toLowerCase();

    // Check if user already exists
    const existingUser = await this.userService.findByWallet(
      walletAddress,
      dto.role,
    );
    if (existingUser) {
      throw new ConflictException('Wallet address already registered');
    }

    // Create new user
    const user = await this.userService.create({
      walletAddress,
      role: dto.role,
      investorData: dto.investorData,
      startupData: dto.startupData,
    });

    // Generate initial nonce
    user.nonce = (await this.generateNonce(walletAddress, dto.role)).nonce;

    return { user };
  }

  async login(dto: LoginDto) {
    const { walletAddress, role } = dto;

    const user = await this.userService.findByWallet(walletAddress, role);
    if (!user) {
      throw new UnauthorizedException('User not found. Please register first.');
    }

    const nonce = user.nonce;
    if (!nonce) {
      throw new UnauthorizedException('Please request a nonce first');
    }

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(nonce, dto.signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Generate a new nonce for next login
    await this.generateNonce(walletAddress, dto.role);

    // Generate JWT token
    const payload = {
      sub: walletAddress,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
