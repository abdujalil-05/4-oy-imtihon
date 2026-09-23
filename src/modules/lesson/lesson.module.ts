// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Darslar xizmati
import { LessonService } from './lesson.service';
// Darslar kontrolleri
import { LessonController } from './lesson.controller';

// Darslar moduli
@Module({
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule {}
