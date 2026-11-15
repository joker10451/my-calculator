/** @type {import('tailwindcss').Config} */

// Редакционная палитра: тёплая «бумага» и почти чёрный текст вместо холодного slate.
// gray и slate переопределены одинаково, чтобы старые классы на всех страницах сразу перешли на новую гамму.
const ink = {
  50: '#F7F4EE', // бумага, фон страницы
  100: '#EFEBE3',
  200: '#E2DCD1', // линии
  300: '#CFC7BA',
  400: '#A39A8C',
  500: '#6E675C', // мелкие подписи, 5:1 на бумаге
  600: '#57514A',
  700: '#403B35',
  800: '#2B2824', // тёмная тема: линии
  900: '#1E1C19', // тёмная тема: поверхности
  950: '#151412', // тёмная тема: фон (графит)
};

// Единственный акцент — тёмно-зелёный. blue/accent/brand ведут на него же, чтобы синего не осталось нигде.
const green = {
  50: '#EEF3EF',
  100: '#DCE8E0',
  200: '#B9D1C2',
  300: '#8DB39C',
  400: '#5E8F74',
  500: '#3A6E55',
  600: '#1F4D3A',
  700: '#183E2F',
  800: '#123025',
  900: '#0D241B',
  950: '#08170F',
};

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Golos Text"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Times New Roman', 'serif'],
        heading: ['"Source Serif 4"', 'Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        ink,
        slate: ink,
        gray: ink,
        brand: green,
        accent: green,
        blue: green,
        // «выгодно» и полосы сравнения были ярким изумрудным — второй зелёный; сводим к акценту
        emerald: green,
        teal: green,
        warm: {
          50: '#FBF6EA',
          100: '#F5EACF',
          200: '#EAD5A3',
          300: '#DDBB72',
          400: '#CC9D45',
          500: '#B07F2A',
          600: '#8F6520',
          700: '#714F1A',
          800: '#553C15',
          900: '#3E2C11',
          950: '#241908',
        },
      },
      // Без теней: структура держится на тонких линиях.
      boxShadow: {
        xs: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        card: 'none',
        'card-hover': 'none',
      },
      // Минимум скруглений; rounded-full (чипсы, ползунки) оставлен.
      borderRadius: {
        md: '3px',
        lg: '4px',
        xl: '4px',
        '2xl': '6px',
        '3xl': '6px',
      },
      backdropBlur: { xs: '2px' },
      // Локально лежат начертания 400/500/600; всё жирнее сводим к 600.
      fontWeight: { bold: '600', extrabold: '600', black: '600' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
