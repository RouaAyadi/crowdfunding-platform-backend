import { Controller, Get, Post, Param, UseGuards, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvestorService } from './investor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/roles.enum';
import { InvestorResponseDto } from './dto/investor-response.dto';
import { AddInvestmentDto } from './dto/add-investment.dto';
import { InvestorDashboardDto } from './dto/investor-dashboard.dto';

@ApiTags('Investors')
@Controller('investors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  @Get('dashboard')
  @HasRoles(Roles.INVESTOR)
  @ApiOperation({ summary: 'Get investor dashboard data' })
  async getDashboard(@Request() req): Promise<InvestorDashboardDto> {
    return this.investorService.getDashboard(req.user.walletAddress);
  }

  @Get()
  async findAll(): Promise<InvestorResponseDto[]> {
    return this.investorService.findAll();
  }

  @Get('wallet/:address')
  async findByWalletAddress(@Param('address') address: string): Promise<InvestorResponseDto> {
    return this.investorService.findByWalletAddress(address);
  }

  @Get(':id/stats')
  async getInvestorStats(@Param('id') id: string) {
    return this.investorService.getInvestorStats(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<InvestorResponseDto> {
    return this.investorService.findOne(id);
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
