import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, ExternalLink, Star } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatTile } from '../../components/charts/StatTile';
import { keys, useList } from '../../lib/queries';
import { dateTime } from '../../lib/format';
import type { Submission } from '../../lib/types';

export function MyHomework() {
  const { data, isLoading } = useList<Submission[]>(keys.mySubmissions, '/homework-submission/my');
  const rows = useMemo(() => data ?? [], [data]);

  const graded = rows.filter((row) => row.score != null);
  const average =
    graded.length > 0
      ? Math.round(graded.reduce((sum, row) => sum + (row.score ?? 0), 0) / graded.length)
      : 0;

  return (
    <>
      <PageHeader
        title="Vazifalarim"
        subtitle="Topshirgan ishlaringiz va olingan baholar"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Topshirilgan" value={rows.length} unit="ta" />
        <StatTile label="Baholangan" value={graded.length} unit="ta" delay={0.06} />
        <StatTile label="O'rtacha baho" value={average} delay={0.12} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Topshiriqlar tarixi"
          subtitle="Yangi vazifani dars sahifasidan topshirasiz"
        />
        {isLoading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} h={18} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={20} />}
            title="Hali topshiriq yo'q"
            message="Guruh → dars sahifasiga o'ting va uy vazifasini topshiring."
          />
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {rows.map((row, index) => (
              <motion.li
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: Math.min(index * 0.04, 0.28) }}
                className="flex flex-wrap items-center gap-3 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{row.homework?.title ?? 'Uy vazifasi'}</p>
                  <a
                    href={row.answer}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => {
                      if (!/^https?:\/\//.test(row.answer)) event.preventDefault();
                    }}
                    className="inline-flex max-w-full items-center gap-1 truncate text-[12.5px] text-[var(--accent)] hover:underline"
                  >
                    <span className="truncate">{row.answer}</span>
                    {/^https?:\/\//.test(row.answer) ? (
                      <ExternalLink size={12} className="shrink-0" />
                    ) : null}
                  </a>
                  <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">{dateTime(row.createdAt)}</p>
                </div>
                {row.score != null ? (
                  <Badge tone="good" icon={<Star size={12} />}>
                    {row.score} ball
                  </Badge>
                ) : (
                  <Badge tone="warning">Tekshirilmoqda</Badge>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
