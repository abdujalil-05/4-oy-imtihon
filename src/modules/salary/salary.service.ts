import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';
import { Roles } from '../../common/enum';

@Injectable()
export class SalaryService {
  constructor(private readonly db: PrismaService) {}

  async create(createSalaryDto: CreateSalaryDto) {
    const { teacherId, month } = createSalaryDto;
    const teacher = await this.db.user.findUnique({ where: { id: teacherId } });
    if (!teacher || teacher.role !== Roles.TEACHER) {
      throw new BadRequestException("O'qituvchi topilmadi");
    }
    const exists = await this.db.salary.findUnique({
      where: { teacherId_month: { teacherId, month } },
    });
    if (exists) {
      throw new ConflictException('Bu oy uchun maosh allaqachon yozilgan');
    }
    const salary = await this.db.salary.create({ data: createSalaryDto });
    return successRes(salary, 201);
  }

  async findAll() {
    const salaries = await this.db.salary.findMany({
      include: { teacher: { select: { id: true, fullName: true } } },
      orderBy: { paidAt: 'desc' },
    });
    return successRes(salaries);
  }

  async findByTeacher(teacherId: number) {
    const salaries = await this.db.salary.findMany({
      where: { teacherId },
      orderBy: { month: 'desc' },
    });
    const total = salaries.reduce((sum, salary) => sum + salary.amount, 0);
    return successRes({ total, salaries });
  }

  async update(id: number, updateSalaryDto: UpdateSalaryDto) {
    const salary = await this.db.salary.findUnique({ where: { id } });
    if (!salary) {
      throw new NotFoundException('Maosh topilmadi');
    }
    await this.db.salary.update({ where: { id }, data: updateSalaryDto });
    return successRes({});
  }

  async remove(id: number) {
    const salary = await this.db.salary.findUnique({ where: { id } });
    if (!salary) {
      throw new NotFoundException('Maosh topilmadi');
    }
    await this.db.salary.delete({ where: { id } });
    return successRes({});
  }
}
