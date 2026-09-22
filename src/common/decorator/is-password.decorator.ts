import { applyDecorators } from '@nestjs/common'; // Bir nechta decoratorni birlashtirish
import { ApiProperty } from '@nestjs/swagger'; // Swagger
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'; // Validatsiya

// Parol qoidalari bitta joyda (TZ 11.2): 8–72 belgi, kamida bitta harf va raqam
export function IsPassword(example = 'parol1234') {
  return applyDecorators(
    ApiProperty({ type: String, example }), // Swagger
    IsString(), // Satr
    IsNotEmpty(), // Bo'sh emas
    Length(8, 72, { message: "Parol 8 dan 72 gacha belgi bo'lishi kerak" }), // Uzunlik
    Matches(/[a-zA-Z]/, {
      message: "Parolda kamida bitta harf bo'lishi kerak",
    }), // Harf
    Matches(/\d/, { message: "Parolda kamida bitta raqam bo'lishi kerak" }), // Raqam
  );
}
