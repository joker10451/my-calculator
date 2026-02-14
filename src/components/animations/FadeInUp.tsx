/**
 * FadeInUp Animation Component
 * 
 * Wrapper component that applies fade-in-up animation to its children.
 * Triggers on scroll using IntersectionObserver via Framer Motion.
 * Respects user's prefers-reduced-motion preference.
 * 
 * Performance optimizations:
 * - Uses only transform and opacity (GPU-accelerated)
 * - Applies will-change for complex animations
 * - Optimized IntersectionObserver settings
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { fadeInUpVariants, scrollViewport, getAnimationVariants, willChangeStyles } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

interface FadeInUpProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'whileInView' | 'viewport'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  /**
   * Apply will-change for complex animations (use sparingly)
   */
  useWillChange?: boolean;
}

/**
 * FadeInUp component that animates children on scroll
 * 
 * @param children - Content to animate
 * @param delay - Optional delay before animation starts (in seconds)
 * @param duration - Optional animation duration (in seconds)
 * @param useWillChange - Apply will-change for performance boost (default: false)
 * @param props - Additional motion div props
 */
export const FadeInUp = ({ 
  children, 
  delay = 0, 
  duration,
  useWillChange = false,
  ...props 
}: FadeInUpProps) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = getAnimationVariants(fadeInUpVariants);
  
  // Override transition if custom duration or delay provided
  const customTransition = duration || delay ? {
    duration: duration || 0.5,
    delay,
    ease: [0, 0, 0.2, 1],
  } : undefined;

  // If reduced motion is preferred, render without animation
  if (shouldReduceMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileInView="animate"
      viewport={scrollViewport}
      transition={customTransition}
      style={useWillChange ? willChangeStyles.transformOpacity : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default FadeInUp;
