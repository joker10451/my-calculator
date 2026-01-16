/**
 * HoverScale Animation Component
 * 
 * Wrapper component that applies scale animation on hover and tap.
 * Used for interactive elements like cards and buttons.
 * Respects user's prefers-reduced-motion preference.
 * 
 * Performance optimizations:
 * - Uses only transform (GPU-accelerated)
 * - Applies will-change for complex animations
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { hoverScaleVariants, getAnimationVariants, willChangeStyles } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

interface HoverScaleProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'whileHover' | 'whileTap'> {
  children: ReactNode;
  scale?: number;
  tapScale?: number;
  /**
   * Apply will-change for complex animations (use sparingly)
   */
  useWillChange?: boolean;
}

/**
 * HoverScale component that scales on hover and tap
 * 
 * @param children - Content to animate
 * @param scale - Scale factor on hover (default: 1.05)
 * @param tapScale - Scale factor on tap (default: 0.95)
 * @param useWillChange - Apply will-change for performance boost (default: false)
 * @param props - Additional motion div props
 */
export const HoverScale = ({ 
  children, 
  scale = 1.05,
  tapScale = 0.95,
  useWillChange = false,
  ...props 
}: HoverScaleProps) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = getAnimationVariants(hoverScaleVariants);
  
  // Override scale values if custom provided
  const customVariants = {
    ...variants,
    hover: {
      ...variants.hover,
      transform: `scale(${scale})`,
    },
    tap: {
      ...variants.tap,
      transform: `scale(${tapScale})`,
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
      whileHover="hover"
      whileTap="tap"
      style={useWillChange ? willChangeStyles.transform : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default HoverScale;
