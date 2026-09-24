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
  @IsInt()
  @IsNotEmpty()
  studentId!: number;

  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method!: PaymentMethod;

  @IsString()
  @IsOptional()
  comment?: string;
}
