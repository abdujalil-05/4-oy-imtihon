// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Imtihonlar xizmati
import { ExamService } from './exam.service';
// Imtihonlar kontrolleri
import { ExamController } from './exam.controller';

// Imtihonlar moduli
@Module({
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}
