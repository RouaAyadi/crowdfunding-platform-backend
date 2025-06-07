import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserService } from './services/user.service';
import { Roles } from './roles.enum';

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
    required: true,
    description: 'Ethereum wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @Public()
  @Get('nonce')
  async getNonce(
    @Query('walletAddress') walletAddress: string,
    @Query('role') role: Roles,
  ) {
    return this.authService.generateNonce(walletAddress, role);
  }

  @ApiOperation({ summary: 'Get all investors' })
  @Get('allInvestors')
  @Public()
  async getAllIn() {
    return this.userService.findAllInvestors();
  }

  @ApiOperation({ summary: 'Get all startups' })
  @Get('allStartups')
  @Public()
  async getAllStar() {
    return this.userService.findAllStartups();
  }

  @ApiOperation({ summary: 'Register new user (investor or startup)' })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
    examples: {
      investor: {
        value: {
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          role: 'investor',
          investorData: {
            name: 'John Doe',
            nickname: 'crypto_whale',
          },
        },
      },
      startup: {
        value: {
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          role: 'startup',
          startupData: {
            name: 'TechCorp',
            location: 'Silicon Valley, CA',
            website: 'https://techcorp.com',
            bio: 'A tech startup focused on blockchain solutions',
            mission: [
              'Revolutionize blockchain technology',
              'Create sustainable solutions',
            ],
          },
        },
      },
    },
  })
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
