// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Uy vazifalari xizmati
import { HomeworkService } from './homework.service';
// Uy vazifalari kontrolleri
import { HomeworkController } from './homework.controller';

// Uy vazifalari moduli
@Module({
  controllers: [HomeworkController],
  providers: [HomeworkService],
})
export class HomeworkModule {}
