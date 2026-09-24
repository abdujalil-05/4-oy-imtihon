import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { Status } from '../../../common/enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
