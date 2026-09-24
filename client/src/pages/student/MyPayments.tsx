import { useMemo } from 'react';
import { CreditCard } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatTile } from '../../components/charts/StatTile';
import { RevenueBars } from '../../components/charts/RevenueBars';
import { keys, useList } from '../../lib/queries';
import { date, money } from '../../lib/format';
import { methodLabel } from '../../lib/labels';
import { monthlySeries } from '../../lib/series';
import type { Payment, PaymentTotals } from '../../lib/types';

export function MyPayments() {
  const { data, isLoading } = useList<PaymentTotals>(keys.myPayments, '/payment/my');
  const payments = useMemo(() => data?.payments ?? [], [data]);
  const series = useMemo(
    () => monthlySeries(payments, (row) => row.paidAt, (row) => row.amount),
    [payments],
  );

  const columns: Array<Column<Payment>> = [
    {
      key: 'group',
      label: 'Guruh',
      render: (row) => <span className="font-medium">{row.group?.name ?? '—'}</span>,
    },
    {
      key: 'method',
      label: 'Turi',
      hideOnMobile: true,
      render: (row) => <Badge tone="neutral">{methodLabel(row.method)}</Badge>,
    },
    {
      key: 'paidAt',
      label: 'Sana',
      render: (row) => <span className="text-[var(--ink-2)]">{date(row.paidAt)}</span>,
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
      <PageHeader title="To'lovlarim" subtitle="Kurs uchun amalga oshirgan to'lovlaringiz" />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Jami to'langan"
          value={data?.total ?? 0}
          format={money}
          unit="so'm"
          icon={<CreditCard size={16} />}
        />
        <StatTile label="To'lovlar soni" value={payments.length} unit="ta" delay={0.06} />
      </div>

      {payments.length > 0 ? (
        <Card className="p-5">
          <h2 className="text-[15px]">Oylar kesimida</h2>
          <div className="mt-5">
            <RevenueBars data={series} caption="So'nggi 6 oy · sizning to'lovlaringiz" />
          </div>
        </Card>
      ) : null}

      <Card>
        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={<CreditCard size={20} />}
            title="To'lovlar yo'q"
            message="To'lov qabul qilingach, u shu yerda ko'rinadi."
          />
        ) : (
          <Table columns={columns} rows={payments} rowKey={(row) => row.id} />
        )}
      </Card>
    </>
  );
}
