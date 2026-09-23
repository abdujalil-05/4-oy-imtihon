// Kerakli xato turlari va Nest vositasi
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateGroupStudentDto } from './dto/create-group-student.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateGroupStudentDto } from './dto/update-group-student.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Guruh va o'quvchi bog'lanishi bilan ishlovchi xizmat
@Injectable()
export class GroupStudentService {
  constructor(private readonly db: PrismaService) {}

  async create(createGroupStudentDto: CreateGroupStudentDto) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { groupId, studentId } = createGroupStudentDto;
    // Guruhni xonasi bilan birga qidiramiz
    const group = await this.db.group.findUnique({
      where: { id: groupId },
      include: { room: true },
    });
    // Guruh topilmasa xato qaytaramiz
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    // O'quvchini bazadan qidiramiz
    const student = await this.db.user.findUnique({ where: { id: studentId } });
    // Topilgan foydalanuvchi o'quvchi ekanini tekshiramiz
    if (!student || student.role !== Roles.STUDENT) {
      throw new BadRequestException("O'quvchi topilmadi");
    }
    // O'quvchi guruhda bor yoki yo'qligini tekshiramiz
    const exists = await this.db.groupStudent.findUnique({
      where: { groupId_studentId: { groupId, studentId } },
    });
    // Allaqachon qo'shilgan bo'lsa xato qaytaramiz
    if (exists) {
      throw new ConflictException("O'quvchi bu guruhda allaqachon bor");
    }
    // Guruhdagi o'quvchilar sonini hisoblaymiz
    const count = await this.db.groupStudent.count({ where: { groupId } });
    // Xona sig'imidan oshib ketsa xato qaytaramiz
    if (count >= group.room.capacity) {
      throw new ConflictException("Xona sig'imi to'lgan");
    }
    // O'quvchini guruhga qo'shamiz
    const groupStudent = await this.db.groupStudent.create({
      data: { groupId, studentId },
    });
    // Qo'shilgan yozuvni qaytaramiz
    return successRes(groupStudent, 201);
  }

  async findAll(groupId: number) {
    // Guruhdagi o'quvchilar ro'yxatini olamiz
    const students = await this.db.groupStudent.findMany({
      where: { groupId },
      include: {
        student: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(students);
  }

  async update(id: number, updateGroupStudentDto: UpdateGroupStudentDto) {
    // Yozuvni bazadan qidiramiz
    const groupStudent = await this.db.groupStudent.findUnique({
      where: { id },
    });
    // Topilmasa xato qaytaramiz
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi guruhda topilmadi");
    }
    // Holatni yangilaymiz
    await this.db.groupStudent.update({
      where: { id },
      data: updateGroupStudentDto,
    });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Yozuvni bazadan qidiramiz
    const groupStudent = await this.db.groupStudent.findUnique({
      where: { id },
    });
    // Topilmasa xato qaytaramiz
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi guruhda topilmadi");
    }
    // O'quvchini guruhdan chiqaramiz
    await this.db.groupStudent.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
