import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, DoorOpen, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Confirm } from '../components/ui/Confirm';
import { Field } from '../components/ui/Field';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { date, toInputDate } from '../lib/format';
import { groupStatusLabel, groupStatusOptions } from '../lib/labels';
import { useIsAdmin } from '../auth/useAuth';
import type { Course, Group, GroupStatus, Room, User } from '../lib/types';

interface FormState {
  name: string;
  courseId: string;
  teacherId: string;
  roomId: string;
  startDate: string;
  status: GroupStatus;
}

const emptyForm: FormState = {
  name: '',
  courseId: '',
  teacherId: '',
  roomId: '',
  startDate: '',
  status: 'NEW',
};

const tone: Record<GroupStatus, 'accent' | 'good' | 'neutral'> = {
  NEW: 'accent',
  ACTIVE: 'good',
  FINISHED: 'neutral',
};

export function Groups() {
  const isAdmin = useIsAdmin();
  const { data, isLoading } = useList<Group[]>(keys.groups, '/group');
  const { data: courses } = useList<Course[]>(keys.courses, '/course', isAdmin);
  const { data: rooms } = useList<Room[]>(keys.rooms, '/room', isAdmin);
  const { data: users } = useList<User[]>(keys.users, '/user', isAdmin);

  const [tab, setTab] = useState<'ALL' | GroupStatus>('ALL');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toDelete, setToDelete] = useState<Group | null>(null);

  const groups = useMemo(() => data ?? [], [data]);
  const teachers = (users ?? []).filter((user) => user.role === 'TEACHER');
  const filtered = groups.filter((group) => tab === 'ALL' || group.status === tab);

  const save = useApiMutation<void, unknown>({
    run: async () => {
      const body = {
        name: form.name.trim(),
        courseId: Number(form.courseId),
        teacherId: Number(form.teacherId),
        roomId: Number(form.roomId),
        startDate: new Date(form.startDate).toISOString(),
      };
      return editing
        ? api.patch(`/group/${editing.id}`, { ...body, status: form.status })
        : api.post('/group', body);
    },
    invalidate: [keys.groups],
    success: editing ? 'Guruh yangilandi' : "Guruh ochildi",
    onDone: () => setOpen(false),
  });

  const remove = useApiMutation<number, unknown>({
    run: async (id) => api.remove(`/group/${id}`),
    invalidate: [keys.groups],
    success: "Guruh o'chirildi",
    onDone: () => setToDelete(null),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(group: Group) {
    setEditing(group);
    setForm({
      name: group.name,
      courseId: String(group.courseId),
      teacherId: String(group.teacherId),
      roomId: String(group.roomId),
      startDate: toInputDate(group.startDate),
      status: group.status,
    });
    setOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Guruhlar"
        subtitle={`${groups.length} ta guruh`}
        action={
          isAdmin ? (
            <Button icon={<Plus size={16} />} onClick={openCreate}>
              Yangi guruh
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <Tabs
          items={[
            { id: 'ALL', label: 'Hammasi', count: groups.length },
            { id: 'NEW', label: 'Yangi', count: groups.filter((g) => g.status === 'NEW').length },
            { id: 'ACTIVE', label: 'Davom etmoqda', count: groups.filter((g) => g.status === 'ACTIVE').length },
            { id: 'FINISHED', label: 'Yakunlangan', count: groups.filter((g) => g.status === 'FINISHED').length },
          ]}
          active={tab}
          onChange={(id) => setTab(id as 'ALL' | GroupStatus)}
          layoutId="groups-tab"
        />

        <div className="p-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-[12px] border border-[var(--hairline)] p-4">
                  <Skeleton h={18} w="55%" />
                  <div className="mt-3 flex flex-col gap-2">
                    <Skeleton h={12} w="80%" />
                    <Skeleton h={12} w="60%" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Users size={20} />}
              title="Guruhlar yo'q"
              message="Kurs, o'qituvchi va xona tanlab birinchi guruhni oching."
              action={isAdmin ? <Button onClick={openCreate}>Guruh ochish</Button> : undefined}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -3 }}
                  className="group relative flex flex-col gap-3 rounded-[12px] border border-[var(--hairline)] bg-[var(--surface-2)] p-4 transition-colors hover:border-[var(--hairline-strong)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/groups/${group.id}`} className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 font-display text-[17px] font-semibold">
                        {group.name}
                        <ArrowUpRight
                          size={15}
                          className="text-[var(--ink-3)] opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </p>
                      <p className="mt-0.5 text-[13px] text-[var(--ink-3)]">{group.course?.name}</p>
                    </Link>
                    <Badge tone={tone[group.status]}>{groupStatusLabel(group.status)}</Badge>
                  </div>

                  <dl className="flex flex-col gap-1.5 text-[13px] text-[var(--ink-2)]">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-[var(--ink-3)]" />
                      <dd>{group.teacher?.fullName ?? '—'}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <DoorOpen size={14} className="text-[var(--ink-3)]" />
                      <dd>{group.room?.name ?? '—'}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-[var(--ink-3)]" />
                      <dd>{date(group.startDate)} dan</dd>
                    </div>
                  </dl>

                  {isAdmin ? (
                    <div className="flex gap-1 border-t border-[var(--hairline)] pt-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(group)}>
                        <Pencil size={13} /> Tahrirlash
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setToDelete(group)}>
                        <Trash2 size={13} className="text-critical" />
                      </Button>
                    </div>
                  ) : null}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Guruhni tahrirlash' : 'Yangi guruh'}
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
          <Field label="Guruh nomi" required>
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="React N-12"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kurs" required>
              <Select
                value={form.courseId}
                onChange={(event) => setForm({ ...form, courseId: event.target.value })}
              >
                <option value="">Tanlang</option>
                {(courses ?? []).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Select>
            </Field>
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Xona" required>
              <Select
                value={form.roomId}
                onChange={(event) => setForm({ ...form, roomId: event.target.value })}
              >
                <option value="">Tanlang</option>
                {(rooms ?? []).map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Boshlanish sanasi" required>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              />
            </Field>
          </div>
          {editing ? (
            <Field label="Holat">
              <Select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as GroupStatus })}
              >
                {groupStatusOptions.map((option) => (
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
        title="Guruhni o'chirish"
        message={`"${toDelete?.name}" o'chiriladi. Guruhda darslar bo'lsa, amal bajarilmaydi.`}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </>
  );
}
