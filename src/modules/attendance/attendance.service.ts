import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';

@Injectable()
export class AttendanceService {
  constructor(private readonly db: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { lessonId, studentId } = createAttendanceDto;
    const lesson = await this.db.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }
    const groupStudent = await this.db.groupStudent.findUnique({
      where: {
        groupId_studentId: { groupId: lesson.groupId, studentId },
      },
    });
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi bu guruhda yo'q");
    }
    const exists = await this.db.attendance.findUnique({
      where: { lessonId_studentId: { lessonId, studentId } },
    });
    if (exists) {
      throw new ConflictException('Bu darsda davomat allaqachon belgilangan');
    }
    const attendance = await this.db.attendance.create({
      data: createAttendanceDto,
    });
    return successRes(attendance, 201);
  }

  async findAll(lessonId: number) {
    const attendances = await this.db.attendance.findMany({
      where: { lessonId },
      include: { student: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return successRes(attendances);
  }

  async findByStudent(studentId: number) {
    const attendances = await this.db.attendance.findMany({
      where: { studentId },
      include: {
        lesson: { select: { id: true, topic: true, lessonDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successRes(attendances);
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.db.attendance.findUnique({ where: { id } });
    if (!attendance) {
      throw new NotFoundException('Davomat topilmadi');
    }
    await this.db.attendance.update({
      where: { id },
      data: updateAttendanceDto,
    });
    return successRes({});
  }

  async remove(id: number) {
    const attendance = await this.db.attendance.findUnique({ where: { id } });
    if (!attendance) {
      throw new NotFoundException('Davomat topilmadi');
    }
    await this.db.attendance.delete({ where: { id } });
    return successRes({});
  }
}
