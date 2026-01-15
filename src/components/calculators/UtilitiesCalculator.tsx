import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Share2, Info, Droplets, Zap, Flame, Home } from "lucide-react";

const UtilitiesCalculator = () => {
    // Electricity
    const [elecRate, setElecRate] = useState(5.50);
    const [elecPrev, setElecBrev] = useState(1000);
    const [elecCurr, setElecCurr] = useState(1150);
    const [elecByNorm, setElecByNorm] = useState(false);
    const [residents, setResidents] = useState(2);

    // Water
    const [waterRate, setWaterRate] = useState(45.00);
    const [waterPrev, setWaterPrev] = useState(100);
    const [waterCurr, setWaterCurr] = useState(105);
    const [waterByNorm, setWaterByNorm] = useState(false);

    // Norms (average for Russia)
    const ELEC_NORM_PER_PERSON = 50; // kWh per month
    const WATER_NORM_PER_PERSON = 6.935; // m³ per month

    const calculateCost = (curr: number, prev: number, rate: number) => {
        const diff = Math.max(0, curr - prev);
        return diff * rate;
    };

    const calculateElecCost = () => {
        if (elecByNorm) {
            return residents * ELEC_NORM_PER_PERSON * elecRate;
        }
        return calculateCost(elecCurr, elecPrev, elecRate);
    };

    const calculateWaterCost = () => {
        if (waterByNorm) {
            return residents * WATER_NORM_PER_PERSON * waterRate;
        }
        return calculateCost(waterCurr, waterPrev, waterRate);
    };

    const elecCost = useMemo(() => calculateElecCost(), [elecCurr, elecPrev, elecRate, elecByNorm, residents]);
    const waterCost = useMemo(() => calculateWaterCost(), [waterCurr, waterPrev, waterRate, waterByNorm, residents]);
    const totalCost = useMemo(() => elecCost + waterCost, [elecCost, waterCost]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Residents Count */}
                    <div className="space-y-4">
                        <label className="text-base font-medium">Количество проживающих</label>
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setResidents(num)}
                                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all ${residents === num ? 'border-primary bg-primary/10' : 'border-border'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Electricity */}
                    <div className="space-y-4 p-4 border rounded-xl bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                Электроэнергия
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="elecByNorm"
                                    checked={elecByNorm}
                                    onChange={(e) => setElecByNorm(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="elecByNorm" className="text-sm cursor-pointer">
                                    По нормативу
                                </label>
                            </div>
                        </div>
                        
                        {elecByNorm ? (
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Расчет по нормативу: {ELEC_NORM_PER_PERSON} кВт·ч на человека
                                </p>
                                <p className="font-semibold">
                                    {residents} × {ELEC_NORM_PER_PERSON} = {residents * ELEC_NORM_PER_PERSON} кВт·ч
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Тариф (руб/кВт)</label>
                                    <input
                                        type="number"
                                        value={elecRate}
                                        onChange={(e) => setElecRate(Number(e.target.value))}
                                        className="calc-input w-full h-10 px-3 text-base"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Предыдущие</label>
                                    <input
                                        type="number"
                                        value={elecPrev}
                                        onChange={(e) => setElecBrev(Number(e.target.value))}
                                        className="calc-input w-full h-10 px-3 text-base"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Текущие</label>
                                    <input
                                        type="number"
                                        value={elecCurr}
                                        onChange={(e) => setElecCurr(Number(e.target.value))}
                                        className="calc-input w-full h-10 px-3 text-base"
                                    />
                                </div>
                            </div>
                        )}
                        
                        {!elecByNorm && (
                            <div className="text-right text-sm font-medium pt-2 text-muted-foreground">
                                Расход: {Math.max(0, elecCurr - elecPrev)} кВт • {formatCurrency(elecCost)}
                            </div>
                        )}
                        
                        {elecByNorm && (
                            <div className="text-right text-sm font-medium pt-2 text-muted-foreground">
                                Тариф: {elecRate} руб/кВт • {formatCurrency(elecCost)}
                            </div>
                        )}
                    </div>

                    {/* Water */}
                    <div className="space-y-4 p-4 border rounded-xl bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Droplets className="w-5 h-5 text-blue-500" />
                                Водоснабжение
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="waterByNorm"
                                    checked={waterByNorm}
                                    onChange={(e) => setWaterByNorm(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="waterByNorm" className="text-sm cursor-pointer">
                                    По нормативу
                                </label>
                            </div>
                        </div>
                        
                        {waterByNorm ? (
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Расчет по нормативу: {WATER_NORM_PER_PERSON} м³ на человека
                                </p>
                                <p className="font-semibold">
                                    {residents} × {WATER_NORM_PER_PERSON} = {(residents * WATER_NORM_PER_PERSON).toFixed(2)} м³
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Тариф (руб/м³)</label>
                                    <input
                                        type="number"
                                        value={waterRate}
                                        onChange={(e) => setWaterRate(Number(e.target.value))}
                                        className="calc-input w-full h-10 px-3 text-base"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Предыдущие</label>
                                    <input
                                        type="number"
                                        value={waterPrev}
                                        onChange={(e) => setWaterPrev(Number(e.target.value))}
                                        className="calc-input w-full h-10 px-3 text-base"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Текущие</label>
                                    <input
                                        type="number"
                                        value={waterCurr}
                                        onChange={(e) => setWaterCurr(Number(e.target.value))}
                                        className="calc-input w-full h-10 px-3 text-base"
                                    />
                                </div>
                            </div>
                        )}
                        
                        {!waterByNorm && (
                            <div className="text-right text-sm font-medium pt-2 text-muted-foreground">
                                Расход: {Math.max(0, waterCurr - waterPrev)} м³ • {formatCurrency(waterCost)}
                            </div>
                        )}
                        
                        {waterByNorm && (
                            <div className="text-right text-sm font-medium pt-2 text-muted-foreground">
                                Тариф: {waterRate} руб/м³ • {formatCurrency(waterCost)}
                            </div>
                        )}
                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <p>
                            Введите показания счетчиков или включите расчет по нормативу. Нормативы могут отличаться в зависимости от региона.
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6 sticky top-24">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-primary" />
                            К оплате
                        </h3>

                        {/* Total Cost */}
                        <div className="mb-6">
                            <div className="text-sm text-muted-foreground mb-1">
                                Итого за месяц
                            </div>
                            <div className="calc-result animate-count-up">
                                {formatCurrency(totalCost)}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 py-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Свет
                                </span>
                                <span className="font-semibold">{formatCurrency(elecCost)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Droplets className="w-4 h-4" />
                                    Вода
                                </span>
                                <span className="font-semibold">
                                    {formatCurrency(waterCost)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                                <span>Отопление, газ и прочее</span>
                                <span>Не включено</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <Button variant="hero" className="w-full gap-2">
                                <Share2 className="w-5 h-5" />
                                Отправить показания
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UtilitiesCalculator;
