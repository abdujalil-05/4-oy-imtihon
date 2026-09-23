// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Topshirilgan uy vazifalari xizmati
import { HomeworkSubmissionService } from './homework-submission.service';
// Topshirilgan uy vazifalari kontrolleri
import { HomeworkSubmissionController } from './homework-submission.controller';

// Topshirilgan uy vazifalari moduli
@Module({
  controllers: [HomeworkSubmissionController],
  providers: [HomeworkSubmissionService],
})
export class HomeworkSubmissionModule {}
