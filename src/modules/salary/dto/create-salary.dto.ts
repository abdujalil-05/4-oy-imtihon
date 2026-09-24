import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateSalaryDto {
  @IsInt()
  @IsNotEmpty()
  teacherId!: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @Matches(/^\d{4}-\d{2}$/, { message: "Oy 2026-09 ko'rinishida bo'lsin" })
  @IsNotEmpty()
  month!: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
