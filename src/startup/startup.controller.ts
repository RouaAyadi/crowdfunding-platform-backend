import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { StartupService } from './startup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StartupResponseDto } from './dto/startup-response.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { LaunchCampaignDto } from './dto/launch-campaign.dto';
import { Roles } from '../auth/roles.enum';
import { HasRoles } from '../auth/decorators/roles.decorator';

@Controller('startups')
@UseGuards(JwtAuthGuard)
export class StartupController {
  constructor(private readonly startupService: StartupService) {}

  @Get()
  async findAll(): Promise<StartupResponseDto[]> {
    return this.startupService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<StartupResponseDto> {
    return this.startupService.findOne(id);
  }

  @Get('wallet/:address')
  async findByWalletAddress(@Param('address') address: string): Promise<StartupResponseDto> {
    return this.startupService.findByWalletAddress(address);
  }

  @Patch(':id')
  @HasRoles(Roles.STARTUP)
  async update(
    @Param('id') id: string,
    @Body() updateStartupDto: UpdateStartupDto,
    @Request() req
  ): Promise<StartupResponseDto> {
    return this.startupService.update(id, updateStartupDto, req.user.userId);
  }

  @Get(':id/dashboard')
  @HasRoles(Roles.STARTUP)
  async getDashboardStats(@Param('id') id: string) {
    return this.startupService.getDashboardStats(id);
  }

  @Get(':id/campaigns')
  async getStartupCampaigns(
    @Param('id') id: string,
    @Query('status') status?: string
  ) {
    return this.startupService.getStartupCampaigns(id, status);
  }

  @Post(':id/campaigns')
  @HasRoles(Roles.STARTUP)
  async launchCampaign(
    @Param('id') id: string,
    @Body() launchCampaignDto: LaunchCampaignDto,
    @Request() req
  ) {
    if (id !== req.user.userId) {
      throw new ForbiddenException('You can only launch campaigns for your own startup');
    }
    return this.startupService.launchCampaign(id, launchCampaignDto);
  }
}
