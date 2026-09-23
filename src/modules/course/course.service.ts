// Kerakli xato turlari va Nest vositasi
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateCourseDto } from './dto/create-course.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateCourseDto } from './dto/update-course.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';

// Kurslar bilan ishlovchi xizmat
@Injectable()
export class CourseService {
  constructor(private readonly db: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    // Bunday nomli kurs bor yoki yo'qligini tekshiramiz
    const existsName = await this.db.course.findUnique({
      where: { name: createCourseDto.name },
    });
    // Nom band bo'lsa xato qaytaramiz
    if (existsName) {
      throw new ConflictException('Bunday nomli kurs allaqachon mavjud');
    }
    // Yangi kursni bazaga yozamiz
    const course = await this.db.course.create({ data: createCourseDto });
    // Yaratilgan kursni qaytaramiz
    return successRes(course, 201);
  }

  async findAll() {
    // Barcha kurslarni olamiz
    const courses = await this.db.course.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(courses);
  }

  async findOne(id: number) {
    // Kursni raqami bo'yicha guruhlari bilan qidiramiz
    const course = await this.db.course.findUnique({
      where: { id },
      include: { groups: true },
    });
    // Topilmasa xato qaytaramiz
    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }
    // Topilgan kursni qaytaramiz
    return successRes(course);
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    // Kursni bazadan qidiramiz
    const course = await this.db.course.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }
    // Ma'lumotlarni yangilaymiz
    await this.db.course.update({ where: { id }, data: updateCourseDto });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Kursni bazadan qidiramiz
    const course = await this.db.course.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }
    // Kursga bog'liq guruhlar borligini tekshiramiz
    const groups = await this.db.group.findFirst({ where: { courseId: id } });
    // Guruh bo'lsa o'chirishga ruxsat bermaymiz
    if (groups) {
      throw new ConflictException("Kursda guruhlar bor, o'chirib bo'lmaydi");
    }
    // Kursni o'chiramiz
    await this.db.course.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
