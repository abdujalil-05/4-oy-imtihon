// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
// To'lov turlari ro'yxati
import { PaymentMethod } from '../../../common/enum';

// Yangi to'lov qo'shish uchun yuboriladigan ma'lumot
export class CreatePaymentDto {
  // To'lov qilgan o'quvchi raqami
  @IsInt()
  @IsNotEmpty()
  studentId!: number;

  // Qaysi guruh uchun to'lanayotgani
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  // To'lov summasi so'mda
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  // To'lov turi
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method!: PaymentMethod;

  // Qo'shimcha izoh
  @IsString()
  @IsOptional()
  comment?: string;
}
