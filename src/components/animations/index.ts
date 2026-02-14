/**
 * Animation Components
 * 
 * Export all animation wrapper components for easy importing.
 */

export { FadeInUp } from './FadeInUp';
export { HoverScale } from './HoverScale';
export { PageTransition } from './PageTransition';
export { StaggerContainer } from './StaggerContainer';
export { StaggerItem } from './StaggerItem';

// Re-export motion config for convenience
export { motionConfig, prefersReducedMotion, getAnimationVariants } from '@/lib/motion-config';
