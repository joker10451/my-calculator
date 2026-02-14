/**
 * StaggerContainer Animation Component
 * 
 * Container component that staggers the animation of its children.
 * Each child will animate with a delay relative to the previous one.
 * Respects user's prefers-reduced-motion preference.
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { staggerContainerVariants, getAnimationVariants } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

interface StaggerContainerProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate'> {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
}

/**
 * StaggerContainer component for staggered list animations
 * 
 * @param children - Items to animate with stagger
 * @param staggerDelay - Delay between each child animation (in seconds)
 * @param delayChildren - Initial delay before first child animates (in seconds)
 * @param props - Additional motion div props
 */
export const StaggerContainer = ({ 
  children,
  staggerDelay = 0.1,
  delayChildren = 0.1,
  ...props 
}: StaggerContainerProps) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = getAnimationVariants(staggerContainerVariants);
  
  // Override stagger timing if custom provided
  const customVariants = {
    ...variants,
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  // If reduced motion is preferred, render without animation
  if (shouldReduceMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      variants={customVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default StaggerContainer;
