// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Maoshlar xizmati
import { SalaryService } from './salary.service';
// Maoshlar kontrolleri
import { SalaryController } from './salary.controller';

// Maoshlar moduli
@Module({
  controllers: [SalaryController],
  providers: [SalaryService],
})
export class SalaryModule {}
