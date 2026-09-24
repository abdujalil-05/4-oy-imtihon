import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';
import { Roles } from '../../common/enum';

@Injectable()
export class GroupService {
  constructor(private readonly db: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    const { name, courseId, teacherId, roomId, startDate } = createGroupDto;
    const existsName = await this.db.group.findUnique({ where: { name } });
    if (existsName) {
      throw new ConflictException('Bunday nomli guruh allaqachon mavjud');
    }
    const course = await this.db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }
    const teacher = await this.db.user.findUnique({ where: { id: teacherId } });
    if (!teacher || teacher.role !== Roles.TEACHER) {
      throw new BadRequestException("O'qituvchi topilmadi");
    }
    const room = await this.db.room.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Xona topilmadi');
    }
    const group = await this.db.group.create({
      data: {
        name,
        courseId,
        teacherId,
        roomId,
        startDate: new Date(startDate),
      },
    });
    return successRes(group, 201);
  }

  async findAll() {
    const groups = await this.db.group.findMany({
      include: {
        course: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true } },
        room: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return successRes(groups);
  }

  async findOne(id: number) {
    const group = await this.db.group.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true } },
        room: { select: { id: true, name: true } },
        students: {
          include: { student: { select: { id: true, fullName: true } } },
        },
      },
    });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    return successRes(group);
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.db.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    if (updateGroupDto.teacherId) {
      const teacher = await this.db.user.findUnique({
        where: { id: updateGroupDto.teacherId },
      });
      if (!teacher || teacher.role !== Roles.TEACHER) {
        throw new BadRequestException("O'qituvchi topilmadi");
      }
    }
    const startDate = updateGroupDto.startDate
      ? new Date(updateGroupDto.startDate)
      : group.startDate;
    await this.db.group.update({
      where: { id },
      data: { ...updateGroupDto, startDate },
    });
    return successRes({});
  }

  async remove(id: number) {
    const group = await this.db.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    const lesson = await this.db.lesson.findFirst({ where: { groupId: id } });
    if (lesson) {
      throw new ConflictException("Guruhda darslar bor, o'chirib bo'lmaydi");
    }
    await this.db.groupStudent.deleteMany({ where: { groupId: id } });
    await this.db.group.delete({ where: { id } });
    return successRes({});
  }
}
