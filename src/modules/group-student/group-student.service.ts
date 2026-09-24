import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupStudentDto } from './dto/create-group-student.dto';
import { UpdateGroupStudentDto } from './dto/update-group-student.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';
import { Roles } from '../../common/enum';

@Injectable()
export class GroupStudentService {
  constructor(private readonly db: PrismaService) {}

  async create(createGroupStudentDto: CreateGroupStudentDto) {
    const { groupId, studentId } = createGroupStudentDto;
    const group = await this.db.group.findUnique({
      where: { id: groupId },
      include: { room: true },
    });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    const student = await this.db.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== Roles.STUDENT) {
      throw new BadRequestException("O'quvchi topilmadi");
    }
    const exists = await this.db.groupStudent.findUnique({
      where: { groupId_studentId: { groupId, studentId } },
    });
    if (exists) {
      throw new ConflictException("O'quvchi bu guruhda allaqachon bor");
    }
    const count = await this.db.groupStudent.count({ where: { groupId } });
    if (count >= group.room.capacity) {
      throw new ConflictException("Xona sig'imi to'lgan");
    }
    const groupStudent = await this.db.groupStudent.create({
      data: { groupId, studentId },
    });
    return successRes(groupStudent, 201);
  }

  async findAll(groupId: number) {
    const students = await this.db.groupStudent.findMany({
      where: { groupId },
      include: {
        student: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successRes(students);
  }

  async update(id: number, updateGroupStudentDto: UpdateGroupStudentDto) {
    const groupStudent = await this.db.groupStudent.findUnique({
      where: { id },
    });
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi guruhda topilmadi");
    }
    await this.db.groupStudent.update({
      where: { id },
      data: updateGroupStudentDto,
    });
    return successRes({});
  }

  async remove(id: number) {
    const groupStudent = await this.db.groupStudent.findUnique({
      where: { id },
    });
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi guruhda topilmadi");
    }
    await this.db.groupStudent.delete({ where: { id } });
    return successRes({});
  }
}
