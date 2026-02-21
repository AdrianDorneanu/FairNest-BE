import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  async signUp(@Body() dto: SignupDto): Promise<AuthResponseDto> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in an existing user' })
  async logIn(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.logIn(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto);
  }
}
