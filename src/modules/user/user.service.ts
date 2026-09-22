import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'; // Xatolar
import { PrismaService } from '../../config/database/prisma.service'; // Baza
import { Crypt } from '../../infrastructure/lib/Crypt'; // Parol
import { RevokeReason } from '../../common/enum'; // Sabablar
import { successRes } from '../../common/helper/success-response'; // Javob
import { DeviceService } from '../auth/device.service'; // Qurilmalar
import { CreateUserDto } from './dto/create-user.dto'; // DTO
import { QueryUserDto } from './dto/query-user.dto'; // DTO

// API javobida qaytadigan maydonlar — hashedPassword YO'Q
const userSelect = {
  id: true,
  login: true,
  fullName: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
};

// Admin amallari (TZ 8.10)
@Injectable()
export class UserService {
  constructor(
    private readonly db: PrismaService, // Baza
    private readonly device: DeviceService, // Qurilmalar
  ) {}

  // Mavjudligini tekshirish — yo'q bo'lsa 404
  private async findOrFail(id: number) {
    const user = await this.db.user.findUnique({
      where: { id },
      select: userSelect,
    });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    return user;
  }

  // Yaratish — login kichik harfda, band → 409, parol xeshlanadi
  async create(dto: CreateUserDto) {
    const login = dto.login.toLowerCase(); // Kichik harf
    const existsLogin = await this.db.user.findUnique({ where: { login } }); // Bandmi?
    if (existsLogin) {
      throw new ConflictException('Bu login band');
    }
    const hashedPassword = await Crypt.hash(dto.password); // Xesh
    const user = await this.db.user.create({
      data: { login, hashedPassword, fullName: dto.fullName, role: dto.role },
      select: userSelect, // Xesh qaytmaydi
    });
    return successRes(user, 201);
  }

  // Ro'yxat — rol va holat bo'yicha filtr
  async findAll(query: QueryUserDto) {
    const users = await this.db.user.findMany({
      where: { role: query.role, isActive: query.isActive }, // undefined → filtr yo'q
      select: userSelect,
      orderBy: { id: 'asc' },
    });
    return successRes(users);
  }

  // Bloklash / ochish
  async updateStatus(id: number, isActive: boolean, adminId: number) {
    if (id === adminId) {
      throw new BadRequestException("Admin o'zini bloklay olmaydi"); // O'zini emas
    }
    await this.findOrFail(id); // 404
    if (!isActive) {
      // Bloklash — tranzaksiyada: isActive=false + barcha qurilmalar yopiladi
      const user = await this.db.$transaction(async (tx) => {
        const updated = await tx.user.update({
          where: { id },
          data: { isActive: false },
          select: userSelect,
        });
        await this.device.revokeAll(id, RevokeReason.ADMIN_REVOKED, tx);
        return updated;
      });
      return successRes(user);
    }
    // Ochish — hisoblagich va blok tozalanadi
    const user = await this.db.user.update({
      where: { id },
      data: { isActive: true, failedLoginCount: 0, lockedUntil: null },
      select: userSelect,
    });
    return successRes(user);
  }

  // Parolni tiklash — yangi xesh + barcha qurilmalar yopiladi
  async resetPassword(id: number, newPassword: string) {
    await this.findOrFail(id); // 404
    const hashedPassword = await Crypt.hash(newPassword); // Xesh
    await this.db.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { hashedPassword } });
      await this.device.revokeAll(id, RevokeReason.ADMIN_REVOKED, tx);
    });
    return successRes({});
  }

  // Foydalanuvchi qurilmalari (isCurrent'siz)
  async findDevices(id: number) {
    await this.findOrFail(id); // 404
    return this.device.findAll(id);
  }

  // Hammasidan chiqarish
  async removeDevices(id: number) {
    await this.findOrFail(id); // 404
    await this.device.revokeAll(id, RevokeReason.ADMIN_REVOKED);
    return successRes({});
  }
}
