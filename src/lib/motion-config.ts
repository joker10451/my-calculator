/**
 * Motion Configuration
 * 
 * Centralized animation variants and configurations for Framer Motion.
 * Provides consistent animations across the application.
 */

import { Variants, Transition } from 'framer-motion';

/**
 * Easing functions for smooth animations
 */
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
} as const;

/**
 * Animation durations in seconds
 */
export const durations = {
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
} as const;

/**
 * Fade In Up Animation
 * Used for scroll-triggered content reveals
 * Optimized: Uses only transform and opacity (GPU-accelerated)
 */
export const fadeInUpVariants: Variants = {
  initial: {
    opacity: 0,
    transform: 'translateY(40px)',
  },
  animate: {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transform: 'translateY(-20px)',
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

/**
 * Hover Scale Animation
 * Used for interactive elements like cards and buttons
 * Optimized: Uses only transform (GPU-accelerated)
 */
export const hoverScaleVariants: Variants = {
  initial: {
    transform: 'scale(1)',
  },
  hover: {
    transform: 'scale(1.05)',
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
  tap: {
    transform: 'scale(0.95)',
    transition: {
      duration: 0.1,
      ease: easings.easeOut,
    },
  },
};

/**
 * Page Transition Animation
 * Used for route transitions
 * Optimized: Uses only transform and opacity (GPU-accelerated)
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    transform: 'translateY(20px)',
  },
  animate: {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: {
      duration: durations.base,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transform: 'translateY(-20px)',
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

/**
 * Card Hover Animation
 * Lift effect with shadow transition
 * Optimized: Uses only transform (GPU-accelerated), shadow handled by CSS
 */
export const cardHoverVariants: Variants = {
  initial: {
    transform: 'translateY(0px)',
  },
  hover: {
    transform: 'translateY(-8px)',
    transition: {
      duration: durations.base,
      ease: easings.easeOut,
    },
  },
};

/**
 * Image Zoom Animation
 * Used for image hover effects
 * Optimized: Uses only transform (GPU-accelerated)
 */
export const imageZoomVariants: Variants = {
  initial: {
    transform: 'scale(1)',
  },
  hover: {
    transform: 'scale(1.05)',
    transition: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
};

/**
 * Stagger Container Animation
 * Used for animating lists of items with delay
 */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger Item Animation
 * Used with staggerContainerVariants for individual items
 * Optimized: Uses only transform and opacity (GPU-accelerated)
 */
export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    transform: 'translateY(20px)',
  },
  animate: {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: {
      duration: durations.base,
      ease: easings.easeOut,
    },
  },
};

/**
 * Fade Animation
 * Simple fade in/out
 */
export const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: durations.base,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

/**
 * Slide In Animation
 * Slide from right
 * Optimized: Uses only transform and opacity (GPU-accelerated)
 */
export const slideInVariants: Variants = {
  initial: {
    transform: 'translateX(100px)',
    opacity: 0,
  },
  animate: {
    transform: 'translateX(0px)',
    opacity: 1,
    transition: {
      duration: durations.base,
      ease: easings.easeOut,
    },
  },
  exit: {
    transform: 'translateX(-100px)',
    opacity: 0,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

/**
 * Scale Animation
 * Scale from center
 * Optimized: Uses only transform and opacity (GPU-accelerated)
 */
export const scaleVariants: Variants = {
  initial: {
    transform: 'scale(0.8)',
    opacity: 0,
  },
  animate: {
    transform: 'scale(1)',
    opacity: 1,
    transition: {
      duration: durations.base,
      ease: easings.easeOut,
    },
  },
  exit: {
    transform: 'scale(0.8)',
    opacity: 0,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

/**
 * Viewport configuration for scroll animations
 * Optimized: Better IntersectionObserver settings for performance
 */
export const scrollViewport = {
  once: true,
  margin: '-100px',
  amount: 0.3,
} as const;

/**
 * Viewport configuration for complex animations
 * Uses smaller margin for better performance
 */
export const complexScrollViewport = {
  once: true,
  margin: '-50px',
  amount: 0.2,
} as const;

/**
 * Default transition configuration
 */
export const defaultTransition: Transition = {
  duration: durations.base,
  ease: easings.easeOut,
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation variants with reduced motion support
 * Returns static variants if user prefers reduced motion
 */
export const getAnimationVariants = <T extends Variants>(
  variants: T,
  staticVariant: keyof T = 'animate'
): T => {
  if (prefersReducedMotion()) {
    // Return all variants pointing to the static state
    const staticState = variants[staticVariant];
    return Object.keys(variants).reduce((acc, key) => {
      acc[key] = staticState;
      return acc;
    }, {} as Record<string, unknown>) as T;
  }
  return variants;
};

/**
 * Motion configuration object
 * Combines all animation utilities
 */
export const motionConfig = {
  variants: {
    fadeInUp: fadeInUpVariants,
    hoverScale: hoverScaleVariants,
    pageTransition: pageTransitionVariants,
    cardHover: cardHoverVariants,
    imageZoom: imageZoomVariants,
    staggerContainer: staggerContainerVariants,
    staggerItem: staggerItemVariants,
    fade: fadeVariants,
    slideIn: slideInVariants,
    scale: scaleVariants,
  },
  easings,
  durations,
  scrollViewport,
  complexScrollViewport,
  defaultTransition,
  prefersReducedMotion,
  getAnimationVariants,
} as const;

/**
 * Will-change utilities for complex animations
 * Use sparingly - only for animations that need performance boost
 */
export const willChangeStyles = {
  transform: { willChange: 'transform' as const },
  opacity: { willChange: 'opacity' as const },
  transformOpacity: { willChange: 'transform, opacity' as const },
  auto: { willChange: 'auto' as const },
} as const;

/**
 * Apply will-change for complex animations
 * Automatically removes will-change after animation completes
 */
export const applyWillChange = (element: HTMLElement, properties: string) => {
  element.style.willChange = properties;
  
  // Remove will-change after animation completes (300ms default)
  setTimeout(() => {
    element.style.willChange = 'auto';
  }, 300);
};

export default motionConfig;
