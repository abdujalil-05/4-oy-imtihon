import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, ClipboardList, Plus, Users } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Field } from '../components/ui/Field';
import { Input, Textarea } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { AttendanceSplit, attendanceMeta } from '../components/charts/AttendanceSplit';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { date, dateTime } from '../lib/format';
import { attendanceOptions } from '../lib/labels';
import { useAuth } from '../auth/useAuth';
import type {
  AttendanceStatus,
  GroupStudent,
  Homework,
  LessonDetail as LessonDetailType,
} from '../lib/types';
import { cn } from '../lib/cn';

export function LessonDetail() {
  const { id } = useParams();
  const lessonId = Number(id);
  const navigate = useNavigate();
  const { me } = useAuth();
  const isStudent = me?.role === 'STUDENT';

  const [homeworkOpen, setHomeworkOpen] = useState(false);
  const [form, setForm] = useState({ title: '', deadline: '', description: '' });
  const [submitting, setSubmitting] = useState<Homework | null>(null);
  const [answer, setAnswer] = useState('');

  const { data: lesson, isLoading } = useList<LessonDetailType>(
    keys.lesson(lessonId),
    `/lesson/${lessonId}`,
  );
  const { data: students } = useList<GroupStudent[]>(
    keys.groupStudents(lesson?.groupId ?? 0),
    `/group-student/${lesson?.groupId ?? 0}`,
    Boolean(lesson?.groupId) && !isStudent,
  );

  const mark = useApiMutation<
    { studentId: number; status: AttendanceStatus; attendanceId?: number },
    unknown
  >({
    run: async ({ studentId, status, attendanceId }) =>
      attendanceId
        ? api.patch(`/attendance/${attendanceId}`, { status })
        : api.post('/attendance', { lessonId, studentId, status }),
    invalidate: [keys.lesson(lessonId)],
  });

  const createHomework = useApiMutation<void, unknown>({
    run: async () =>
      api.post('/homework', {
        lessonId,
        title: form.title.trim(),
        deadline: new Date(form.deadline).toISOString(),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      }),
    invalidate: [keys.lesson(lessonId)],
    success: "Uy vazifasi qo'shildi",
    onDone: () => {
      setHomeworkOpen(false);
      setForm({ title: '', deadline: '', description: '' });
    },
  });

  const submitHomework = useApiMutation<void, unknown>({
    run: async () =>
      api.post('/homework-submission', {
        homeworkId: submitting?.id,
        answer: answer.trim(),
      }),
    invalidate: [keys.mySubmissions],
    success: 'Vazifa topshirildi',
    onDone: () => {
      setSubmitting(null);
      setAnswer('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton h={30} w="45%" />
        <Card className="h-52" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <Card>
        <EmptyState
          icon={<CalendarClock size={20} />}
          title="Dars topilmadi"
          message="Dars o'chirilgan bo'lishi mumkin."
          action={<Button onClick={() => navigate('/groups')}>Guruhlarga qaytish</Button>}
        />
      </Card>
    );
  }

  const attendanceById = new Map(lesson.attendances.map((row) => [row.studentId, row]));
  const counts: Record<AttendanceStatus, number> = {
    PRESENT: lesson.attendances.filter((row) => row.status === 'PRESENT').length,
    LATE: lesson.attendances.filter((row) => row.status === 'LATE').length,
    ABSENT: lesson.attendances.filter((row) => row.status === 'ABSENT').length,
  };

  const roster = isStudent
    ? []
    : (students ?? []).map((row) => ({
        studentId: row.studentId,
        fullName: row.student?.fullName ?? '—',
        attendance: attendanceById.get(row.studentId),
      }));

  return (
    <>
      <PageHeader
        title={lesson.topic}
        subtitle={dateTime(lesson.lessonDate)}
        back={{ to: `/groups/${lesson.groupId}`, label: 'Guruhga qaytish' }}
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Davomat" subtitle="Har bir o'quvchi uchun belgini tanlang" />
          {isStudent ? (
            <EmptyState
              icon={<Users size={20} />}
              title="Davomat yopiq"
              message="O'z davomatingizni «Davomatim» bo'limida ko'rishingiz mumkin."
            />
          ) : roster.length === 0 ? (
            <EmptyState
              icon={<Users size={20} />}
              title="O'quvchilar yo'q"
              message="Avval guruhga o'quvchi qo'shing."
            />
          ) : (
            <ul className="divide-y divide-[var(--hairline)]">
              {roster.map((row, index) => (
                <motion.li
                  key={row.studentId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.24) }}
                  className="flex flex-wrap items-center gap-3 px-5 py-3"
                >
                  <Avatar name={row.fullName} size={32} />
                  <span className="min-w-0 flex-1 truncate font-medium">{row.fullName}</span>
                  <div className="flex gap-1 rounded-[10px] bg-[var(--surface-2)] p-1">
                    {attendanceOptions.map((option) => {
                      const active = row.attendance?.status === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={mark.isPending}
                          onClick={() =>
                            mark.mutate({
                              studentId: row.studentId,
                              status: option.value,
                              attendanceId: row.attendance?.id,
                            })
                          }
                          className={cn(
                            'relative rounded-[7px] px-2.5 py-1 text-[12.5px] transition-colors',
                            active ? 'text-[var(--accent-on-fill)]' : 'text-[var(--ink-3)] hover:text-[var(--ink)]',
                          )}
                        >
                          {active ? (
                            <motion.span
                              layoutId={`att-${row.studentId}`}
                              transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                              className="absolute inset-0 rounded-[7px]"
                              style={{ background: attendanceMeta[option.value].color }}
                            />
                          ) : null}
                          <span className="relative z-10">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="text-[15px]">Davomat holati</h2>
            <div className="mt-4">
              <AttendanceSplit
                counts={counts}
                caption={`${lesson.attendances.length} ta yozuv · ${date(lesson.lessonDate)}`}
              />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Uy vazifalari"
              action={
                isStudent ? null : (
                  <Button size="sm" icon={<Plus size={15} />} onClick={() => setHomeworkOpen(true)}>
                    Vazifa
                  </Button>
                )
              }
            />
            {lesson.homeworks.length === 0 ? (
              <EmptyState
                icon={<ClipboardList size={20} />}
                title="Vazifa yo'q"
                message="Ushbu darsga uy vazifasi biriktirilmagan."
              />
            ) : (
              <ul className="divide-y divide-[var(--hairline)]">
                {lesson.homeworks.map((homework) => (
                  <li key={homework.id}>
                    <button
                      type="button"
                      onClick={() =>
                        isStudent ? setSubmitting(homework) : navigate(`/homework/${homework.id}`)
                      }
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[var(--surface-2)]"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{homework.title}</span>
                        <span className="block text-[12.5px] text-[var(--ink-3)]">
                          Muddat: {date(homework.deadline)}
                        </span>
                      </span>
                      <Badge tone={new Date(homework.deadline) < new Date() ? 'neutral' : 'accent'}>
                        {new Date(homework.deadline) < new Date() ? 'Yopilgan' : 'Ochiq'}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(submitting)}
        onClose={() => setSubmitting(null)}
        title="Vazifani topshirish"
        description={submitting?.title}
        width={440}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSubmitting(null)}>
              Bekor qilish
            </Button>
            <Button
              loading={submitHomework.isPending}
              disabled={!answer.trim()}
              onClick={() => submitHomework.mutate()}
            >
              Topshirish
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {submitting?.description ? (
            <p className="rounded-[10px] bg-[var(--surface-2)] px-3 py-2.5 text-[13px] text-[var(--ink-2)]">
              {submitting.description}
            </p>
          ) : null}
          <Field label="Javob" required hint="GitHub havolasi yoki qisqa izoh">
            <Textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="https://github.com/username/todo-app"
              autoFocus
            />
          </Field>
          <p className="text-[12px] text-[var(--ink-3)]">
            Muddat: {dateTime(submitting?.deadline ?? '')}
          </p>
        </div>
      </Modal>

      <Modal
        open={homeworkOpen}
        onClose={() => setHomeworkOpen(false)}
        title="Yangi uy vazifasi"
        footer={
          <>
            <Button variant="ghost" onClick={() => setHomeworkOpen(false)}>
              Bekor qilish
            </Button>
            <Button loading={createHomework.isPending} onClick={() => createHomework.mutate()}>
              Qo'shish
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Sarlavha" required>
            <Input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Todo ilovasini yozish"
            />
          </Field>
          <Field label="Topshirish muddati" required>
            <Input
              type="datetime-local"
              value={form.deadline}
              onChange={(event) => setForm({ ...form, deadline: event.target.value })}
            />
          </Field>
          <Field label="Tavsif">
            <Textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Vazifa shartlari va talablar"
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
