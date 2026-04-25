import { useState, useMemo, useEffect, useCallback } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";
import { calculateMortgage, type ExtraPayment, type MortgageCalculationResult, type ScheduleItem } from "@/lib/mortgageCalculations";
import { exportToPDF } from "@/lib/pdfService";

export const useMortgageCalculator = () => {
    const { formatCurrency, saveCalculation, addToComparison, showToast } = useCalculatorCommon('mortgage', 'Ипотечный калькулятор');

    // Parse URL params on initial load (take priority over localStorage)
    const getInitialValue = <T,>(param: string, fallback: T, parser: (v: string) => T): T => {
        const urlParams = new URLSearchParams(window.location.search);
        const val = urlParams.get(param);
        if (val === null) return fallback;
        try { return parser(val); } catch { return fallback; }
    };

    const [price, setPrice] = useLocalStorage("mortgage_price",
        getInitialValue('price', 5000000, v => parseInt(v, 10)));
    const [initialPayment, setInitialPayment] = useLocalStorage("mortgage_initial",
        getInitialValue('initial', 1000000, v => parseInt(v, 10)));
    const [isInitialPercent, setIsInitialPercent] = useState(false);
    const [term, setTerm] = useLocalStorage("mortgage_term",
        getInitialValue('term', 20, v => parseInt(v, 10))); // years
    const [rate, setRate] = useLocalStorage("mortgage_rate",
        getInitialValue('rate', 18, v => parseFloat(v)));
    const [withMatCapital, setWithMatCapital] = useState(
        getInitialValue('matcap', false, v => v === '1' || v === 'true'));
    const [paymentType, setPaymentType] = useState<"annuity" | "differentiated">(
        getInitialValue('type', 'annuity', v => v === 'diff' ? 'differentiated' : 'annuity'));
    const [extraPayments, setExtraPayments] = useLocalStorage<ExtraPayment[]>("mortgage_extra_payments", []);
    interface MortgageInputs {
        price: number;
        initialPayment: number;
        term: number;
        rate: number;
        paymentType: "annuity" | "differentiated";
    }

    const [pinnedCalculation, setPinnedCalculation] = useState<{
        calculations: MortgageCalculationResult;
        inputs: MortgageInputs;
    } | null>(null);

    const MAT_CAPITAL = 934058; // Official for 2026 (first child)

    // Update URL params when inputs change (debounced via timeout)
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (price !== 5000000) params.set('price', String(price));
            if (initialPayment !== 1000000) params.set('initial', String(initialPayment));
            if (term !== 20) params.set('term', String(term));
            if (rate !== 18) params.set('rate', String(rate));
            if (withMatCapital) params.set('matcap', '1');
            if (paymentType === 'differentiated') params.set('type', 'diff');

            const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
            window.history.replaceState(null, '', newUrl);
        }, 300);
        return () => clearTimeout(timer);
    }, [price, initialPayment, term, rate, withMatCapital, paymentType]);

    const calculations = useMemo(() => {
        return calculateMortgage({
            price,
            initialPayment,
            isInitialPercent,
            term,
            rate,
            withMatCapital,
            paymentType,
            extraPayments,
            MAT_CAPITAL
        });
    }, [price, initialPayment, isInitialPercent, term, rate, withMatCapital, paymentType, extraPayments]);

    // Save to history
    useEffect(() => {
        if (calculations.monthlyPayment > 0) {
            saveCalculation(
                { price, initialPayment, term, rate, withMatCapital, paymentType },
                {
                    'Ежемесячный платеж': formatCurrency(calculations.monthlyPayment),
                    'Переплата': formatCurrency(calculations.totalInterest),
                    'Экономия': formatCurrency(calculations.savings)
                }
            );
        }
    }, [calculations, price, initialPayment, term, rate, withMatCapital, paymentType, saveCalculation, formatCurrency]);

    const handleDownload = async () => {
        showToast("Генерация PDF", "Пожалуйста, подождите...");
        const success = await exportToPDF("mortgage-report-template", `расчет_ипотеки_${new Date().toISOString().split('T')[0]}`);
        if (success) {
            showToast("Успех!", "PDF-отчет успешно сформирован.");
        } else {
            showToast("Ошибка", "Не удалось создать PDF.", "destructive");
        }
    };

    const handleShare = async () => {
        const text = `Расчет ипотеки: ${formatCurrency(price)}. Платеж: ${formatCurrency(calculations.monthlyPayment)}/мес. Переплата: ${formatCurrency(calculations.totalInterest)}. Экономия: ${formatCurrency(calculations.savings)}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Расчет ипотеки Считай.RU', text });
                return;
            } catch (e) {
                // Ignore share errors
            }
        }
        await navigator.clipboard.writeText(text);
        showToast("Скопировано!");
    };

    const copyShareableLink = useCallback(async () => {
        const params = new URLSearchParams();
        params.set('price', String(price));
        params.set('initial', String(initialPayment));
        params.set('term', String(term));
        params.set('rate', String(rate));
        if (withMatCapital) params.set('matcap', '1');
        if (paymentType === 'differentiated') params.set('type', 'diff');

        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        try {
            await navigator.clipboard.writeText(url);
            showToast('Ссылка скопирована!', 'Поделитесь расчётом — получатель увидит те же цифры');
        } catch {
            showToast('Не удалось скопировать', 'Попробуйте скопировать URL вручную', 'destructive');
        }
    }, [price, initialPayment, term, rate, withMatCapital, paymentType, showToast]);

    const handleCompare = () => {
        addToComparison(
            `Ипотека: ${formatCurrency(price)}`,
            {
                monthlyPayment: calculations.monthlyPayment,
                totalOverpayment: calculations.totalInterest,
                totalAmount: calculations.totalAmount,
                loanAmount: calculations.loanAmount
            },
            {
                price,
                initialPayment,
                term,
                rate,
                paymentType
            }
        );
    };

    const addExtraPayment = () => {
        const newPayment: ExtraPayment = {
            id: Math.random().toString(36).substr(2, 9),
            amount: 100000,
            type: 'one-time',
            month: 12,
            mode: 'reduce-term'
        };
        setExtraPayments([...extraPayments, newPayment]);
    };

    const removeExtraPayment = (id: string) => {
        setExtraPayments(extraPayments.filter(p => p.id !== id));
    };

    const updateExtraPayment = (id: string, updates: Partial<ExtraPayment>) => {
        setExtraPayments(extraPayments.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    interface HistoryItem {
        inputs: {
            price?: number;
            initialPayment?: number;
            term?: number;
            rate?: number;
            withMatCapital?: boolean;
            paymentType?: "annuity" | "differentiated";
        };
    }

    const handleLoadFromHistory = (item: HistoryItem) => {
        if (item.inputs.price) setPrice(item.inputs.price);
        if (item.inputs.initialPayment) setInitialPayment(item.inputs.initialPayment);
        if (item.inputs.term) setTerm(item.inputs.term);
        if (item.inputs.rate) setRate(item.inputs.rate);
        if (item.inputs.withMatCapital !== undefined) setWithMatCapital(item.inputs.withMatCapital);
        if (item.inputs.paymentType) setPaymentType(item.inputs.paymentType);
    };

    const exportData = useMemo(() => calculations.schedule.map((item: ScheduleItem) => ({
        'Месяц': item.month,
        'Платеж': formatCurrency(item.payment),
        'Основной долг': formatCurrency(item.principal),
        'Проценты': formatCurrency(item.interest),
        'Остаток': formatCurrency(item.balance),
        'Досрочный': item.isEarly ? 'Да' : 'Нет'
    })), [calculations.schedule, formatCurrency]);

    return {
        price, setPrice,
        initialPayment, setInitialPayment,
        isInitialPercent, setIsInitialPercent,
        term, setTerm,
        rate, setRate,
        withMatCapital, setWithMatCapital,
        paymentType, setPaymentType,
        extraPayments,
        calculations,
        handleDownload,
        handleShare,
        copyShareableLink,
        handleCompare,
        addExtraPayment,
        removeExtraPayment,
        updateExtraPayment,
        handleLoadFromHistory,
        handlePinCurrent: () => setPinnedCalculation({ calculations, inputs: { price, initialPayment, term, rate, paymentType } }),
        handleClearPinned: () => setPinnedCalculation(null),
        pinnedCalculation,
        exportData,
        formatCurrency,
        MAT_CAPITAL
    };
};
