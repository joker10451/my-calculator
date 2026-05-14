import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

/**
 * Анимированный счётчик — числа "набираются" при изменении значения
 */
export function AnimatedCounter({ value, duration = 800, formatFn, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const startValue = prevValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo для плавного замедления
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = endValue;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  const formatted = formatFn ? formatFn(Math.round(displayValue)) : Math.round(displayValue).toLocaleString('ru-RU');

  return <span className={className}>{formatted}</span>;
}
