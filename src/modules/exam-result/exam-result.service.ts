// Kerakli xato turlari va Nest vositasi
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateExamResultDto } from './dto/create-exam-result.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateExamResultDto } from './dto/update-exam-result.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';

// Imtihon natijalari bilan ishlovchi xizmat
@Injectable()
export class ExamResultService {
  constructor(private readonly db: PrismaService) {}

  async create(createExamResultDto: CreateExamResultDto) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { examId, studentId, score } = createExamResultDto;
    // Imtihonni bazadan qidiramiz
    const exam = await this.db.exam.findUnique({ where: { id: examId } });
    // Imtihon topilmasa xato qaytaramiz
    if (!exam) {
      throw new NotFoundException('Imtihon topilmadi');
    }
    // Ball maksimal balldan oshmasligi kerak
    if (score > exam.maxScore) {
      throw new BadRequestException(
        `Ball ${exam.maxScore} dan oshmasligi kerak`,
      );
    }
    // O'quvchi shu guruhda borligini tekshiramiz
    const groupStudent = await this.db.groupStudent.findUnique({
      where: { groupId_studentId: { groupId: exam.groupId, studentId } },
    });
    // Guruhda bo'lmasa xato qaytaramiz
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi bu guruhda yo'q");
    }
    // Natija yozilgan yoki yo'qligini tekshiramiz
    const exists = await this.db.examResult.findUnique({
      where: { examId_studentId: { examId, studentId } },
    });
    // Yozilgan bo'lsa xato qaytaramiz
    if (exists) {
      throw new ConflictException("Bu o'quvchiga natija allaqachon yozilgan");
    }
    // Natijani bazaga yozamiz
    const examResult = await this.db.examResult.create({
      data: createExamResultDto,
    });
    // Yozilgan natijani qaytaramiz
    return successRes(examResult, 201);
  }

  async findAll(examId: number) {
    // Imtihondagi barcha natijalarni olamiz
    const results = await this.db.examResult.findMany({
      where: { examId },
      include: { student: { select: { id: true, fullName: true } } },
      orderBy: { score: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(results);
  }

  async findByStudent(studentId: number) {
    // O'quvchining barcha natijalarini olamiz
    const results = await this.db.examResult.findMany({
      where: { studentId },
      include: { exam: { select: { id: true, title: true, maxScore: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(results);
  }

  async update(id: number, updateExamResultDto: UpdateExamResultDto) {
    // Natijani imtihoni bilan qidiramiz
    const examResult = await this.db.examResult.findUnique({
      where: { id },
      include: { exam: true },
    });
    // Topilmasa xato qaytaramiz
    if (!examResult) {
      throw new NotFoundException('Natija topilmadi');
    }
    // Ball maksimal balldan oshmasligi kerak
    if (updateExamResultDto.score > examResult.exam.maxScore) {
      throw new BadRequestException(
        `Ball ${examResult.exam.maxScore} dan oshmasligi kerak`,
      );
    }
    // Ma'lumotlarni yangilaymiz
    await this.db.examResult.update({
      where: { id },
      data: updateExamResultDto,
    });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Natijani bazadan qidiramiz
    const examResult = await this.db.examResult.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!examResult) {
      throw new NotFoundException('Natija topilmadi');
    }
    // Natijani o'chiramiz
    await this.db.examResult.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
