// Nest xizmati uchun kerakli vositalar
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
// Postgres uchun prisma adapteri
import { PrismaPg } from '@prisma/adapter-pg';
// Generatsiya qilingan prisma klienti
import { PrismaClient } from '../../../generated/prisma/client';
// Sozlamalar
import { env } from '../index';
// Rollar ro'yxati
import { Roles } from '../../common/enum';
// Parolni shifrlovchi klass
import { Crypt } from '../../infrastructure/lib/Crypt';

// Baza bilan ishlovchi xizmat
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Baza holatini yozuvchi logger
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Postgres adapterini ulanish manzili bilan yasaymiz
    const adapter = new PrismaPg({
      connectionString: env.DB_URI,
    });
    // Prisma klientini adapter bilan ishga tushiramiz
    super({
      adapter,
    });
  }

  async onModuleInit(): Promise<void> {
    // Bazaga ulanamiz
    await this.$connect();
    // Ulanganini konsolga yozamiz
    this.logger.log('Database connected');

    // Bazada superadmin bor yoki yo'qligini tekshiramiz
    const isSuperAdmin = await this.user.findFirst({
      where: {
        role: Roles.SUPERADMIN,
      },
    });
    // Superadmin yo'q bo'lsa uni sozlamalardagi ma'lumot bilan yaratamiz
    if (!isSuperAdmin) {
      await this.user.create({
        data: {
          login: env.SUPERADMIN.LOGIN,
          hashedPassword: await Crypt.hash(env.SUPERADMIN.PASSWORD),
          fullName: 'Super Admin',
          role: Roles.SUPERADMIN,
        },
      });
      // Yaratilganini konsolga yozamiz
      console.log('Super admin created');
    }
  }

  async onModuleDestroy(): Promise<void> {
    // Bazadan uzilamiz
    await this.$disconnect();
    // Uzilganini konsolga yozamiz
    this.logger.log('Database disconnected');
  }
}
