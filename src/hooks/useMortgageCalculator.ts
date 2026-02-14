import { useState, useMemo, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";
import { calculateMortgage, type ExtraPayment, type MortgageCalculationResult } from "@/lib/mortgageCalculations";
import { parseShareableLink } from "@/utils/exportUtils";
import { STAMP_BASE64 } from "@/lib/assets";
import { exportToPDF } from "@/lib/pdfService";

export const useMortgageCalculator = () => {
    const { formatCurrency, saveCalculation, addToComparison, showToast } = useCalculatorCommon('mortgage', 'Ипотечный калькулятор');

    const [price, setPrice] = useLocalStorage("mortgage_price", 5000000);
    const [initialPayment, setInitialPayment] = useLocalStorage("mortgage_initial", 1000000);
    const [isInitialPercent, setIsInitialPercent] = useState(false);
    const [term, setTerm] = useLocalStorage("mortgage_term", 20); // years
    const [rate, setRate] = useLocalStorage("mortgage_rate", 18);
    const [withMatCapital, setWithMatCapital] = useState(false);
    const [paymentType, setPaymentType] = useState<"annuity" | "differentiated">("annuity");
    const [extraPayments, setExtraPayments] = useLocalStorage<ExtraPayment[]>("mortgage_extra_payments", []);
    const [pinnedCalculation, setPinnedCalculation] = useState<{
        calculations: MortgageCalculationResult;
        inputs: any;
    } | null>(null);

    const MAT_CAPITAL = 934058; // Official for 2026 (first child)

    // Load results from shared link
    useEffect(() => {
        const sharedParams = parseShareableLink();
        if (sharedParams) {
            if (sharedParams.price) setPrice(sharedParams.price as number);
            if (sharedParams.initialPayment) setInitialPayment(sharedParams.initialPayment as number);
            if (sharedParams.term) setTerm(sharedParams.term as number);
            if (sharedParams.rate) setRate(sharedParams.rate as number);
            if (sharedParams.withMatCapital !== undefined) setWithMatCapital(sharedParams.withMatCapital as boolean);
            if (sharedParams.paymentType) setPaymentType(sharedParams.paymentType as "annuity" | "differentiated");
        }
    }, [setPrice, setInitialPayment, setTerm, setRate, setWithMatCapital, setPaymentType]);

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
        const success = await exportToPDF("mortgage-report-template", `расчет_ипотеки_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
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

    const handleLoadFromHistory = (item: any) => {
        if (item.inputs.price) setPrice(item.inputs.price);
        if (item.inputs.initialPayment) setInitialPayment(item.inputs.initialPayment);
        if (item.inputs.term) setTerm(item.inputs.term);
        if (item.inputs.rate) setRate(item.inputs.rate);
        if (item.inputs.withMatCapital !== undefined) setWithMatCapital(item.inputs.withMatCapital);
        if (item.inputs.paymentType) setPaymentType(item.inputs.paymentType);
    };

    const exportData = useMemo(() => calculations.schedule.map(item => ({
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
