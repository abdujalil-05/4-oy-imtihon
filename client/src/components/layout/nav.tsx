import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  DoorOpen,
  LayoutDashboard,
  Receipt,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Role } from '../../lib/types';

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  roles: Role[];
  group: string;
}

export const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Boshqaruv paneli',
    icon: <LayoutDashboard size={17} />,
    roles: ['SUPERADMIN', 'TEACHER', 'STUDENT'],
    group: 'Umumiy',
  },
  {
    to: '/groups',
    label: 'Guruhlar',
    icon: <Users size={17} />,
    roles: ['SUPERADMIN', 'TEACHER', 'STUDENT'],
    group: 'Umumiy',
  },
  {
    to: '/courses',
    label: 'Kurslar',
    icon: <BookOpen size={17} />,
    roles: ['SUPERADMIN', 'TEACHER', 'STUDENT'],
    group: 'Umumiy',
  },
  {
    to: '/rooms',
    label: 'Xonalar',
    icon: <DoorOpen size={17} />,
    roles: ['SUPERADMIN', 'TEACHER'],
    group: 'Umumiy',
  },
  {
    to: '/users',
    label: 'Foydalanuvchilar',
    icon: <Users size={17} />,
    roles: ['SUPERADMIN'],
    group: 'Boshqaruv',
  },
  {
    to: '/payments',
    label: "To'lovlar",
    icon: <CreditCard size={17} />,
    roles: ['SUPERADMIN'],
    group: 'Moliya',
  },
  {
    to: '/salaries',
    label: 'Maoshlar',
    icon: <Wallet size={17} />,
    roles: ['SUPERADMIN'],
    group: 'Moliya',
  },
  {
    to: '/expenses',
    label: 'Xarajatlar',
    icon: <Receipt size={17} />,
    roles: ['SUPERADMIN'],
    group: 'Moliya',
  },
  {
    to: '/me/salary',
    label: 'Maoshim',
    icon: <Wallet size={17} />,
    roles: ['TEACHER'],
    group: 'Shaxsiy',
  },
  {
    to: '/me/attendance',
    label: 'Davomatim',
    icon: <CalendarCheck size={17} />,
    roles: ['STUDENT'],
    group: 'Shaxsiy',
  },
  {
    to: '/me/homework',
    label: 'Vazifalarim',
    icon: <ClipboardList size={17} />,
    roles: ['STUDENT'],
    group: 'Shaxsiy',
  },
  {
    to: '/me/results',
    label: 'Natijalarim',
    icon: <Trophy size={17} />,
    roles: ['STUDENT'],
    group: 'Shaxsiy',
  },
  {
    to: '/me/payments',
    label: "To'lovlarim",
    icon: <CreditCard size={17} />,
    roles: ['STUDENT'],
    group: 'Shaxsiy',
  },
];

export function navFor(role: Role): Array<{ group: string; items: NavItem[] }> {
  const allowed = navItems.filter((item) => item.roles.includes(role));
  const groups: string[] = [];
  allowed.forEach((item) => {
    if (!groups.includes(item.group)) groups.push(item.group);
  });
  return groups.map((group) => ({
    group,
    items: allowed.filter((item) => item.group === group),
  }));
}
