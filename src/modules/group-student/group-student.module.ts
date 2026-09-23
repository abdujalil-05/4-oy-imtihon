// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Guruh va o'quvchi bog'lanishi xizmati
import { GroupStudentService } from './group-student.service';
// Guruh va o'quvchi bog'lanishi kontrolleri
import { GroupStudentController } from './group-student.controller';

// Guruhdagi o'quvchilar moduli
@Module({
  controllers: [GroupStudentController],
  providers: [GroupStudentService],
})
export class GroupStudentModule {}
