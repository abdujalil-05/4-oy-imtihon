import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';

@Injectable()
export class ExpenseService {
  constructor(private readonly db: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    const expense = await this.db.expense.create({ data: createExpenseDto });
    return successRes(expense, 201);
  }

  async findAll() {
    const expenses = await this.db.expense.findMany({
      orderBy: { spentAt: 'desc' },
    });
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return successRes({ total, expenses });
  }

  async findOne(id: number) {
    const expense = await this.db.expense.findUnique({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Xarajat topilmadi');
    }
    return successRes(expense);
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.db.expense.findUnique({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Xarajat topilmadi');
    }
    await this.db.expense.update({ where: { id }, data: updateExpenseDto });
    return successRes({});
  }

  async remove(id: number) {
    const expense = await this.db.expense.findUnique({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Xarajat topilmadi');
    }
    await this.db.expense.delete({ where: { id } });
    return successRes({});
  }
}
