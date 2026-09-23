// Kerakli xato turlari va Nest vositasi
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateAttendanceDto } from './dto/create-attendance.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';

// Davomat bilan ishlovchi xizmat
@Injectable()
export class AttendanceService {
  constructor(private readonly db: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { lessonId, studentId } = createAttendanceDto;
    // Darsni bazadan qidiramiz
    const lesson = await this.db.lesson.findUnique({ where: { id: lessonId } });
    // Dars topilmasa xato qaytaramiz
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }
    // O'quvchi shu guruhda borligini tekshiramiz
    const groupStudent = await this.db.groupStudent.findUnique({
      where: {
        groupId_studentId: { groupId: lesson.groupId, studentId },
      },
    });
    // Guruhda bo'lmasa xato qaytaramiz
    if (!groupStudent) {
      throw new NotFoundException("O'quvchi bu guruhda yo'q");
    }
    // Shu darsda belgi qo'yilgan yoki yo'qligini tekshiramiz
    const exists = await this.db.attendance.findUnique({
      where: { lessonId_studentId: { lessonId, studentId } },
    });
    // Belgi bo'lsa xato qaytaramiz
    if (exists) {
      throw new ConflictException('Bu darsda davomat allaqachon belgilangan');
    }
    // Davomatni bazaga yozamiz
    const attendance = await this.db.attendance.create({
      data: createAttendanceDto,
    });
    // Yozilgan davomatni qaytaramiz
    return successRes(attendance, 201);
  }

  async findAll(lessonId: number) {
    // Darsdagi barcha davomat yozuvlarini olamiz
    const attendances = await this.db.attendance.findMany({
      where: { lessonId },
      include: { student: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(attendances);
  }

  async findByStudent(studentId: number) {
    // O'quvchining barcha davomat yozuvlarini olamiz
    const attendances = await this.db.attendance.findMany({
      where: { studentId },
      include: {
        lesson: { select: { id: true, topic: true, lessonDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(attendances);
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    // Davomat yozuvini bazadan qidiramiz
    const attendance = await this.db.attendance.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!attendance) {
      throw new NotFoundException('Davomat topilmadi');
    }
    // Ma'lumotlarni yangilaymiz
    await this.db.attendance.update({
      where: { id },
      data: updateAttendanceDto,
    });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Davomat yozuvini bazadan qidiramiz
    const attendance = await this.db.attendance.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!attendance) {
      throw new NotFoundException('Davomat topilmadi');
    }
    // Yozuvni o'chiramiz
    await this.db.attendance.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
