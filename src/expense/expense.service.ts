import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/createExpense.dto';
import { ExpenseType } from 'generated/prisma/enums';

@Injectable()
export class ExpenseService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSummary(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { coupleId: true },
    });

    if (!user?.coupleId) {
      throw new BadRequestException(
        'You must be part of a couple to view expense summary',
      );
    }

    const total = await this.prismaService.expense.aggregate({
      where: { coupleId: user.coupleId },
      _sum: { amount: true },
      _count: { _all: true },
    });

    const shared = await this.prismaService.expense.aggregate({
      where: { coupleId: user.coupleId, type: ExpenseType.SHARED },
      _sum: { amount: true },
    });

    const personal = await this.prismaService.expense.aggregate({
      where: { coupleId: user.coupleId, type: ExpenseType.PERSONAL },
      _sum: { amount: true },
    });

    return {
      totalAmount: total._sum.amount ?? 0,
      sharedAmount: shared._sum.amount ?? 0,
      personalAmount: personal._sum.amount ?? 0,
      expenseCount: total._count._all ?? 0,
    };
  }

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
      select: { coupleId: true },
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
