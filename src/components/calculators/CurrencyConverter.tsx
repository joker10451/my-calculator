import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRightLeft, Info, Share2, Coins, RefreshCw, Download } from "lucide-react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { exportToPDF } from "@/lib/pdfService";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";

type Currency = "RUB" | "USD" | "EUR" | "CNY" | "KZT" | "BYN";

// Базовые курсы (Данные на начало 2026 года)
const DEFAULT_RATES: Record<Currency, number> = {
    RUB: 1,
    USD: 92.50,
    EUR: 101.20,
    CNY: 12.85,
    KZT: 0.205,
    BYN: 28.80,
};

const LABELS: Record<Currency, string> = {
    RUB: "🇷🇺 Рубль (RUB)",
    USD: "🇺🇸 Доллар (USD)",
    EUR: "🇪🇺 Евро (EUR)",
    CNY: "🇨🇳 Юань (CNY)",
    KZT: "🇰🇿 Тенге (KZT)",
    BYN: "🇧🇾 Бел. рубль (BYN)",
};

const CurrencyConverter = () => {
    const { formatCurrency, showToast } = useCalculatorCommon('currency', 'Конвертер валют');
    const [amount, setAmount] = useLocalStorage<number>("calc_currency_amount", 100);
    const [from, setFrom] = useLocalStorage<Currency>("calc_currency_from", "USD");
    const [to, setTo] = useLocalStorage<Currency>("calc_currency_to", "RUB");
    const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
                const data = await response.json();

                // CBR returns value in RUB. e.g. USD.Value = 92.5
                const newRates: Record<Currency, number> = {
                    RUB: 1,
                    USD: data.Valute.USD.Value,
                    EUR: data.Valute.EUR.Value,
                    CNY: data.Valute.CNY.Value,
                    KZT: data.Valute.KZT.Value / data.Valute.KZT.Nominal, // Nominal is often 100 for KZT
                    BYN: data.Valute.BYN.Value,
                };

                setRates(newRates);
                setLastUpdated(new Date(data.Date).toLocaleDateString());
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch rates:", error);
                setIsLoading(false);
            }
        };

        fetchRates();
    }, []);

    const result = useMemo(() => {
        // Convert to RUB first (base), then to target
        const inRub = amount * rates[from];
        const final = inRub / rates[to];
        return final;
    }, [amount, from, to, rates]);

    const handleSwap = () => {
        setFrom(to);
        setTo(from);
    };

    const formatCurrencyLocal = (val: number, cur: Currency) => {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: cur,
            maximumFractionDigits: 2,
        }).format(val);
    };

    const handleDownload = async () => {
        showToast("Генерация PDF", "Пожалуйста, подождите...");

        const success = await exportToPDF("currency-report-template", `конвертация_${new Date().toISOString().split('T')[0]}`);

        if (success) {
            showToast("Успех!", "PDF-отчет успешно сформирован и скачан.");
        } else {
            showToast("Ошибка", "Не удалось создать PDF-отчет.", "destructive");
        }
    };

    const handleShare = async () => {
        const text = [
            'Конвертация валют',
            `${formatCurrencyLocal(amount, from)} = ${formatCurrencyLocal(result, to)}`,
            `Курс: 1 ${from} ≈ ${(rates[from] / rates[to]).toFixed(4)} ${to}`,
            `(${lastUpdated ? 'Официальный курс ЦБ' : 'Примерный курс'})`
        ].join('\n');

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Конвертация валют', text });
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-3 space-y-8">

                    <div className="bg-card border rounded-2xl p-6 shadow-sm relative space-y-6">

                        {/* From */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex justify-between">
                                <span>У меня есть</span>
                                {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />}
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                                    className="calc-input flex-1 font-bold text-2xl"
                                />
                                <select
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value as Currency)}
                                    className="h-14 px-4 rounded-xl border-2 border-border bg-muted/50 font-medium cursor-pointer hover:bg-muted transition-colors outline-none focus:border-primary"
                                >
                                    {Object.keys(LABELS).map((cur) => (
                                        <option key={cur} value={cur}>{cur}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-sm text-muted-foreground">{LABELS[from]}</div>
                        </div>

                        {/* Swap Button */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <button
                                onClick={handleSwap}
                                aria-label="Поменять валюты местами"
                                className="w-12 h-12 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-lg hover:border-primary hover:text-primary transition-all active:scale-95"
                            >
                                <ArrowRightLeft className="w-5 h-5" />
                            </button>
                        </div>

                        {/* To */}
                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-medium text-muted-foreground">Хочу получить</label>
                            <div className="flex gap-4">
                                <div className="calc-input flex-1 flex items-center bg-muted/20 text-2xl font-bold text-foreground/80 pointer-events-none">
                                    {result.toFixed(2)}
                                </div>
                                <select
                                    value={to}
                                    onChange={(e) => setTo(e.target.value as Currency)}
                                    className="h-14 px-4 rounded-xl border-2 border-border bg-muted/50 font-medium cursor-pointer hover:bg-muted transition-colors outline-none focus:border-primary"
                                >
                                    {Object.keys(LABELS).map((cur) => (
                                        <option key={cur} value={cur}>{cur}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-sm text-muted-foreground">{LABELS[to]}</div>
                        </div>

                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <p>
                            {lastUpdated
                                ? `Используется официальный курс ЦБ РФ на ${lastUpdated}.`
                                : "Используются примерные рыночные курсы (ЦБ недоступен)."}
                            {" "}
                            {lastUpdated?.includes(".12.") && (
                                <span className="opacity-70">
                                    (Курс за декабрь отображается из-за новогодних праздников в РФ, ЦБ обновит данные в ближайшее время).
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6 sticky top-24">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-primary" />
                            Итого
                        </h3>

                        {/* Total */}
                        <div className="mb-6">
                            <div className="text-sm text-muted-foreground mb-1">
                                Результат обмена
                            </div>
                            <div className="calc-result animate-count-up text-3xl md:text-4xl text-green-600 word-break">
                                {formatCurrencyLocal(result, to)}
                            </div>
                        </div>

                        {/* Rate Info */}
                        <div className="space-y-4 py-4 border-t border-border">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Курс обмена</span>
                                <span className="font-semibold">
                                    1 {from} ≈ {(rates[from] / rates[to]).toFixed(4)} {to}
                                </span>
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

            {/* Hidden PDF Template */}
            <div className="fixed -left-[9999px] top-0">
                <div id="currency-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
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
                            <Coins className="w-6 h-6 text-primary" />
                            Результаты конвертации валют ( live )
                        </h2>

                        <div className="grid grid-cols-1 gap-8">
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                                <p className="text-slate-500 text-sm mb-2 uppercase font-semibold">Результат обмена</p>
                                <p className="text-5xl font-black text-primary">
                                    {formatCurrencyLocal(result, to)}
                                </p>
                                <p className="text-slate-400 mt-2 italic text-sm">
                                    из рассчета {formatCurrencyLocal(amount, from)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-12">
                        <div className="flex justify-between py-3 border-b border-slate-100">
                            <span className="text-slate-600 font-medium">Исходная сумма</span>
                            <span className="font-bold text-slate-900">{formatCurrencyLocal(amount, from)}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-100">
                            <span className="text-slate-600 font-medium">Курс конвертации</span>
                            <span className="font-bold text-slate-900">1 {from} ≈ {(rates[from] / rates[to]).toFixed(4)} {to}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-100 italic">
                            <span className="text-slate-600 font-medium">Источник данных</span>
                            <span className="font-bold text-slate-800">{lastUpdated ? "Центральный Банк РФ" : "Рыночные данные (default)"}</span>
                        </div>
                        {lastUpdated && (
                            <div className="flex justify-between py-3 border-b border-slate-100">
                                <span className="text-slate-600 font-medium">Дата обновления курса</span>
                                <span className="font-bold text-slate-900">{lastUpdated}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-3 border-b border-slate-200 bg-slate-50 px-4 rounded-lg mt-4">
                            <span className="text-slate-800 font-bold uppercase">ИТОГО К ПОЛУЧЕНИЮ</span>
                            <span className="font-extrabold text-primary text-xl">{formatCurrencyLocal(result, to)}</span>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                        <p className="text-slate-400 text-xs text-center italic">
                            Курсы валют меняются динамически. Schitay.ru не несет ответственности за убытки, связанные с использованием данных котировок.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CurrencyConverter;
