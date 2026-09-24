import { useMemo, useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Confirm } from '../components/ui/Confirm';
import { Field } from '../components/ui/Field';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatTile } from '../components/charts/StatTile';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { date, money, monthLabel } from '../lib/format';
import type { Salary, User } from '../lib/types';

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function Salaries() {
  const { data, isLoading } = useList<Salary[]>(keys.salaries, '/salary');
  const { data: users } = useList<User[]>(keys.users, '/user');
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Salary | null>(null);
  const [form, setForm] = useState({
    teacherId: '',
    amount: '',
    month: currentMonth(),
    comment: '',
  });

  const salaries = useMemo(() => data ?? [], [data]);
  const total = salaries.reduce((sum, row) => sum + row.amount, 0);
  const teachers = (users ?? []).filter((user) => user.role === 'TEACHER');

  const create = useApiMutation<void, unknown>({
    run: async () =>
      api.post('/salary', {
        teacherId: Number(form.teacherId),
        amount: Number(form.amount),
        month: form.month,
        ...(form.comment.trim() ? { comment: form.comment.trim() } : {}),
      }),
    invalidate: [keys.salaries],
    success: "Maosh to'landi",
    onDone: () => {
      setOpen(false);
      setForm({ teacherId: '', amount: '', month: currentMonth(), comment: '' });
    },
  });

  const remove = useApiMutation<number, unknown>({
    run: async (id) => api.remove(`/salary/${id}`),
    invalidate: [keys.salaries],
    success: "Yozuv o'chirildi",
    onDone: () => setToDelete(null),
  });

  const columns: Array<Column<Salary>> = [
    {
      key: 'teacher',
      label: "O'qituvchi",
      render: (row) => (
        <div>
          <p className="font-medium">{row.teacher?.fullName ?? '—'}</p>
          {row.comment ? (
            <p className="truncate text-[12.5px] text-[var(--ink-3)]">{row.comment}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'month',
      label: 'Oy',
      render: (row) => <span className="text-[var(--ink-2)]">{monthLabel(row.month)}</span>,
    },
    {
      key: 'paidAt',
      label: "To'langan",
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

  return (
    <>
      <PageHeader
        title="Maoshlar"
        subtitle="O'qituvchilarga oylik to'lovlar"
        action={
          <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            Maosh to'lash
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Jami to'langan" value={total} format={money} unit="so'm" icon={<Wallet size={16} />} />
        <StatTile label="Yozuvlar" value={salaries.length} unit="ta" delay={0.06} />
        <StatTile label="O'qituvchilar" value={teachers.length} unit="ta" delay={0.12} />
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : salaries.length === 0 ? (
          <EmptyState
            icon={<Wallet size={20} />}
            title="Maosh yozuvlari yo'q"
            message="Har bir o'qituvchi uchun oyiga bitta yozuv kiritiladi."
            action={<Button onClick={() => setOpen(true)}>Maosh to'lash</Button>}
          />
        ) : (
          <Table columns={columns} rows={salaries} rowKey={(row) => row.id} />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Maosh to'lash"
        description="Bir o'qituvchiga bitta oyda faqat bitta yozuv kiritiladi"
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
          <Field label="O'qituvchi" required>
            <Select
              value={form.teacherId}
              onChange={(event) => setForm({ ...form, teacherId: event.target.value })}
            >
              <option value="">Tanlang</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Summa (so'm)" required>
              <Input
                type="number"
                min={1}
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                placeholder="7500000"
              />
            </Field>
            <Field label="Oy" required hint="2026-09 ko'rinishida">
              <Input
                type="month"
                value={form.month}
                onChange={(event) => setForm({ ...form, month: event.target.value })}
              />
            </Field>
          </div>
          <Field label="Izoh">
            <Textarea
              value={form.comment}
              onChange={(event) => setForm({ ...form, comment: event.target.value })}
              placeholder="Sentabr oyi uchun maosh"
            />
          </Field>
        </div>
      </Modal>

      <Confirm
        open={Boolean(toDelete)}
        title="Yozuvni o'chirish"
        message={`${toDelete?.teacher?.fullName} uchun ${monthLabel(toDelete?.month ?? '')} maoshi o'chiriladi.`}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </>
  );
}
