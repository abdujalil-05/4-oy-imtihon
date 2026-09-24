import { Module } from '@nestjs/common';
import { GroupStudentService } from './group-student.service';
import { GroupStudentController } from './group-student.controller';

@Module({
  controllers: [GroupStudentController],
  providers: [GroupStudentService],
})
export class GroupStudentModule {}
