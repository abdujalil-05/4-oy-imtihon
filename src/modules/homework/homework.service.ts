import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';

@Injectable()
export class HomeworkService {
  constructor(private readonly db: PrismaService) {}

  async create(createHomeworkDto: CreateHomeworkDto) {
    const { lessonId, title, description, deadline } = createHomeworkDto;
    const lesson = await this.db.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }
    const homework = await this.db.homework.create({
      data: { lessonId, title, description, deadline: new Date(deadline) },
    });
    return successRes(homework, 201);
  }

  async findAll(lessonId: number) {
    const homeworks = await this.db.homework.findMany({
      where: { lessonId },
      orderBy: { deadline: 'desc' },
    });
    return successRes(homeworks);
  }

  async findOne(id: number) {
    const homework = await this.db.homework.findUnique({
      where: { id },
      include: {
        submissions: {
          include: { student: { select: { id: true, fullName: true } } },
        },
      },
    });
    if (!homework) {
      throw new NotFoundException('Uy vazifasi topilmadi');
    }
    return successRes(homework);
  }

  async update(id: number, updateHomeworkDto: UpdateHomeworkDto) {
    const homework = await this.db.homework.findUnique({ where: { id } });
    if (!homework) {
      throw new NotFoundException('Uy vazifasi topilmadi');
    }
    const deadline = updateHomeworkDto.deadline
      ? new Date(updateHomeworkDto.deadline)
      : homework.deadline;
    await this.db.homework.update({
      where: { id },
      data: { ...updateHomeworkDto, deadline },
    });
    return successRes({});
  }

  async remove(id: number) {
    const homework = await this.db.homework.findUnique({ where: { id } });
    if (!homework) {
      throw new NotFoundException('Uy vazifasi topilmadi');
    }
    const submission = await this.db.homeworkSubmission.findFirst({
      where: { homeworkId: id },
    });
    if (submission) {
      throw new ConflictException("Vazifaga javoblar bor, o'chirib bo'lmaydi");
    }
    await this.db.homework.delete({ where: { id } });
    return successRes({});
  }
}
