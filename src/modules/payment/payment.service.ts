// Kerakli xato turlari va Nest vositasi
import { Injectable, NotFoundException } from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreatePaymentDto } from './dto/create-payment.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdatePaymentDto } from './dto/update-payment.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';

// To'lovlar bilan ishlovchi xizmat
@Injectable()
export class PaymentService {
  constructor(private readonly db: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { studentId, groupId } = createPaymentDto;
    // O'quvchi shu guruhda borligini tekshiramiz
    const groupStudent = await this.db.groupStudent.findUnique({
      where: { groupId_studentId: { groupId, studentId } },
    });
    // Guruhda bo'lmasa xato qaytaramiz
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi bu guruhda yo'q");
    }
    // To'lovni bazaga yozamiz
    const payment = await this.db.payment.create({ data: createPaymentDto });
    // Yozilgan to'lovni qaytaramiz
    return successRes(payment, 201);
  }

  async findAll() {
    // Barcha to'lovlarni olamiz
    const payments = await this.db.payment.findMany({
      include: {
        student: { select: { id: true, fullName: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { paidAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(payments);
  }

  async findByStudent(studentId: number) {
    // O'quvchining to'lovlarini olamiz
    const payments = await this.db.payment.findMany({
      where: { studentId },
      include: { group: { select: { id: true, name: true } } },
      orderBy: { paidAt: 'desc' },
    });
    // Jami to'langan summani hisoblaymiz
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    // Ro'yxat va jami summani qaytaramiz
    return successRes({ total, payments });
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    // To'lovni bazadan qidiramiz
    const payment = await this.db.payment.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!payment) {
      throw new NotFoundException("To'lov topilmadi");
    }
    // Ma'lumotlarni yangilaymiz
    await this.db.payment.update({ where: { id }, data: updatePaymentDto });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // To'lovni bazadan qidiramiz
    const payment = await this.db.payment.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!payment) {
      throw new NotFoundException("To'lov topilmadi");
    }
    // To'lovni o'chiramiz
    await this.db.payment.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
