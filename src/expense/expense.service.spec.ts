import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseType } from 'generated/prisma/enums';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let prismaService: {
    user: { findUnique: jest.Mock };
    expense: { aggregate: jest.Mock };
  };

  beforeEach(async () => {
    prismaService = {
      user: { findUnique: jest.fn() },
      expense: { aggregate: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns expense summary for user couple', async () => {
    prismaService.user.findUnique.mockResolvedValue({ coupleId: 'couple-1' });
    prismaService.expense.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 300 }, _count: { _all: 3 } })
      .mockResolvedValueOnce({ _sum: { amount: 220 } })
      .mockResolvedValueOnce({ _sum: { amount: 80 } });

    const result = await service.getSummary('user-1');

    expect(result).toEqual({
      totalAmount: 300,
      sharedAmount: 220,
      personalAmount: 80,
      expenseCount: 3,
    });
    expect(prismaService.expense.aggregate).toHaveBeenNthCalledWith(1, {
      where: { coupleId: 'couple-1' },
      _sum: { amount: true },
      _count: { _all: true },
    });
    expect(prismaService.expense.aggregate).toHaveBeenNthCalledWith(2, {
      where: { coupleId: 'couple-1', type: ExpenseType.SHARED },
      _sum: { amount: true },
    });
    expect(prismaService.expense.aggregate).toHaveBeenNthCalledWith(3, {
      where: { coupleId: 'couple-1', type: ExpenseType.PERSONAL },
      _sum: { amount: true },
    });
  });

  it('returns zero-safe totals when no expenses exist', async () => {
    prismaService.user.findUnique.mockResolvedValue({ coupleId: 'couple-1' });
    prismaService.expense.aggregate
      .mockResolvedValueOnce({ _sum: { amount: null }, _count: { _all: 0 } })
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });

    await expect(service.getSummary('user-1')).resolves.toEqual({
      totalAmount: 0,
      sharedAmount: 0,
      personalAmount: 0,
      expenseCount: 0,
    });
  });

  it('throws when user is not part of a couple', async () => {
    prismaService.user.findUnique.mockResolvedValue({ coupleId: null });

    await expect(service.getSummary('user-1')).rejects.toThrow(
      new BadRequestException(
        'You must be part of a couple to view expense summary',
      ),
    );
    expect(prismaService.expense.aggregate).not.toHaveBeenCalled();
  });
});
