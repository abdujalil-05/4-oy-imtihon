// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Baza moduli
import { PrismaModule } from './config/database/prisma.module';
// Tizimga kirish moduli
import { AuthModule } from './modules/auth/auth.module';
// Foydalanuvchilar moduli
import { UserModule } from './modules/user/user.module';
// Kurslar moduli
import { CourseModule } from './modules/course/course.module';
// Xonalar moduli
import { RoomModule } from './modules/room/room.module';
// Guruhlar moduli
import { GroupModule } from './modules/group/group.module';
// Guruhdagi o'quvchilar moduli
import { GroupStudentModule } from './modules/group-student/group-student.module';
// Darslar moduli
import { LessonModule } from './modules/lesson/lesson.module';
// Davomat moduli
import { AttendanceModule } from './modules/attendance/attendance.module';
// To'lovlar moduli
import { PaymentModule } from './modules/payment/payment.module';
// Maoshlar moduli
import { SalaryModule } from './modules/salary/salary.module';
// Xarajatlar moduli
import { ExpenseModule } from './modules/expense/expense.module';
// Imtihonlar moduli
import { ExamModule } from './modules/exam/exam.module';
// Imtihon natijalari moduli
import { ExamResultModule } from './modules/exam-result/exam-result.module';
// Uy vazifalari moduli
import { HomeworkModule } from './modules/homework/homework.module';
// Topshirilgan uy vazifalari moduli
import { HomeworkSubmissionModule } from './modules/homework-submission/homework-submission.module';

// Loyihaning barcha modullarini yig'uvchi asosiy modul
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
