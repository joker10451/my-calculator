import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Share2, Info, Fuel, MapPin, Wallet, Download } from "lucide-react";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";

const FuelCalculator = () => {
    const { formatCurrency, showToast } = useCalculatorCommon('fuel', 'Калькулятор топлива');
    const [distance, setDistance] = useState(100);
    const [consumption, setConsumption] = useState(8); // L/100km
    const [price, setPrice] = useState(55); // RUB/L

    const requiredFuel = useMemo(() => (distance / 100) * consumption, [distance, consumption]);
    const tripCost = useMemo(() => requiredFuel * price, [requiredFuel, price]);

    const handleDownload = async () => {
        showToast("Генерация PDF", "Пожалуйста, подождите...");
        const success = await exportToPDF("fuel-report-template", `расчет_топлива_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
        if (success) {
            showToast("Успех!", "PDF-отчет успешно сформирован.");
        } else {
            showToast("Ошибка", "Не удалось создать PDF-отчет.", "destructive");
        }
    };

    const formatNumber = (value: number, decimals = 1) => {
        return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: decimals }).format(value);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Distance */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Расстояние (км)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={distance}
                                    onChange={(e) => setDistance(Number(e.target.value))}
                                    className="text-right text-lg font-semibold bg-transparent border-none focus:outline-none w-32"
                                />
                            </div>
                        </div>
                        <Slider
                            value={[distance]}
                            onValueChange={(v) => setDistance(v[0])}
                            min={1}
                            max={5000}
                            step={10}
                            className="py-4"
                        />
                    </div>

                    {/* Consumption */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Расход (л/100км)</label>
                            <span className="text-lg font-semibold">{formatNumber(consumption)} л</span>
                        </div>
                        <Slider
                            value={[consumption]}
                            onValueChange={(v) => setConsumption(v[0])}
                            min={2}
                            max={30}
                            step={0.1}
                            className="py-4"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>2 л</span>
                            <span>30 л</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Цена топлива (₽/л)</label>
                            <span className="text-lg font-semibold">{formatCurrency(price)}</span>
                        </div>
                        <Slider
                            value={[price]}
                            onValueChange={(v) => setPrice(v[0])}
                            min={20}
                            max={100}
                            step={0.5}
                            className="py-4"
                        />
                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <p>
                            Расчет примерный и зависит от стиля вождения, пробок и погодных условий.
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-primary" />
                            Стоимость поездки
                        </h3>

                        {/* Total Cost */}
                        <div className="mb-6">
                            <div className="text-sm text-muted-foreground mb-1">
                                Итого
                            </div>
                            <div className="calc-result animate-count-up">
                                {formatCurrency(tripCost)}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 py-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Fuel className="w-4 h-4" />
                                    Потребуется топлива
                                </span>
                                <span className="font-semibold">{formatNumber(requiredFuel)} л</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Стоимость 1 км
                                </span>
                                <span className="font-semibold text-muted-foreground">
                                    {formatCurrency(tripCost / distance)}
                                </span>
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
                <div id="fuel-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
                    <div className="flex justify-between items-start mb-12 border-b-2 border-primary/20 pb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Расчет топлива</h1>
                            <p className="text-slate-600">Стоимость поездки • Калькулятор Считай.RU</p>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                            <p>Дата: {new Date().toLocaleDateString('ru-RU')}</p>
                            <p>schitay.ru</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Параметры поездки</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Расстояние:</span>
                                    <span className="font-semibold">{distance} км</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Расход топлива:</span>
                                    <span className="font-semibold">{formatNumber(consumption)} л/100км</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Цена топлива:</span>
                                    <span className="font-semibold">{formatCurrency(price)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Результат расчета</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xl">
                                    <span className="text-slate-600">Стоимость поездки:</span>
                                    <span className="font-bold text-primary">{formatCurrency(tripCost)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Потребуется топлива:</span>
                                    <span className="font-semibold">{formatNumber(requiredFuel)} л</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Стоимость 1 км:</span>
                                    <span className="font-semibold">{formatCurrency(tripCost / distance)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg mb-8">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Дополнительная информация</h3>
                        <div className="text-sm text-slate-600 space-y-2">
                            <p>• Расчет является приблизительным и может отличаться от фактических затрат</p>
                            <p>• Реальный расход зависит от стиля вождения, дорожных условий и технического состояния автомобиля</p>
                            <p>• В городских условиях расход может быть выше на 10-30%</p>
                            <p>• При движении по трассе расход обычно ниже заявленного</p>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400 border-t pt-4">
                        <p>Расчет выполнен на основе введенных данных. Фактические затраты могут отличаться.</p>
                        <p className="mt-2">Сформировано на schitay.ru • Дата: {new Date().toLocaleString('ru-RU')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FuelCalculator;
