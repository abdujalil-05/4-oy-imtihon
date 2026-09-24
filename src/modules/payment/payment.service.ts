import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';

@Injectable()
export class PaymentService {
  constructor(private readonly db: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { studentId, groupId } = createPaymentDto;
    const groupStudent = await this.db.groupStudent.findUnique({
      where: { groupId_studentId: { groupId, studentId } },
    });
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi bu guruhda yo'q");
    }
    const payment = await this.db.payment.create({ data: createPaymentDto });
    return successRes(payment, 201);
  }

  async findAll() {
    const payments = await this.db.payment.findMany({
      include: {
        student: { select: { id: true, fullName: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { paidAt: 'desc' },
    });
    return successRes(payments);
  }

  async findByStudent(studentId: number) {
    const payments = await this.db.payment.findMany({
      where: { studentId },
      include: { group: { select: { id: true, name: true } } },
      orderBy: { paidAt: 'desc' },
    });
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return successRes({ total, payments });
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.db.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException("To'lov topilmadi");
    }
    await this.db.payment.update({ where: { id }, data: updatePaymentDto });
    return successRes({});
  }

  async remove(id: number) {
    const payment = await this.db.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException("To'lov topilmadi");
    }
    await this.db.payment.delete({ where: { id } });
    return successRes({});
  }
}
