import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookMarked,
  CalendarDays,
  DoorOpen,
  GraduationCap,
  NotebookPen,
  Plus,
  Trash2,
  Trophy,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Confirm } from '../components/ui/Confirm';
import { Field } from '../components/ui/Field';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { date, dateTime, relative } from '../lib/format';
import { groupStatusLabel, statusLabel } from '../lib/labels';
import { useAuth, useIsAdmin } from '../auth/useAuth';
import type { Exam, Group, GroupStudent, Lesson, User } from '../lib/types';

export function GroupDetail() {
  const { id } = useParams();
  const groupId = Number(id);
  const navigate = useNavigate();
  const { me } = useAuth();
  const isAdmin = useIsAdmin();
  const isStudent = me?.role === 'STUDENT';

  const [tab, setTab] = useState('lessons');
  const [lessonOpen, setLessonOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ topic: '', lessonDate: '' });
  const [examForm, setExamForm] = useState({ title: '', examDate: '', maxScore: '100' });
  const [studentId, setStudentId] = useState('');
  const [toRemove, setToRemove] = useState<GroupStudent | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  const { data: group, isLoading } = useList<Group>(keys.group(groupId), `/group/${groupId}`);
  const { data: lessons } = useList<Lesson[]>(keys.lessons(groupId), `/lesson/group/${groupId}`);
  const { data: exams } = useList<Exam[]>(keys.exams(groupId), `/exam/group/${groupId}`);
  const { data: students } = useList<GroupStudent[]>(
    keys.groupStudents(groupId),
    `/group-student/${groupId}`,
    !isStudent,
  );
  const { data: users } = useList<User[]>(keys.users, '/user', isAdmin);

  const createLesson = useApiMutation<void, unknown>({
    run: async () =>
      api.post('/lesson', {
        groupId,
        topic: lessonForm.topic.trim(),
        lessonDate: new Date(lessonForm.lessonDate).toISOString(),
      }),
    invalidate: [keys.lessons(groupId)],
    success: "Dars qo'shildi",
    onDone: () => {
      setLessonOpen(false);
      setLessonForm({ topic: '', lessonDate: '' });
    },
  });

  const deleteLesson = useApiMutation<number, unknown>({
    run: async (lessonId) => api.remove(`/lesson/${lessonId}`),
    invalidate: [keys.lessons(groupId)],
    success: "Dars o'chirildi",
    onDone: () => setLessonToDelete(null),
  });

  const createExam = useApiMutation<void, unknown>({
    run: async () =>
      api.post('/exam', {
        groupId,
        title: examForm.title.trim(),
        examDate: new Date(examForm.examDate).toISOString(),
        maxScore: Number(examForm.maxScore),
      }),
    invalidate: [keys.exams(groupId)],
    success: "Imtihon qo'shildi",
    onDone: () => {
      setExamOpen(false);
      setExamForm({ title: '', examDate: '', maxScore: '100' });
    },
  });

  const addStudent = useApiMutation<void, unknown>({
    run: async () => api.post('/group-student', { groupId, studentId: Number(studentId) }),
    invalidate: [keys.groupStudents(groupId)],
    success: "O'quvchi guruhga qo'shildi",
    onDone: () => {
      setStudentOpen(false);
      setStudentId('');
    },
  });

  const removeStudent = useApiMutation<number, unknown>({
    run: async (rowId) => api.remove(`/group-student/${rowId}`),
    invalidate: [keys.groupStudents(groupId)],
    success: "O'quvchi guruhdan chiqarildi",
    onDone: () => setToRemove(null),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton h={30} w="40%" />
        <Card className="h-40" />
      </div>
    );
  }

  if (!group) {
    return (
      <Card>
        <EmptyState
          icon={<GraduationCap size={20} />}
          title="Guruh topilmadi"
          message="Guruh o'chirilgan bo'lishi mumkin."
          action={<Button onClick={() => navigate('/groups')}>Guruhlarga qaytish</Button>}
        />
      </Card>
    );
  }

  const enrolled = students ?? [];
  const availableStudents = (users ?? []).filter(
    (user) => user.role === 'STUDENT' && !enrolled.some((row) => row.studentId === user.id),
  );

  const tabs = [
    { id: 'lessons', label: 'Darslar', count: lessons?.length },
    { id: 'exams', label: 'Imtihonlar', count: exams?.length },
    ...(isStudent ? [] : [{ id: 'students', label: "O'quvchilar", count: enrolled.length }]),
  ];

  return (
    <>
      <PageHeader
        title={group.name}
        subtitle={group.course?.name}
        back={{ to: '/groups', label: 'Guruhlar' }}
        action={<Badge tone="accent">{groupStatusLabel(group.status)}</Badge>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: <GraduationCap size={15} />, label: "O'qituvchi", value: group.teacher?.fullName ?? '—' },
          { icon: <DoorOpen size={15} />, label: 'Xona', value: group.room?.name ?? '—' },
          { icon: <CalendarDays size={15} />, label: 'Boshlangan', value: date(group.startDate) },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="flex items-center gap-3 rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--surface-3)] text-[var(--ink-3)]">
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-[11.5px] uppercase tracking-[0.08em] text-[var(--ink-3)]">{item.label}</p>
              <p className="truncate text-[14px] font-medium">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <Card className="overflow-hidden">
        <Tabs items={tabs} active={tab} onChange={setTab} layoutId="group-tab" />

        {tab === 'lessons' ? (
          <div>
            <CardHeader
              title="Darslar jadvali"
              subtitle="Darsni bosib davomat va uy vazifalarini boshqaring"
              action={
                isStudent ? null : (
                  <Button size="sm" icon={<Plus size={15} />} onClick={() => setLessonOpen(true)}>
                    Dars
                  </Button>
                )
              }
            />
            {(lessons ?? []).length === 0 ? (
              <EmptyState
                icon={<NotebookPen size={20} />}
                title="Darslar yo'q"
                message="Birinchi darsni qo'shing, so'ng davomat belgilaysiz."
              />
            ) : (
              <ul className="divide-y divide-[var(--hairline)]">
                {(lessons ?? []).map((lesson, index) => (
                  <motion.li
                    key={lesson.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2) }}
                    className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/lessons/${lesson.id}`)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-3)] text-[var(--ink-3)]">
                        <BookMarked size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{lesson.topic}</span>
                        <span className="block text-[12.5px] text-[var(--ink-3)]">
                          {dateTime(lesson.lessonDate)} · {relative(lesson.lessonDate)}
                        </span>
                      </span>
                    </button>
                    {isStudent ? null : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                        onClick={() => setLessonToDelete(lesson)}
                        aria-label="Darsni o'chirish"
                      >
                        <Trash2 size={14} className="text-critical" />
                      </Button>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {tab === 'exams' ? (
          <div>
            <CardHeader
              title="Imtihonlar"
              subtitle="Natijalarni kiritish uchun imtihonni oching"
              action={
                isStudent ? null : (
                  <Button size="sm" icon={<Plus size={15} />} onClick={() => setExamOpen(true)}>
                    Imtihon
                  </Button>
                )
              }
            />
            {(exams ?? []).length === 0 ? (
              <EmptyState
                icon={<Trophy size={20} />}
                title="Imtihonlar yo'q"
                message="Modul yoki yakuniy imtihon qo'shishingiz mumkin."
              />
            ) : (
              <ul className="divide-y divide-[var(--hairline)]">
                {(exams ?? []).map((exam) => {
                  const body = (
                    <>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-3)] text-[var(--ink-3)]">
                        <Trophy size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{exam.title}</span>
                        <span className="block text-[12.5px] text-[var(--ink-3)]">
                          {date(exam.examDate)}
                        </span>
                      </span>
                      <Badge tone="neutral">{exam.maxScore} ball</Badge>
                    </>
                  );
                  return (
                    <li key={exam.id}>
                      {isStudent ? (
                        <div className="flex w-full items-center gap-3 px-5 py-3.5">{body}</div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate(`/exams/${exam.id}`)}
                          className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--surface-2)]"
                        >
                          {body}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}

        {tab === 'students' ? (
          <div>
            <CardHeader
              title="Guruh o'quvchilari"
              subtitle={`${enrolled.length} ta o'quvchi`}
              action={
                isAdmin ? (
                  <Button size="sm" icon={<UserPlus size={15} />} onClick={() => setStudentOpen(true)}>
                    Qo'shish
                  </Button>
                ) : null
              }
            />
            {enrolled.length === 0 ? (
              <EmptyState
                icon={<UserPlus size={20} />}
                title="O'quvchilar yo'q"
                message="Guruhga o'quvchi qo'shilgandan so'ng davomat belgilash mumkin bo'ladi."
              />
            ) : (
              <ul className="divide-y divide-[var(--hairline)]">
                {enrolled.map((row, index) => (
                  <motion.li
                    key={row.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2) }}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <Avatar name={row.student?.fullName ?? '—'} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{row.student?.fullName}</p>
                      <p className="text-[12.5px] text-[var(--ink-3)]">
                        {row.student?.phone ?? "Telefon ko'rsatilmagan"}
                      </p>
                    </div>
                    <Badge tone={row.status === 'ACTIVE' ? 'good' : 'neutral'}>
                      {statusLabel(row.status)}
                    </Badge>
                    {isAdmin ? (
                      <Button size="sm" variant="ghost" onClick={() => setToRemove(row)} aria-label="Chiqarish">
                        <UserMinus size={14} className="text-critical" />
                      </Button>
                    ) : null}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </Card>

      <Modal
        open={lessonOpen}
        onClose={() => setLessonOpen(false)}
        title="Yangi dars"
        width={440}
        footer={
          <>
            <Button variant="ghost" onClick={() => setLessonOpen(false)}>
              Bekor qilish
            </Button>
            <Button loading={createLesson.isPending} onClick={() => createLesson.mutate()}>
              Qo'shish
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Mavzu" required>
            <Input
              value={lessonForm.topic}
              onChange={(event) => setLessonForm({ ...lessonForm, topic: event.target.value })}
              placeholder="useState va useEffect hooklari"
            />
          </Field>
          <Field label="Dars vaqti" required>
            <Input
              type="datetime-local"
              value={lessonForm.lessonDate}
              onChange={(event) => setLessonForm({ ...lessonForm, lessonDate: event.target.value })}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={examOpen}
        onClose={() => setExamOpen(false)}
        title="Yangi imtihon"
        width={440}
        footer={
          <>
            <Button variant="ghost" onClick={() => setExamOpen(false)}>
              Bekor qilish
            </Button>
            <Button loading={createExam.isPending} onClick={() => createExam.mutate()}>
              Qo'shish
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Nomi" required>
            <Input
              value={examForm.title}
              onChange={(event) => setExamForm({ ...examForm, title: event.target.value })}
              placeholder="1-modul imtihoni"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sana" required>
              <Input
                type="datetime-local"
                value={examForm.examDate}
                onChange={(event) => setExamForm({ ...examForm, examDate: event.target.value })}
              />
            </Field>
            <Field label="Maksimal ball" required>
              <Input
                type="number"
                min={1}
                value={examForm.maxScore}
                onChange={(event) => setExamForm({ ...examForm, maxScore: event.target.value })}
              />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={studentOpen}
        onClose={() => setStudentOpen(false)}
        title="Guruhga o'quvchi qo'shish"
        width={440}
        footer={
          <>
            <Button variant="ghost" onClick={() => setStudentOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              loading={addStudent.isPending}
              disabled={!studentId}
              onClick={() => addStudent.mutate()}
            >
              Qo'shish
            </Button>
          </>
        }
      >
        <Field label="O'quvchi" required>
          <Select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
            <option value="">Tanlang</option>
            {availableStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName}
              </option>
            ))}
          </Select>
        </Field>
      </Modal>

      <Confirm
        open={Boolean(toRemove)}
        title="Guruhdan chiqarish"
        message={`${toRemove?.student?.fullName} guruhdan chiqariladi.`}
        confirmLabel="Chiqarish"
        loading={removeStudent.isPending}
        onCancel={() => setToRemove(null)}
        onConfirm={() => toRemove && removeStudent.mutate(toRemove.id)}
      />

      <Confirm
        open={Boolean(lessonToDelete)}
        title="Darsni o'chirish"
        message={`"${lessonToDelete?.topic}" darsi va unga bog'liq yozuvlar o'chiriladi.`}
        loading={deleteLesson.isPending}
        onCancel={() => setLessonToDelete(null)}
        onConfirm={() => lessonToDelete && deleteLesson.mutate(lessonToDelete.id)}
      />
    </>
  );
}
