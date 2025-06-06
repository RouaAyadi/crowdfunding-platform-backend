import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { InvestorService } from './investor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvestorResponseDto } from './dto/investor-response.dto';
import { AddInvestmentDto } from './dto/add-investment.dto';

@Controller('investors')
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  @Get()
  async findAll(): Promise<InvestorResponseDto[]> {
    return this.investorService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<InvestorResponseDto> {
    return this.investorService.findOne(id);
  }

  @Get('wallet/:address')
  async findByWalletAddress(@Param('address') address: string): Promise<InvestorResponseDto> {
    return this.investorService.findByWalletAddress(address);
  }

  @Get(':id/stats')
  async getInvestorStats(@Param('id') id: string) {
    return this.investorService.getInvestorStats(id);
  }

  @Post(':id/investments')
  @UseGuards(JwtAuthGuard)
  async addInvestment(
    @Param('id') id: string,
    @Body() addInvestmentDto: AddInvestmentDto
  ): Promise<InvestorResponseDto> {
    return this.investorService.addInvestment(id, addInvestmentDto);
  }
}
