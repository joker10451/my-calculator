import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Users, Info, Share2, Wallet, UserMinus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";

const AlimonyCalculator = () => {
    const { toast } = useToast();
    const [income, setIncome] = useState(60000);
    const [children, setChildren] = useState(1);
    const [method, setMethod] = useState<"percent" | "fixed">("percent");
    const [fixedAmount, setFixedAmount] = useState(15000);

    const calculateAlimony = () => {
        if (method === "fixed") return fixedAmount;

        let percent = 0.25;
        if (children === 2) percent = 0.3333;
        if (children >= 3) percent = 0.50;

        return Math.round(income * percent);
    };

    const alimony = useMemo(() => calculateAlimony(), [income, children, method, fixedAmount]);
    const netIncome = Math.max(0, income - alimony);

    const handleDownload = async () => {
        toast({ title: "Генерация PDF", description: "Пожалуйста, подождите..." });
        const success = await exportToPDF("alimony-report-template", `расчет_алиментов_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Income */}
                    <div className="space-y-4">
                        <label className="text-base font-medium">Ваш официальный доход (после вычета НДФЛ)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={income}
                                onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                                className="calc-input w-full pl-4 pr-12 h-14 text-xl"
                            />
                            <span className="absolute right-4 top-4 text-muted-foreground">₽</span>
                        </div>
                        <div className="flex gap-2">
                            {[30000, 50000, 100000, 150000].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setIncome(v)}
                                    className="px-3 py-1 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
                                >
                                    {v / 1000}к
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Children and Method */}
                    <div className="space-y-6">
                        <div>
                            <label className="text-base font-medium mb-3 block">Количество детей</label>
                            <div className="flex gap-3">
                                {[1, 2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setChildren(num)}
                                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all ${children === num ? 'border-primary bg-primary/10' : 'border-border'}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-base font-medium mb-3 block">Способ расчета</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setMethod("percent")}
                                    className={`p-4 rounded-xl border-2 transition-all ${method === 'percent' ? 'border-primary bg-primary/10' : 'border-border'}`}
                                >
                                    <div className="font-semibold">От дохода</div>
                                    <div className="text-sm text-muted-foreground">По закону РФ</div>
                                </button>
                                <button
                                    onClick={() => setMethod("fixed")}
                                    className={`p-4 rounded-xl border-2 transition-all ${method === 'fixed' ? 'border-primary bg-primary/10' : 'border-border'}`}
                                >
                                    <div className="font-semibold">Фиксированная</div>
                                    <div className="text-sm text-muted-foreground">Твердая сумма</div>
                                </button>
                            </div>
                        </div>

                        {method === "fixed" && (
                            <div className="space-y-4 animate-fade-in">
                                <label className="text-base font-medium">Фиксированная сумма алиментов</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={fixedAmount}
                                        onChange={(e) => setFixedAmount(Math.max(0, Number(e.target.value)))}
                                        className="calc-input w-full pl-4 pr-12 h-14 text-xl"
                                    />
                                    <span className="absolute right-4 top-4 text-muted-foreground">₽</span>
                                </div>
                                <div className="flex gap-2">
                                    {[10000, 15000, 20000, 25000].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setFixedAmount(v)}
                                            className="px-3 py-1 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
                                        >
                                            {v / 1000}к
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <p>
                            {method === "percent" 
                                ? "По закону РФ: 1 ребенок — 25%, 2 ребенка — 33%, 3 и более — 50% от дохода."
                                : "Фиксированная сумма устанавливается судом или по соглашению сторон."
                            }
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <UserMinus className="w-5 h-5 text-primary" />
                            Сумма алиментов
                        </h3>

                        {/* Total */}
                        <div className="mb-6">
                            <div className="text-sm text-muted-foreground mb-1">
                                Ежемесячная выплата
                            </div>
                            <div className="calc-result animate-count-up text-destructive">
                                {formatCurrency(alimony)}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 py-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Остаток на руках
                                </span>
                                <span className="font-semibold text-green-600">{formatCurrency(netIncome)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {method === "percent" ? "Процент от дохода" : "Способ расчета"}
                                </span>
                                <span className="font-semibold">
                                    {method === "percent" 
                                        ? (children === 1 ? '25%' : children === 2 ? '33.33%' : '50%')
                                        : "Фиксированная сумма"
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <Button variant="outline" className="w-full gap-2" onClick={handleDownload}>
                                <Download className="w-5 h-5" />
                                Скачать PDF
                            </Button>
                            <Button variant="hero" className="w-full gap-2">
                                <Share2 className="w-5 h-5" />
                                Поделиться расчетом
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden PDF Template */}
            <div className="fixed -left-[9999px] top-0">
                <div id="alimony-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
                    <div className="flex justify-between items-start mb-12 border-b-2 border-primary/20 pb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Расчет алиментов</h1>
                            <p className="text-slate-600">Калькулятор Считай.RU</p>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                            <p>Дата: {new Date().toLocaleDateString('ru-RU')}</p>
                            <p>schitay.ru</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Исходные данные</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Доход:</span>
                                    <span className="font-semibold">{formatCurrency(income)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Количество детей:</span>
                                    <span className="font-semibold">{children}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Способ расчета:</span>
                                    <span className="font-semibold">
                                        {method === "percent" ? "От дохода" : "Фиксированная сумма"}
                                    </span>
                                </div>
                                {method === "percent" && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Процент:</span>
                                        <span className="font-semibold">
                                            {children === 1 ? '25%' : children === 2 ? '33.33%' : '50%'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Результат расчета</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xl">
                                    <span className="text-slate-600">Алименты:</span>
                                    <span className="font-bold text-red-600">{formatCurrency(alimony)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Остается на руках:</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(netIncome)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg mb-8">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Правовая информация</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Согласно Семейному кодексу РФ, размер алиментов составляет: на одного ребенка — 1/4 (25%), 
                            на двух детей — 1/3 (33,33%), на трех и более детей — 1/2 (50%) заработка и (или) иного дохода родителей. 
                            Размер может быть изменен судом с учетом материального или семейного положения сторон.
                        </p>
                    </div>

                    <div className="text-center text-xs text-slate-400 border-t pt-4">
                        <p>Расчет носит информационный характер. Для получения точной информации обратитесь к юристу.</p>
                        <p className="mt-2">Сформировано на schitay.ru • Дата: {new Date().toLocaleString('ru-RU')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlimonyCalculator;
