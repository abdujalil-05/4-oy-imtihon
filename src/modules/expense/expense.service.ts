// Kerakli xato turi va Nest vositasi
import { Injectable, NotFoundException } from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateExpenseDto } from './dto/create-expense.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateExpenseDto } from './dto/update-expense.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';

// Xarajatlar bilan ishlovchi xizmat
@Injectable()
export class ExpenseService {
  constructor(private readonly db: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    // Xarajatni bazaga yozamiz
    const expense = await this.db.expense.create({ data: createExpenseDto });
    // Yozilgan xarajatni qaytaramiz
    return successRes(expense, 201);
  }

  async findAll() {
    // Barcha xarajatlarni olamiz
    const expenses = await this.db.expense.findMany({
      orderBy: { spentAt: 'desc' },
    });
    // Jami summani hisoblaymiz
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    // Ro'yxat va jami summani qaytaramiz
    return successRes({ total, expenses });
  }

  async findOne(id: number) {
    // Xarajatni bazadan qidiramiz
    const expense = await this.db.expense.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!expense) {
      throw new NotFoundException('Xarajat topilmadi');
    }
    // Topilgan xarajatni qaytaramiz
    return successRes(expense);
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto) {
    // Xarajatni bazadan qidiramiz
    const expense = await this.db.expense.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!expense) {
      throw new NotFoundException('Xarajat topilmadi');
    }
    // Ma'lumotlarni yangilaymiz
    await this.db.expense.update({ where: { id }, data: updateExpenseDto });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Xarajatni bazadan qidiramiz
    const expense = await this.db.expense.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!expense) {
      throw new NotFoundException('Xarajat topilmadi');
    }
    // Xarajatni o'chiramiz
    await this.db.expense.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
