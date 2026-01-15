import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Download, Share2, Info, User, Scale, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";

const BMICalculator = () => {
    const { toast } = useToast();
    const [height, setHeight] = useState(175); // cm
    const [weight, setWeight] = useState(75); // kg
    const [age, setAge] = useState(30);
    const [gender, setGender] = useState<"male" | "female">("male");

    const bmi = useMemo(() => {
        const heightInMeters = height / 100;
        return weight / (heightInMeters * heightInMeters);
    }, [height, weight]);

    const getBMIStatus = (value: number) => {
        if (value < 18.5) return { label: "Дефицит массы", color: "text-blue-500", bg: "bg-blue-500" };
        if (value < 25) return { label: "Норма", color: "text-green-500", bg: "bg-green-500" };
        if (value < 30) return { label: "Избыточный вес", color: "text-yellow-500", bg: "bg-yellow-500" };
        return { label: "Ожирение", color: "text-red-500", bg: "bg-red-500" };
    };

    const status = getBMIStatus(bmi);

    const handleDownload = async () => {
        toast({ title: "Генерация PDF", description: "Пожалуйста, подождите..." });
        const success = await exportToPDF("bmi-report-template", `расчет_ИМТ_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
        if (success) {
            toast({ title: "Успех!", description: "PDF-отчет успешно сформирован." });
        } else {
            toast({ title: "Ошибка", description: "Не удалось создать PDF-отчет.", variant: "destructive" });
        }
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Gender */}
                    <div className="space-y-4">
                        <label className="text-base font-medium">Пол</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setGender("male")}
                                className={`p-4 rounded-xl border-2 transition-all ${gender === 'male' ? 'border-primary bg-primary/10' : 'border-border'}`}
                            >
                                Мужской
                            </button>
                            <button
                                onClick={() => setGender("female")}
                                className={`p-4 rounded-xl border-2 transition-all ${gender === 'female' ? 'border-primary bg-primary/10' : 'border-border'}`}
                            >
                                Женский
                            </button>
                        </div>
                    </div>

                    {/* Height */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Рост (см)</label>
                            <span className="text-lg font-semibold">{height} см</span>
                        </div>
                        <Slider
                            value={[height]}
                            onValueChange={(v) => setHeight(v[0])}
                            min={100}
                            max={220}
                            step={1}
                            className="py-4"
                        />
                    </div>

                    {/* Weight */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Вес (кг)</label>
                            <span className="text-lg font-semibold">{weight} кг</span>
                        </div>
                        <Slider
                            value={[weight]}
                            onValueChange={(v) => setWeight(v[0])}
                            min={30}
                            max={200}
                            step={0.5}
                            className="py-4"
                        />
                    </div>

                    {/* Age */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-medium">Возраст</label>
                            <span className="text-lg font-semibold">{age} лет</span>
                        </div>
                        <Slider
                            value={[age]}
                            onValueChange={(v) => setAge(v[0])}
                            min={14}
                            max={100}
                            step={1}
                            className="py-4"
                        />
                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <p>
                            Индекс массы тела (ИМТ) — величина, позволяющая оценить степень соответствия массы человека и его роста.
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-primary" />
                            Ваш результат
                        </h3>

                        {/* BMI Value */}
                        <div className="mb-6 text-center">
                            <div className="text-sm text-muted-foreground mb-2">
                                Индекс массы тела
                            </div>
                            <div className={`calc-result animate-count-up ${status.color}`}>
                                {formatNumber(bmi)}
                            </div>
                            <div className={`mt-2 font-semibold ${status.color}`}>
                                {status.label}
                            </div>
                        </div>

                        {/* Visual Bar */}
                        <div className="mb-8">
                            <div className="h-4 bg-muted rounded-full relative overflow-hidden">
                                <div
                                    className={`absolute top-0 bottom-0 w-2 h-full bg-foreground rounded-full transition-all duration-500`}
                                    style={{ left: `${Math.min(Math.max((bmi - 14) * 2.5, 0), 98)}%` }} // Approximate mapping
                                />
                                <div className="absolute inset-0 flex">
                                    <div className="flex-1 bg-blue-500/20 border-r border-white/20"></div>
                                    <div className="flex-1 bg-green-500/20 border-r border-white/20"></div>
                                    <div className="flex-1 bg-yellow-500/20 border-r border-white/20"></div>
                                    <div className="flex-1 bg-red-500/20"></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                                <span>16</span>
                                <span>18.5</span>
                                <span>25</span>
                                <span>30</span>
                                <span>40</span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 py-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Ruler className="w-4 h-4" />
                                    Рост
                                </span>
                                <span className="font-semibold">{height} см</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Scale className="w-4 h-4" />
                                    Вес
                                </span>
                                <span className="font-semibold text-destructive">
                                    {weight} кг
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
                                Поделиться результатом
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden PDF Template */}
            <div className="fixed -left-[9999px] top-0">
                <div id="bmi-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
                    <div className="flex justify-between items-start mb-12 border-b-2 border-primary/20 pb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Расчет ИМТ</h1>
                            <p className="text-slate-600">Индекс массы тела • Калькулятор Считай.RU</p>
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
                                    <span className="text-slate-600">Пол:</span>
                                    <span className="font-semibold">{gender === "male" ? "Мужской" : "Женский"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Возраст:</span>
                                    <span className="font-semibold">{age} лет</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Рост:</span>
                                    <span className="font-semibold">{height} см</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Вес:</span>
                                    <span className="font-semibold">{weight} кг</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Результат расчета</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xl">
                                    <span className="text-slate-600">ИМТ:</span>
                                    <span className="font-bold text-primary">{formatNumber(bmi)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Статус:</span>
                                    <span className={`font-semibold ${status.color.replace('text-', 'text-')}`}>
                                        {status.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg mb-8">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Интерпретация результатов</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold text-blue-600">Дефицит массы (&lt; 18.5)</p>
                                <p className="text-slate-600">Недостаточный вес</p>
                            </div>
                            <div>
                                <p className="font-semibold text-green-600">Норма (18.5 - 24.9)</p>
                                <p className="text-slate-600">Нормальный вес</p>
                            </div>
                            <div>
                                <p className="font-semibold text-yellow-600">Избыточный вес (25.0 - 29.9)</p>
                                <p className="text-slate-600">Предожирение</p>
                            </div>
                            <div>
                                <p className="font-semibold text-red-600">Ожирение (≥ 30.0)</p>
                                <p className="text-slate-600">Требует внимания</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400 border-t pt-4">
                        <p>ИМТ является ориентировочным показателем. Для точной оценки обратитесь к врачу.</p>
                        <p className="mt-2">Сформировано на schitay.ru • Дата: {new Date().toLocaleString('ru-RU')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BMICalculator;
