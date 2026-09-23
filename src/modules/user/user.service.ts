// Kerakli xato turlari va Nest vositasi
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateUserDto } from './dto/create-user.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateUserDto } from './dto/update-user.dto';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Parol bilan ishlovchi klass
import { Crypt } from '../../infrastructure/lib/Crypt';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';
// Fayl bilan ishlovchi klass
import { File } from '../../infrastructure/lib/File';

// Foydalanuvchilar bilan ishlovchi xizmat
@Injectable()
export class UserService {
  constructor(private readonly db: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Kiruvchi ma'lumotni ajratib olamiz
    const { login, password, fullName, role, phone } = createUserDto;
    // Bunday login bor yoki yo'qligini tekshiramiz
    const existsLogin = await this.db.user.findUnique({ where: { login } });
    // Login band bo'lsa xato qaytaramiz
    if (existsLogin) {
      throw new ConflictException('Bunday login allaqachon mavjud');
    }
    // Parolni shifrlaymiz
    const hashedPassword = await Crypt.hash(password);
    // Yangi foydalanuvchini bazaga yozamiz
    const user = await this.db.user.create({
      data: { login, hashedPassword, fullName, role, phone },
      select: {
        id: true,
        login: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
      },
    });
    // Yaratilgan foydalanuvchini qaytaramiz
    return successRes(user, 201);
  }

  async findAll() {
    // Barcha foydalanuvchilarni olamiz
    const users = await this.db.user.findMany({
      select: {
        id: true,
        login: true,
        fullName: true,
        phone: true,
        imageUrl: true,
        role: true,
        status: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    // Ro'yxatni qaytaramiz
    return successRes(users);
  }

  async findOne(id: number) {
    // Foydalanuvchini raqami bo'yicha qidiramiz
    const user = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        fullName: true,
        phone: true,
        imageUrl: true,
        role: true,
        status: true,
      },
    });
    // Topilmasa xato qaytaramiz
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    // Topilgan foydalanuvchini qaytaramiz
    return successRes(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    image?: Express.Multer.File,
  ) {
    // Foydalanuvchini bazadan qidiramiz
    const user = await this.db.user.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    // Eski parolni boshlang'ich qiymat qilib olamiz
    let hashedPassword = user.hashedPassword;
    // Yangi parol yuborilgan bo'lsa uni shifrlaymiz
    if (updateUserDto.password) {
      hashedPassword = await Crypt.hash(updateUserDto.password);
    }
    // Eski rasmni boshlang'ich qiymat qilib olamiz
    let imageUrl = user.imageUrl;
    // Yangi rasm yuborilgan bo'lsa eskisini almashtiramiz
    if (image) {
      // Eski rasm bo'lsa uni o'chiramiz
      if (imageUrl && (await File.exist(imageUrl))) {
        await File.delete(imageUrl);
      }
      // Yangi rasmni saqlaymiz
      imageUrl = await File.create(image);
    }
    // Ochiq parolni saqlamaymiz
    delete updateUserDto.password;
    // Ma'lumotlarni yangilaymiz
    await this.db.user.update({
      where: { id },
      data: { imageUrl, hashedPassword, ...updateUserDto },
    });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async remove(id: number) {
    // Foydalanuvchini bazadan qidiramiz
    const user = await this.db.user.findUnique({ where: { id } });
    // Topilmasa xato qaytaramiz
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    // Rasmi bo'lsa uni diskdan o'chiramiz
    if (user.imageUrl && (await File.exist(user.imageUrl))) {
      await File.delete(user.imageUrl);
    }
    // Foydalanuvchining qurilmalarini o'chiramiz
    await this.db.devices.deleteMany({ where: { userId: id } });
    // Foydalanuvchini o'chiramiz
    await this.db.user.delete({ where: { id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
