import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';

@Injectable()
export class ExamService {
  constructor(private readonly db: PrismaService) {}

  async create(createExamDto: CreateExamDto) {
    const { groupId, title, examDate, maxScore } = createExamDto;
    const group = await this.db.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    const exam = await this.db.exam.create({
      data: { groupId, title, maxScore, examDate: new Date(examDate) },
    });
    return successRes(exam, 201);
  }

  async findAll(groupId: number) {
    const exams = await this.db.exam.findMany({
      where: { groupId },
      orderBy: { examDate: 'desc' },
    });
    return successRes(exams);
  }

  async findOne(id: number) {
    const exam = await this.db.exam.findUnique({
      where: { id },
      include: {
        results: {
          include: { student: { select: { id: true, fullName: true } } },
        },
      },
    });
    if (!exam) {
      throw new NotFoundException('Imtihon topilmadi');
    }
    return successRes(exam);
  }

  async update(id: number, updateExamDto: UpdateExamDto) {
    const exam = await this.db.exam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException('Imtihon topilmadi');
    }
    const examDate = updateExamDto.examDate
      ? new Date(updateExamDto.examDate)
      : exam.examDate;
    await this.db.exam.update({
      where: { id },
      data: { ...updateExamDto, examDate },
    });
    return successRes({});
  }

  async remove(id: number) {
    const exam = await this.db.exam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException('Imtihon topilmadi');
    }
    const result = await this.db.examResult.findFirst({
      where: { examId: id },
    });
    if (result) {
      throw new ConflictException(
        "Imtihonda natijalar bor, o'chirib bo'lmaydi",
      );
    }
    await this.db.exam.delete({ where: { id } });
    return successRes({});
  }
}
