import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class InvitePartnerDto {
  @ApiProperty({
    description: 'Email of the partner to invite',
    example: 'partner@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  partnerEmail: string;
}
