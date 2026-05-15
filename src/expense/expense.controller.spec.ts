import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import type { AuthUser } from '../auth/current-user.decorator';

describe('ExpenseController', () => {
  let controller: ExpenseController;
  let expenseService: {
    create: jest.Mock;
    findAll: jest.Mock;
    remove: jest.Mock;
    getSummary: jest.Mock;
  };

  beforeEach(async () => {
    expenseService = {
      create: jest.fn(),
      findAll: jest.fn(),
      remove: jest.fn(),
      getSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [{ provide: ExpenseService, useValue: expenseService }],
    }).compile();

    controller = module.get<ExpenseController>(ExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns summary for current user', async () => {
    const user: AuthUser = {
      id: 'user-1',
      email: 'user1@fairnest.dev',
      firstName: 'User',
      lastName: 'One',
      coupleId: 'couple-1',
    };
    const summary = {
      totalAmount: 200,
      sharedAmount: 120,
      personalAmount: 80,
      expenseCount: 2,
    };

    expenseService.getSummary.mockResolvedValue(summary);

    await expect(controller.getSummary(user)).resolves.toEqual(summary);
    expect(expenseService.getSummary).toHaveBeenCalledWith('user-1');
  });
});
