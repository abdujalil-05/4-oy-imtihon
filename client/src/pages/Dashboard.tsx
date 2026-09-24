import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Receipt,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { StatTile } from '../components/charts/StatTile';
import { RevenueBars } from '../components/charts/RevenueBars';
import { AttendanceSplit, attendanceMeta } from '../components/charts/AttendanceSplit';
import { keys, useList } from '../lib/queries';
import { date, money } from '../lib/format';
import { groupStatusLabel } from '../lib/labels';
import { monthlySeries } from '../lib/series';
import { useAuth } from '../auth/useAuth';
import type {
  Attendance,
  AttendanceStatus,
  ExamResult,
  Expense,
  ExpenseTotals,
  Group,
  Payment,
  PaymentTotals,
  Salary,
  User,
} from '../lib/types';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Xayrli tun';
  if (hour < 12) return 'Xayrli tong';
  if (hour < 18) return 'Xayrli kun';
  return 'Xayrli kech';
}

export function Dashboard() {
  const { me } = useAuth();
  const role = me?.role;

  const isAdmin = role === 'SUPERADMIN';
  const isTeacher = role === 'TEACHER';
  const isStudent = role === 'STUDENT';

  const { data: groups } = useList<Group[]>(keys.groups, '/group');
  const { data: users } = useList<User[]>(keys.users, '/user', isAdmin);
  const { data: payments } = useList<Payment[]>(keys.payments, '/payment', isAdmin);
  const { data: salaries } = useList<Salary[]>(keys.salaries, '/salary', isAdmin);
  const { data: expenses } = useList<ExpenseTotals>(keys.expenses, '/expense', isAdmin);
  const { data: myAttendance } = useList<Attendance[]>(keys.myAttendance, '/attendance/my', isStudent);
  const { data: myResults } = useList<ExamResult[]>(keys.myResults, '/exam-result/my', isStudent);
  const { data: myPayments } = useList<PaymentTotals>(keys.myPayments, '/payment/my', isStudent);

  const paymentSeries = useMemo(
    () => monthlySeries(payments ?? [], (row) => row.paidAt, (row) => row.amount),
    [payments],
  );

  const myGroups = useMemo(
    () => (groups ?? []).filter((group) => (isTeacher ? group.teacherId === me?.id : true)),
    [groups, isTeacher, me?.id],
  );

  if (!me) return null;

  const income = (payments ?? []).reduce((sum, row) => sum + row.amount, 0);
  const salaryTotal = (salaries ?? []).reduce((sum, row) => sum + row.amount, 0);
  const expenseTotal = expenses?.total ?? 0;
  const profit = income - salaryTotal - expenseTotal;
  const students = (users ?? []).filter((user) => user.role === 'STUDENT');
  const activeGroups = (groups ?? []).filter((group) => group.status === 'ACTIVE');

  const attendanceCounts: Record<AttendanceStatus, number> = {
    PRESENT: (myAttendance ?? []).filter((row) => row.status === 'PRESENT').length,
    LATE: (myAttendance ?? []).filter((row) => row.status === 'LATE').length,
    ABSENT: (myAttendance ?? []).filter((row) => row.status === 'ABSENT').length,
  };
  const attended = attendanceCounts.PRESENT + attendanceCounts.LATE;
  const attendanceRate =
    (myAttendance ?? []).length > 0
      ? Math.round((attended / (myAttendance ?? []).length) * 100)
      : 0;
  const averageScore =
    (myResults ?? []).length > 0
      ? Math.round(
          (myResults ?? []).reduce((sum, row) => sum + row.score, 0) / (myResults ?? []).length,
        )
      : 0;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${me.fullName.split(' ')[0]}`}
        subtitle={
          isAdmin
            ? "Markazning bugungi umumiy ko'rinishi"
            : isTeacher
              ? "Guruhlaringiz va darslaringiz"
              : "O'qishingiz bo'yicha qisqacha hisobot"
        }
      />

      {isAdmin ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="O'quvchilar" value={students.length} unit="ta" icon={<Users size={16} />} />
            <StatTile
              label="Faol guruhlar"
              value={activeGroups.length}
              unit="ta"
              icon={<GraduationCap size={16} />}
              note={`Jami ${(groups ?? []).length} ta guruh`}
              delay={0.06}
            />
            <StatTile
              label="Jami tushum"
              value={income}
              format={money}
              unit="so'm"
              icon={<CreditCard size={16} />}
              delay={0.12}
            />
            <StatTile
              label="Sof foyda"
              value={profit}
              format={money}
              unit="so'm"
              icon={<TrendingUp size={16} />}
              note={`Maosh ${money(salaryTotal)} · xarajat ${money(expenseTotal)}`}
              delay={0.18}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Card className="p-5">
              <h2 className="text-[15px]">Oylik tushum</h2>
              <div className="mt-5">
                <RevenueBars
                  data={paymentSeries}
                  caption="So'nggi 6 oy · qabul qilingan to'lovlar yig'indisi"
                />
              </div>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader
                title="So'nggi to'lovlar"
                action={
                  <Link
                    to="/payments"
                    className="inline-flex items-center gap-1 text-[12.5px] text-[var(--accent)] hover:underline"
                  >
                    Hammasi <ArrowUpRight size={13} />
                  </Link>
                }
              />
              {(payments ?? []).length === 0 ? (
                <EmptyState
                  icon={<CreditCard size={20} />}
                  title="To'lovlar yo'q"
                  message="Birinchi to'lov qabul qilinganda shu yerda ko'rinadi."
                />
              ) : (
                <ul className="divide-y divide-[var(--hairline)]">
                  {(payments ?? []).slice(0, 6).map((payment, index) => (
                    <motion.li
                      key={payment.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <Avatar name={payment.student?.fullName ?? '—'} size={30} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium">
                          {payment.student?.fullName}
                        </p>
                        <p className="truncate text-[12px] text-[var(--ink-3)]">
                          {payment.group?.name} · {date(payment.paidAt)}
                        </p>
                      </div>
                      <span className="shrink-0 text-[13.5px] font-medium tnum">
                        {money(payment.amount)}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      ) : null}

      {isTeacher ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Guruhlarim"
            value={myGroups.length}
            unit="ta"
            icon={<GraduationCap size={16} />}
          />
          <StatTile
            label="Faol guruhlar"
            value={myGroups.filter((group) => group.status === 'ACTIVE').length}
            unit="ta"
            delay={0.06}
          />
          <StatTile
            label="Yakunlangan"
            value={myGroups.filter((group) => group.status === 'FINISHED').length}
            unit="ta"
            delay={0.12}
          />
        </div>
      ) : null}

      {isStudent ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile
              label="Qatnashuv"
              value={attendanceRate}
              unit="%"
              icon={<CalendarCheck size={16} />}
              meter={{
                value: attendanceRate,
                max: 100,
                caption: `${attended} / ${(myAttendance ?? []).length} dars`,
              }}
            />
            <StatTile
              label="O'rtacha ball"
              value={averageScore}
              icon={<Trophy size={16} />}
              note={`${(myResults ?? []).length} ta imtihon`}
              delay={0.06}
            />
            <StatTile
              label="Jami to'lov"
              value={myPayments?.total ?? 0}
              format={money}
              unit="so'm"
              icon={<Receipt size={16} />}
              delay={0.12}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <Card className="p-5">
              <h2 className="text-[15px]">Davomat holati</h2>
              <div className="mt-4">
                <AttendanceSplit
                  counts={attendanceCounts}
                  caption={`Jami ${(myAttendance ?? []).length} ta yozuv`}
                />
              </div>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader
                title="So'nggi darslar"
                action={
                  <Link
                    to="/me/attendance"
                    className="inline-flex items-center gap-1 text-[12.5px] text-[var(--accent)] hover:underline"
                  >
                    Hammasi <ArrowUpRight size={13} />
                  </Link>
                }
              />
              {(myAttendance ?? []).length === 0 ? (
                <EmptyState
                  icon={<CalendarCheck size={20} />}
                  title="Yozuvlar yo'q"
                  message="O'qituvchi davomat belgilagach shu yerda ko'rinadi."
                />
              ) : (
                <ul className="divide-y divide-[var(--hairline)]">
                  {(myAttendance ?? []).slice(0, 6).map((row, index) => (
                    <motion.li
                      key={row.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded"
                        style={{ background: attendanceMeta[row.status].color, color: '#0b0c0e' }}
                      >
                        {attendanceMeta[row.status].icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13.5px]">
                        {row.lesson?.topic ?? 'Dars'}
                      </span>
                      <span className="shrink-0 text-[12px] text-[var(--ink-3)]">
                        {date(row.lesson?.lessonDate ?? row.createdAt)}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader
          title={isTeacher ? 'Guruhlarim' : 'Guruhlar'}
          subtitle="Guruhni bosib darslar va imtihonlarga o'ting"
          action={
            <Link
              to="/groups"
              className="inline-flex items-center gap-1 text-[12.5px] text-[var(--accent)] hover:underline"
            >
              Hammasi <ArrowUpRight size={13} />
            </Link>
          }
        />
        {myGroups.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={20} />}
            title="Guruhlar yo'q"
            message="Hozircha sizga biriktirilgan guruh topilmadi."
          />
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {myGroups.slice(0, 5).map((group, index) => (
              <motion.li
                key={group.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={`/groups/${group.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--surface-2)]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-3)] text-[var(--ink-3)]">
                    <Users size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{group.name}</span>
                    <span className="block truncate text-[12.5px] text-[var(--ink-3)]">
                      {group.course?.name} · {group.teacher?.fullName}
                    </span>
                  </span>
                  <Badge tone={group.status === 'ACTIVE' ? 'good' : 'neutral'}>
                    {groupStatusLabel(group.status)}
                  </Badge>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </Card>

      {isAdmin ? (
        <Card className="overflow-hidden">
          <CardHeader
            title="So'nggi xarajatlar"
            action={
              <Link
                to="/expenses"
                className="inline-flex items-center gap-1 text-[12.5px] text-[var(--accent)] hover:underline"
              >
                Hammasi <ArrowUpRight size={13} />
              </Link>
            }
          />
          {(expenses?.expenses ?? []).length === 0 ? (
            <EmptyState
              icon={<Wallet size={20} />}
              title="Xarajatlar yo'q"
              message="Chiqimlarni qayd etsangiz, sof foyda aniqroq hisoblanadi."
            />
          ) : (
            <ul className="divide-y divide-[var(--hairline)]">
              {(expenses?.expenses ?? []).slice(0, 5).map((expense: Expense) => (
                <li key={expense.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium">{expense.title}</span>
                    <span className="block text-[12px] text-[var(--ink-3)]">
                      {expense.category} · {date(expense.spentAt)}
                    </span>
                  </span>
                  <span className="shrink-0 text-[13.5px] font-medium tnum">
                    {money(expense.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
    </>
  );
}
