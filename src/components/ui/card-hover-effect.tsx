import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

export const HoverEffect = ({
    items,
    className,
}: {
    items: {
        title: string;
        description: string;
        link: string;
        icon?: React.ElementType;
        color?: string;
        bgColor?: string;
        extra?: React.ReactNode;
        onMouseEnter?: () => void;
    }[];
    className?: string;
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 py-4 md:py-6",
                className
            )}
        >
            {items.map((item, idx) => (
                <Link
                    to={item?.link}
                    key={item?.link}
                    className="relative group block p-1.5 h-full w-full"
                    onMouseEnter={() => { setHoveredIndex(idx); item.onMouseEnter?.(); }}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-primary/10 block rounded-3xl"
                                layoutId="hoverBackground"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: { duration: 0.15 },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: { duration: 0.15, delay: 0.2 },
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <HoverCard className="min-h-[210px]">
                        <div className="flex items-start gap-4">
                            {item.icon && (
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", item.bgColor)} aria-hidden="true">
                                    <item.icon className={cn("w-5 h-5", item.color)} aria-hidden="true" />
                                </div>
                            )}
                            <div className="flex-1">
                                <HoverCardTitle>{item.title}</HoverCardTitle>
                                <CardDescription>{item.description}</CardDescription>
                                {item.extra && <div className="mt-4">{item.extra}</div>}
                            </div>
                        </div>
                    </HoverCard>
                </Link>
            ))}
        </div>
    );
};

export const HoverCard = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "rounded-2xl h-full w-full p-4 overflow-hidden border border-slate-800 bg-slate-900/80 group-hover:border-primary/40 relative z-20 transition-colors duration-300",
                className
            )}
        >
            <div className="relative z-50">
                <div className="p-2">{children}</div>
            </div>
        </div>
    );
};

export const HoverCardTitle = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <h4 className={cn("text-slate-100 font-bold tracking-wide", className)}>
            {children}
        </h4>
    );
};

export const CardDescription = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <p
            className={cn(
                "mt-2 text-slate-300 tracking-wide leading-relaxed text-sm line-clamp-2",
                className
            )}
        >
            {children}
        </p>
    );
};
