import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { Status } from '../../../common/enum';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
