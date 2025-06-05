import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserService } from './services/user.service';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Get nonce for wallet signature' })
  @ApiQuery({
    name: 'walletAddress',
    description: 'Ethereum wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @Public()
  @Get('nonce')
  async getNonce(@Query('walletAddress') walletAddress: string) {
    return this.authService.generateNonce(walletAddress);
  }

  @Get('allInvestors')
  @Public()
  async getAllIn() {
    return this.userService.findAllInvestors();
  }

  @Get('allStartups')
  @Public()
  async getAllStar() {
    return this.userService.findAllStartups();
  }

  @ApiOperation({ summary: 'Register new user (investor or startup)' })
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login with wallet signature' })
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
