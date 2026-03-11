import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseType } from 'generated/prisma/enums';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Expense amount in euro',
    example: 200,
  })
  amount: number;

  @ApiProperty({
    description: 'Expense title',
    example: 'Groceries',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Expense description',
    example: 'Weekly grocery shopping',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Expense type',
    enum: ExpenseType,
    default: ExpenseType.SHARED,
    example: 'SHARED',
  })
  type?: ExpenseType;

  @ApiPropertyOptional({
    description: 'Expense date (defaults to now)',
    example: '2026-03-11T12:00:00.000Z',
  })
  date?: string;
}
