/**
 * PageTransition Animation Component
 * 
 * Wrapper component for page-level transitions.
 * Applies fade and slide animations when navigating between routes.
 * Respects user's prefers-reduced-motion preference.
 * 
 * Performance optimizations:
 * - Uses only transform and opacity (GPU-accelerated)
 * - Applies will-change for smooth transitions
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { pageTransitionVariants, getAnimationVariants, willChangeStyles } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

interface PageTransitionProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'exit'> {
  children: ReactNode;
}

/**
 * PageTransition component for route transitions
 * 
 * @param children - Page content to animate
 * @param props - Additional motion div props
 */
export const PageTransition = ({ 
  children,
  ...props 
}: PageTransitionProps) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = getAnimationVariants(pageTransitionVariants);

  // If reduced motion is preferred, render without animation
  if (shouldReduceMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={willChangeStyles.transformOpacity}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
