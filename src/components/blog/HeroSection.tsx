/**
 * HeroSection Component
 * Анимированная hero-секция для блога с крупной типографикой,
 * анимированным фоновым изображением и ColourfulText
 * 
 * Requirements: 10.1, 10.6, 2.1, 5.4
 */

import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { fadeInUpVariants, fadeVariants } from '@/lib/motion-config';

// Lazy load ColourfulText component for better performance
const ColourfulText = lazy(() => import('@/components/ui/colourful-text').then(module => ({ default: module.ColourfulText })));

export interface HeroSectionProps {
  /**
   * Основной заголовок (текст до ColourfulText)
   */
  title: string;
  
  /**
   * Текст для анимации цветом (ColourfulText)
   */
  highlightedText: string;
  
  /**
   * Текст после ColourfulText (опционально)
   */
  titleSuffix?: string;
  
  /**
   * Описание под заголовком
   */
  description: string;
  
  /**
   * URL фонового изображения
   */
  backgroundImage?: string;
  
  /**
   * Высота hero-секции
   * @default 'screen' (100vh)
   */
  height?: 'screen' | 'large' | 'medium';
  
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

/**
 * HeroSection - компонент hero-секции с анимациями
 * 
 * @example
 * ```tsx
 * <HeroSection
 *   title="Лучшие"
 *   highlightedText="финансовые"
 *   titleSuffix="калькуляторы России"
 *   description="Экспертные статьи и инструменты для ваших финансовых решений"
 *   backgroundImage="/hero-bg.webp"
 * />
 * ```
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  highlightedText,
  titleSuffix,
  description,
  backgroundImage,
  height = 'large',
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();
  
  // Определяем высоту секции
  const heightClasses = {
    screen: 'min-h-screen',
    large: 'min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]',
    medium: 'min-h-[350px] sm:min-h-[400px] lg:min-h-[500px]',
  };
  
  return (
    <section 
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        heightClasses[height],
        className
      )}
      aria-label="Hero секция"
    >
      {/* Анимированное фоновое изображение */}
      {backgroundImage && (
        <motion.div
          className="absolute inset-0 opacity-50"
          initial={shouldReduceMotion ? { opacity: 0.5 } : { opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
        >
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              maskImage: 'radial-gradient(circle, transparent 0%, black 80%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 0%, black 80%)',
            }}
            role="img"
            aria-label="Фоновое изображение hero-секции"
          />
        </motion.div>
      )}
      
      {/* Градиентный оверлей */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"
        aria-hidden="true"
      />
      
      {/* Контент hero-секции */}
      <div className="relative z-10 text-center space-y-4 sm:space-y-6 px-4 py-2xl sm:py-3xl lg:py-4xl max-w-5xl mx-auto">
        {/* Заголовок с ColourfulText */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight"
          variants={shouldReduceMotion ? undefined : fadeInUpVariants}
          initial="initial"
          animate="animate"
        >
          {title}{' '}
          <Suspense fallback={<span className="inline-block">{highlightedText}</span>}>
            <ColourfulText 
              text={highlightedText}
              className="inline-block"
            />
          </Suspense>
          {titleSuffix && (
            <>
              <br className="hidden sm:block" />
              {titleSuffix}
            </>
          )}
        </motion.h1>
        
        {/* Описание */}
        <motion.p
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 sm:px-4"
          variants={shouldReduceMotion ? undefined : fadeVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.p>
      </div>
      
      {/* Декоративный градиент внизу */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
};

HeroSection.displayName = 'HeroSection';

export default HeroSection;
