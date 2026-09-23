// Tizimdagi foydalanuvchi rollari
export enum Roles {
  SUPERADMIN = 'SUPERADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

// Umumiy holat: faol yoki nofaol
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// Guruhning holati
export enum GroupStatus {
  NEW = 'NEW',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

// Davomat belgilari
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

// To'lov turlari
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
}
