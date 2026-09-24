import type {
  AttendanceStatus,
  GroupStatus,
  PaymentMethod,
  Role,
  Status,
} from './types';

export function roleLabel(role: Role): string {
  return { SUPERADMIN: 'Administrator', TEACHER: "O'qituvchi", STUDENT: "O'quvchi" }[role];
}

export function statusLabel(status: Status): string {
  return status === 'ACTIVE' ? 'Faol' : 'Nofaol';
}

export function groupStatusLabel(status: GroupStatus): string {
  return { NEW: 'Yangi', ACTIVE: 'Davom etmoqda', FINISHED: 'Yakunlangan' }[status];
}

export function attendanceLabel(status: AttendanceStatus): string {
  return { PRESENT: 'Keldi', ABSENT: 'Kelmadi', LATE: 'Kechikdi' }[status];
}

export function methodLabel(method: PaymentMethod): string {
  return { CASH: 'Naqd', CARD: 'Karta', TRANSFER: "O'tkazma" }[method];
}

export const roleOptions: Array<{ value: Role; label: string }> = [
  { value: 'TEACHER', label: "O'qituvchi" },
  { value: 'STUDENT', label: "O'quvchi" },
  { value: 'SUPERADMIN', label: 'Administrator' },
];

export const statusOptions: Array<{ value: Status; label: string }> = [
  { value: 'ACTIVE', label: 'Faol' },
  { value: 'INACTIVE', label: 'Nofaol' },
];

export const groupStatusOptions: Array<{ value: GroupStatus; label: string }> = [
  { value: 'NEW', label: 'Yangi' },
  { value: 'ACTIVE', label: 'Davom etmoqda' },
  { value: 'FINISHED', label: 'Yakunlangan' },
];

export const methodOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'CASH', label: 'Naqd' },
  { value: 'CARD', label: 'Karta' },
  { value: 'TRANSFER', label: "O'tkazma" },
];

export const attendanceOptions: Array<{ value: AttendanceStatus; label: string }> = [
  { value: 'PRESENT', label: 'Keldi' },
  { value: 'LATE', label: 'Kechikdi' },
  { value: 'ABSENT', label: 'Kelmadi' },
];
