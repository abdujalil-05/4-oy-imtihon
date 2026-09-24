import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, LogOut, Monitor, ShieldCheck, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Confirm } from '../components/ui/Confirm';
import { EmptyState } from '../components/ui/EmptyState';
import { api, keys, useApiMutation, useList } from '../lib/queries';
import { dateTime } from '../lib/format';
import { roleLabel } from '../lib/labels';
import { useAuth } from '../auth/useAuth';
import type { Device } from '../lib/types';

export function Profile() {
  const { me, refreshMe, signOut } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(me?.fullName ?? '');
  const [phone, setPhone] = useState(me?.phone ?? '');
  const [password, setPassword] = useState('');
  const [toRevoke, setToRevoke] = useState<Device | null>(null);

  const { data: devices } = useList<Device[]>(keys.devices, '/device');

  const save = useApiMutation<void, unknown>({
    run: async () => {
      const body: Record<string, unknown> = { fullName: fullName.trim() };
      if (phone.trim()) body.phone = phone.trim();
      if (password) body.password = password;
      return api.patch(`/user/${me?.id}`, body);
    },
    success: 'Profil yangilandi',
    onDone: () => {
      setPassword('');
      void refreshMe();
    },
  });

  const upload = useApiMutation<File, unknown>({
    run: async (file) => {
      const data = new FormData();
      data.append('image', file);
      return api.patch(`/user/${me?.id}`, data);
    },
    success: 'Rasm yangilandi',
    onDone: () => void refreshMe(),
  });

  const revoke = useApiMutation<number, unknown>({
    run: async (deviceId) => api.remove(`/device/${deviceId}`),
    invalidate: [keys.devices],
    success: 'Qurilma uzildi',
    onDone: () => setToRevoke(null),
  });

  if (!me) return null;

  return (
    <>
      <PageHeader title="Profil" subtitle="Shaxsiy maʼlumotlar va faol qurilmalar" />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={me.fullName} src={me.imageUrl} size={72} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Rasmni almashtirish"
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-[var(--surface)] bg-[var(--accent-fill)] text-[var(--accent-on-fill)] transition-transform hover:scale-105"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) upload.mutate(file);
                  event.target.value = '';
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-[19px] font-semibold">{me.fullName}</p>
              <p className="text-[13px] text-[var(--ink-3)]">@{me.login}</p>
              <div className="mt-2 flex gap-2">
                <Badge tone="accent">{roleLabel(me.role)}</Badge>
                <Badge tone={me.status === 'ACTIVE' ? 'good' : 'critical'}>
                  {me.status === 'ACTIVE' ? 'Faol' : 'Bloklangan'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Field label="F.I.Sh">
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </Field>
            <Field label="Telefon" hint="+998 bilan boshlanadi">
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+998901234567"
              />
            </Field>
            <Field label="Yangi parol" hint="O'zgartirmaslik uchun bo'sh qoldiring">
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
            <Button
              className="self-start"
              loading={save.isPending || upload.isPending}
              onClick={() => save.mutate()}
            >
              Saqlash
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden" id="devices">
          <CardHeader
            title="Faol qurilmalar"
            subtitle="Hisobingizga ulangan seanslar"
          />

          {(devices ?? []).length === 0 ? (
            <EmptyState
              icon={<Smartphone size={20} />}
              title="Qurilmalar yo'q"
              message="Hozircha faol seans topilmadi."
            />
          ) : (
            <ul className="divide-y divide-[var(--hairline)]">
              {(devices ?? []).map((device, index) => (
                <motion.li
                  key={device.deviceId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.34, delay: index * 0.06 }}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-3)] text-[var(--ink-3)]">
                    <Monitor size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{device.device}</p>
                    <p className="text-[12.5px] text-[var(--ink-3)]">
                      Ulangan: {dateTime(device.createdAt)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setToRevoke(device)}>
                    Uzish
                  </Button>
                </motion.li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-[var(--hairline)] bg-[var(--surface-2)] px-5 py-4">
            <p className="flex items-center gap-2 text-[12.5px] text-[var(--ink-3)]">
              <ShieldCheck size={14} />
              Seans httpOnly cookie orqali saqlanadi
            </p>
            <Button
              size="sm"
              variant="danger"
              icon={<LogOut size={14} />}
              onClick={async () => {
                await signOut();
                navigate('/login', { replace: true });
              }}
            >
              Chiqish
            </Button>
          </div>
        </Card>
      </div>

      <Confirm
        open={Boolean(toRevoke)}
        title="Qurilmani uzish"
        message={`"${toRevoke?.device}" qurilmasidagi seans yopiladi.`}
        confirmLabel="Uzish"
        loading={revoke.isPending}
        onCancel={() => setToRevoke(null)}
        onConfirm={() => toRevoke && revoke.mutate(toRevoke.deviceId)}
      />
    </>
  );
}
