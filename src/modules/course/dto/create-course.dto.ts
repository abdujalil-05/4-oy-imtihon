import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    type: String,
    example: 'Frontend React',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    type: Number,
    example: 1200000,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  price!: number;

  @ApiProperty({
    type: Number,
    example: 6,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  duration!: number;

  @ApiPropertyOptional({
    type: String,
    example: "React va TypeScript asoslari, haftasiga 3 kun amaliy mashg'ulot",
  })
  @IsString()
  @IsOptional()
  description?: string;
}
