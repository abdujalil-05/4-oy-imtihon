import { useMemo, useState } from 'react';
import { CreditCard, Plus, Trash2, Wallet } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Confirm } from '../components/ui/Confirm';
import { Field } from '../components/ui/Field';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatTile } from '../components/charts/StatTile';
import { RevenueBars } from '../components/charts/RevenueBars';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { date, money } from '../lib/format';
import { methodLabel, methodOptions } from '../lib/labels';
import { monthlySeries } from '../lib/series';
import type { Group, Payment, PaymentMethod, User } from '../lib/types';

export function Payments() {
  const { data, isLoading } = useList<Payment[]>(keys.payments, '/payment');
  const { data: users } = useList<User[]>(keys.users, '/user');
  const { data: groups } = useList<Group[]>(keys.groups, '/group');

  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Payment | null>(null);
  const [form, setForm] = useState({
    studentId: '',
    groupId: '',
    amount: '',
    method: 'CASH' as PaymentMethod,
    comment: '',
  });

  const payments = useMemo(() => data ?? [], [data]);
  const total = payments.reduce((sum, row) => sum + row.amount, 0);
  const thisMonth = payments
    .filter((row) => new Date(row.paidAt).getMonth() === new Date().getMonth())
    .reduce((sum, row) => sum + row.amount, 0);
  const series = useMemo(() => monthlySeries(payments, (row) => row.paidAt, (row) => row.amount), [payments]);

  const create = useApiMutation<void, unknown>({
    run: async () =>
      api.post('/payment', {
        studentId: Number(form.studentId),
        groupId: Number(form.groupId),
        amount: Number(form.amount),
        method: form.method,
        ...(form.comment.trim() ? { comment: form.comment.trim() } : {}),
      }),
    invalidate: [keys.payments],
    success: "To'lov qabul qilindi",
    onDone: () => {
      setOpen(false);
      setForm({ studentId: '', groupId: '', amount: '', method: 'CASH', comment: '' });
    },
  });

  const remove = useApiMutation<number, unknown>({
    run: async (id) => api.remove(`/payment/${id}`),
    invalidate: [keys.payments],
    success: "To'lov o'chirildi",
    onDone: () => setToDelete(null),
  });

  const columns: Array<Column<Payment>> = [
    {
      key: 'student',
      label: "O'quvchi",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.student?.fullName ?? '—'}</p>
          <p className="truncate text-[12.5px] text-[var(--ink-3)]">{row.group?.name}</p>
        </div>
      ),
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
      hideOnMobile: true,
      render: (row) => <span className="text-[var(--ink-2)]">{date(row.paidAt)}</span>,
    },
    {
      key: 'amount',
      label: 'Summa',
      align: 'right',
      render: (row) => <span className="font-medium">{money(row.amount)}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '56px',
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => setToDelete(row)} aria-label="O'chirish">
          <Trash2 size={14} className="text-critical" />
        </Button>
      ),
    },
  ];

  const students = (users ?? []).filter((user) => user.role === 'STUDENT');

  return (
    <>
      <PageHeader
        title="To'lovlar"
        subtitle="O'quvchilarning kurs to'lovlari"
        action={
          <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            To'lov qabul qilish
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Jami tushum" value={total} format={money} unit="so'm" icon={<Wallet size={16} />} />
        <StatTile
          label="Shu oyda"
          value={thisMonth}
          format={money}
          unit="so'm"
          icon={<CreditCard size={16} />}
          delay={0.06}
        />
        <StatTile label="To'lovlar soni" value={payments.length} unit="ta" delay={0.12} />
      </div>

      {series.length > 1 ? (
        <Card className="p-5">
          <h2 className="text-[15px]">Oylar kesimida tushum</h2>
          <div className="mt-5">
            <RevenueBars data={series} caption="So'nggi 6 oy · qabul qilingan to'lovlar yig'indisi" />
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
            message="Birinchi to'lovni qabul qiling — u shu yerda ko'rinadi."
            action={<Button onClick={() => setOpen(true)}>To'lov qabul qilish</Button>}
          />
        ) : (
          <Table columns={columns} rows={payments} rowKey={(row) => row.id} />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="To'lov qabul qilish"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button loading={create.isPending} onClick={() => create.mutate()}>
              Saqlash
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="O'quvchi" required>
              <Select
                value={form.studentId}
                onChange={(event) => setForm({ ...form, studentId: event.target.value })}
              >
                <option value="">Tanlang</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Guruh" required>
              <Select
                value={form.groupId}
                onChange={(event) => setForm({ ...form, groupId: event.target.value })}
              >
                <option value="">Tanlang</option>
                {(groups ?? []).map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Summa (so'm)" required>
              <Input
                type="number"
                min={1}
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                placeholder="1200000"
              />
            </Field>
            <Field label="To'lov turi" required>
              <Select
                value={form.method}
                onChange={(event) =>
                  setForm({ ...form, method: event.target.value as PaymentMethod })
                }
              >
                {methodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Izoh">
            <Textarea
              value={form.comment}
              onChange={(event) => setForm({ ...form, comment: event.target.value })}
              placeholder="Oktabr oyi uchun to'lov"
            />
          </Field>
        </div>
      </Modal>

      <Confirm
        open={Boolean(toDelete)}
        title="To'lovni o'chirish"
        message={`${money(toDelete?.amount ?? 0)} so'mlik to'lov yozuvi o'chiriladi.`}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </>
  );
}
