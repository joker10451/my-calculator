import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f5f7ff",
          100: "#ebefff",
          200: "#d6deff",
          300: "#b8c5ff",
          400: "#8b9cff",
          500: "#667eea",
          600: "#5568d3",
          700: "#4654bc",
          800: "#3a44a5",
          900: "#2f378e",
          gradient: "var(--primary-gradient)",
          solid: "#667eea",
          light: "#8b9cff",
          dark: "#5568d3",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          success: {
            DEFAULT: "#22c55e",
            light: "#4ade80",
            dark: "#16a34a",
          },
          warning: {
            DEFAULT: "#f59e0b",
            light: "#fbbf24",
            dark: "#d97706",
          },
          error: {
            DEFAULT: "#ef4444",
            light: "#f87171",
            dark: "#dc2626",
          },
          info: {
            DEFAULT: "#3b82f6",
            light: "#60a5fa",
            dark: "#2563eb",
          },
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Категории калькуляторов
        finance: "hsl(var(--finance))",
        housing: "hsl(var(--housing))",
        auto: "hsl(var(--auto))",
        health: "hsl(var(--health))",
        family: "hsl(var(--family))",
        business: "hsl(var(--business))",
        legal: "hsl(var(--legal))",
        // Категории блога (яркие цвета)
        categories: {
          finance: {
            DEFAULT: "#10b981",
            light: "#34d399",
            dark: "#059669",
          },
          taxes: {
            DEFAULT: "#f59e0b",
            light: "#fbbf24",
            dark: "#d97706",
          },
          mortgage: {
            DEFAULT: "#3b82f6",
            light: "#60a5fa",
            dark: "#2563eb",
          },
          utilities: {
            DEFAULT: "#8b5cf6",
            light: "#a78bfa",
            dark: "#7c3aed",
          },
          salary: {
            DEFAULT: "#ec4899",
            light: "#f472b6",
            dark: "#db2777",
          },
          insurance: {
            DEFAULT: "#06b6d4",
            light: "#22d3ee",
            dark: "#0891b2",
          },
          investment: {
            DEFAULT: "#14b8a6",
            light: "#2dd4bf",
            dark: "#0d9488",
          },
          savings: {
            DEFAULT: "#84cc16",
            light: "#a3e635",
            dark: "#65a30d",
          },
        },
        // Нейтральная палитра
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Display sizes for hero sections
        "display": ["4rem", { lineHeight: "1.1", fontWeight: "800", letterSpacing: "-0.02em" }],
        "display-sm": ["2.5rem", { lineHeight: "1.2", fontWeight: "800" }],
        "hero": ["4rem", { lineHeight: "1.1", fontWeight: "800", letterSpacing: "-0.02em" }],
        
        // Heading sizes (Requirements 2.1, 2.2, 2.3, 2.4)
        "h1": ["3rem", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.01em" }],      // 48px
        "h2": ["2.25rem", { lineHeight: "1.3", fontWeight: "700" }],                             // 36px
        "h3": ["1.75rem", { lineHeight: "1.4", fontWeight: "700" }],                             // 28px
        
        // Body text (Requirement 2.3)
        "body": ["1.125rem", { lineHeight: "1.8", fontWeight: "400" }],                          // 18px
        "body-lg": ["1.25rem", { lineHeight: "1.8", fontWeight: "400" }],                        // 20px
        
        // Supporting text
        "caption": ["0.875rem", { lineHeight: "1.5", fontWeight: "500" }],                       // 14px
        "small": ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],                          // 12px
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
      lineHeight: {
        tight: "1.2",
        snug: "1.4",
        normal: "1.6",
        relaxed: "1.8",
        loose: "2.0",
      },
      spacing: {
        "xs": "8px",
        "sm": "16px",
        "md": "24px",
        "lg": "32px",
        "xl": "48px",
        "2xl": "64px",
        "3xl": "96px",
        "4xl": "120px",
        "5xl": "160px",
      },
      boxShadow: {
        "card": "var(--shadow-card)",
        "button": "var(--shadow-button)",
        "elevated": "var(--shadow-elevated)",
        "sm": "0 2px 8px rgba(0,0,0,0.1)",
        "md": "0 10px 30px rgba(0,0,0,0.15)",
        "lg": "0 20px 40px rgba(0,0,0,0.25)",
        "card-hover": "0 20px 40px rgba(0,0,0,0.25)",
      },
      transitionDuration: {
        "fast": "200ms",
        "base": "300ms",
        "slow": "500ms",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "count-up": {
          from: { opacity: "0", transform: "scale(0.8)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "count-up": "count-up 0.4s ease-out forwards",
        "shimmer": "shimmer 2s infinite",
      },
      backgroundImage: {
        // Hero gradients
        "hero-light": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "hero-dark": "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        // Card gradients
        "card-light": "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        "card-dark": "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        // Section gradients
        "section-light": "linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)",
        "section-dark": "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)",
        // Overlay gradients
        "overlay-light": "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))",
        "overlay-dark": "linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))",
        // Category gradients
        "gradient-finance": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "gradient-taxes": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "gradient-mortgage": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        "gradient-utilities": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        "gradient-salary": "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
        "gradient-insurance": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
        "gradient-investment": "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
        "gradient-savings": "linear-gradient(135deg, #84cc16 0%, #65a30d 100%)",
        // Accent gradients
        "gradient-success": "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        "gradient-warning": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "gradient-error": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        "gradient-info": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        // Primary gradient
        "gradient-primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate")
  ],
} satisfies Config;
