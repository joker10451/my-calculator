/**
 * Feature detection utilities for modern CSS features
 */

/**
 * Check if the browser supports backdrop-filter CSS property
 * @returns true if backdrop-filter is supported, false otherwise
 */
export function supportsBackdropFilter(): boolean {
  if (typeof window === 'undefined' || !CSS?.supports) {
    return false;
  }

  return (
    CSS.supports('backdrop-filter', 'blur(10px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
  );
}

/**
 * Check if the browser supports CSS Grid
 * @returns true if CSS Grid is supported, false otherwise
 */
export function supportsGrid(): boolean {
  if (typeof window === 'undefined' || !CSS?.supports) {
    return false;
  }

  return CSS.supports('display', 'grid');
}

/**
 * Check if the browser supports CSS custom properties (CSS variables)
 * @returns true if CSS custom properties are supported, false otherwise
 */
export function supportsCSSVariables(): boolean {
  if (typeof window === 'undefined' || !CSS?.supports) {
    return false;
  }

  return CSS.supports('--test', '0');
}

/**
 * Check if the browser supports CSS transforms
 * @returns true if CSS transforms are supported, false otherwise
 */
export function supportsTransforms(): boolean {
  if (typeof window === 'undefined' || !CSS?.supports) {
    return false;
  }

  return (
    CSS.supports('transform', 'translateX(0)') ||
    CSS.supports('-webkit-transform', 'translateX(0)')
  );
}

/**
 * Check if the browser supports CSS animations
 * @returns true if CSS animations are supported, false otherwise
 */
export function supportsAnimations(): boolean {
  if (typeof window === 'undefined' || !CSS?.supports) {
    return false;
  }

  return (
    CSS.supports('animation', 'test 1s') ||
    CSS.supports('-webkit-animation', 'test 1s')
  );
}

/**
 * Get a fallback class name based on feature support
 * @param feature - The feature to check
 * @param supportedClass - Class to use if feature is supported
 * @param fallbackClass - Class to use if feature is not supported
 * @returns The appropriate class name
 */
export function getFeatureClass(
  feature: 'backdrop-filter' | 'grid' | 'transforms' | 'animations',
  supportedClass: string,
  fallbackClass: string
): string {
  const featureChecks = {
    'backdrop-filter': supportsBackdropFilter,
    grid: supportsGrid,
    transforms: supportsTransforms,
    animations: supportsAnimations,
  };

  const checkFunction = featureChecks[feature];
  return checkFunction() ? supportedClass : fallbackClass;
}

/**
 * Create a feature detection hook result
 */
export interface FeatureSupport {
  backdropFilter: boolean;
  grid: boolean;
  cssVariables: boolean;
  transforms: boolean;
  animations: boolean;
}

/**
 * Get all feature support information
 * @returns Object with all feature support flags
 */
export function getAllFeatureSupport(): FeatureSupport {
  return {
    backdropFilter: supportsBackdropFilter(),
    grid: supportsGrid(),
    cssVariables: supportsCSSVariables(),
    transforms: supportsTransforms(),
    animations: supportsAnimations(),
  };
}
