import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpenseService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.expense.findMany();
  }
}
