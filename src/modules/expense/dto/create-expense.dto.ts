// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// Yangi xarajat yozish uchun yuboriladigan ma'lumot
export class CreateExpenseDto {
  // Xarajat nomi
  @IsString()
  @IsNotEmpty()
  title!: string;

  // Xarajat summasi so'mda
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  // Xarajat turi masalan ijara yoki kommunal
  @IsString()
  @IsNotEmpty()
  category!: string;

  // Qo'shimcha izoh
  @IsString()
  @IsOptional()
  comment?: string;
}
