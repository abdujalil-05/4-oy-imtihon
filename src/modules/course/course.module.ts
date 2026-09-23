// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Kurslar xizmati
import { CourseService } from './course.service';
// Kurslar kontrolleri
import { CourseController } from './course.controller';

// Kurslar moduli
@Module({
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
