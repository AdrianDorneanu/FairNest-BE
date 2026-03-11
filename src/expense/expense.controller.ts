import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { CreateExpenseDto } from './dto/createExpense.dto';

@ApiTags('expenses')
@Controller({ path: 'expenses', version: '1' })
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new expense' })
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateExpenseDto) {
    return this.expenseService.create(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all expenses' })
  async findAll() {
    return this.expenseService.findAll();
  }
}
