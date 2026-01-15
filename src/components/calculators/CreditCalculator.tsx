import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Download, Share2, Info, Banknote, Calendar, Percent, Scale, TrendingUp, Clock, FileText } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import { useToast } from "@/hooks/use-toast";
import { PSBCardWidget } from "@/components/PSBCardWidget";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { useCalculatorHistory } from "@/hooks/useCalculatorHistory";
import { parseShareableLink } from "@/utils/exportUtils";
import { FeatureCard } from "@/components/calculators/FeatureCard";
import { HowToUseSection } from "@/components/calculators/HowToUseSection";

const CreditCalculator = () => {
    const { addItem } = useComparison();
    const { toast } = useToast();
    const { addCalculation } = useCalculatorHistory();
    const [loanAmount, setLoanAmount] = useState(500000);
    const [loanTerm, setLoanTerm] = useState(24); // months
    const [interestRate, setInterestRate] = useState(19.5);

    // Загрузка из расшаренной ссылки
    useEffect(() => {
        const params = parseShareableLink();
        if (params) {
            if (params.loanAmount) setLoanAmount(params.loanAmount);
            if (params.loanTerm) setLoanTerm(params.loanTerm);
            if (params.interestRate) setInterestRate(params.interestRate);
        }
    }, []);

    const monthlyRate = useMemo(() => interestRate / 100 / 12, [interestRate]);

    const monthlyPayment = useMemo(() => {
        if (monthlyRate === 0) return loanAmount / loanTerm;
        return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1);
    }, [loanAmount, loanTerm, monthlyRate]);

    const totalPayment = useMemo(() => monthlyPayment * loanTerm, [monthlyPayment, loanTerm]);
    const overpayment = useMemo(() => totalPayment - loanAmount, [totalPayment, loanAmount]);
    const overpaymentPercent = useMemo(() => (overpayment / loanAmount) * 100, [overpayment, loanAmount]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getTermString = (months: number) => {
        const years = Math.floor(months / 12);
        const m = months % 12;
        let res = "";
        if (years > 0) res += `${years} лет `;
        if (m > 0) res += `${m} мес`;
        if (years === 0 && m === 0) return "0 мес";
        return res.trim();
    };

    const handleCompare = () => {
        addItem({
            title: `Кредит: ${formatCurrency(loanAmount)}`,
            calculatorId: "credit",
            data: {
                monthlyPayment: Math.round(monthlyPayment),
                totalOverpayment: Math.round(overpayment),
                totalAmount: Math.round(totalPayment),
                loanAmount: loanAmount
            },
            params: {
                loanAmount,
                loanTerm,
                interestRate
            }
        });
        toast({
            title: "Добавлено к сравнению",
            description: "Вы можете сравнить этот расчет с другими на странице сравнения."
        });
    };

    const handleLoadFromHistory = (item: any) => {
        if (item.inputs.loanAmount) setLoanAmount(item.inputs.loanAmount);
        if (item.inputs.loanTerm) setLoanTerm(item.inputs.loanTerm);
        if (item.inputs.interestRate) setInterestRate(item.inputs.interestRate);
    };

    // Сохранение в историю
    useEffect(() => {
        if (loanAmount > 0 && monthlyPayment > 0) {
            addCalculation(
                'credit',
                'Кредитный калькулятор',
                { loanAmount, loanTerm, interestRate },
                {
                    'Ежемесячный платеж': formatCurrency(monthlyPayment),
                    'Переплата': formatCurrency(overpayment),
                    'Всего к выплате': formatCurrency(totalPayment)
                }
            );
        }
    }, [loanAmount, loanTerm, interestRate, monthlyPayment, overpayment, totalPayment]);

    const exportData = [{
        'Сумма кредита': formatCurrency(loanAmount),
        'Срок': getTermString(loanTerm),
        'Ставка': `${interestRate}%`,
        'Ежемесячный платеж': formatCurrency(monthlyPayment),
        'Переплата': formatCurrency(overpayment),
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
                            <span className="text-lg font-semibold">{getTermString(loanTerm)}</span>
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
                    <div className="glass-card p-6 sticky top-24 z-10">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-primary" />
                            Результаты
                        </h3>

                        {/* Monthly Payment */}
                        <div className="mb-6">
                            <div className="text-sm text-muted-foreground mb-1">
                                Ежемесячный платёж
                            </div>
                            <div className="calc-result animate-count-up">
                                {formatCurrency(monthlyPayment)}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 py-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Banknote className="w-4 h-4" />
                                    Сумма кредита
                                </span>
                                <span className="font-semibold">{formatCurrency(loanAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Percent className="w-4 h-4" />
                                    Переплата
                                </span>
                                <span className="font-semibold text-destructive">
                                    {formatCurrency(overpayment)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Всего выплат
                                </span>
                                <span className="font-semibold">
                                    {formatCurrency(totalPayment)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <Button variant="hero" className="w-full gap-2">
                                <Download className="w-5 h-5" />
                                График платежей
                            </Button>
                            <Button variant="secondary" className="w-full gap-2" onClick={handleCompare}>
                                <Scale className="w-5 h-5" />
                                Добавить к сравнению
                            </Button>
                        </div>
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

            {/* Возможности калькулятора */}
            <div className="calculator-section">
                <h2 className="section-title">О калькуляторе кредитов</h2>
                <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-12">
                    Калькулятор кредита поможет вам рассчитать ежемесячный платеж по потребительскому кредиту и общую переплату. Инструмент использует аннуитетную схему платежей и позволяет сравнить предложения разных банков.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={Calculator}
                        title="Расчет аннуитетных платежей"
                        description="Точный расчет ежемесячного платежа"
                        gradient="blue"
                    />
                    <FeatureCard
                        icon={Percent}
                        title="Учет процентной ставки"
                        description="Расчет переплаты с учетом ставки"
                        gradient="green"
                    />
                    <FeatureCard
                        icon={Calendar}
                        title="Гибкий срок кредитования"
                        description="От 1 месяца до 7 лет"
                        gradient="purple"
                    />
                    <FeatureCard
                        icon={Scale}
                        title="Сравнение предложений"
                        description="Сопоставьте условия разных банков"
                        gradient="orange"
                    />
                    <FeatureCard
                        icon={TrendingUp}
                        title="Анализ переплаты"
                        description="Узнайте реальную стоимость кредита"
                        gradient="pink"
                    />
                    <FeatureCard
                        icon={FileText}
                        title="График платежей"
                        description="Детальный план выплат"
                        gradient="blue"
                    />
                </div>
            </div>

            {/* Как пользоваться */}
            <HowToUseSection
                steps={[
                    { title: "Введите желаемую сумму кредита" },
                    { title: "Укажите срок кредитования в месяцах" },
                    { title: "Введите процентную ставку (уточните в банке)" },
                    { title: "Просмотрите результаты и сравните предложения" }
                ]}
            />
        </div>
    );
};

export default CreditCalculator;
