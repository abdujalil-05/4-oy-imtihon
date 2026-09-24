import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '../../../common/enum';

export class UpdateGroupStudentDto {
  @ApiProperty({
    enum: Status,
    example: Status.INACTIVE,
  })
  @IsEnum(Status)
  @IsNotEmpty()
  status!: Status;
}
