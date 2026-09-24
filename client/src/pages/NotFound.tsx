import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <motion.span
          animate={{ rotate: [0, 14, -14, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink-3)]"
        >
          <Compass size={24} />
        </motion.span>
        <div>
          <p className="font-display text-[34px] font-semibold leading-none">404</p>
          <p className="mt-2 text-[var(--ink-3)]">Bunday sahifa topilmadi</p>
        </div>
        <Link to="/">
          <Button>Bosh sahifaga</Button>
        </Link>
      </motion.div>
    </div>
  );
}
