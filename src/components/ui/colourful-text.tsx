/**
 * ColourfulText Component
 * Анимированный цветной текст с эффектами blur, scale и opacity
 * Каждый символ циклически меняет цвет с задержкой (stagger effect)
 * Respects user's prefers-reduced-motion preference
 */

import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Палитра из 10 ярких цветов для анимации
const DEFAULT_COLORS = [
  'rgb(131, 179, 32)',   // Green
  'rgb(47, 195, 106)',   // Emerald
  'rgb(42, 169, 210)',   // Cyan
  'rgb(4, 112, 202)',    // Blue
  'rgb(107, 10, 255)',   // Purple
  'rgb(183, 0, 218)',    // Magenta
  'rgb(218, 0, 171)',    // Pink
  'rgb(230, 64, 92)',    // Red
  'rgb(232, 98, 63)',    // Orange
  'rgb(249, 129, 47)',   // Amber
];

export interface ColourfulTextProps {
  /**
   * Текст для анимации
   */
  text: string;
  
  /**
   * Массив цветов для циклической анимации
   * @default DEFAULT_COLORS (10 цветов)
   */
  colors?: string[];
  
  /**
   * Длительность одного цикла анимации в миллисекундах
   * @default 5000
   */
  animationDuration?: number;
  
  /**
   * Задержка между анимацией символов в миллисекундах
   * @default 50
   */
  staggerDelay?: number;
  
  /**
   * Дополнительные CSS классы
   */
  className?: string;
  
  /**
   * Отключить анимацию (для prefers-reduced-motion)
   * @default false
   */
  disableAnimation?: boolean;
}

/**
 * ColourfulText - компонент для отображения анимированного цветного текста
 * 
 * @example
 * ```tsx
 * <ColourfulText text="финансовые" />
 * <ColourfulText 
 *   text="экономить" 
 *   colors={['#ff0000', '#00ff00', '#0000ff']}
 *   animationDuration={3000}
 * />
 * ```
 */
export const ColourfulText: React.FC<ColourfulTextProps> = ({
  text,
  colors = DEFAULT_COLORS,
  animationDuration = 5000,
  staggerDelay = 50,
  className,
  disableAnimation = false,
}) => {
  // Используем хук для отслеживания предпочтений пользователя
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !disableAnimation && !prefersReducedMotion;
  
  // Разбиваем текст на символы
  const characters = useMemo(() => text.split(''), [text]);
  
  // Создаем варианты анимации для каждого символа
  const characterVariants: Variants = useMemo(() => {
    if (!shouldAnimate) {
      return {
        initial: {},
        animate: {},
      };
    }
    
    return {
      initial: {
        opacity: 0.8,
        transform: 'translateY(0px) scale(1)',
        filter: 'blur(0px)',
      },
      animate: (custom: number) => ({
        color: colors,
        opacity: [0.8, 1, 0.9, 1],
        transform: [
          'translateY(0px) scale(1)',
          'translateY(-2px) scale(1.05)',
          'translateY(0px) scale(1)',
          'translateY(-1px) scale(1.02)',
          'translateY(0px) scale(1)',
        ],
        filter: ['blur(0px)', 'blur(0.5px)', 'blur(0px)'],
        transition: {
          duration: animationDuration / 1000,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: custom * (staggerDelay / 1000),
          times: [0, 0.25, 0.5, 0.75, 1],
        },
      }),
    };
  }, [colors, animationDuration, staggerDelay, shouldAnimate]);
  
  // Если анимация отключена, возвращаем простой текст
  if (!shouldAnimate) {
    return (
      <span className={cn('inline-block', className)}>
        {text}
      </span>
    );
  }
  
  return (
    <span className={cn('inline-block', className)}>
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          custom={index}
          variants={characterVariants}
          initial="initial"
          animate="animate"
          className="inline-block"
          style={{
            display: char === ' ' ? 'inline' : 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            willChange: 'transform, opacity, filter',
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

ColourfulText.displayName = 'ColourfulText';

export default ColourfulText;
