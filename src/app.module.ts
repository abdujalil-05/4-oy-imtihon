import { Module } from '@nestjs/common';
import { PrismaModule } from './config/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from './modules/course/course.module';
import { RoomModule } from './modules/room/room.module';
import { GroupModule } from './modules/group/group.module';
import { GroupStudentModule } from './modules/group-student/group-student.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SalaryModule } from './modules/salary/salary.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { ExamModule } from './modules/exam/exam.module';
import { ExamResultModule } from './modules/exam-result/exam-result.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { HomeworkSubmissionModule } from './modules/homework-submission/homework-submission.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    CourseModule,
    RoomModule,
    GroupModule,
    GroupStudentModule,
    LessonModule,
    AttendanceModule,
    PaymentModule,
    SalaryModule,
    ExpenseModule,
    ExamModule,
    ExamResultModule,
    HomeworkModule,
    HomeworkSubmissionModule,
  ],
})
export class AppModule {}
