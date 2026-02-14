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
    }[];
    className?: string;
}) => {
    let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
                className
            )}
        >
            {items.map((item, idx) => (
                <Link
                    to={item?.link}
                    key={item?.link}
                    className="relative group block p-2 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-primary/10 dark:bg-slate-800/[0.8] block rounded-3xl"
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
                    <Card>
                        <div className="flex items-start gap-4">
                            {item.icon && (
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", item.bgColor)}>
                                    <item.icon className={cn("w-5 h-5", item.color)} />
                                </div>
                            )}
                            <div className="flex-1">
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                                {item.extra && <div className="mt-4">{item.extra}</div>}
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export const Card = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "rounded-2xl h-full w-full p-4 overflow-hidden bg-background border border-border group-hover:border-primary/50 relative z-20 transition-colors duration-300",
                className
            )}
        >
            <div className="relative z-50">
                <div className="p-2">{children}</div>
            </div>
        </div>
    );
};

export const CardTitle = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <h4 className={cn("text-foreground font-bold tracking-wide", className)}>
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
                "mt-2 text-muted-foreground tracking-wide leading-relaxed text-sm line-clamp-2",
                className
            )}
        >
            {children}
        </p>
    );
};
