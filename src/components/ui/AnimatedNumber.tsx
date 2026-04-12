import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, MotionValue } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  /** Функция форматирования числа в строку */
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}

function useAnimatedValue(target: number, duration: number): MotionValue<number> {
  const spring = useSpring(target, {
    stiffness: 80,
    damping: 20,
    mass: 0.8,
    duration,
  });

  const prevRef = useRef(target);

  useEffect(() => {
    if (prevRef.current !== target) {
      spring.set(target);
      prevRef.current = target;
    }
  }, [target, spring]);

  return spring;
}

/**
 * Анимированное число — плавно переходит от предыдущего значения к новому.
 * Использует framer-motion useSpring для count-up эффекта.
 */
export function AnimatedNumber({
  value,
  format = (n) => n.toFixed(0),
  className,
  duration = 600,
}: AnimatedNumberProps) {
  const animatedValue = useAnimatedValue(value, duration);
  const displayValue = useTransform(animatedValue, (v) => format(v));

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}

/** Форматирование в рубли */
export function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}
