import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, UserPlus, Users as UsersIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Confirm } from '../components/ui/Confirm';
import { Field } from '../components/ui/Field';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Table } from '../components/ui/Table';
import type { Column } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs } from '../components/ui/Tabs';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { roleLabel, roleOptions, statusLabel, statusOptions } from '../lib/labels';
import type { Role, Status, User } from '../lib/types';

interface FormState {
  login: string;
  password: string;
  fullName: string;
  phone: string;
  role: Role;
  status: Status;
}

const emptyForm: FormState = {
  login: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'STUDENT',
  status: 'ACTIVE',
};

export function Users() {
  const { data, isLoading } = useList<User[]>(keys.users, '/user');
  const [tab, setTab] = useState<'ALL' | Role>('ALL');
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toDelete, setToDelete] = useState<User | null>(null);

  const users = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const query = term.trim().toLowerCase();
    return users.filter((user) => {
      const matchesTab = tab === 'ALL' || user.role === tab;
      const matchesTerm =
        !query ||
        user.fullName.toLowerCase().includes(query) ||
        user.login.toLowerCase().includes(query) ||
        (user.phone ?? '').includes(query);
      return matchesTab && matchesTerm;
    });
  }, [users, tab, term]);

  const save = useApiMutation<void, unknown>({
    run: async () => {
      if (editing) {
        const body: Record<string, unknown> = {
          fullName: form.fullName.trim(),
          role: form.role,
          status: form.status,
        };
        if (form.login.trim()) body.login = form.login.trim();
        if (form.password) body.password = form.password;
        if (form.phone.trim()) body.phone = form.phone.trim();
        return api.patch(`/user/${editing.id}`, body);
      }
      return api.post('/user', {
        login: form.login.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        role: form.role,
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      });
    },
    invalidate: [keys.users],
    success: editing ? 'Maʼlumotlar yangilandi' : "Foydalanuvchi qo'shildi",
    onDone: () => setOpen(false),
  });

  const remove = useApiMutation<number, unknown>({
    run: async (id) => api.remove(`/user/${id}`),
    invalidate: [keys.users],
    success: "Foydalanuvchi o'chirildi",
    onDone: () => setToDelete(null),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setForm({
      login: user.login,
      password: '',
      fullName: user.fullName,
      phone: user.phone ?? '',
      role: user.role,
      status: user.status,
    });
    setOpen(true);
  }

  const columns: Array<Column<User>> = [
    {
      key: 'user',
      label: 'Foydalanuvchi',
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} src={user.imageUrl} size={34} />
          <div className="min-w-0">
            <p className="truncate font-medium">{user.fullName}</p>
            <p className="truncate text-[12.5px] text-[var(--ink-3)]">@{user.login}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      hideOnMobile: true,
      render: (user) => (
        <Badge tone={user.role === 'SUPERADMIN' ? 'accent' : user.role === 'TEACHER' ? 'info' : 'neutral'}>
          {roleLabel(user.role)}
        </Badge>
      ),
    },
    {
      key: 'phone',
      label: 'Telefon',
      hideOnMobile: true,
      render: (user) => <span className="tnum text-[var(--ink-2)]">{user.phone ?? '—'}</span>,
    },
    {
      key: 'status',
      label: 'Holat',
      render: (user) => (
        <Badge tone={user.status === 'ACTIVE' ? 'good' : 'critical'}>{statusLabel(user.status)}</Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '96px',
      render: (user) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(user)} aria-label="Tahrirlash">
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setToDelete(user)} aria-label="O'chirish">
            <Trash2 size={14} className="text-critical" />
          </Button>
        </div>
      ),
    },
  ];

  const counts = {
    ALL: users.length,
    SUPERADMIN: users.filter((user) => user.role === 'SUPERADMIN').length,
    TEACHER: users.filter((user) => user.role === 'TEACHER').length,
    STUDENT: users.filter((user) => user.role === 'STUDENT').length,
  };

  return (
    <>
      <PageHeader
        title="Foydalanuvchilar"
        subtitle="O'qituvchilar, o'quvchilar va administratorlar"
        action={
          <Button icon={<Plus size={16} />} onClick={openCreate}>
            Qo'shish
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 px-1 pt-1 sm:flex-row sm:items-center sm:justify-between sm:pr-4">
          <Tabs
            items={[
              { id: 'ALL', label: 'Hammasi', count: counts.ALL },
              { id: 'TEACHER', label: "O'qituvchilar", count: counts.TEACHER },
              { id: 'STUDENT', label: "O'quvchilar", count: counts.STUDENT },
              { id: 'SUPERADMIN', label: 'Adminlar', count: counts.SUPERADMIN },
            ]}
            active={tab}
            onChange={(id) => setTab(id as 'ALL' | Role)}
            layoutId="users-tab"
          />
          <div className="relative px-3 pb-3 sm:pb-0 sm:px-0">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] sm:left-3"
            />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Ism yoki login..."
              className="h-9 pl-9 sm:w-56"
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<UsersIcon size={20} />}
            title="Hech kim topilmadi"
            message="Qidiruv shartini o'zgartiring yoki yangi foydalanuvchi qo'shing."
            action={
              <Button icon={<UserPlus size={15} />} onClick={openCreate}>
                Foydalanuvchi qo'shish
              </Button>
            }
          />
        ) : (
          <Table columns={columns} rows={filtered} rowKey={(user) => user.id} />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}
        description={editing ? 'Parolni bo‘sh qoldirsangiz, u o‘zgarmaydi' : undefined}
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
          <Field label="F.I.Sh" required>
            <Input
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              placeholder="Ulug'bek Karimov"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Login" required>
              <Input
                value={form.login}
                onChange={(event) => setForm({ ...form, login: event.target.value })}
                placeholder="ulugbek_karimov"
                autoComplete="off"
              />
            </Field>
            <Field
              label="Parol"
              required={!editing}
              hint="Katta-kichik harf, raqam va belgi"
            >
              <Input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder={editing ? "O'zgartirmaslik uchun bo'sh qoldiring" : 'Ulugbek2026!'}
                autoComplete="new-password"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefon" hint="+998 bilan boshlanadi">
              <Input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="+998901234567"
              />
            </Field>
            <Field label="Rol" required>
              <Select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {editing ? (
            <Field label="Holat" hint="Nofaol foydalanuvchi tizimga kira olmaydi">
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
        </div>
      </Modal>

      <Confirm
        open={Boolean(toDelete)}
        title="Foydalanuvchini o'chirish"
        message={`${toDelete?.fullName} tizimdan butunlay o'chiriladi.`}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </>
  );
}
