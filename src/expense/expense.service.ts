import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/createExpense.dto';

@Injectable()
export class ExpenseService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { coupleId: true },
    });

    if (!user?.coupleId) {
      throw new BadRequestException(
        'You must be part of a couple to create an expense',
      );
    }

    return this.prismaService.expense.create({
      data: {
        coupleId: user.coupleId,
        paidById: userId,
        amount: dto.amount,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async findAll() {
    return this.prismaService.expense.findMany();
  }

  async remove(userId: string, expenseId: string) {
    const expense = await this.prismaService.expense.findUnique({
      where: { id: expenseId },
      select: { coupleId: true, paidById: true },
    });

    if (!expense) {
      throw new BadRequestException('Expense not found');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { coupleId: true },
    });

    if (expense.coupleId !== user?.coupleId) {
      throw new BadRequestException(
        'You are not allowed to delete this expense',
      );
    }

    return this.prismaService.expense.delete({
      where: { id: expenseId },
    });
  }
}
