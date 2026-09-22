import { Injectable, NotFoundException } from '@nestjs/common'; // Nest
import type { Request } from 'express'; // So'rov tipi
import { PrismaService } from '../../config/database/prisma.service'; // Baza
import { Token } from '../../infrastructure/lib/Token'; // Tokenlar
import { RevokeReason } from '../../common/enum'; // Sabablar
import { env } from '../../config'; // Sozlamalar
import { successRes } from '../../common/helper/success-response'; // Javob
import { getDeviceInfo } from '../../common/helper/device-info'; // Qurilma nomi

// Qurilmalar (sessiyalar) bilan ishlash — TZ 6-bo'lim
@Injectable()
export class DeviceService {
  constructor(private readonly db: PrismaService) {}

  // "Faol" sharti: revokedAt bo'sh VA expiresAt > hozir (TZ 6.4)
  private activeWhere(userId: number) {
    return { userId, revokedAt: null, expiresAt: { gt: new Date() } };
  }

  // Login paytida qurilma yaratish — tranzaksiyada limit bilan (TZ 6.6)
  async create(userId: number, req: Request, deviceName?: string) {
    const refreshToken = Token.getRefreshToken(); // Yangi refresh token
    const { device, userAgent, ip } = getDeviceInfo(req, deviceName); // Qurilma ma'lumoti

    const created = await this.db.$transaction(async (tx) => {
      const count = await tx.devices.count({ where: this.activeWhere(userId) }); // Faol soni
      if (count >= env.AUTH.MAX_DEVICES) {
        // Limit — eng uzoq ishlatilmaganini yopamiz
        const oldest = await tx.devices.findFirst({
          where: this.activeWhere(userId),
          orderBy: { lastUsedAt: 'asc' },
        });
        if (oldest) {
          await tx.devices.update({
            where: { deviceId: oldest.deviceId },
            data: {
              revokedAt: new Date(),
              revokedReason: RevokeReason.LIMIT_EXCEEDED,
            },
          });
        }
      }
      // Yangi qurilma — bazaga faqat xesh
      return tx.devices.create({
        data: {
          user: { connect: { id: userId } }, // Egasi
          device, // Nom
          userAgent: userAgent.slice(0, 500), // Xom UA
          ipAddress: ip, // IP
          hashedRefreshToken: Token.hashRefreshToken(refreshToken), // SHA-256
          expiresAt: Token.refreshExpiresAt(), // +7 kun
        },
      });
    });

    return { deviceId: created.deviceId, refreshToken }; // Token faqat klientga
  }

  // Rotatsiya (TZ 8.3) — muvaffaqiyatda yangi token, aks holda null
  async rotate(refreshToken: string, ip?: string) {
    const hash = Token.hashRefreshToken(refreshToken); // Kelgan token xeshi
    const device = await this.db.devices.findUnique({
      where: { hashedRefreshToken: hash }, // Joriy xesh bo'yicha
      include: { user: { select: { isActive: true } } },
    });

    if (!device) {
      // TOPILMADI — oldingi xeshlarda bormi? (reuse detection, TZ 5.4)
      const reused = await this.db.devices.findFirst({
        where: { previousTokenHash: hash },
      });
      if (reused && !reused.revokedAt) {
        await this.revoke(reused.deviceId, RevokeReason.REUSE_DETECTED); // O'g'irlik — yopamiz
      }
      return null;
    }

    // Yopilgan / muddati o'tgan / foydalanuvchi bloklangan
    if (
      device.revokedAt ||
      device.expiresAt <= new Date() ||
      !device.user.isActive
    ) {
      return null;
    }

    const newToken = Token.getRefreshToken(); // Yangi token
    // Shartli UPDATE — xesh hali eski bo'lsagina (parallel refresh himoyasi)
    const result = await this.db.devices.updateMany({
      where: { deviceId: device.deviceId, hashedRefreshToken: hash },
      data: {
        previousTokenHash: hash, // Eski → oldingi
        hashedRefreshToken: Token.hashRefreshToken(newToken), // Yangi → joriy
        lastUsedAt: new Date(), // Faollik
        expiresAt: Token.refreshExpiresAt(), // Sirpanuvchi muddat
        ipAddress: ip, // IP
      },
    });
    if (result.count === 0) return null; // Kimdir oldinroq yangilagan

    return {
      deviceId: device.deviceId,
      userId: device.userId,
      refreshToken: newToken,
    };
  }

  // Bitta qurilmani yopish
  async revoke(deviceId: string, reason: RevokeReason, tx: any = this.db) {
    await tx.devices.updateMany({
      where: { deviceId, revokedAt: null }, // Hali yopilmagan bo'lsa
      data: { revokedAt: new Date(), revokedReason: reason },
    });
  }

  // Foydalanuvchining barcha faol qurilmalarini yopish (ixtiyoriy: bittasini saqlab)
  async revokeAll(
    userId: number,
    reason: RevokeReason,
    tx: any = this.db,
    exceptId?: string,
  ) {
    await tx.devices.updateMany({
      where: {
        ...this.activeWhere(userId),
        ...(exceptId ? { deviceId: { not: exceptId } } : {}), // Joriy qurilma qolsin
      },
      data: { revokedAt: new Date(), revokedReason: reason },
    });
  }

  // Faol qurilmalar ro'yxati (TZ 8.7) — xesh chiqmaydi
  async findAll(userId: number, currentDeviceId?: string) {
    const devices = await this.db.devices.findMany({
      where: this.activeWhere(userId),
      select: {
        deviceId: true,
        device: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });
    // isCurrent — shu so'rov shu qurilmadan kelganmi
    const data = devices.map((d) => ({
      ...d,
      isCurrent: d.deviceId === currentDeviceId,
    }));
    return successRes(data);
  }

  // O'z qurilmasini uzish (TZ 8.8) — egalik so'rov ichida, topilmasa 404
  async remove(userId: number, deviceId: string) {
    const result = await this.db.devices.updateMany({
      where: { deviceId, ...this.activeWhere(userId) }, // id + userId + faol
      data: {
        revokedAt: new Date(),
        revokedReason: RevokeReason.REVOKED_BY_USER,
      },
    });
    if (result.count === 0) {
      throw new NotFoundException('Qurilma topilmadi'); // Boshqa odamniki ham 404
    }
    return successRes({});
  }
}
