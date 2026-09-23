// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Xarajatlar xizmati
import { ExpenseService } from './expense.service';
// Xarajatlar kontrolleri
import { ExpenseController } from './expense.controller';

// Xarajatlar moduli
@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
})
export class ExpenseModule {}
