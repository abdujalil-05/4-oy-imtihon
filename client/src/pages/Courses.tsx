import { useState } from 'react';
import { BookOpen, Clock, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { money } from '../lib/format';
import { statusLabel, statusOptions } from '../lib/labels';
import { useIsAdmin } from '../auth/useAuth';
import type { Course, Status } from '../lib/types';

interface FormState {
  name: string;
  price: string;
  duration: string;
  description: string;
  status: Status;
}

const emptyForm: FormState = {
  name: '',
  price: '',
  duration: '',
  description: '',
  status: 'ACTIVE',
};

export function Courses() {
  const isAdmin = useIsAdmin();
  const { data, isLoading } = useList<Course[]>(keys.courses, '/course');
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toDelete, setToDelete] = useState<Course | null>(null);

  const courses = data ?? [];

  const save = useApiMutation<void, unknown>({
    run: async () => {
      const body = {
        name: form.name.trim(),
        price: Number(form.price),
        duration: Number(form.duration),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      };
      if (editing) {
        return api.patch(`/course/${editing.id}`, { ...body, status: form.status });
      }
      return api.post('/course', body);
    },
    invalidate: [keys.courses],
    success: editing ? 'Kurs yangilandi' : "Kurs qo'shildi",
    onDone: () => setOpen(false),
  });

  const remove = useApiMutation<number, unknown>({
    run: async (id: number) => api.remove(`/course/${id}`),
    invalidate: [keys.courses],
    success: "Kurs o'chirildi",
    onDone: () => setToDelete(null),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(course: Course) {
    setEditing(course);
    setForm({
      name: course.name,
      price: String(course.price),
      duration: String(course.duration),
      description: course.description ?? '',
      status: course.status,
    });
    setOpen(true);
  }

  const columns: Array<Column<Course>> = [
    {
      key: 'name',
      label: 'Kurs',
      render: (course) => (
        <div>
          <p className="font-medium">{course.name}</p>
          {course.description ? (
            <p className="mt-0.5 line-clamp-1 text-[12.5px] text-[var(--ink-3)]">
              {course.description}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Davomiyligi',
      hideOnMobile: true,
      render: (course) => (
        <span className="inline-flex items-center gap-1.5 text-[var(--ink-2)]">
          <Clock size={14} className="text-[var(--ink-3)]" />
          {course.duration} oy
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Holat',
      hideOnMobile: true,
      render: (course) => (
        <Badge tone={course.status === 'ACTIVE' ? 'good' : 'neutral'}>
          {statusLabel(course.status)}
        </Badge>
      ),
    },
    {
      key: 'price',
      label: 'Narxi',
      align: 'right',
      render: (course) => (
        <span className="font-medium">
          {money(course.price)} <span className="text-[var(--ink-3)]">so'm</span>
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            label: '',
            align: 'right' as const,
            width: '96px',
            render: (course: Course) => (
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(course)} aria-label="Tahrirlash">
                  <Pencil size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setToDelete(course)} aria-label="O'chirish">
                  <Trash2 size={14} className="text-critical" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Kurslar"
        subtitle={`${courses.length} ta yo'nalish`}
        action={
          isAdmin ? (
            <Button icon={<Plus size={16} />} onClick={openCreate}>
              Yangi kurs
            </Button>
          ) : null
        }
      />

      <Card>
        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={20} />}
            title="Kurslar yo'q"
            message="Birinchi kursni qo'shing — guruhlar shu kurs asosida ochiladi."
            action={isAdmin ? <Button onClick={openCreate}>Kurs qo'shish</Button> : undefined}
          />
        ) : (
          <Table columns={columns} rows={courses} rowKey={(course) => course.id} />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Kursni tahrirlash' : 'Yangi kurs'}
        description="Kurs narxi va davomiyligi guruh ochishda ishlatiladi"
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
          <Field label="Nomi" required>
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Frontend React"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Narxi (so'm)" required>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                placeholder="1200000"
              />
            </Field>
            <Field label="Davomiyligi (oy)" required>
              <Input
                type="number"
                min={1}
                value={form.duration}
                onChange={(event) => setForm({ ...form, duration: event.target.value })}
                placeholder="6"
              />
            </Field>
          </div>
          {editing ? (
            <Field label="Holat">
              <Select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as Status })}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Tavsif">
            <Textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Kurs dasturi haqida qisqacha"
            />
          </Field>
        </div>
      </Modal>

      <Confirm
        open={Boolean(toDelete)}
        title="Kursni o'chirish"
        message={`"${toDelete?.name}" kursi o'chiriladi. Unga bog'langan guruhlar bo'lsa, amal bajarilmaydi.`}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </>
  );
}
