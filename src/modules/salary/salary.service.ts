// Kerakli xato turlari va Nest vositasi
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateSalaryDto } from './dto/create-salary.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateSalaryDto } from './dto/update-salary.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Maoshlar bilan ishlovchi xizmat
@Injectable()
export class SalaryService {
  constructor(private readonly db: PrismaService) {}

  async create(createSalaryDto: CreateSalaryDto) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { teacherId, month } = createSalaryDto;
    // O'qituvchini bazadan qidiramiz
    const teacher = await this.db.user.findUnique({ where: { id: teacherId } });
    // Topilgan foydalanuvchi o'qituvchi ekanini tekshiramiz
    if (!teacher || teacher.role !== Roles.TEACHER) {
      throw new BadRequestException("O'qituvchi topilmadi");
    }
    // Shu oy uchun maosh yozilganini tekshiramiz
    const exists = await this.db.salary.findUnique({
      where: { teacherId_month: { teacherId, month } },
    });
    // Yozilgan bo'lsa xato qaytaramiz
    if (exists) {
      throw new ConflictException('Bu oy uchun maosh allaqachon yozilgan');
    }
    // Maoshni bazaga yozamiz
    const salary = await this.db.salary.create({ data: createSalaryDto });
    // Yozilgan maoshni qaytaramiz
    return successRes(salary, 201);
  }

  async findAll() {
    // Barcha maoshlarni olamiz
    const salaries = await this.db.salary.findMany({
      include: { teacher: { select: { id: true, fullName: true } } },
      orderBy: { paidAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(salaries);
  }

  async findByTeacher(teacherId: number) {
    // O'qituvchining maoshlarini olamiz
    const salaries = await this.db.salary.findMany({
      where: { teacherId },
      orderBy: { month: 'desc' },
    });
    // Jami summani hisoblaymiz
    const total = salaries.reduce((sum, salary) => sum + salary.amount, 0);
    // Ro'yxat va jami summani qaytaramiz
    return successRes({ total, salaries });
  }

  async update(id: number, updateSalaryDto: UpdateSalaryDto) {
    // Maoshni bazadan qidiramiz
    const salary = await this.db.salary.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!salary) {
      throw new NotFoundException('Maosh topilmadi');
    }
    // Ma'lumotlarni yangilaymiz
    await this.db.salary.update({ where: { id }, data: updateSalaryDto });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Maoshni bazadan qidiramiz
    const salary = await this.db.salary.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!salary) {
      throw new NotFoundException('Maosh topilmadi');
    }
    // Maoshni o'chiramiz
    await this.db.salary.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
