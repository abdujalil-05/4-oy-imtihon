import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Medal, Plus, Trophy } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Field } from '../components/ui/Field';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { date } from '../lib/format';
import { useAuth } from '../auth/useAuth';
import type { ExamDetail as ExamDetailType, GroupStudent } from '../lib/types';

export function ExamDetail() {
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();
  const { me } = useAuth();
  const isStudent = me?.role === 'STUDENT';

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', score: '', comment: '' });

  const { data: exam, isLoading } = useList<ExamDetailType>(keys.exam(examId), `/exam/${examId}`);
  const { data: students } = useList<GroupStudent[]>(
    keys.groupStudents(exam?.groupId ?? 0),
    `/group-student/${exam?.groupId ?? 0}`,
    Boolean(exam?.groupId) && !isStudent,
  );

  const addResult = useApiMutation<void, unknown>({
    run: async () =>
      api.post('/exam-result', {
        examId,
        studentId: Number(form.studentId),
        score: Number(form.score),
        ...(form.comment.trim() ? { comment: form.comment.trim() } : {}),
      }),
    invalidate: [keys.exam(examId)],
    success: 'Natija kiritildi',
    onDone: () => {
      setOpen(false);
      setForm({ studentId: '', score: '', comment: '' });
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

  if (!exam) {
    return (
      <Card>
        <EmptyState
          icon={<Trophy size={20} />}
          title="Imtihon topilmadi"
          message="Imtihon o'chirilgan bo'lishi mumkin."
          action={<Button onClick={() => navigate('/groups')}>Guruhlarga qaytish</Button>}
        />
      </Card>
    );
  }

  const ranked = [...exam.results].sort((a, b) => b.score - a.score);
  const average =
    exam.results.length > 0
      ? Math.round(exam.results.reduce((sum, row) => sum + row.score, 0) / exam.results.length)
      : 0;
  const available = (students ?? []).filter(
    (row) => !exam.results.some((result) => result.studentId === row.studentId),
  );

  return (
    <>
      <PageHeader
        title={exam.title}
        subtitle={`${date(exam.examDate)} · maksimal ${exam.maxScore} ball`}
        back={{ to: `/groups/${exam.groupId}`, label: 'Guruhga qaytish' }}
        action={
          isStudent ? null : (
            <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>
              Natija
            </Button>
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Natijalar', value: `${exam.results.length} ta` },
          { label: "O'rtacha ball", value: `${average} / ${exam.maxScore}` },
          {
            label: 'Eng yuqori',
            value: ranked[0] ? `${ranked[0].score} ball` : '—',
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3"
          >
            <p className="text-[11.5px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
              {item.label}
            </p>
            <p className="mt-1 font-display text-[19px] font-semibold tnum">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Reyting" subtitle="Ball bo'yicha kamayish tartibida" />
        {ranked.length === 0 ? (
          <EmptyState
            icon={<Medal size={20} />}
            title="Natijalar yo'q"
            message="O'quvchilarning imtihon ballarini kiriting."
          />
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {ranked.map((result, index) => {
              const share = exam.maxScore > 0 ? (result.score / exam.maxScore) * 100 : 0;
              return (
                <motion.li
                  key={result.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.34, delay: Math.min(index * 0.04, 0.3) }}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="w-5 shrink-0 text-center text-[13px] tnum text-[var(--ink-3)]">
                    {index + 1}
                  </span>
                  <Avatar name={result.student?.fullName ?? '—'} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{result.student?.fullName}</p>
                    {result.comment ? (
                      <p className="truncate text-[12.5px] text-[var(--ink-3)]">{result.comment}</p>
                    ) : null}
                    <div className="mt-1.5 h-1 w-full max-w-56 overflow-hidden rounded-full bg-[var(--surface-3)]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(share, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.1 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-[var(--chart-fill)]"
                      />
                    </div>
                  </div>
                  <span className="shrink-0 font-display text-[17px] font-semibold tnum">
                    {result.score}
                    <span className="ml-0.5 text-[12px] font-normal text-[var(--ink-3)]">
                      /{exam.maxScore}
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Natija kiritish"
        width={440}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              loading={addResult.isPending}
              disabled={!form.studentId || !form.score}
              onClick={() => addResult.mutate()}
            >
              Saqlash
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="O'quvchi" required>
            <Select
              value={form.studentId}
              onChange={(event) => setForm({ ...form, studentId: event.target.value })}
            >
              <option value="">Tanlang</option>
              {available.map((row) => (
                <option key={row.id} value={row.studentId}>
                  {row.student?.fullName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Ball" required hint={`Maksimal ${exam.maxScore} ball`}>
            <Input
              type="number"
              min={0}
              max={exam.maxScore}
              value={form.score}
              onChange={(event) => setForm({ ...form, score: event.target.value })}
              placeholder="87"
            />
          </Field>
          <Field label="Izoh">
            <Textarea
              value={form.comment}
              onChange={(event) => setForm({ ...form, comment: event.target.value })}
              placeholder="Amaliy qismda kamchiliklar bor"
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
