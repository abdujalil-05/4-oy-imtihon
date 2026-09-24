import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExamResultDto } from './dto/create-exam-result.dto';
import { UpdateExamResultDto } from './dto/update-exam-result.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';

@Injectable()
export class ExamResultService {
  constructor(private readonly db: PrismaService) {}

  async create(createExamResultDto: CreateExamResultDto) {
    const { examId, studentId, score } = createExamResultDto;
    const exam = await this.db.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      throw new NotFoundException('Imtihon topilmadi');
    }
    if (score > exam.maxScore) {
      throw new BadRequestException(
        `Ball ${exam.maxScore} dan oshmasligi kerak`,
      );
    }
    const groupStudent = await this.db.groupStudent.findUnique({
      where: { groupId_studentId: { groupId: exam.groupId, studentId } },
    });
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi bu guruhda yo'q");
    }
    const exists = await this.db.examResult.findUnique({
      where: { examId_studentId: { examId, studentId } },
    });
    if (exists) {
      throw new ConflictException("Bu o'quvchiga natija allaqachon yozilgan");
    }
    const examResult = await this.db.examResult.create({
      data: createExamResultDto,
    });
    return successRes(examResult, 201);
  }

  async findAll(examId: number) {
    const results = await this.db.examResult.findMany({
      where: { examId },
      include: { student: { select: { id: true, fullName: true } } },
      orderBy: { score: 'desc' },
    });
    return successRes(results);
  }

  async findByStudent(studentId: number) {
    const results = await this.db.examResult.findMany({
      where: { studentId },
      include: { exam: { select: { id: true, title: true, maxScore: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return successRes(results);
  }

  async update(id: number, updateExamResultDto: UpdateExamResultDto) {
    const examResult = await this.db.examResult.findUnique({
      where: { id },
      include: { exam: true },
    });
    if (!examResult) {
      throw new NotFoundException('Natija topilmadi');
    }
    if (updateExamResultDto.score > examResult.exam.maxScore) {
      throw new BadRequestException(
        `Ball ${examResult.exam.maxScore} dan oshmasligi kerak`,
      );
    }
    await this.db.examResult.update({
      where: { id },
      data: updateExamResultDto,
    });
    return successRes({});
  }

  async remove(id: number) {
    const examResult = await this.db.examResult.findUnique({ where: { id } });
    if (!examResult) {
      throw new NotFoundException('Natija topilmadi');
    }
    await this.db.examResult.delete({ where: { id } });
    return successRes({});
  }
}
