import { Global, Module } from '@nestjs/common'; // Global modul
import { PrismaService } from './prisma.service'; // Servis

// Global — hamma modulda import qilmasdan ishlatiladi
@Global()
@Module({
  providers: [PrismaService], // Ro'yxatdan o'tkazish
  exports: [PrismaService], // Eksport
})
export class PrismaModule {}
