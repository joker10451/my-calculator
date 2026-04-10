import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Info, Droplets, Download } from "lucide-react";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";

type ActivityLevel = "low" | "medium" | "high";

const WaterCalculator = () => {
    const { showToast } = useCalculatorCommon('water', 'Калькулятор воды');
    const [weight, setWeight] = useState(70);
    const [activity, setActivity] = useState<ActivityLevel>("medium");

    const waterNorm = useMemo(() => {
        let base = weight * 30; // 30ml per kg

        // Activity adjustments
        if (activity === "medium") base += 500;
        if (activity === "high") base += 1000;

        return base;
    }, [weight, activity]);

    const handleDownload = async () => {
        showToast("Генерация PDF", "Пожалуйста, подождите...");
        const success = await exportToPDF("water-report-template", `расчет_воды_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
        if (success) {
            showToast("Успех!", "PDF-отчет успешно сформирован.");
        } else {
            showToast("Ошибка", "Не удалось создать PDF-отчет.", "destructive");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Weight */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Ваш вес (кг)</label>
                            <span className="text-lg font-semibold">{weight} кг</span>
                        </div>
                        <Slider
                            value={[weight]}
                            onValueChange={(v) => setWeight(v[0])}
                            min={30}
                            max={150}
                            step={1}
                            className="py-4"
                        />
                    </div>

                    {/* Activity */}
                    <div className="space-y-4">
                        <label className="text-base font-medium">Активность</label>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setActivity("low")}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${activity === 'low' ? 'border-primary bg-primary/10' : 'border-border'}`}
                            >
                                <span className="text-2xl">🛋️</span>
                                <span className="text-sm font-medium">Низкая</span>
                            </button>
                            <button
                                onClick={() => setActivity("medium")}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${activity === 'medium' ? 'border-primary bg-primary/10' : 'border-border'}`}
                            >
                                <span className="text-2xl">🚶</span>
                                <span className="text-sm font-medium">Средняя</span>
                            </button>
                            <button
                                onClick={() => setActivity("high")}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${activity === 'high' ? 'border-primary bg-primary/10' : 'border-border'}`}
                            >
                                <span className="text-2xl">🏃</span>
                                <span className="text-sm font-medium">Высокая</span>
                            </button>
                        </div>
                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <p>
                            ВОЗ рекомендует пить ~30 мл воды на 1 кг веса. При нагрузках потребность возрастает.
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-blue-500" />
                            Дневная норма
                        </h3>

                        {/* Result */}
                        <div className="mb-6 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-5xl font-bold text-blue-600 animate-count-up">
                                    {(waterNorm / 1000).toFixed(1)}
                                </span>
                                <span className="text-xl font-medium text-muted-foreground self-end mb-2">л</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                ~ {Math.round(waterNorm / 250)} стаканов воды
                            </div>
                        </div>

                        {/* Visual */}
                        <div className="flex justify-center gap-1 mb-8">
                            {Array.from({ length: Math.min(Math.round(waterNorm / 250), 12) }).map((_, i) => (
                                <div key={i} className="w-4 h-8 bg-blue-400/50 rounded-b-md animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <Button variant="hero" className="w-full gap-2" onClick={handleDownload}>
                                <Download className="w-5 h-5" />
                                Скачать PDF
                            </Button>
                            <Button variant="outline" className="w-full gap-2">
                                <Share2 className="w-5 h-5" />
                                Напомнить пить воду
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden PDF Template */}
            <div className="fixed -left-[9999px] top-0">
                <div id="water-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
                    <div className="flex justify-between items-start mb-12 border-b-2 border-primary/20 pb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Расчет нормы воды</h1>
                            <p className="text-slate-600">Дневная норма потребления • Калькулятор Считай.RU</p>
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
                                    <span className="text-slate-600">Вес:</span>
                                    <span className="font-semibold">{weight} кг</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Активность:</span>
                                    <span className="font-semibold">
                                        {activity === "low" ? "Низкая" :
                                         activity === "medium" ? "Средняя" : "Высокая"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Результат расчета</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xl">
                                    <span className="text-slate-600">Дневная норма:</span>
                                    <span className="font-bold text-blue-600">{(waterNorm / 1000).toFixed(1)} л</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">В стаканах:</span>
                                    <span className="font-semibold">~ {Math.round(waterNorm / 250)} стаканов</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">В миллилитрах:</span>
                                    <span className="font-semibold">{waterNorm} мл</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg mb-8">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Рекомендации ВОЗ</h3>
                        <div className="text-sm text-slate-600 space-y-2">
                            <p>• Базовая норма: 30 мл воды на 1 кг веса тела</p>
                            <p>• При средней активности добавляйте +500 мл</p>
                            <p>• При высокой активности добавляйте +1000 мл</p>
                            <p>• В жаркую погоду увеличивайте потребление на 15-20%</p>
                            <p>• Пейте небольшими порциями в течение дня</p>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400 border-t pt-4">
                        <p>Норма рассчитана по рекомендациям ВОЗ. Индивидуальные потребности могут отличаться.</p>
                        <p className="mt-2">Сформировано на schitay.ru • Дата: {new Date().toLocaleString('ru-RU')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterCalculator;
