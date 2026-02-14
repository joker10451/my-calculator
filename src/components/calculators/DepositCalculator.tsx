import { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Info, Share2, Wallet, Download } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import useLocalStorage from "@/hooks/useLocalStorage";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PSBCardWidget } from "@/components/PSBCardWidget";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { parseShareableLink } from "@/utils/exportUtils";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";

const DepositCalculator = () => {
    const { formatCurrency, saveCalculation, showToast } = useCalculatorCommon('deposit', 'Калькулятор вкладов');
    const [amount, setAmount] = useLocalStorage("calc_deposit_amount", 100000);
    const [rate, setRate] = useLocalStorage("calc_deposit_rate", 15);
    const [term, setTerm] = useLocalStorage("calc_deposit_term", 12); // months
    const [replenishment, setReplenishment] = useLocalStorage("calc_deposit_replenishment", 0);
    const [indexation, setIndexation] = useLocalStorage("calc_deposit_indexation", 0);

    // Загрузка из расшаренной ссылки
    useEffect(() => {
        const params = parseShareableLink();
        if (params) {
            if (params.amount) setAmount(params.amount);
            if (params.rate) setRate(params.rate);
            if (params.term) setTerm(params.term);
            if (params.replenishment) setReplenishment(params.replenishment);
            if (params.indexation) setIndexation(params.indexation);
        }
    }, []);

    const { total, interest, history } = useMemo(() => {
        let currentBalance = amount;
        let totalInterest = 0;
        let currentReplenishment = replenishment;
        const history = [{ month: 0, balance: amount, interest: 0 }];

        // Monthly capitalization
        for (let i = 1; i <= term; i++) {
            // Annual Indexation of replenishment (only on anniversary months)
            if (i % 12 === 0 && indexation > 0) {
                currentReplenishment = currentReplenishment * (1 + indexation / 100);
            }

            const interest = currentBalance * (rate / 100 / 12);
            totalInterest += interest;
            currentBalance += interest + currentReplenishment;
            history.push({
                month: i,
                balance: Math.round(currentBalance),
                interest: Math.round(totalInterest)
            });
        }

        return {
            total: Math.round(currentBalance),
            interest: Math.round(totalInterest),
            history
        };
    }, [amount, rate, term, replenishment, indexation]);
    const initialPlusReplenishment = amount + (replenishment * term);

    // Сохранение в историю
    useEffect(() => {
        if (amount > 0 && total > 0) {
            saveCalculation(
                { amount, rate, term, replenishment, indexation },
                {
                    'Начальная сумма': formatCurrency(amount),
                    'Итоговая сумма': formatCurrency(total),
                    'Доход': formatCurrency(interest)
                }
            );
        }
    }, [amount, rate, term, replenishment, indexation, total, interest, saveCalculation, formatCurrency]);

    const handleDownload = async () => {
        showToast("Генерация PDF", "Пожалуйста, подождите...");
        const success = await exportToPDF("deposit-report-template", `расчет_вклада_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
        if (success) {
            showToast("Успех!", "PDF-отчет успешно сформирован и скачан.");
        } else {
            showToast("Ошибка", "Не удалось создать PDF-отчет.", "destructive");
        }
    };

    const handleShare = async () => {
        const text = [
            'Расчет вклада',
            `Сумма: ${formatCurrency(amount)}`,
            `Ставка: ${rate}%`,
            `Срок: ${term} мес.`,
            `Пополнение: ${formatCurrency(replenishment)}/мес`,
            '---',
            `Итог: ${formatCurrency(total)}`,
            `Доход: +${formatCurrency(interest)}`
        ].join('\n');

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Расчет вклада', text });
                return;
            } catch (err) { console.log(err); }
        }

        try {
            await navigator.clipboard.writeText(text);
            showToast("Скопировано!", "Результат сохранен в буфер обмена.");
        } catch (e) {
            showToast("Ошибка", "Не удалось скопировать", "destructive");
        }
    };

    const handleLoadFromHistory = (item: { inputs: { amount?: number; rate?: number; term?: number; replenishment?: number; indexation?: boolean } }) => {
        if (item.inputs.amount) setAmount(item.inputs.amount);
        if (item.inputs.rate) setRate(item.inputs.rate);
        if (item.inputs.term) setTerm(item.inputs.term);
        if (item.inputs.replenishment !== undefined) setReplenishment(item.inputs.replenishment);
        if (item.inputs.indexation !== undefined) setIndexation(item.inputs.indexation);
    };

    const exportData = history.map(item => ({
        'Месяц': item.month,
        'Баланс': formatCurrency(item.balance),
        'Проценты': formatCurrency(item.interest)
    }));

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Калькулятор вкладов</h2>
                <div className="flex gap-2">
                    <CalculatorHistory
                        calculatorType="deposit"
                        onLoadCalculation={handleLoadFromHistory}
                    />
                    <CalculatorActions
                        calculatorId="deposit"
                        calculatorName="Калькулятор вкладов"
                        data={exportData}
                        printElementId="deposit-results"
                        shareParams={{ amount, rate, term, replenishment, indexation }}
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-3 space-y-8">

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="font-medium">Сумма вклада</label>
                            <div className="font-semibold text-lg">{formatCurrency(amount)}</div>
                        </div>
                        <Slider value={[amount]} onValueChange={v => setAmount(v[0])} min={10000} max={5000000} step={10000} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="font-medium">Ставка (%)</label>
                                <div className="font-semibold text-lg">{rate}%</div>
                            </div>
                            <Slider value={[rate]} onValueChange={v => setRate(v[0])} min={1} max={30} step={0.5} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="font-medium">Срок (мес)</label>
                                <div className="font-semibold text-lg">{term}</div>
                            </div>
                            <Slider value={[term]} onValueChange={v => setTerm(v[0])} min={3} max={60} step={1} />
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="font-medium text-sm">Ежемес. пополнение</label>
                                <div className="font-semibold">{formatCurrency(replenishment)}</div>
                            </div>
                            <Slider value={[replenishment]} onValueChange={v => setReplenishment(v[0])} min={0} max={100000} step={1000} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="font-medium text-sm underline decoration-dotted cursor-help" title="Ежегодное увеличение суммы пополнения">
                                    Индексация (%)
                                </label>
                                <div className="font-semibold">{indexation}%</div>
                            </div>
                            <Slider value={[indexation]} onValueChange={v => setIndexation(v[0])} min={0} max={20} step={1} />
                        </div>
                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <div className="space-y-1">
                            <p>Капитализация процентов: <strong>Ежемесячно</strong>.</p>
                            {indexation > 0 && <p>Индексация: Сумма пополнения растет на <strong>{indexation}%</strong> каждый год.</p>}
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div id="deposit-results" className="lg:col-span-2">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-primary" />
                            Итог вклада
                        </h3>

                        {/* Total */}
                        <div className="mb-6">
                            <div className="text-sm text-muted-foreground mb-1">
                                Сумма к концу срока
                            </div>
                            <div className="calc-result animate-count-up text-3xl md:text-4xl text-green-600">
                                {formatCurrency(total)}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 py-4 border-t border-border">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Начислено процентов
                                </span>
                                <span className="font-semibold text-green-600">+{formatCurrency(interest)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Вложено средств
                                </span>
                                <span className="font-semibold">{formatCurrency(initialPlusReplenishment)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <Button variant="hero" className="w-full gap-2" onClick={handleDownload}>
                                <Download className="w-5 h-5" />
                                Скачать PDF
                            </Button>
                            <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
                                <Share2 className="w-5 h-5" />
                                Поделиться
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visualization */}
            <div className="mt-12">
                <div className="glass-card p-6">
                    <h4 className="font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        График роста накоплений
                    </h4>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    labelFormatter={(label) => `Месяц: ${label}`}
                                />
                                <Area
                                    name="Баланс"
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorBalance)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Hidden PDF Template */}
            <div className="fixed -left-[9999px] top-0">
                <div id="deposit-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
                    <div className="flex justify-between items-start mb-12 border-b-2 border-primary/20 pb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-primary mb-2">Считай.RU</h1>
                            <p className="text-slate-500 uppercase tracking-widest text-sm font-semibold">Официальный финансовый расчет</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg">ОТЧЕТ №{Math.floor(1000 + Math.random() * 9000)}</p>
                            <p className="text-slate-500">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Calculator className="w-6 h-6 text-primary" />
                            Результаты расчета банковского вклада
                        </h2>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-slate-500 text-sm mb-1 uppercase font-semibold">Сумма к концу срока</p>
                                <p className="text-4xl font-black text-primary">{formatCurrency(total)}</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-slate-500 text-sm mb-1 uppercase font-semibold">Начислено процентов</p>
                                <p className="text-4xl font-black text-green-600">+{formatCurrency(interest)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-12">
                        <div className="flex justify-between py-3 border-b border-slate-100">
                            <span className="text-slate-600 font-medium">Первоначальная сумма</span>
                            <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-100">
                            <span className="text-slate-600 font-medium">Процентная ставка</span>
                            <span className="font-bold text-slate-900">{rate}% годовых</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-100">
                            <span className="text-slate-600 font-medium">Срок вклада</span>
                            <span className="font-bold text-slate-900">{term} месяцев</span>
                        </div>
                        {replenishment > 0 && (
                            <div className="flex justify-between py-3 border-b border-slate-100">
                                <span className="text-slate-600 font-medium">Ежемесячное пополнение</span>
                                <span className="font-bold text-slate-900">{formatCurrency(replenishment)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-3 border-b border-slate-100">
                            <span className="text-slate-600 font-medium">Всего вложено (с пополнениями)</span>
                            <span className="font-bold text-slate-900">{formatCurrency(initialPlusReplenishment)}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-200 bg-slate-50 px-4 rounded-lg mt-4">
                            <span className="text-slate-800 font-bold uppercase">Итоговая сумма накоплений</span>
                            <span className="font-extrabold text-primary text-xl">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                        <p className="text-slate-400 text-xs text-center italic">
                            Расчет произведен с учетом ежемесячной капитализации процентов. Schitay.ru не является финансовым учреждением.
                        </p>
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
        </div >
    );
};

export default DepositCalculator;
