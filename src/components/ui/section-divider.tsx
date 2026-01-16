import { cn } from "@/lib/utils";

interface SectionDividerProps {
  variant?: "default" | "gradient" | "dotted" | "thick";
  className?: string;
  spacing?: "sm" | "md" | "lg" | "xl";
}

/**
 * Visual separator component for creating clear section divisions
 * Requirement 2.5: Add visual separators between sections
 */
export function SectionDivider({ 
  variant = "default", 
  className,
  spacing = "md" 
}: SectionDividerProps) {
  const spacingClasses = {
    sm: "my-8",
    md: "my-12",
    lg: "my-16",
    xl: "my-24",
  };

  const variantClasses = {
    default: "h-px bg-border",
    gradient: "h-px bg-gradient-to-r from-transparent via-border to-transparent",
    dotted: "h-px border-t-2 border-dotted border-border",
    thick: "h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full",
  };

  return (
    <div 
      className={cn(
        "w-full",
        spacingClasses[spacing],
        variantClasses[variant],
        className
      )}
      role="separator"
      aria-hidden="true"
    />
  );
}

interface ContentBlockProps {
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Content block wrapper with consistent spacing
 * Requirement 2.5: Add spacing between content blocks
 */
export function ContentBlock({ 
  children, 
  spacing = "lg",
  className 
}: ContentBlockProps) {
  const spacingClasses = {
    sm: "space-y-4",
    md: "space-y-6",
    lg: "space-y-8",
    xl: "space-y-12",
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
}
