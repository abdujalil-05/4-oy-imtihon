// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Davomat xizmati
import { AttendanceService } from './attendance.service';
// Davomat kontrolleri
import { AttendanceController } from './attendance.controller';

// Davomat moduli
@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
