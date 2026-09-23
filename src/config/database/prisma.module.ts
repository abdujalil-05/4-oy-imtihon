// Modul yasash uchun Nest vositalari
import { Global, Module } from '@nestjs/common';
// Baza bilan ishlovchi xizmat
import { PrismaService } from './prisma.service';

// Baza xizmatini butun loyihaga ochib beruvchi modul
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
