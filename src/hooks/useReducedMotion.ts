/**
 * useReducedMotion Hook
 * 
 * Detects and tracks user's motion preference.
 * Returns true if user prefers reduced motion.
 * Updates dynamically if preference changes.
 */

import { useEffect, useState } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * @returns boolean - true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  // Default to false for SSR
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return;

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Handler for changes
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    // Listen for changes
    // Use addEventListener if available (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get animation props based on reduced motion preference
 * Returns empty object if reduced motion is preferred, otherwise returns the props
 */
export function useAnimationProps<T extends Record<string, unknown>>(
  animationProps: T
): Partial<T> {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return {};
  }
  
  return animationProps;
}

/**
 * Hook to get conditional animation value
 * Returns staticValue if reduced motion is preferred, otherwise returns animatedValue
 */
export function useConditionalAnimation<T>(
  animatedValue: T,
  staticValue: T
): T {
  const shouldReduceMotion = useReducedMotion();
  return shouldReduceMotion ? staticValue : animatedValue;
}
