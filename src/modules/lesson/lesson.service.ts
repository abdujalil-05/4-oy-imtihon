import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';

@Injectable()
export class LessonService {
  constructor(private readonly db: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    const { groupId, topic, lessonDate } = createLessonDto;
    const group = await this.db.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    const lesson = await this.db.lesson.create({
      data: { groupId, topic, lessonDate: new Date(lessonDate) },
    });
    return successRes(lesson, 201);
  }

  async findAll(groupId: number) {
    const lessons = await this.db.lesson.findMany({
      where: { groupId },
      orderBy: { lessonDate: 'desc' },
    });
    return successRes(lessons);
  }

  async findOne(id: number) {
    const lesson = await this.db.lesson.findUnique({
      where: { id },
      include: {
        attendances: {
          include: { student: { select: { id: true, fullName: true } } },
        },
        homeworks: true,
      },
    });
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }
    return successRes(lesson);
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.db.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }
    const lessonDate = updateLessonDto.lessonDate
      ? new Date(updateLessonDto.lessonDate)
      : lesson.lessonDate;
    await this.db.lesson.update({
      where: { id },
      data: { ...updateLessonDto, lessonDate },
    });
    return successRes({});
  }

  async remove(id: number) {
    const lesson = await this.db.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }
    const homework = await this.db.homework.findFirst({
      where: { lessonId: id },
    });
    if (homework) {
      throw new ConflictException("Darsda uy vazifasi bor, o'chirib bo'lmaydi");
    }
    await this.db.attendance.deleteMany({ where: { lessonId: id } });
    await this.db.lesson.delete({ where: { id } });
    return successRes({});
  }
}
