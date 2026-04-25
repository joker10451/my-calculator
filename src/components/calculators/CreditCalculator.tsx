import { useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Info, Banknote, Calendar, Percent, Download, Share2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PSBCardWidget } from "@/components/PSBCardWidget";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { CalculatorResults } from "@/components/calculators/CalculatorResults";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";
import { useAnnuityCalculation } from "@/hooks/useCalculatorMemo";
import { exportToPDF } from "@/lib/pdfService";

const CreditCalculator = () => {
    const getInitial = <T,>(param: string, fallback: T, parser: (v: string) => T): T => {
        const v = new URLSearchParams(window.location.search).get(param);
        if (v === null) return fallback;
        try { return parser(v); } catch { return fallback; }
    };

    const [loanAmount, setLoanAmount] = useState(getInitial('amount', 500000, v => parseInt(v, 10)));
    const [loanTerm, setLoanTerm] = useState(getInitial('term', 24, v => parseInt(v, 10))); // months
    const [interestRate, setInterestRate] = useState(getInitial('rate', 19.5, v => parseFloat(v)));

    const {
        formatCurrency,
        formatTerm,
        saveCalculation,
        addToComparison,
        showToast,
    } = useCalculatorCommon('credit', 'Кредитный калькулятор');

    // Auto-update URL
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (loanAmount !== 500000) params.set('amount', String(loanAmount));
            if (loanTerm !== 24) params.set('term', String(loanTerm));
            if (interestRate !== 19.5) params.set('rate', String(interestRate));
            const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
            window.history.replaceState(null, '', newUrl);
        }, 300);
        return () => clearTimeout(timer);
    }, [loanAmount, loanTerm, interestRate]);

    // Расчеты с использованием оптимизированного хука
    const calculations = useAnnuityCalculation(loanAmount, interestRate, loanTerm);
    const { monthlyPayment, totalPayment, totalInterest } = calculations;

    // Сохранение в историю
    useEffect(() => {
        if (loanAmount > 0 && monthlyPayment > 0) {
            saveCalculation(
                { loanAmount, loanTerm, interestRate },
                {
                    'Ежемесячный платеж': formatCurrency(monthlyPayment),
                    'Переплата': formatCurrency(totalInterest),
                    'Всего к выплате': formatCurrency(totalPayment)
                }
            );
        }
    }, [loanAmount, loanTerm, interestRate, monthlyPayment, totalInterest, totalPayment, saveCalculation, formatCurrency]);

    const handleCompare = () => {
        addToComparison(
            `Кредит: ${formatCurrency(loanAmount)}`,
            {
                monthlyPayment,
                totalOverpayment: totalInterest,
                totalAmount: totalPayment,
                loanAmount
            },
            { loanAmount, loanTerm, interestRate }
        );
    };

    const handleLoadFromHistory = (item: { inputs: { loanAmount?: number; loanTerm?: number; interestRate?: number } }) => {
        if (item.inputs.loanAmount) setLoanAmount(item.inputs.loanAmount);
        if (item.inputs.loanTerm) setLoanTerm(item.inputs.loanTerm);
        if (item.inputs.interestRate) setInterestRate(item.inputs.interestRate);
    };

    const handleDownload = async () => {
        showToast("Генерация PDF", "Пожалуйста, подождите...");
        const success = await exportToPDF("credit-report-template", `расчет_кредита_${new Date().toISOString().split('T')[0]}`);
        if (success) {
            showToast("Успех!", "PDF-отчет сформирован.");
        } else {
            showToast("Ошибка", "Не удалось создать PDF.", "destructive");
        }
    };

    const handleShare = async () => {
        const text = `Кредит ${formatCurrency(loanAmount)} на ${loanTerm} мес. при ${interestRate}%: платёж ${formatCurrency(monthlyPayment)}/мес, переплата ${formatCurrency(totalInterest)}`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Расчет кредита', text }); return; } catch {}
        }
        try {
            await navigator.clipboard.writeText(text);
            showToast("Скопировано!");
        } catch { showToast("Ошибка", "Не удалось скопировать", "destructive"); }
    };

    const copyShareableLink = useCallback(async () => {
        const params = new URLSearchParams();
        params.set('amount', String(loanAmount));
        params.set('term', String(loanTerm));
        params.set('rate', String(interestRate));
        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        try {
            await navigator.clipboard.writeText(url);
            showToast('Ссылка скопирована!', 'Поделитесь расчётом — получатель увидит те же цифры');
        } catch {
            showToast('Не удалось скопировать', 'Попробуйте скопировать URL вручную', 'destructive');
        }
    }, [loanAmount, loanTerm, interestRate, showToast]);

    const exportData = [{
        'Сумма кредита': formatCurrency(loanAmount),
        'Срок': formatTerm(loanTerm),
        'Ставка': `${interestRate}%`,
        'Ежемесячный платеж': formatCurrency(monthlyPayment),
        'Переплата': formatCurrency(totalInterest),
        'Всего к выплате': formatCurrency(totalPayment)
    }];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Кредитный калькулятор</h2>
                <div className="flex gap-2">
                    <CalculatorHistory
                        calculatorType="credit"
                        onLoadCalculation={handleLoadFromHistory}
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Loan Amount */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Сумма кредита</label>
                            <span className="text-lg font-semibold" aria-live="polite">{formatCurrency(loanAmount)}</span>
                        </div>
                        <Slider
                            value={[loanAmount]}
                            onValueChange={(v) => setLoanAmount(v[0])}
                            min={10000}
                            max={5000000}
                            step={5000}
                            className="py-4"
                            aria-label="Сумма кредита"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground" aria-hidden="true">
                            <span>10 тыс</span>
                            <span>5 млн</span>
                        </div>
                    </div>

                    {/* Loan Term */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Срок кредита</label>
                            <span className="text-lg font-semibold" aria-live="polite">{formatTerm(loanTerm)}</span>
                        </div>
                        <Slider
                            value={[loanTerm]}
                            onValueChange={(v) => setLoanTerm(v[0])}
                            min={1}
                            max={84} // 7 years
                            step={1}
                            className="py-4"
                            aria-label="Срок кредита в месяцах"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground" aria-hidden="true">
                            <span>1 мес</span>
                            <span>7 лет</span>
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Ставка</label>
                            <span className="text-lg font-semibold" aria-live="polite">{interestRate}%</span>
                        </div>
                        <Slider
                            value={[interestRate]}
                            onValueChange={(v) => setInterestRate(v[0])}
                            min={1}
                            max={50}
                            step={0.1}
                            className="py-4"
                            aria-label="Процентная ставка"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground" aria-hidden="true">
                            <span>1%</span>
                            <span>50%</span>
                        </div>
                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <p>
                            Расчёт предварительный. Точные условия зависят от банка и вашей кредитной истории.
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div id="credit-results" className="lg:col-span-2">
                    <CalculatorResults
                        mainResult={{
                            label: 'Ежемесячный платёж',
                            value: formatCurrency(monthlyPayment)
                        }}
                        results={[
                            {
                                label: 'Сумма кредита',
                                value: formatCurrency(loanAmount),
                                icon: <Banknote className="w-4 h-4" />
                            },
                            {
                                label: 'Переплата',
                                value: formatCurrency(totalInterest),
                                icon: <Percent className="w-4 h-4" />,
                                variant: 'danger'
                            },
                            {
                                label: 'Всего выплат',
                                value: formatCurrency(totalPayment),
                                icon: <Calendar className="w-4 h-4" />
                            }
                        ]}
                        onCompare={handleCompare}
                        onDownload={handleDownload}
                        onShare={handleShare}
                    />

                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <Button variant="outline" className="gap-2" onClick={handleShare}>
                            <Share2 className="w-4 h-4" />
                            Поделиться
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={copyShareableLink}>
                            <Link2 className="w-4 h-4" />
                            Ссылка
                        </Button>
                    </div>

                    {/* PSB Card Widget */}
                    <div className="mt-6 animate-fade-in relative z-0">
                        <PSBCardWidget
                            source="calculator"
                            variant="full"
                            showDetails={true}
                            className="relative z-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditCalculator;
