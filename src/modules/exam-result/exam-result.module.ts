// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Imtihon natijalari xizmati
import { ExamResultService } from './exam-result.service';
// Imtihon natijalari kontrolleri
import { ExamResultController } from './exam-result.controller';

// Imtihon natijalari moduli
@Module({
  controllers: [ExamResultController],
  providers: [ExamResultService],
})
export class ExamResultModule {}
