import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  price!: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  duration!: number;

  @IsString()
  @IsOptional()
  description?: string;
}
