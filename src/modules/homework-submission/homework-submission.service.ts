// Kerakli xato turlari va Nest vositasi
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateHomeworkSubmissionDto } from './dto/create-homework-submission.dto';
// Baho qo'yish uchun ishlatiladigan ma'lumot
import { UpdateHomeworkSubmissionDto } from './dto/update-homework-submission.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';

// Topshirilgan uy vazifalari bilan ishlovchi xizmat
@Injectable()
export class HomeworkSubmissionService {
  constructor(private readonly db: PrismaService) {}

  async create(
    createHomeworkSubmissionDto: CreateHomeworkSubmissionDto,
    studentId: number,
  ) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { homeworkId, answer } = createHomeworkSubmissionDto;
    // Uy vazifasini darsi bilan qidiramiz
    const homework = await this.db.homework.findUnique({
      where: { id: homeworkId },
      include: { lesson: true },
    });
    // Uy vazifasi topilmasa xato qaytaramiz
    if (!homework) {
      throw new NotFoundException('Uy vazifasi topilmadi');
    }
    // Muddati o'tgan bo'lsa qabul qilmaymiz
    if (homework.deadline < new Date()) {
      throw new BadRequestException("Uy vazifasi muddati o'tgan");
    }
    // O'quvchi shu guruhda borligini tekshiramiz
    const groupStudent = await this.db.groupStudent.findUnique({
      where: {
        groupId_studentId: { groupId: homework.lesson.groupId, studentId },
      },
    });
    // Guruhda bo'lmasa xato qaytaramiz
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi bu guruhda yo'q");
    }
    // Avval topshirganini tekshiramiz
    const exists = await this.db.homeworkSubmission.findUnique({
      where: { homeworkId_studentId: { homeworkId, studentId } },
    });
    // Topshirgan bo'lsa xato qaytaramiz
    if (exists) {
      throw new ConflictException('Bu vazifa allaqachon topshirilgan');
    }
    // Javobni bazaga yozamiz
    const submission = await this.db.homeworkSubmission.create({
      data: { homeworkId, studentId, answer },
    });
    // Yozilgan javobni qaytaramiz
    return successRes(submission, 201);
  }

  async findAll(homeworkId: number) {
    // Uy vazifasiga topshirilgan javoblarni olamiz
    const submissions = await this.db.homeworkSubmission.findMany({
      where: { homeworkId },
      include: { student: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(submissions);
  }

  async findByStudent(studentId: number) {
    // O'quvchi topshirgan barcha javoblarni olamiz
    const submissions = await this.db.homeworkSubmission.findMany({
      where: { studentId },
      include: { homework: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(submissions);
  }

  async update(
    id: number,
    updateHomeworkSubmissionDto: UpdateHomeworkSubmissionDto,
  ) {
    // Topshirilgan javobni bazadan qidiramiz
    const submission = await this.db.homeworkSubmission.findUnique({
      where: { id },
    });
    // Topilmasa xato qaytaramiz
    if (!submission) {
      throw new NotFoundException('Topshirilgan vazifa topilmadi');
    }
    // Baho qo'yamiz
    await this.db.homeworkSubmission.update({
      where: { id },
      data: updateHomeworkSubmissionDto,
    });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Topshirilgan javobni bazadan qidiramiz
    const submission = await this.db.homeworkSubmission.findUnique({
      where: { id },
    });
    // Topilmasa xato qaytaramiz
    if (!submission) {
      throw new NotFoundException('Topshirilgan vazifa topilmadi');
    }
    // Javobni o'chiramiz
    await this.db.homeworkSubmission.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
