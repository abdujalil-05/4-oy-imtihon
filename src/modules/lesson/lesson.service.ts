// Kerakli xato turlari va Nest vositasi
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateLessonDto } from './dto/create-lesson.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateLessonDto } from './dto/update-lesson.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';

// Darslar bilan ishlovchi xizmat
@Injectable()
export class LessonService {
  constructor(private readonly db: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { groupId, topic, lessonDate } = createLessonDto;
    // Guruhni bazadan qidiramiz
    const group = await this.db.group.findUnique({ where: { id: groupId } });
    // Guruh topilmasa xato qaytaramiz
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    // Yangi darsni bazaga yozamiz
    const lesson = await this.db.lesson.create({
      data: { groupId, topic, lessonDate: new Date(lessonDate) },
    });
    // Yaratilgan darsni qaytaramiz
    return successRes(lesson, 201);
  }

  async findAll(groupId: number) {
    // Guruhdagi barcha darslarni olamiz
    const lessons = await this.db.lesson.findMany({
      where: { groupId },
      orderBy: { lessonDate: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(lessons);
  }

  async findOne(id: number) {
    // Darsni davomat va uy vazifalari bilan qidiramiz
    const lesson = await this.db.lesson.findUnique({
      where: { id },
      include: {
        attendances: {
          include: { student: { select: { id: true, fullName: true } } },
        },
        homeworks: true,
      },
    });
    // Topilmasa xato qaytaramiz
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }
    // Topilgan darsni qaytaramiz
    return successRes(lesson);
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    // Darsni bazadan qidiramiz
    const lesson = await this.db.lesson.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }
    // Sanani kerakli ko'rinishga o'tkazamiz
    const lessonDate = updateLessonDto.lessonDate
      ? new Date(updateLessonDto.lessonDate)
      : lesson.lessonDate;
    // Ma'lumotlarni yangilaymiz
    await this.db.lesson.update({
      where: { id },
      data: { ...updateLessonDto, lessonDate },
    });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Darsni bazadan qidiramiz
    const lesson = await this.db.lesson.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }
    // Darsga uy vazifasi berilganini tekshiramiz
    const homework = await this.db.homework.findFirst({
      where: { lessonId: id },
    });
    // Uy vazifasi bo'lsa o'chirishga ruxsat bermaymiz
    if (homework) {
      throw new ConflictException("Darsda uy vazifasi bor, o'chirib bo'lmaydi");
    }
    // Darsdagi davomat yozuvlarini o'chiramiz
    await this.db.attendance.deleteMany({ where: { lessonId: id } });
    // Darsni o'chiramiz
    await this.db.lesson.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
