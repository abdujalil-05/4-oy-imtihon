import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { HttpError } from '../lib/api';

const highlights = [
  'Guruhlar, darslar va davomat — bitta oynada',
  "To'lov, maosh va xarajatlar nazorati",
  'Uy vazifalari va imtihon natijalari',
];

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(login.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Tizimga kirib bo‘lmadi');
      setShake((value) => value + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[var(--surface)] lg:block">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full blur-[90px]"
          style={{ background: 'var(--glow)' }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-0 h-[380px] w-[380px] rounded-full blur-[100px]"
          style={{ background: 'var(--glow)' }}
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--accent-fill)] text-[var(--accent-on-fill)]">
              <GraduationCap size={19} />
            </span>
            <span className="font-display text-[16px] font-semibold">Maktab</span>
          </div>

          <div className="max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-[40px] leading-[1.08]"
            >
              O‘quv markazingiz
              <br />
              <span className="text-[var(--accent)]">bitta panelda.</span>
            </motion.h1>

            <ul className="mt-8 flex flex-col gap-3">
              {highlights.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.25 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 text-[14px] text-[var(--ink-2)]"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="flex items-center gap-2 text-[12.5px] text-[var(--ink-3)]">
            <ShieldCheck size={14} />
            Seans himoyalangan cookie orqali saqlanadi
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <motion.div
          key={shake}
          initial={shake ? { x: 0 } : { opacity: 0, y: 16 }}
          animate={shake ? { x: [0, -9, 8, -5, 0] } : { opacity: 1, y: 0 }}
          transition={shake ? { duration: 0.42 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[380px]"
        >
          <div className="mb-8 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--accent-fill)] text-[var(--accent-on-fill)]">
              <GraduationCap size={20} />
            </span>
          </div>

          <h2 className="text-[26px] leading-tight">Xush kelibsiz</h2>
          <p className="mt-1.5 text-[13.5px] text-[var(--ink-3)]">
            Davom etish uchun hisobingizga kiring
          </p>

          <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
            <Field label="Login">
              <Input
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                placeholder="superadmin"
                autoComplete="username"
                autoFocus
                required
              />
            </Field>

            <Field label="Parol">
              <div className="relative">
                <Input
                  type={visible ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setVisible((value) => !value)}
                  aria-label={visible ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                  className="absolute right-1 top-1 grid h-8 w-9 place-items-center rounded-lg text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
                >
                  {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {error ? (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[10px] border border-critical/30 bg-critical/10 px-3 py-2.5 text-[13px] text-critical"
              >
                {error}
              </motion.p>
            ) : null}

            <Button type="submit" loading={loading} className="mt-1 w-full">
              Kirish
              {!loading ? <ArrowRight size={16} /> : null}
            </Button>
          </form>

          <p className="mt-6 text-[12px] leading-relaxed text-[var(--ink-3)]">
            Login-parolni administrator beradi. Ulangan qurilmalarni profil
            sahifasidan ko'rib, keraksizini uzib qo'yishingiz mumkin.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
