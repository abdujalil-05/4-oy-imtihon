import { useMemo, useState } from 'react';
import { Pencil, Plus, Receipt, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Confirm } from '../components/ui/Confirm';
import { Field } from '../components/ui/Field';
import { Input, Textarea } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatTile } from '../components/charts/StatTile';
import { RevenueBars } from '../components/charts/RevenueBars';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { date, money } from '../lib/format';
import { monthlySeries } from '../lib/series';
import type { Expense, ExpenseTotals } from '../lib/types';

export function Expenses() {
  const { data, isLoading } = useList<ExpenseTotals>(keys.expenses, '/expense');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const [form, setForm] = useState({ title: '', amount: '', category: '', comment: '' });

  const expenses = useMemo(() => data?.expenses ?? [], [data]);
  const total = data?.total ?? 0;
  const series = useMemo(
    () => monthlySeries(expenses, (row) => row.spentAt, (row) => row.amount),
    [expenses],
  );
  const categories = new Set(expenses.map((row) => row.category)).size;

  const save = useApiMutation<void, unknown>({
    run: async () => {
      const body = {
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category.trim(),
        ...(form.comment.trim() ? { comment: form.comment.trim() } : {}),
      };
      return editing ? api.patch(`/expense/${editing.id}`, body) : api.post('/expense', body);
    },
    invalidate: [keys.expenses],
    success: editing ? 'Xarajat yangilandi' : "Xarajat qo'shildi",
    onDone: () => setOpen(false),
  });

  const remove = useApiMutation<number, unknown>({
    run: async (id) => api.remove(`/expense/${id}`),
    invalidate: [keys.expenses],
    success: "Xarajat o'chirildi",
    onDone: () => setToDelete(null),
  });

  function openCreate() {
    setEditing(null);
    setForm({ title: '', amount: '', category: '', comment: '' });
    setOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      comment: expense.comment ?? '',
    });
    setOpen(true);
  }

  const columns: Array<Column<Expense>> = [
    {
      key: 'title',
      label: 'Xarajat',
      render: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          {row.comment ? (
            <p className="truncate text-[12.5px] text-[var(--ink-3)]">{row.comment}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Turkum',
      hideOnMobile: true,
      render: (row) => <Badge tone="neutral">{row.category}</Badge>,
    },
    {
      key: 'spentAt',
      label: 'Sana',
      hideOnMobile: true,
      render: (row) => <span className="text-[var(--ink-2)]">{date(row.spentAt)}</span>,
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
      width: '96px',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)} aria-label="Tahrirlash">
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setToDelete(row)} aria-label="O'chirish">
            <Trash2 size={14} className="text-critical" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Xarajatlar"
        subtitle="Markaz bo'yicha chiqimlar"
        action={
          <Button icon={<Plus size={16} />} onClick={openCreate}>
            Xarajat qo'shish
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Jami xarajat" value={total} format={money} unit="so'm" icon={<Receipt size={16} />} />
        <StatTile label="Yozuvlar" value={expenses.length} unit="ta" delay={0.06} />
        <StatTile label="Turkumlar" value={categories} unit="ta" delay={0.12} />
      </div>

      {expenses.length > 0 ? (
        <Card className="p-5">
          <h2 className="text-[15px]">Oylar kesimida chiqim</h2>
          <div className="mt-5">
            <RevenueBars data={series} caption="So'nggi 6 oy · qayd etilgan xarajatlar yig'indisi" />
          </div>
        </Card>
      ) : null}

      <Card>
        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={<Receipt size={20} />}
            title="Xarajatlar yo'q"
            message="Ijara, kanselyariya va boshqa chiqimlarni shu yerda qayd eting."
            action={<Button onClick={openCreate}>Xarajat qo'shish</Button>}
          />
        ) : (
          <Table columns={columns} rows={expenses} rowKey={(row) => row.id} />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Xarajatni tahrirlash' : 'Yangi xarajat'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button loading={save.isPending} onClick={() => save.mutate()}>
              Saqlash
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Sarlavha" required>
            <Input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Kanselyariya xaridi"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Summa (so'm)" required>
              <Input
                type="number"
                min={1}
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                placeholder="450000"
              />
            </Field>
            <Field label="Turkum" required>
              <Input
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                placeholder="Ofis"
                list="expense-categories"
              />
            </Field>
          </div>
          <datalist id="expense-categories">
            {[...new Set(expenses.map((row) => row.category))].map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          <Field label="Izoh">
            <Textarea
              value={form.comment}
              onChange={(event) => setForm({ ...form, comment: event.target.value })}
              placeholder="Marker va doska tozalagich olindi"
            />
          </Field>
        </div>
      </Modal>

      <Confirm
        open={Boolean(toDelete)}
        title="Xarajatni o'chirish"
        message={`"${toDelete?.title}" yozuvi o'chiriladi.`}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </>
  );
}
