import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
