import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Percent, Info, Share2, Wallet, ArrowRight, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";
import { PSBCardWidget } from "@/components/PSBCardWidget";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { useCalculatorHistory } from "@/hooks/useCalculatorHistory";
import { parseShareableLink } from "@/utils/exportUtils";

const RefinancingCalculator = () => {
    const { toast } = useToast();
    const { addCalculation } = useCalculatorHistory();
    // Current Loan
    const [currentBalance, setCurrentBalance] = useState(1500000);
    const [currentRate, setCurrentRate] = useState(16);
    const [currentTerm, setCurrentTerm] = useState(36); // months left

    // New Loan
    const [newRate, setNewRate] = useState(12);
    const [newTerm, setNewTerm] = useState(36);

    useEffect(() => {
        const params = parseShareableLink();
        if (params) {
            if (params.currentBalance) setCurrentBalance(params.currentBalance);
            if (params.currentRate) setCurrentRate(params.currentRate);
            if (params.currentTerm) setCurrentTerm(params.currentTerm);
            if (params.newRate) setNewRate(params.newRate);
            if (params.newTerm) setNewTerm(params.newTerm);
        }
    }, []);

    const calculatePayment = (principal: number, rate: number, months: number) => {
        if (rate === 0) return principal / months;
        const monthlyRate = rate / 12 / 100;
        const factor = Math.pow(1 + monthlyRate, months);
        return Math.round(principal * (monthlyRate * factor) / (factor - 1));
    };

    const oldMonthly = useMemo(() => calculatePayment(currentBalance, currentRate, currentTerm), [currentBalance, currentRate, currentTerm]);
    const newMonthly = useMemo(() => calculatePayment(currentBalance, newRate, newTerm), [currentBalance, newRate, newTerm]);

    const oldTotal = oldMonthly * currentTerm;
    const newTotal = newMonthly * newTerm;

    const monthlySavings = oldMonthly - newMonthly;
    const totalSavings = oldTotal - newTotal;

    const handleDownload = async () => {
        toast({ title: "Генерация PDF", description: "Пожалуйста, подождите..." });
        const success = await exportToPDF("refinancing-report-template", `рефинансирование_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
        if (success) {
            toast({ title: "Успех!", description: "PDF-отчет успешно сформирован." });
        } else {
            toast({ title: "Ошибка", description: "Не удалось создать PDF-отчет.", variant: "destructive" });
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const handleLoadFromHistory = (item: any) => {
        if (item.inputs.currentBalance) setCurrentBalance(item.inputs.currentBalance);
        if (item.inputs.currentRate) setCurrentRate(item.inputs.currentRate);
        if (item.inputs.currentTerm) setCurrentTerm(item.inputs.currentTerm);
        if (item.inputs.newRate) setNewRate(item.inputs.newRate);
        if (item.inputs.newTerm) setNewTerm(item.inputs.newTerm);
    };

    useEffect(() => {
        if (currentBalance > 0 && totalSavings !== 0) {
            addCalculation(
                'refinancing',
                'Калькулятор рефинансирования',
                { currentBalance, currentRate, currentTerm, newRate, newTerm },
                {
                    'Старый платеж': formatCurrency(oldMonthly),
                    'Новый платеж': formatCurrency(newMonthly),
                    'Экономия': formatCurrency(totalSavings)
                }
            );
        }
    }, [currentBalance, currentRate, currentTerm, newRate, newTerm, oldMonthly, newMonthly, totalSavings]);

    const exportData = [{
        'Остаток долга': formatCurrency(currentBalance),
        'Старая ставка': `${currentRate}%`,
        'Новая ставка': `${newRate}%`,
        'Старый платеж': formatCurrency(oldMonthly),
        'Новый платеж': formatCurrency(newMonthly),
        'Экономия в месяц': formatCurrency(oldMonthly - newMonthly),
        'Общая экономия': formatCurrency(totalSavings)
    }];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Калькулятор рефинансирования</h2>
                <div className="flex gap-2">
                    <CalculatorHistory
                        calculatorType="refinancing"
                        onLoadCalculation={handleLoadFromHistory}
                    />
                    <CalculatorActions
                        calculatorId="refinancing"
                        calculatorName="Калькулятор рефинансирования"
                        data={exportData}
                        printElementId="refinancing-results"
                        shareParams={{ currentBalance, currentRate, currentTerm, newRate, newTerm }}
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Current Loan */}
                    <div className="space-y-4 p-4 border rounded-xl bg-card/50">
                        <h3 className="font-semibold text-muted-foreground mb-4">Текущий кредит</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Остаток долга</label>
                                <input
                                    type="number"
                                    value={currentBalance}
                                    onChange={(e) => setCurrentBalance(Number(e.target.value))}
                                    className="calc-input w-full h-10"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Ставка (%)</label>
                                    <input
                                        type="number"
                                        value={currentRate}
                                        onChange={(e) => setCurrentRate(Number(e.target.value))}
                                        className="calc-input w-full h-10"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Осталось (мес)</label>
                                    <input
                                        type="number"
                                        value={currentTerm}
                                        onChange={(e) => setCurrentTerm(Number(e.target.value))}
                                        className="calc-input w-full h-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* New Loan */}
                    <div className="space-y-4 p-4 border rounded-xl bg-card shadow-sm border-primary/20">
                        <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Новые условия
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Новая ставка (%)</label>
                                <input
                                    type="number"
                                    value={newRate}
                                    onChange={(e) => setNewRate(Number(e.target.value))}
                                    className="calc-input w-full h-10"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Срок (мес)</label>
                                <input
                                    type="number"
                                    value={newTerm}
                                    onChange={(e) => setNewTerm(Number(e.target.value))}
                                    className="calc-input w-full h-10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <p>
                            Рефинансирование выгодно, если новая ставка ниже текущей минимум на 1.5-2%.
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div id="refinancing-results" className="lg:col-span-2">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            Ваша выгода
                        </h3>

                        {/* Total Savings */}
                        <div className="mb-6">
                            <div className="text-sm text-muted-foreground mb-1">
                                Экономия на переплате
                            </div>
                            <div className={`calc-result animate-count-up ${totalSavings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {formatCurrency(totalSavings)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                                за весь срок
                            </div>
                        </div>

                        {/* Monthly Diff */}
                        <div className="p-4 bg-muted/50 rounded-lg mb-6 flex items-center justify-between">
                            <div className="text-sm">
                                <div className="text-muted-foreground">Платеж</div>
                                <div className="font-medium line-through text-muted-foreground text-xs">{formatCurrency(oldMonthly)}</div>
                                <div className="font-bold">{formatCurrency(newMonthly)}</div>
                            </div>
                            <div className={`text-sm font-semibold flex items-center gap-1 ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {monthlySavings >= 0 ? '-' : '+'}{formatCurrency(Math.abs(monthlySavings))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <Button variant="hero" className="w-full gap-2" onClick={handleDownload}>
                                <Download className="w-5 h-5" />
                                Скачать PDF
                            </Button>
                            <Button variant="outline" className="w-full gap-2">
                                <Share2 className="w-5 h-5" />
                                Поделиться расчетом
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden PDF Template */}
            <div className="fixed -left-[9999px] top-0">
                <div id="refinancing-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
                    <div className="flex justify-between items-start mb-12 border-b-2 border-primary/20 pb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Рефинансирование кредита</h1>
                            <p className="text-slate-600">Расчет выгоды • Калькулятор Считай.RU</p>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                            <p>Дата: {new Date().toLocaleDateString('ru-RU')}</p>
                            <p>schitay.ru</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Текущий кредит</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Остаток долга:</span>
                                    <span className="font-semibold">{formatCurrency(currentBalance)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Процентная ставка:</span>
                                    <span className="font-semibold">{currentRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Осталось месяцев:</span>
                                    <span className="font-semibold">{currentTerm}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Ежемесячный платеж:</span>
                                    <span className="font-semibold">{formatCurrency(oldMonthly)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Новые условия</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Сумма кредита:</span>
                                    <span className="font-semibold">{formatCurrency(currentBalance)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Новая ставка:</span>
                                    <span className="font-semibold text-green-600">{newRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Срок кредита:</span>
                                    <span className="font-semibold">{newTerm} мес</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Новый платеж:</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(newMonthly)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg mb-8">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Выгода от рефинансирования</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center">
                                <p className="text-sm text-slate-600 mb-1">Экономия в месяц</p>
                                <p className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {monthlySavings >= 0 ? '+' : ''}{formatCurrency(monthlySavings)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-slate-600 mb-1">Общая экономия</p>
                                <p className={`text-2xl font-bold ${totalSavings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {totalSavings >= 0 ? '+' : ''}{formatCurrency(totalSavings)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-200">
                        <h3 className="font-bold text-lg mb-3 text-blue-800">Рекомендации</h3>
                        <div className="text-sm text-blue-700 space-y-2">
                            <p>• Рефинансирование выгодно при снижении ставки минимум на 1.5-2%</p>
                            <p>• Учитывайте комиссии и расходы на оформление нового кредита</p>
                            <p>• Сравните предложения нескольких банков</p>
                            <p>• Обратите внимание на дополнительные условия и требования</p>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400 border-t pt-4">
                        <p>Расчет является предварительным. Окончательные условия уточняйте в банке.</p>
                        <p className="mt-2">Сформировано на schitay.ru • Дата: {new Date().toLocaleString('ru-RU')}</p>
                    </div>

                    {/* PSB Card Widget */}
                    <div className="mt-8 animate-fade-in relative z-0">
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

export default RefinancingCalculator;
