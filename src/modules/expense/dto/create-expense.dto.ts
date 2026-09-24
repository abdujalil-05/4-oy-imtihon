import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    type: String,
    example: 'Kanselyariya xaridi',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    type: Number,
    example: 450000,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({
    type: String,
    example: 'Ofis',
  })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({
    type: String,
    example: "Marker, doska tozalagich va A4 qog'oz olindi",
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
