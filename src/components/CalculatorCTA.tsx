import { ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { forwardRef } from "react";

interface CalculatorCTAProps {
  testKey: string;
  label: string;
  description?: string;
  href: string;
  variant?: "primary" | "insurance" | "mortgage" | "credit" | "debit";
  showAdLabel?: boolean;
  erid?: string;
  className?: string;
  calculatorId?: string;
}

const variantStyles = {
  primary: {
    bg: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
    textColor: "text-white",
    ring: "focus:ring-blue-500",
  },
  insurance: {
    bg: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800",
    textColor: "text-white",
    ring: "focus:ring-emerald-500",
  },
  mortgage: {
    bg: "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800",
    textColor: "text-white",
    ring: "focus:ring-indigo-500",
  },
  credit: {
    bg: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800",
    textColor: "text-white",
    ring: "focus:ring-amber-500",
  },
  debit: {
    bg: "bg-violet-600 hover:bg-violet-700 active:bg-violet-800",
    textColor: "text-white",
    ring: "focus:ring-violet-500",
  },
} as const;

export const CalculatorCTA = forwardRef<HTMLAnchorElement, CalculatorCTAProps>(
  function CalculatorCTA(
    { testKey, label, description, href, variant = "primary", showAdLabel = true, erid, className = "", calculatorId },
    ref
  ) {
    const styles = variantStyles[variant];
    const abVariant = typeof window !== "undefined" ? ((localStorage.getItem(`ab_cta_${testKey}`) as "a" | "b" | null) ?? "a") : "a";

    if (typeof window !== "undefined" && !localStorage.getItem(`ab_cta_${testKey}`)) {
      const assigned = Math.random() < 0.5 ? "a" : "b";
      localStorage.setItem(`ab_cta_${testKey}`, assigned);
    }

    const handleClick = () => {
      if (typeof window === "undefined") return;
      try {
        const win = window as Window & { ym?: (...args: unknown[]) => void };
        win.ym?.(93845231, "reachGoal", "calculator_cta_click", {
          calculator: calculatorId,
          test_key: testKey,
          variant: abVariant,
          label,
        });
      } catch {
        // Yandex Metrika may not be loaded
      }
    };

    return (
      <div className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-lg ${className}`}>
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{label}</h3>
            {description && <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>}
          </div>
          <div className="flex flex-col items-start gap-1 md:items-end">
            <a
              ref={ref}
              href={href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleClick}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold ${styles.bg} ${styles.textColor} ${styles.ring} focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              <span>{label}</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <div className="text-[10px] text-slate-500 md:text-xs">
              {showAdLabel && <span>Партнёрская ссылка</span>}
              {showAdLabel && erid && <span>{showAdLabel && erid ? " • " : ""}Реклама • erid: {erid}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CalculatorCTA.displayName = "CalculatorCTA";

export default CalculatorCTA;
