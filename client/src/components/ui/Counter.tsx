import { useEffect, useRef, useState } from 'react';

export function Counter({
  value,
  format = (n: number) => String(n),
  duration = 900,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(value);
      fromRef.current = value;
      return;
    }

    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setShown(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className="tnum">{format(shown)}</span>;
}
