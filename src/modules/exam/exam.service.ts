// Kerakli xato turlari va Nest vositasi
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateExamDto } from './dto/create-exam.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateExamDto } from './dto/update-exam.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';

// Imtihonlar bilan ishlovchi xizmat
@Injectable()
export class ExamService {
  constructor(private readonly db: PrismaService) {}

  async create(createExamDto: CreateExamDto) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { groupId, title, examDate, maxScore } = createExamDto;
    // Guruhni bazadan qidiramiz
    const group = await this.db.group.findUnique({ where: { id: groupId } });
    // Guruh topilmasa xato qaytaramiz
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    // Imtihonni bazaga yozamiz
    const exam = await this.db.exam.create({
      data: { groupId, title, maxScore, examDate: new Date(examDate) },
    });
    // Yaratilgan imtihonni qaytaramiz
    return successRes(exam, 201);
  }

  async findAll(groupId: number) {
    // Guruhdagi barcha imtihonlarni olamiz
    const exams = await this.db.exam.findMany({
      where: { groupId },
      orderBy: { examDate: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(exams);
  }

  async findOne(id: number) {
    // Imtihonni natijalari bilan qidiramiz
    const exam = await this.db.exam.findUnique({
      where: { id },
      include: {
        results: {
          include: { student: { select: { id: true, fullName: true } } },
        },
      },
    });
    // Topilmasa xato qaytaramiz
    if (!exam) {
      throw new NotFoundException('Imtihon topilmadi');
    }
    // Topilgan imtihonni qaytaramiz
    return successRes(exam);
  }

  async update(id: number, updateExamDto: UpdateExamDto) {
    // Imtihonni bazadan qidiramiz
    const exam = await this.db.exam.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!exam) {
      throw new NotFoundException('Imtihon topilmadi');
    }
    // Sanani kerakli ko'rinishga o'tkazamiz
    const examDate = updateExamDto.examDate
      ? new Date(updateExamDto.examDate)
      : exam.examDate;
    // Ma'lumotlarni yangilaymiz
    await this.db.exam.update({
      where: { id },
      data: { ...updateExamDto, examDate },
    });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Imtihonni bazadan qidiramiz
    const exam = await this.db.exam.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!exam) {
      throw new NotFoundException('Imtihon topilmadi');
    }
    // Imtihonda natija borligini tekshiramiz
    const result = await this.db.examResult.findFirst({
      where: { examId: id },
    });
    // Natija bo'lsa o'chirishga ruxsat bermaymiz
    if (result) {
      throw new ConflictException(
        "Imtihonda natijalar bor, o'chirib bo'lmaydi",
      );
    }
    // Imtihonni o'chiramiz
    await this.db.exam.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
