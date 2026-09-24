import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';

@Injectable()
export class CourseService {
  constructor(private readonly db: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    const existsName = await this.db.course.findUnique({
      where: { name: createCourseDto.name },
    });
    if (existsName) {
      throw new ConflictException('Bunday nomli kurs allaqachon mavjud');
    }
    const course = await this.db.course.create({ data: createCourseDto });
    return successRes(course, 201);
  }

  async findAll() {
    const courses = await this.db.course.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return successRes(courses);
  }

  async findOne(id: number) {
    const course = await this.db.course.findUnique({
      where: { id },
      include: { groups: true },
    });
    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }
    return successRes(course);
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const course = await this.db.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }
    await this.db.course.update({ where: { id }, data: updateCourseDto });
    return successRes({});
  }

  async remove(id: number) {
    const course = await this.db.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }
    const groups = await this.db.group.findFirst({ where: { courseId: id } });
    if (groups) {
      throw new ConflictException("Kursda guruhlar bor, o'chirib bo'lmaydi");
    }
    await this.db.course.delete({ where: { id } });
    return successRes({});
  }
}
