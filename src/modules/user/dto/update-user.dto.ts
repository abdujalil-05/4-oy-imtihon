import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { Status } from '../../../common/enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    enum: Status,
    example: Status.INACTIVE,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
