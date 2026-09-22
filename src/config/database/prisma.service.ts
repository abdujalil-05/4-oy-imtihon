import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'; // Nest lifecycle
import { PrismaPg } from '@prisma/adapter-pg'; // Prisma 7 uchun pg adapter
import { PrismaClient } from '../../../generated/prisma/client'; // Generatsiya qilingan klient
import { env } from '../index'; // Sozlamalar
import { Roles } from '../../common/enum'; // Rollar
import { Crypt } from '../../infrastructure/lib/Crypt'; // Parol xeshlash

// Baza servisi — butun loyihada bitta nusxa
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name); // Log

  constructor() {
    const adapter = new PrismaPg({ connectionString: env.DB_URI }); // pg adapter
    super({ adapter }); // Klientni adapter bilan yaratish
  }

  // Modul yuklanganda: ulanish + birinchi admin yo'q bo'lsa yaratish (TZ 7.8)
  async onModuleInit(): Promise<void> {
    await this.$connect(); // Ulanish
    this.logger.log('Database connected');

    const login = env.SUPERADMIN.LOGIN.toLowerCase(); // Login kichik harfda
    const isAdmin = await this.user.findUnique({ where: { login } }); // Bormi?
    if (!isAdmin) {
      await this.user.create({
        data: {
          login, // Login
          hashedPassword: await Crypt.hash(env.SUPERADMIN.PASSWORD), // Xeshlangan parol
          fullName: 'Administrator', // Ism
          role: Roles.ADMIN, // Rol
        },
      });
      this.logger.log('Admin created'); // Parol logga yozilmaydi
    }
  }

  // Ilova to'xtaganda ulanishni yopish
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
