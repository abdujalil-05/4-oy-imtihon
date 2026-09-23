// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// To'lovlar xizmati
import { PaymentService } from './payment.service';
// To'lovlar kontrolleri
import { PaymentController } from './payment.controller';

// To'lovlar moduli
@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
