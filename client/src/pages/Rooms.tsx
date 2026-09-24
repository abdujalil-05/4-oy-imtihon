import { useState } from 'react';
import { DoorOpen, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Confirm } from '../components/ui/Confirm';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { useIsAdmin } from '../auth/useAuth';
import type { Room } from '../lib/types';

export function Rooms() {
  const isAdmin = useIsAdmin();
  const { data, isLoading } = useList<Room[]>(keys.rooms, '/room');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [toDelete, setToDelete] = useState<Room | null>(null);

  const rooms = data ?? [];

  const save = useApiMutation<void, unknown>({
    run: async () => {
      const body = { name: name.trim(), capacity: Number(capacity) };
      return editing ? api.patch(`/room/${editing.id}`, body) : api.post('/room', body);
    },
    invalidate: [keys.rooms],
    success: editing ? 'Xona yangilandi' : "Xona qo'shildi",
    onDone: () => setOpen(false),
  });

  const remove = useApiMutation<number, unknown>({
    run: async (id) => api.remove(`/room/${id}`),
    invalidate: [keys.rooms],
    success: "Xona o'chirildi",
    onDone: () => setToDelete(null),
  });

  function openCreate() {
    setEditing(null);
    setName('');
    setCapacity('');
    setOpen(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    setName(room.name);
    setCapacity(String(room.capacity));
    setOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Xonalar"
        subtitle={`${rooms.length} ta o'quv xonasi`}
        action={
          isAdmin ? (
            <Button icon={<Plus size={16} />} onClick={openCreate}>
              Yangi xona
            </Button>
          ) : null
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-5">
              <Skeleton h={18} w="60%" />
              <div className="mt-3">
                <Skeleton h={12} w="40%" />
              </div>
            </Card>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card>
          <EmptyState
            icon={<DoorOpen size={20} />}
            title="Xonalar yo'q"
            message="Guruh ochish uchun kamida bitta xona kerak bo'ladi."
            action={isAdmin ? <Button onClick={openCreate}>Xona qo'shish</Button> : undefined}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, index) => (
            <motion.article
              key={room.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
            >
              <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'var(--glow)' }} />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[18px] font-semibold">{room.name}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-3)]">
                    <Users size={14} />
                    {room.capacity} o'rin
                  </p>
                </div>
                {isAdmin ? (
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(room)} aria-label="Tahrirlash">
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setToDelete(room)} aria-label="O'chirish">
                      <Trash2 size={14} className="text-critical" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Xonani tahrirlash' : 'Yangi xona'}
        width={420}
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
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="204-xona" />
          </Field>
          <Field label="Sig'imi" required hint="Xonaga nechta o'quvchi sig'adi">
            <Input
              type="number"
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              placeholder="24"
            />
          </Field>
        </div>
      </Modal>

      <Confirm
        open={Boolean(toDelete)}
        title="Xonani o'chirish"
        message={`"${toDelete?.name}" o'chiriladi. Xonaga biriktirilgan guruh bo'lsa, amal bajarilmaydi.`}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </>
  );
}
