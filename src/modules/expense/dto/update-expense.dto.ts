// Barcha maydonlarni ixtiyoriy qiluvchi vosita
import { PartialType } from '@nestjs/swagger';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateExpenseDto } from './create-expense.dto';

// Xarajatni tahrirlash uchun yuboriladigan ma'lumot
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
