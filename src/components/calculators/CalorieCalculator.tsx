import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Utensils, Info, Share2, Flame, User, Activity, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";

type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
};

const CalorieCalculator = () => {
    const { toast } = useToast();
    const [gender, setGender] = useState<Gender>("female");
    const [age, setAge] = useState(30);
    const [weight, setWeight] = useState(65);
    const [height, setHeight] = useState(170);
    const [activity, setActivity] = useState<ActivityLevel>("sedentary");

    const calculateCalories = () => {
        // Harris-Benedict Equation (Revised)
        let bmr = 0;
        if (gender === "male") {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
        return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
    };

    const calories = useMemo(() => calculateCalories(), [gender, age, weight, height, activity]);

    const handleDownload = async () => {
        toast({ title: "Генерация PDF", description: "Пожалуйста, подождите..." });
        const success = await exportToPDF("calorie-report-template", `расчет_калорий_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
        if (success) {
            toast({ title: "Успех!", description: "PDF-отчет успешно сформирован." });
        } else {
            toast({ title: "Ошибка", description: "Не удалось создать PDF-отчет.", variant: "destructive" });
        }
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

                    {/* Age, Weight, Height */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="font-medium">Возраст</label>
                                <span className="font-semibold">{age}</span>
                            </div>
                            <Slider value={[age]} onValueChange={v => setAge(v[0])} min={14} max={100} step={1} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="font-medium">Вес (кг)</label>
                                <span className="font-semibold">{weight}</span>
                            </div>
                            <Slider value={[weight]} onValueChange={v => setWeight(v[0])} min={30} max={200} step={1} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="font-medium">Рост (см)</label>
                                <span className="font-semibold">{height}</span>
                            </div>
                            <Slider value={[height]} onValueChange={v => setHeight(v[0])} min={100} max={220} step={1} />
                        </div>
                    </div>

                    {/* Activity */}
                    <div className="space-y-4">
                        <label className="text-base font-medium">Активность</label>
                        <select
                            value={activity}
                            onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                            className="calc-input h-12 w-full px-4"
                        >
                            <option value="sedentary">Минимальная (сидячая работа)</option>
                            <option value="light">Лёгкая (тренировки 1-3 раза в неделю)</option>
                            <option value="moderate">Средняя (тренировки 3-5 раз в неделю)</option>
                            <option value="active">Высокая (тренировки 6-7 раз в неделю)</option>
                            <option value="very_active">Экстремальная (тяжелый труд)</option>
                        </select>
                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <p>
                            Расчет по формуле Харриса-Бенедикта для поддержания текущего веса.
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Flame className="w-5 h-5 text-primary" />
                            Ваша норма
                        </h3>

                        {/* Total */}
                        <div className="mb-6 text-center">
                            <div className="text-sm text-muted-foreground mb-2">
                                Калорий в день
                            </div>
                            <div className="calc-result animate-count-up text-4xl text-primary">
                                {calories}
                            </div>
                            <div className="text-sm font-medium mt-2">
                                ккал
                            </div>
                        </div>

                        {/* Goals */}
                        <div className="space-y-4 py-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Похудение</span>
                                <span className="font-semibold text-green-600">{Math.round(calories * 0.85)} ккал</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Набор массы</span>
                                <span className="font-semibold text-red-500">{Math.round(calories * 1.15)} ккал</span>
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
                                Сохранить результат
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden PDF Template */}
            <div className="fixed -left-[9999px] top-0">
                <div id="calorie-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
                    <div className="flex justify-between items-start mb-12 border-b-2 border-primary/20 pb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Расчет калорий</h1>
                            <p className="text-slate-600">Суточная норма калорий • Калькулятор Считай.RU</p>
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
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Активность:</span>
                                    <span className="font-semibold">
                                        {activity === "sedentary" ? "Минимальная" :
                                         activity === "light" ? "Лёгкая" :
                                         activity === "moderate" ? "Средняя" :
                                         activity === "active" ? "Высокая" : "Экстремальная"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Результат расчета</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xl">
                                    <span className="text-slate-600">Норма калорий:</span>
                                    <span className="font-bold text-primary">{calories} ккал</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Для похудения:</span>
                                    <span className="font-semibold text-green-600">{Math.round(calories * 0.85)} ккал</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Для набора массы:</span>
                                    <span className="font-semibold text-red-500">{Math.round(calories * 1.15)} ккал</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg mb-8">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Рекомендации</h3>
                        <div className="text-sm text-slate-600 space-y-2">
                            <p>• Расчет выполнен по формуле Харриса-Бенедикта (пересмотренная версия)</p>
                            <p>• Для похудения создайте дефицит калорий 15-20% от нормы</p>
                            <p>• Для набора мышечной массы увеличьте калорийность на 15-20%</p>
                            <p>• Учитывайте качество пищи, а не только количество калорий</p>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400 border-t pt-4">
                        <p>Расчет является ориентировочным. Для составления индивидуального плана питания обратитесь к диетологу.</p>
                        <p className="mt-2">Сформировано на schitay.ru • Дата: {new Date().toLocaleString('ru-RU')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalorieCalculator;
