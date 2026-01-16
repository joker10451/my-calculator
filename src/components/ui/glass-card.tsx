import * as React from "react";
import { cn } from "@/lib/utils";
import { supportsBackdropFilter } from "@/lib/feature-detection";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant of the glass card
   * - default: Standard glassmorphic effect
   * - header: Stronger blur for header/navigation
   * - modal: Darker background for modal overlays
   */
  variant?: "default" | "header" | "modal";
  /**
   * Whether to use fallback for browsers that don't support backdrop-filter
   */
  useFallback?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", useFallback = false, children, ...props }, ref) => {
    const [supportsBackdrop, setSupportsBackdrop] = React.useState(true);

    React.useEffect(() => {
      // Feature detection for backdrop-filter support
      setSupportsBackdrop(supportsBackdropFilter());
    }, []);

    const shouldUseFallback = useFallback || !supportsBackdrop;

    const variantStyles = {
      default: shouldUseFallback
        ? "bg-white/90 dark:bg-gray-900/90"
        : "bg-white/10 dark:bg-white/5 backdrop-blur-[10px] backdrop-saturate-150",
      header: shouldUseFallback
        ? "bg-white/95 dark:bg-gray-900/95"
        : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-[20px] backdrop-saturate-[180%]",
      modal: shouldUseFallback
        ? "bg-black/80"
        : "bg-black/50 backdrop-blur-[8px]",
    };

    const borderStyles = {
      default: "border border-white/20 dark:border-white/10",
      header: "border-b border-black/10 dark:border-white/10",
      modal: "border-0",
    };

    const shadowStyles = {
      default: "shadow-[0_8px_32px_rgba(0,0,0,0.1)]",
      header: "shadow-sm",
      modal: "shadow-2xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300",
          variantStyles[variant],
          borderStyles[variant],
          shadowStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
