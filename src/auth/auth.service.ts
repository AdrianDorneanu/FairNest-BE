import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup() {
    const user = await this.prismaService.user.findUnique({
      where: { id: '1' },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User signed up successfully',
    };
  }
}
