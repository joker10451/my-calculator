import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Info, Banknote, Calendar, Percent } from "lucide-react";
import { PSBCardWidget } from "@/components/PSBCardWidget";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { parseShareableLink } from "@/utils/exportUtils";
import { CalculatorResults } from "@/components/calculators/CalculatorResults";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";
import { useAnnuityCalculation } from "@/hooks/useCalculatorMemo";

const CreditCalculator = () => {
    const [loanAmount, setLoanAmount] = useState(500000);
    const [loanTerm, setLoanTerm] = useState(24); // months
    const [interestRate, setInterestRate] = useState(19.5);

    const {
        formatCurrency,
        formatTerm,
        saveCalculation,
        addToComparison,
    } = useCalculatorCommon('credit', 'Кредитный калькулятор');

    // Загрузка из расшаренной ссылки
    useEffect(() => {
        const params = parseShareableLink();
        if (params) {
            if (params.loanAmount) setLoanAmount(params.loanAmount);
            if (params.loanTerm) setLoanTerm(params.loanTerm);
            if (params.interestRate) setInterestRate(params.interestRate);
        }
    }, []);

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
                    <CalculatorActions
                        calculatorId="credit"
                        calculatorName="Кредитный калькулятор"
                        data={exportData}
                        printElementId="credit-results"
                        shareParams={{ loanAmount, loanTerm, interestRate }}
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
                            <span className="text-lg font-semibold">{formatCurrency(loanAmount)}</span>
                        </div>
                        <Slider
                            value={[loanAmount]}
                            onValueChange={(v) => setLoanAmount(v[0])}
                            min={10000}
                            max={5000000}
                            step={5000}
                            className="py-4"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>10 тыс</span>
                            <span>5 млн</span>
                        </div>
                    </div>

                    {/* Loan Term */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Срок кредита</label>
                            <span className="text-lg font-semibold">{formatTerm(loanTerm)}</span>
                        </div>
                        <Slider
                            value={[loanTerm]}
                            onValueChange={(v) => setLoanTerm(v[0])}
                            min={1}
                            max={84} // 7 years
                            step={1}
                            className="py-4"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>1 мес</span>
                            <span>7 лет</span>
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Ставка</label>
                            <span className="text-lg font-semibold">{interestRate}%</span>
                        </div>
                        <Slider
                            value={[interestRate]}
                            onValueChange={(v) => setInterestRate(v[0])}
                            min={1}
                            max={50}
                            step={0.1}
                            className="py-4"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
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
                    />

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
