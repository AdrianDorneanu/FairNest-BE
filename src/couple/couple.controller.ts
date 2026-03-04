import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoupleService } from './couple.service';
import { InvitePartnerDto } from './dto/invite-partner.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';

@ApiTags('couples')
@Controller({ path: 'couples', version: '1' })
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Invite a partner to form a couple' })
  async invitePartner(
    @CurrentUser() user: AuthUser,
    @Body() dto: InvitePartnerDto,
  ) {
    return this.coupleService.invitePartner(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user couple info' })
  async getMyCouple(@CurrentUser() user: AuthUser) {
    return this.coupleService.getMyCouple(user.id);
  }
}
