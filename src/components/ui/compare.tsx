"use client";
import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface CompareProps {
    firstContent?: React.ReactNode;
    secondContent?: React.ReactNode;
    className?: string;
    contentClassName?: string;
    initialSliderPercentage?: number;
    slideMode?: "hover" | "drag";
    showHandlebar?: boolean;
}

export const Compare = ({
    firstContent,
    secondContent,
    className,
    contentClassName,
    initialSliderPercentage = 50,
    slideMode = "hover",
    showHandlebar = true,
}: CompareProps) => {
    const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!sliderRef.current) return;
        if (slideMode === "hover") {
            const rect = sliderRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const percent = (x / rect.width) * 100;
            requestAnimationFrame(() => {
                setSliderXPercent(Math.max(0, Math.min(100, percent)));
            });
        }
    }, [slideMode]);

    return (
        <div
            ref={sliderRef}
            role="slider"
            aria-label="Сравнение изображений"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sliderXPercent)}
            aria-valuetext={`${Math.round(sliderXPercent)} процентов`}
            tabIndex={0}
            className={cn("relative overflow-hidden w-full h-full rounded-xl border border-border bg-background", className)}
            style={{ cursor: "col-resize" }}
            onMouseLeave={() => { if (slideMode === "hover") setSliderXPercent(initialSliderPercentage); }}
        >
            <input
                type="range"
                min={0}
                max={100}
                value={Math.round(sliderXPercent)}
                aria-label="Сравнение изображений"
                aria-orientation="horizontal"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sliderXPercent)}
                aria-valuetext={`${Math.round(sliderXPercent)} процентов`}
                className="absolute inset-0 z-40 h-full w-full cursor-col-resize opacity-0"
                onChange={(e) => setSliderXPercent(Number(e.currentTarget.value))}
                onPointerMove={(e) => {
                    if (slideMode === "hover") handleMove(e.clientX);
                }}
            />
            <div className="absolute inset-0 z-10 pointer-events-none">
                <motion.div
                    className="h-full w-px absolute top-0 z-30 bg-primary"
                    style={{ left: `${sliderXPercent}%` }}
                    transition={{ duration: 0 }}
                >
                    {showHandlebar && (
                        <div className="absolute top-1/2 -translate-y-1/2 -left-3 h-8 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-primary/50">
                            <GripVertical className="h-4 w-4" />
                        </div>
                    )}
                    {/* Subtle glow / beam effect */}
                    <div className="absolute inset-y-0 -left-10 w-20 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-50" />
                </motion.div>
            </div>

            <div className={cn("relative w-full h-full", contentClassName)}>
                {/* First Content (Top Layer - Clipped) */}
                <motion.div
                    className="absolute inset-0 z-20 w-full h-full overflow-hidden select-none"
                    style={{ clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)` }}
                    transition={{ duration: 0 }}
                >
                    {firstContent}
                </motion.div>

                {/* Second Content (Bottom Layer) */}
                <div className="absolute inset-0 z-10 w-full h-full select-none">
                    {secondContent}
                </div>
            </div>
        </div>
    );
};
