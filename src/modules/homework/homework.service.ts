// Kerakli xato turlari va Nest vositasi
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateHomeworkDto } from './dto/create-homework.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateHomeworkDto } from './dto/update-homework.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';

// Uy vazifalari bilan ishlovchi xizmat
@Injectable()
export class HomeworkService {
  constructor(private readonly db: PrismaService) {}

  async create(createHomeworkDto: CreateHomeworkDto) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { lessonId, title, description, deadline } = createHomeworkDto;
    // Darsni bazadan qidiramiz
    const lesson = await this.db.lesson.findUnique({ where: { id: lessonId } });
    // Dars topilmasa xato qaytaramiz
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }
    // Uy vazifasini bazaga yozamiz
    const homework = await this.db.homework.create({
      data: { lessonId, title, description, deadline: new Date(deadline) },
    });
    // Yaratilgan uy vazifasini qaytaramiz
    return successRes(homework, 201);
  }

  async findAll(lessonId: number) {
    // Darsga berilgan uy vazifalarini olamiz
    const homeworks = await this.db.homework.findMany({
      where: { lessonId },
      orderBy: { deadline: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(homeworks);
  }

  async findOne(id: number) {
    // Uy vazifasini topshiriqlari bilan qidiramiz
    const homework = await this.db.homework.findUnique({
      where: { id },
      include: {
        submissions: {
          include: { student: { select: { id: true, fullName: true } } },
        },
      },
    });
    // Topilmasa xato qaytaramiz
    if (!homework) {
      throw new NotFoundException('Uy vazifasi topilmadi');
    }
    // Topilgan uy vazifasini qaytaramiz
    return successRes(homework);
  }

  async update(id: number, updateHomeworkDto: UpdateHomeworkDto) {
    // Uy vazifasini bazadan qidiramiz
    const homework = await this.db.homework.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!homework) {
      throw new NotFoundException('Uy vazifasi topilmadi');
    }
    // Sanani kerakli ko'rinishga o'tkazamiz
    const deadline = updateHomeworkDto.deadline
      ? new Date(updateHomeworkDto.deadline)
      : homework.deadline;
    // Ma'lumotlarni yangilaymiz
    await this.db.homework.update({
      where: { id },
      data: { ...updateHomeworkDto, deadline },
    });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Uy vazifasini bazadan qidiramiz
    const homework = await this.db.homework.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!homework) {
      throw new NotFoundException('Uy vazifasi topilmadi');
    }
    // Topshirilgan javob borligini tekshiramiz
    const submission = await this.db.homeworkSubmission.findFirst({
      where: { homeworkId: id },
    });
    // Javob bo'lsa o'chirishga ruxsat bermaymiz
    if (submission) {
      throw new ConflictException("Vazifaga javoblar bor, o'chirib bo'lmaydi");
    }
    // Uy vazifasini o'chiramiz
    await this.db.homework.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
