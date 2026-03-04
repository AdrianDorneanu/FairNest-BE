import { ApiProperty } from '@nestjs/swagger';

export class InvitePartnerDto {
  @ApiProperty({
    description: 'Email of the partner to invite',
    example: 'partner@example.com',
  })
  partnerEmail: string;
}
