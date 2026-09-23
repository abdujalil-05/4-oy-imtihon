// Barcha maydonlarni ixtiyoriy qiluvchi vosita
import { PartialType } from '@nestjs/swagger';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreatePaymentDto } from './create-payment.dto';

// To'lovni tahrirlash uchun yuboriladigan ma'lumot
export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
