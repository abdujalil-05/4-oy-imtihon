// Kerakli xato turlari va Nest vositasi
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateGroupDto } from './dto/create-group.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateGroupDto } from './dto/update-group.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Guruhlar bilan ishlovchi xizmat
@Injectable()
export class GroupService {
  constructor(private readonly db: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { name, courseId, teacherId, roomId, startDate } = createGroupDto;
    // Bunday nomli guruh bor yoki yo'qligini tekshiramiz
    const existsName = await this.db.group.findUnique({ where: { name } });
    // Nom band bo'lsa xato qaytaramiz
    if (existsName) {
      throw new ConflictException('Bunday nomli guruh allaqachon mavjud');
    }
    // Kursni bazadan qidiramiz
    const course = await this.db.course.findUnique({ where: { id: courseId } });
    // Kurs topilmasa xato qaytaramiz
    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }
    // O'qituvchini bazadan qidiramiz
    const teacher = await this.db.user.findUnique({ where: { id: teacherId } });
    // Topilgan foydalanuvchi o'qituvchi ekanini tekshiramiz
    if (!teacher || teacher.role !== Roles.TEACHER) {
      throw new BadRequestException("O'qituvchi topilmadi");
    }
    // Xonani bazadan qidiramiz
    const room = await this.db.room.findUnique({ where: { id: roomId } });
    // Xona topilmasa xato qaytaramiz
    if (!room) {
      throw new NotFoundException('Xona topilmadi');
    }
    // Yangi guruhni bazaga yozamiz
    const group = await this.db.group.create({
      data: {
        name,
        courseId,
        teacherId,
        roomId,
        startDate: new Date(startDate),
      },
    });
    // Yaratilgan guruhni qaytaramiz
    return successRes(group, 201);
  }

  async findAll() {
    // Barcha guruhlarni kurs, o'qituvchi va xonasi bilan olamiz
    const groups = await this.db.group.findMany({
      include: {
        course: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true } },
        room: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(groups);
  }

  async findOne(id: number) {
    // Guruhni raqami bo'yicha bog'liq ma'lumotlari bilan qidiramiz
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
    // Topilmasa xato qaytaramiz
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    // Topilgan guruhni qaytaramiz
    return successRes(group);
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    // Guruhni bazadan qidiramiz
    const group = await this.db.group.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    // Yangi o'qituvchi yuborilgan bo'lsa uni tekshiramiz
    if (updateGroupDto.teacherId) {
      const teacher = await this.db.user.findUnique({
        where: { id: updateGroupDto.teacherId },
      });
      // Topilgan foydalanuvchi o'qituvchi bo'lmasa xato qaytaramiz
      if (!teacher || teacher.role !== Roles.TEACHER) {
        throw new BadRequestException("O'qituvchi topilmadi");
      }
    }
    // Sanani kerakli ko'rinishga o'tkazamiz
    const startDate = updateGroupDto.startDate
      ? new Date(updateGroupDto.startDate)
      : group.startDate;
    // Ma'lumotlarni yangilaymiz
    await this.db.group.update({
      where: { id },
      data: { ...updateGroupDto, startDate },
    });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Guruhni bazadan qidiramiz
    const group = await this.db.group.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    // Guruhda dars borligini tekshiramiz
    const lesson = await this.db.lesson.findFirst({ where: { groupId: id } });
    // Dars bo'lsa o'chirishga ruxsat bermaymiz
    if (lesson) {
      throw new ConflictException("Guruhda darslar bor, o'chirib bo'lmaydi");
    }
    // Guruhdagi o'quvchilarni ajratamiz
    await this.db.groupStudent.deleteMany({ where: { groupId: id } });
    // Guruhni o'chiramiz
    await this.db.group.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
