import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { AttendanceSplit, attendanceMeta } from '../../components/charts/AttendanceSplit';
import { StatTile } from '../../components/charts/StatTile';
import { keys, useList } from '../../lib/queries';
import { dateTime } from '../../lib/format';
import { attendanceLabel } from '../../lib/labels';
import type { Attendance, AttendanceStatus } from '../../lib/types';

export function MyAttendance() {
  const { data, isLoading } = useList<Attendance[]>(keys.myAttendance, '/attendance/my');
  const rows = useMemo(() => data ?? [], [data]);

  const counts: Record<AttendanceStatus, number> = {
    PRESENT: rows.filter((row) => row.status === 'PRESENT').length,
    LATE: rows.filter((row) => row.status === 'LATE').length,
    ABSENT: rows.filter((row) => row.status === 'ABSENT').length,
  };
  const rate = rows.length > 0 ? Math.round(((counts.PRESENT + counts.LATE) / rows.length) * 100) : 0;

  return (
    <>
      <PageHeader title="Davomatim" subtitle="Darslardagi ishtirokingiz tarixi" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Qatnashuv"
          value={rate}
          unit="%"
          meter={{ value: rate, max: 100, caption: `${counts.PRESENT + counts.LATE} / ${rows.length} dars` }}
        />
        <StatTile label="Kelgan darslar" value={counts.PRESENT} unit="ta" delay={0.06} />
        <StatTile label="Qoldirilgan" value={counts.ABSENT} unit="ta" delay={0.12} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-5">
          <h2 className="text-[15px]">Belgilar taqsimoti</h2>
          <div className="mt-4">
            <AttendanceSplit counts={counts} caption={`Jami ${rows.length} ta yozuv`} />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Tarix" subtitle="Eng so'nggi darslardan boshlab" />
          {isLoading ? (
            <div className="flex flex-col gap-3 p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} h={16} />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck size={20} />}
              title="Yozuvlar yo'q"
              message="O'qituvchi davomat belgilagach, bu yerda ko'rinadi."
            />
          ) : (
            <ul className="divide-y divide-[var(--hairline)]">
              {rows.map((row, index) => (
                <motion.li
                  key={row.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                    style={{ background: attendanceMeta[row.status].color, color: '#0b0c0e' }}
                  >
                    {attendanceMeta[row.status].icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{row.lesson?.topic ?? 'Dars'}</p>
                    <p className="text-[12.5px] text-[var(--ink-3)]">
                      {dateTime(row.lesson?.lessonDate ?? row.createdAt)}
                    </p>
                  </div>
                  <span className="text-[13px] text-[var(--ink-2)]">{attendanceLabel(row.status)}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
