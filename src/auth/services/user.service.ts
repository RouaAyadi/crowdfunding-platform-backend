import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  Investor,
  InvestorDocument,
} from '../../investor/schemas/investor.schema';
import { Startup, StartupDocument } from '../../startup/schemas/startup.schema';
import { RegisterDto } from '../dto/auth.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { Roles } from '../roles.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Investor.name) private investorModel: Model<Investor>,
    @InjectModel(Startup.name) private startupModel: Model<Startup>,
  ) {}

  async findByWallet(walletAddress: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });
  }

  async updateNonce(walletAddress: string, nonce: string) {
    return this.userModel.updateOne(
      { walletAddress: walletAddress.toLowerCase() },
      { nonce },
      { upsert: false },
    );
  }

  async create(data: CreateUserDto): Promise<UserDocument> {
    const walletAddress = data.walletAddress.toLowerCase();

    if (data.role === Roles.INVESTOR) {
      return new this.investorModel({
        walletAddress,
        role: Roles.INVESTOR,
        nickname: data.nickname,
      }).save();
    }

    if (data.role === Roles.STARTUP) {
      if (!data.startupData) {
        throw new Error('Startup data is required for startup registration');
      }

      return new this.startupModel({
        walletAddress,
        role: Roles.STARTUP,
        name: data.startupData.name,
        location: data.startupData.location,
        website: data.startupData.website,
        bio: data.startupData.bio,
        missionGoals: data.startupData.mission,
      }).save();
    }

    throw new Error('Invalid role specified');
  }

  async findAllInvestors(): Promise<Investor[]> {
    return this.investorModel.find().exec();
  }

  // Find ClientB users specifically
  async findAllStartups(): Promise<Startup[]> {
    return this.startupModel.find().exec();
  }
}
