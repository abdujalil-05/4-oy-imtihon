import { useMemo } from 'react';
import { Wallet } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatTile } from '../../components/charts/StatTile';
import { RevenueBars } from '../../components/charts/RevenueBars';
import { keys, useList } from '../../lib/queries';
import { date, money, monthLabel } from '../../lib/format';
import { monthlySeries } from '../../lib/series';
import type { Salary, SalaryTotals } from '../../lib/types';

export function MySalary() {
  const { data, isLoading } = useList<SalaryTotals>(keys.mySalary, '/salary/my');
  const salaries = useMemo(() => data?.salaries ?? [], [data]);
  const series = useMemo(
    () => monthlySeries(salaries, (row) => row.paidAt, (row) => row.amount),
    [salaries],
  );
  const average =
    salaries.length > 0 ? Math.round((data?.total ?? 0) / salaries.length) : 0;

  const columns: Array<Column<Salary>> = [
    {
      key: 'month',
      label: 'Oy',
      render: (row) => <span className="font-medium">{monthLabel(row.month)}</span>,
    },
    {
      key: 'paidAt',
      label: "To'langan sana",
      hideOnMobile: true,
      render: (row) => <span className="text-[var(--ink-2)]">{date(row.paidAt)}</span>,
    },
    {
      key: 'comment',
      label: 'Izoh',
      hideOnMobile: true,
      render: (row) => <span className="text-[var(--ink-3)]">{row.comment ?? '—'}</span>,
    },
    {
      key: 'amount',
      label: 'Summa',
      align: 'right',
      render: (row) => <span className="font-medium">{money(row.amount)}</span>,
    },
  ];

  return (
    <>
      <PageHeader title="Maoshim" subtitle="Oylik to'lovlaringiz tarixi" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Jami olingan"
          value={data?.total ?? 0}
          format={money}
          unit="so'm"
          icon={<Wallet size={16} />}
        />
        <StatTile label="Oylar" value={salaries.length} unit="ta" delay={0.06} />
        <StatTile label="O'rtacha" value={average} format={money} unit="so'm" delay={0.12} />
      </div>

      {salaries.length > 0 ? (
        <Card className="p-5">
          <h2 className="text-[15px]">Oylar kesimida</h2>
          <div className="mt-5">
            <RevenueBars data={series} caption="So'nggi 6 oy · olingan maosh" />
          </div>
        </Card>
      ) : null}

      <Card>
        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : salaries.length === 0 ? (
          <EmptyState
            icon={<Wallet size={20} />}
            title="Maosh yozuvlari yo'q"
            message="Administrator maosh kiritgach, u shu yerda ko'rinadi."
          />
        ) : (
          <Table columns={columns} rows={salaries} rowKey={(row) => row.id} />
        )}
      </Card>
    </>
  );
}
