import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateGroupDto } from './create-group.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { GroupStatus } from '../../../common/enum';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @ApiPropertyOptional({
    enum: GroupStatus,
    example: GroupStatus.ACTIVE,
  })
  @IsEnum(GroupStatus)
  @IsOptional()
  status?: GroupStatus;
}
