/**
 * Design System Constants
 * Централизованные константы для дизайн-системы блога
 */

// Цветовая палитра (Requirements 3.1, 3.2, 3.3, 3.5)
export const colors = {
  // Primary Color with Multiple Shades (Requirement 3.1)
  primary: {
    50: '#f5f7ff',
    100: '#ebefff',
    200: '#d6deff',
    300: '#b8c5ff',
    400: '#8b9cff',
    500: '#667eea',    // Base color
    600: '#5568d3',
    700: '#4654bc',
    800: '#3a44a5',
    900: '#2f378e',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    solid: '#667eea',
    light: '#8b9cff',
    dark: '#5568d3',
  },
  
  // Category Colors - 8 Vibrant Colors (Requirements 3.2, 3.5)
  categories: {
    finance: {
      base: '#10b981',      // Emerald
      light: '#34d399',
      dark: '#059669',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    taxes: {
      base: '#f59e0b',      // Amber
      light: '#fbbf24',
      dark: '#d97706',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    mortgage: {
      base: '#3b82f6',      // Blue
      light: '#60a5fa',
      dark: '#2563eb',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
    utilities: {
      base: '#8b5cf6',      // Purple
      light: '#a78bfa',
      dark: '#7c3aed',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
    salary: {
      base: '#ec4899',      // Pink
      light: '#f472b6',
      dark: '#db2777',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    },
    insurance: {
      base: '#06b6d4',      // Cyan
      light: '#22d3ee',
      dark: '#0891b2',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    },
    investment: {
      base: '#14b8a6',      // Teal
      light: '#2dd4bf',
      dark: '#0d9488',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    },
    savings: {
      base: '#84cc16',      // Lime
      light: '#a3e635',
      dark: '#65a30d',
      gradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
    },
  },
  
  // Accent Colors (Requirement 3.2)
  accent: {
    success: {
      base: '#22c55e',
      light: '#4ade80',
      dark: '#16a34a',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    warning: {
      base: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    error: {
      base: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    info: {
      base: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
  },
  
  // Neutral Palette (Requirement 3.3)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Background Gradients (Requirement 3.6)
  backgrounds: {
    hero: {
      light: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      dark: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    },
    card: {
      light: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      dark: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    },
    section: {
      light: 'linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)',
      dark: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
    },
    overlay: {
      light: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))',
      dark: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))',
    },
  },
  
  // Dark mode specific colors (Requirements 12.2, 12.3)
  dark: {
    background: {
      primary: '#0a0a0a',    // Very dark background
      secondary: '#1a1a1a',  // Dark card background
      tertiary: '#262626',   // Slightly lighter
    },
    text: {
      primary: '#fafafa',    // Light text
      secondary: '#d4d4d4',  // Muted text
      tertiary: '#a3a3a3',   // Even more muted
    },
    border: {
      primary: '#262626',    // Subtle borders
      secondary: '#404040',  // More visible borders
    },
  },
} as const;

// Типографика
export const typography = {
  hero: {
    fontSize: '4rem',      // 64px
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  h1: {
    fontSize: '3rem',      // 48px
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  h2: {
    fontSize: '2.25rem',   // 36px
    lineHeight: 1.3,
    fontWeight: 700,
  },
  h3: {
    fontSize: '1.75rem',   // 28px
    lineHeight: 1.4,
    fontWeight: 600,
  },
  body: {
    fontSize: '1.125rem',  // 18px
    lineHeight: 1.8,
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.875rem',  // 14px
    lineHeight: 1.5,
    fontWeight: 500,
  },
} as const;

// Spacing (отступы)
export const spacing = {
  // Micro spacing (внутри компонентов)
  xs: '8px',
  sm: '16px',
  md: '24px',
  
  // Macro spacing (между компонентами)
  lg: '32px',
  xl: '48px',
  '2xl': '64px',
  
  // Layout spacing (секции)
  '3xl': '96px',
  '4xl': '120px',
  '5xl': '160px',
} as const;

// Grid gaps
export const gridGaps = {
  cards: '32px',
  sections: '64px',
  hero: '96px',
} as const;

// Тени
export const shadows = {
  sm: '0 2px 8px rgba(0,0,0,0.1)',
  md: '0 10px 30px rgba(0,0,0,0.15)',
  lg: '0 20px 40px rgba(0,0,0,0.25)',
  card: '0 10px 30px rgba(0,0,0,0.15)',
  cardHover: '0 20px 40px rgba(0,0,0,0.25)',
  // Dark mode shadows (Requirements 12.4)
  dark: {
    sm: '0 2px 8px rgba(0,0,0,0.5)',
    md: '0 10px 30px rgba(0,0,0,0.7)',
    lg: '0 20px 40px rgba(0,0,0,0.8)',
    card: '0 10px 30px rgba(0,0,0,0.7)',
    cardHover: '0 20px 40px rgba(0,0,0,0.8)',
  },
} as const;

// Transitions
export const transitions = {
  fast: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Стили карточек
export const cardStyles = {
  default: {
    imageHeight: '280px',
    padding: '24px',
    borderRadius: '16px',
    shadow: shadows.md,
    hoverTransform: 'translateY(-8px) scale(1.02)',
    hoverShadow: shadows.cardHover,
  },
  featured: {
    imageHeight: '360px',
    padding: '32px',
    borderRadius: '20px',
    shadow: '0 15px 40px rgba(0,0,0,0.2)',
    border: '2px solid',
    borderGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  hero: {
    imageHeight: '500px',
    layout: 'full-width',
    overlay: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))',
  },
} as const;

// Анимации
export const animations = {
  // Hover эффекты
  cardHover: {
    transform: 'translateY(-8px) scale(1.02)',
    shadow: shadows.cardHover,
    duration: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  imageZoom: {
    scale: 1.05,
    duration: '500ms',
    easing: 'ease-out',
  },
  
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    duration: 0.3,
  },
  
  // Scroll animations
  fadeInUp: {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  
  // Text animations
  colourfulText: {
    duration: 5000,
    staggerDelay: 50,
    effects: ['color', 'y', 'scale', 'blur', 'opacity'],
  },
  
  // Button animations
  buttonPress: {
    scale: 0.95,
    duration: 100,
  },
  
  buttonHover: {
    scale: 1.05,
    shadow: '0 10px 25px rgba(0,0,0,0.2)',
    duration: 200,
  },
} as const;

// Glassmorphism эффекты
export const glassmorphism = {
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  
  header: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px) saturate(180%)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  },
  
  modal: {
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
  },
  
  // Dark mode glassmorphism (Requirement 12.4)
  dark: {
    card: {
      background: 'rgba(26, 26, 26, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    },
    
    header: {
      background: 'rgba(10, 10, 10, 0.8)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    
    modal: {
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
    },
  },
} as const;

// Breakpoints
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Цвета для анимированного текста
export const colourfulTextColors = [
  'rgb(131, 179, 32)',   // Green
  'rgb(47, 195, 106)',   // Emerald
  'rgb(42, 169, 210)',   // Cyan
  'rgb(4, 112, 202)',    // Blue
  'rgb(107, 10, 255)',   // Purple
  'rgb(183, 0, 218)',    // Magenta
  'rgb(218, 0, 171)',    // Pink
  'rgb(230, 64, 92)',    // Red
  'rgb(232, 98, 63)',    // Orange
  'rgb(249, 129, 47)',   // Amber
] as const;

// Экспорт типов
export type ColorCategory = keyof typeof colors.categories;
export type SpacingSize = keyof typeof spacing;
export type CardVariant = keyof typeof cardStyles;
export type Breakpoint = keyof typeof breakpoints;
