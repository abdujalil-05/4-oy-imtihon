export type Role = 'SUPERADMIN' | 'TEACHER' | 'STUDENT';
export type Status = 'ACTIVE' | 'INACTIVE';
export type GroupStatus = 'NEW' | 'ACTIVE' | 'FINISHED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export interface ApiSuccess<T> {
  statusCode: number;
  data: T;
}

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  path: string;
  timestamp: string;
}

export interface Me {
  id: number;
  login: string;
  fullName: string;
  phone: string | null;
  imageUrl: string | null;
  role: Role;
  status: Status;
}

export type User = Me;

export interface Device {
  deviceId: number;
  device: string;
  userId: number;
  createdAt: string;
}

export interface Course {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ref {
  id: number;
  name: string;
}

export interface PersonRef {
  id: number;
  fullName: string;
  phone?: string | null;
}

export interface Group {
  id: number;
  name: string;
  courseId: number;
  teacherId: number;
  roomId: number;
  startDate: string;
  status: GroupStatus;
  course?: Ref;
  teacher?: PersonRef;
  room?: Ref;
  createdAt: string;
  updatedAt: string;
}

export interface GroupStudent {
  id: number;
  groupId: number;
  studentId: number;
  status: Status;
  student?: PersonRef;
  createdAt: string;
}

export interface GroupDetail extends Group {
  students: GroupStudent[];
}

export interface Lesson {
  id: number;
  groupId: number;
  topic: string;
  lessonDate: string;
  createdAt: string;
}

export interface Attendance {
  id: number;
  lessonId: number;
  studentId: number;
  status: AttendanceStatus;
  comment: string | null;
  student?: PersonRef;
  lesson?: { id: number; topic: string; lessonDate: string };
  createdAt: string;
}

export interface LessonDetail extends Lesson {
  attendances: Attendance[];
  homeworks: Homework[];
}

export interface Homework {
  id: number;
  lessonId: number;
  title: string;
  description: string | null;
  deadline: string;
  createdAt: string;
}

export interface Submission {
  id: number;
  homeworkId: number;
  studentId: number;
  answer: string;
  score: number | null;
  student?: PersonRef;
  homework?: { id: number; title: string };
  createdAt: string;
}

export interface HomeworkDetail extends Homework {
  submissions: Submission[];
}

export interface Exam {
  id: number;
  groupId: number;
  title: string;
  examDate: string;
  maxScore: number;
  createdAt: string;
}

export interface ExamResult {
  id: number;
  examId: number;
  studentId: number;
  score: number;
  comment: string | null;
  student?: PersonRef;
  exam?: { id: number; title: string; maxScore: number };
  createdAt: string;
}

export interface ExamDetail extends Exam {
  results: ExamResult[];
}

export interface Payment {
  id: number;
  studentId: number;
  groupId: number;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  comment: string | null;
  student?: PersonRef;
  group?: Ref;
}

export interface Salary {
  id: number;
  teacherId: number;
  amount: number;
  month: string;
  paidAt: string;
  comment: string | null;
  teacher?: PersonRef;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  spentAt: string;
  comment: string | null;
}

export interface PaymentTotals {
  total: number;
  payments: Payment[];
}

export interface SalaryTotals {
  total: number;
  salaries: Salary[];
}

export interface ExpenseTotals {
  total: number;
  expenses: Expense[];
}
