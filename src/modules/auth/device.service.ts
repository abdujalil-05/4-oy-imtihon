// Kerakli xato turi va Nest vositasi
import { BadRequestException, Injectable } from '@nestjs/common';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';
// Token bilan ishlovchi klass
import { Token } from '../../infrastructure/lib/Token';

// Qurilmalar bilan ishlovchi xizmat
@Injectable()
export class DeviceService {
  constructor(private readonly db: PrismaService) {}

  async findAll(userId: number) {
    // Foydalanuvchining barcha qurilmalarini olamiz
    const devices = await this.db.devices.findMany({
      where: { userId },
      select: {
        deviceId: true,
        device: true,
        createdAt: true,
      },
    });
    // Ro'yxatni qaytaramiz
    return successRes(devices);
  }

  async remove(refreshToken: string, id: number) {
    // Refresh tokenni tekshiramiz
    const verifiedData = await Token.verifyToken(refreshToken, 'refresh');
    // Token yasalgan vaqtni sanaga aylantiramiz
    const iatDate = new Date(verifiedData.iat * 1000);
    // Hozirgi vaqtni olamiz
    const currentDate = new Date();
    // Ikki vaqt orasidagi farqni daqiqada hisoblaymiz
    const diffInMinutes = Math.floor(
      (currentDate.getTime() - iatDate.getTime()) / (1000 * 60),
    );
    // 24 soat o'tmagan bo'lsa o'chirishga ruxsat bermaymiz
    if (diffInMinutes < 1440) {
      throw new BadRequestException(
        "Eski qurilmani o'chirish uchun 24 soat talab etiladi",
      );
    }
    // Joriy qurilmani o'chirishga ruxsat bermaymiz
    if (verifiedData.deviceId === id) {
      throw new BadRequestException("Joriy qurilmani o'chirib bo'lmaydi");
    }
    // Qurilmani bazadan o'chiramiz
    await this.db.devices.delete({ where: { deviceId: id } });
    // Bo'sh javob qaytaramiz
    return successRes({});
  }
}
