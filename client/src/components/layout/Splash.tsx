import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--plane)]">
      <div className="flex flex-col items-center gap-4">
        <motion.span
          animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="grid h-12 w-12 place-items-center rounded-[14px] bg-[var(--accent-fill)] text-[var(--accent-on-fill)]"
        >
          <GraduationCap size={24} />
        </motion.span>
        <div className="h-1 w-28 overflow-hidden rounded-full bg-[var(--surface-3)]">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/2 rounded-full bg-[var(--accent)]"
          />
        </div>
      </div>
    </div>
  );
}
