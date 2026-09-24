import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '../../../common/enum';

export class UpdateGroupStudentDto {
  @IsEnum(Status)
  @IsNotEmpty()
  status!: Status;
}
