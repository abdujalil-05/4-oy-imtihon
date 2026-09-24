import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../../common/enum';

export class CreatePaymentDto {
  @ApiProperty({
    type: Number,
    example: 7,
  })
  @IsInt()
  @IsNotEmpty()
  studentId!: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  @ApiProperty({
    type: Number,
    example: 1200000,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method!: PaymentMethod;

  @ApiPropertyOptional({
    type: String,
    example: "Oktyabr oyi uchun to'lov",
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
