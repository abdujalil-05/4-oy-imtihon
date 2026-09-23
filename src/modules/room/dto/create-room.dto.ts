// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

// Yangi xona qo'shish uchun yuboriladigan ma'lumot
export class CreateRoomDto {
  // Xona nomi yoki raqami
  @IsString()
  @IsNotEmpty()
  name!: string;

  // Xonaga sig'adigan o'quvchilar soni
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  capacity!: number;
}
