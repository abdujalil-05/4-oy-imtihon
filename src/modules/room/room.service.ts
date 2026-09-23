// Kerakli xato turlari va Nest vositasi
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateRoomDto } from './dto/create-room.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateRoomDto } from './dto/update-room.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';

// Xonalar bilan ishlovchi xizmat
@Injectable()
export class RoomService {
  constructor(private readonly db: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    // Bunday nomli xona bor yoki yo'qligini tekshiramiz
    const existsName = await this.db.room.findUnique({
      where: { name: createRoomDto.name },
    });
    // Nom band bo'lsa xato qaytaramiz
    if (existsName) {
      throw new ConflictException('Bunday nomli xona allaqachon mavjud');
    }
    // Yangi xonani bazaga yozamiz
    const room = await this.db.room.create({ data: createRoomDto });
    // Yaratilgan xonani qaytaramiz
    return successRes(room, 201);
  }

  async findAll() {
    // Barcha xonalarni olamiz
    const rooms = await this.db.room.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(rooms);
  }

  async findOne(id: number) {
    // Xonani raqami bo'yicha guruhlari bilan qidiramiz
    const room = await this.db.room.findUnique({
      where: { id },
      include: { groups: true },
    });
    // Topilmasa xato qaytaramiz
    if (!room) {
      throw new NotFoundException('Xona topilmadi');
    }
    // Topilgan xonani qaytaramiz
    return successRes(room);
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    // Xonani bazadan qidiramiz
    const room = await this.db.room.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!room) {
      throw new NotFoundException('Xona topilmadi');
    }
    // Ma'lumotlarni yangilaymiz
    await this.db.room.update({ where: { id }, data: updateRoomDto });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Xonani bazadan qidiramiz
    const room = await this.db.room.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!room) {
      throw new NotFoundException('Xona topilmadi');
    }
    // Xonaga biriktirilgan guruh borligini tekshiramiz
    const group = await this.db.group.findFirst({ where: { roomId: id } });
    // Guruh bo'lsa o'chirishga ruxsat bermaymiz
    if (group) {
      throw new ConflictException("Xonada guruhlar bor, o'chirib bo'lmaydi");
    }
    // Xonani o'chiramiz
    await this.db.room.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
