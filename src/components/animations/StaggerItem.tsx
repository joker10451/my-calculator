/**
 * StaggerItem Animation Component
 * 
 * Item component to be used within StaggerContainer.
 * Animates with fade-in-up effect when parent container triggers.
 * Respects user's prefers-reduced-motion preference.
 * 
 * Performance optimizations:
 * - Uses only transform and opacity (GPU-accelerated)
 * - Applies will-change for complex animations
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { staggerItemVariants, getAnimationVariants, willChangeStyles } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  /**
   * Apply will-change for complex animations (use sparingly)
   */
  useWillChange?: boolean;
}

/**
 * StaggerItem component for individual items in staggered lists
 * 
 * @param children - Item content to animate
 * @param useWillChange - Apply will-change for performance boost (default: false)
 * @param props - Additional motion div props
 */
export const StaggerItem = ({ 
  children,
  useWillChange = false,
  ...props 
}: StaggerItemProps) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = getAnimationVariants(staggerItemVariants);

  // If reduced motion is preferred, render without animation
  if (shouldReduceMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants}
      style={useWillChange ? willChangeStyles.transformOpacity : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default StaggerItem;
