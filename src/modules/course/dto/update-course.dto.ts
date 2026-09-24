import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { Status } from '../../../common/enum';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiPropertyOptional({
    enum: Status,
    example: Status.INACTIVE,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
