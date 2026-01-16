/**
 * Hook for detecting and respecting system theme preference
 * Requirement 12.7: Respect system theme preference
 */

import { useEffect, useState } from 'react';

export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if user prefers dark mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial value
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return systemTheme;
}

/**
 * Detect if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Detect if user prefers light mode
 */
export function prefersLightMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

/**
 * Get the current system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return prefersDarkMode() ? 'dark' : 'light';
}
