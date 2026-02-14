/**
 * Theme Initializer Component
 * Ensures system theme preference is applied on initial load
 * Requirement 12.7: Apply system theme on initial load
 */

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getSystemTheme } from '@/hooks/useSystemTheme';

export function ThemeInitializer() {
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => {
    // Remove no-transition class after initial render
    // This allows smooth transitions after page load
    const timer = setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If no theme is set in localStorage, use system preference
    const storedTheme = localStorage.getItem('theme');
    
    if (!storedTheme || storedTheme === 'system') {
      const systemPreference = getSystemTheme();
      
      // Log for debugging
      console.log('[ThemeInitializer] System preference detected:', systemPreference);
      
      // If theme is not explicitly set, ensure system theme is applied
      if (theme === 'system' && systemTheme !== systemPreference) {
        setTheme('system');
      }
    }
  }, [theme, systemTheme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      console.log('[ThemeInitializer] System theme changed to:', newTheme);
      
      // Force re-render by setting theme to system again
      setTheme('system');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, setTheme]);

  return null;
}
