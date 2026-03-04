import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvitePartnerDto } from './dto/invite-partner.dto';

@Injectable()
export class CoupleService {
  constructor(private readonly prismaService: PrismaService) {}

  async invitePartner(currentUserId: string, dto: InvitePartnerDto) {
    const currentUser = await this.prismaService.user.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    if (currentUser.coupleId) {
      throw new BadRequestException('You are already part of a couple');
    }

    const partner = await this.prismaService.user.findUnique({
      where: { email: dto.partnerEmail },
    });

    if (!partner) {
      throw new NotFoundException(
        'No user found with that email. They need to sign up first.',
      );
    }

    if (partner.id === currentUserId) {
      throw new BadRequestException('You cannot invite yourself');
    }

    if (partner.coupleId) {
      throw new BadRequestException(
        'That user is already part of another couple',
      );
    }

    const couple = await this.prismaService.couple.create({
      data: {
        name: `${currentUser.name} & ${partner.name}`,
        users: {
          connect: [{ id: currentUserId }, { id: partner.id }],
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return couple;
  }

  async getMyCouple(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { coupleId: true },
    });

    if (!user?.coupleId) {
      return null;
    }

    return this.prismaService.couple.findUnique({
      where: { id: user.coupleId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
