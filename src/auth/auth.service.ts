import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LoginDto } from './dto/login.dto';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly ACCESS_TOKEN_EXPIRY_SECONDS = 900;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prismaService.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  }

  async logIn(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  }

  async refresh(dto: RefreshDto): Promise<AuthResponseDto> {
    try {
      const refreshSecret = process.env.JWT_REFRESH_SECRET;

      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = this.generateTokens(user.id, user.email);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, email: string) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        email,
      },
      {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        email,
      },
      {
        secret: refreshSecret,
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
      },
    );

    return { accessToken, refreshToken };
  }
}
