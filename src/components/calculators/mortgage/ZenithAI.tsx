import React, { useMemo } from 'react';
import { Sparkles, TrendingDown, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { type MortgageCalculationResult } from '@/lib/mortgageCalculations';
import { cn } from '@/lib/utils';

interface ZenithAIProps {
    calculations: MortgageCalculationResult;
    formatCurrency: (value: number) => string;
}

export const ZenithAI = ({ calculations, formatCurrency }: ZenithAIProps) => {
    const insights = useMemo(() => {
        const list = [];
        const { totalInterest, loanAmount, savings, actualMonths, originalMonths } = calculations;

        // 1. Анализ переплаты
        const overpaymentRatio = totalInterest / loanAmount;
        if (overpaymentRatio > 2) {
            list.push({
                icon: AlertTriangle,
                color: 'text-red-500',
                title: 'Критическая переплата',
                text: `Вы заплатите банку в ${overpaymentRatio.toFixed(1)} раза больше, чем взяли. Это очень дорого. Рекомендую увеличить первый взнос или сократить срок.`
            });
        } else if (overpaymentRatio > 1) {
            list.push({
                icon: Info,
                color: 'text-yellow-500',
                title: 'Высокая переплата',
                text: `Проценты составляют ${Math.round(overpaymentRatio * 100)}% от суммы кредита. Это типично, но можно сэкономить, сократив срок.`
            });
        }

        // 2. Потенциал экономии
        if (savings > 0) {
            list.push({
                icon: TrendingDown,
                color: 'text-green-500',
                title: 'Отличная стратегия',
                text: `Ваши досрочные платежи экономят вам ${formatCurrency(savings)} и сокращают срок на ${originalMonths - actualMonths} мес. Это эквивалентно ${Math.ceil((originalMonths - actualMonths) / 12)} годам свободы!`
            });
        } else {
            list.push({
                icon: Sparkles,
                color: 'text-blue-500',
                title: 'Секрет экономии',
                text: `Даже +5,000 руб. ежемесячно к платежу могут сэкономить вам сотни тысяч рублей и годы ипотеки. Попробуйте добавить досрочный платеж.`
            });
        }

        // 3. Инфляционный контекст
        list.push({
            icon: Info,
            color: 'text-indigo-500',
            title: 'Взгляд сквозь время',
            text: 'При инфляции 8-10%, через 10 лет ваш текущий платеж будет ощущаться как стоимость 2-3 походов в магазин. Инфляция "съедает" долг за вас.'
        });

        return list;
    }, [calculations, formatCurrency]);

    return (
        <div className="relative group p-6 rounded-3xl bg-card border-2 border-primary/20 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-indigo-500/30 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-6 h-6 text-primary fill-primary/20" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                            Zenith AI Аналитик
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Интеллектуальный анализ</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {insights.map((insight, idx) => (
                            <motion.div
                                key={insight.title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className="flex gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors"
                            >
                                <div className={cn("mt-1 shrink-0", insight.color)}>
                                    <insight.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {idx === 0 ? <TextGenerateEffect words={insight.text} className="font-normal text-sm" /> : insight.text}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
