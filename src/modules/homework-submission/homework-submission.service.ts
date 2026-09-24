import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHomeworkSubmissionDto } from './dto/create-homework-submission.dto';
import { UpdateHomeworkSubmissionDto } from './dto/update-homework-submission.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';

@Injectable()
export class HomeworkSubmissionService {
  constructor(private readonly db: PrismaService) {}

  async create(
    createHomeworkSubmissionDto: CreateHomeworkSubmissionDto,
    studentId: number,
  ) {
    const { homeworkId, answer } = createHomeworkSubmissionDto;
    const homework = await this.db.homework.findUnique({
      where: { id: homeworkId },
      include: { lesson: true },
    });
    if (!homework) {
      throw new NotFoundException('Uy vazifasi topilmadi');
    }
    if (homework.deadline < new Date()) {
      throw new BadRequestException("Uy vazifasi muddati o'tgan");
    }
    const groupStudent = await this.db.groupStudent.findUnique({
      where: {
        groupId_studentId: { groupId: homework.lesson.groupId, studentId },
      },
    });
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi bu guruhda yo'q");
    }
    const exists = await this.db.homeworkSubmission.findUnique({
      where: { homeworkId_studentId: { homeworkId, studentId } },
    });
    if (exists) {
      throw new ConflictException('Bu vazifa allaqachon topshirilgan');
    }
    const submission = await this.db.homeworkSubmission.create({
      data: { homeworkId, studentId, answer },
    });
    return successRes(submission, 201);
  }

  async findAll(homeworkId: number) {
    const submissions = await this.db.homeworkSubmission.findMany({
      where: { homeworkId },
      include: { student: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return successRes(submissions);
  }

  async findByStudent(studentId: number) {
    const submissions = await this.db.homeworkSubmission.findMany({
      where: { studentId },
      include: { homework: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return successRes(submissions);
  }

  async update(
    id: number,
    updateHomeworkSubmissionDto: UpdateHomeworkSubmissionDto,
  ) {
    const submission = await this.db.homeworkSubmission.findUnique({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException('Topshirilgan vazifa topilmadi');
    }
    await this.db.homeworkSubmission.update({
      where: { id },
      data: updateHomeworkSubmissionDto,
    });
    return successRes({});
  }

  async remove(id: number) {
    const submission = await this.db.homeworkSubmission.findUnique({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException('Topshirilgan vazifa topilmadi');
    }
    await this.db.homeworkSubmission.delete({ where: { id } });
    return successRes({});
  }
}
