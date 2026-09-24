import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, ClipboardList, ExternalLink, Star } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { dateTime, relative } from '../lib/format';
import type { HomeworkDetail as HomeworkDetailType, Submission } from '../lib/types';

export function HomeworkDetail() {
  const { id } = useParams();
  const homeworkId = Number(id);
  const navigate = useNavigate();
  const [grading, setGrading] = useState<Submission | null>(null);
  const [score, setScore] = useState('');

  const { data: homework, isLoading } = useList<HomeworkDetailType>(
    keys.homework(homeworkId),
    `/homework/${homeworkId}`,
  );

  const grade = useApiMutation<void, unknown>({
    run: async () => api.patch(`/homework-submission/${grading?.id}`, { score: Number(score) }),
    invalidate: [keys.homework(homeworkId)],
    success: 'Baho qo‘yildi',
    onDone: () => setGrading(null),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton h={30} w="45%" />
        <Card className="h-52" />
      </div>
    );
  }

  if (!homework) {
    return (
      <Card>
        <EmptyState
          icon={<ClipboardList size={20} />}
          title="Vazifa topilmadi"
          message="Uy vazifasi o'chirilgan bo'lishi mumkin."
          action={<Button onClick={() => navigate(-1)}>Orqaga</Button>}
        />
      </Card>
    );
  }

  const overdue = new Date(homework.deadline) < new Date();
  const graded = homework.submissions.filter((row) => row.score != null).length;

  return (
    <>
      <PageHeader
        title={homework.title}
        subtitle={homework.description ?? undefined}
        back={{ to: `/lessons/${homework.lessonId}`, label: 'Darsga qaytish' }}
        action={
          <Badge tone={overdue ? 'neutral' : 'accent'} icon={<CalendarClock size={13} />}>
            {relative(homework.deadline)}
          </Badge>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader
          title="Topshirilgan ishlar"
          subtitle={`${homework.submissions.length} ta javob · ${graded} tasi baholangan`}
        />

        {homework.submissions.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={20} />}
            title="Hali javob yo'q"
            message={`Muddat: ${dateTime(homework.deadline)}`}
          />
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {homework.submissions.map((submission, index) => (
              <motion.li
                key={submission.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: Math.min(index * 0.04, 0.25) }}
                className="flex flex-wrap items-center gap-3 px-5 py-4"
              >
                <Avatar name={submission.student?.fullName ?? '—'} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{submission.student?.fullName}</p>
                  <a
                    href={submission.answer}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1 truncate text-[12.5px] text-[var(--accent)] hover:underline"
                    onClick={(event) => {
                      if (!/^https?:\/\//.test(submission.answer)) event.preventDefault();
                    }}
                  >
                    <span className="truncate">{submission.answer}</span>
                    {/^https?:\/\//.test(submission.answer) ? (
                      <ExternalLink size={12} className="shrink-0" />
                    ) : null}
                  </a>
                  <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
                    {dateTime(submission.createdAt)}
                  </p>
                </div>

                {submission.score != null ? (
                  <Badge tone="good" icon={<Star size={12} />}>
                    {submission.score} ball
                  </Badge>
                ) : (
                  <Badge tone="warning">Baholanmagan</Badge>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setGrading(submission);
                    setScore(submission.score != null ? String(submission.score) : '');
                  }}
                >
                  {submission.score != null ? "O'zgartirish" : 'Baholash'}
                </Button>
              </motion.li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={Boolean(grading)}
        onClose={() => setGrading(null)}
        title="Ishni baholash"
        description={grading?.student?.fullName}
        width={400}
        footer={
          <>
            <Button variant="ghost" onClick={() => setGrading(null)}>
              Bekor qilish
            </Button>
            <Button loading={grade.isPending} onClick={() => grade.mutate()}>
              Saqlash
            </Button>
          </>
        }
      >
        <Field label="Ball" required hint="0 dan boshlab butun son">
          <Input
            type="number"
            min={0}
            value={score}
            onChange={(event) => setScore(event.target.value)}
            placeholder="95"
            autoFocus
          />
        </Field>
      </Modal>
    </>
  );
}
