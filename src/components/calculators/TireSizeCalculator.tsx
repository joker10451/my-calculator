import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Car, Info, Share2, Gauge, Ruler, Scale, Download } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";

interface TireSize {
  width: number;
  profile: number;
  diameter: number;
}

const TireSizeCalculator = () => {
  const { showToast } = useCalculatorCommon('tire-size', 'Калькулятор размера шин');
  const { addItem } = useComparison();
  
  // Текущие шины
  const [currentTire, setCurrentTire] = useState<TireSize>({
    width: 205,
    profile: 55,
    diameter: 16
  });
  
  // Новые шины
  const [newTire, setNewTire] = useState<TireSize>({
    width: 215,
    profile: 50,
    diameter: 17
  });

  // Расчеты для шин
  const calculations = useMemo(() => {
    // Высота боковины = ширина * профиль / 100
    const currentSidewallHeight = (currentTire.width * currentTire.profile) / 100;
    const newSidewallHeight = (newTire.width * newTire.profile) / 100;
    
    // Общий диаметр = диаметр диска + 2 * высота боковины
    const currentOverallDiameter = currentTire.diameter * 25.4 + 2 * currentSidewallHeight;
    const newOverallDiameter = newTire.diameter * 25.4 + 2 * newSidewallHeight;
    
    // Длина окружности = π * диаметр
    const currentCircumference = Math.PI * currentOverallDiameter;
    const newCircumference = Math.PI * newOverallDiameter;
    
    // Разница в диаметре и окружности
    const diameterDifference = newOverallDiameter - currentOverallDiameter;
    const circumferenceDifference = newCircumference - currentCircumference;
    
    // Процентная разница
    const diameterPercentDiff = (diameterDifference / currentOverallDiameter) * 100;
    const circumferencePercentDiff = (circumferenceDifference / currentCircumference) * 100;
    
    // Влияние на спидометр (при скорости 100 км/ч)
    const speedometerError = circumferencePercentDiff;
    const actualSpeedAt100 = 100 + speedometerError;
    
    // Влияние на расход топлива (приблизительно)
    const fuelConsumptionChange = -circumferencePercentDiff; // Больше окружность = меньше оборотов = меньше расход
    
    return {
      current: {
        sidewallHeight: Math.round(currentSidewallHeight),
        overallDiameter: Math.round(currentOverallDiameter),
        circumference: Math.round(currentCircumference)
      },
      new: {
        sidewallHeight: Math.round(newSidewallHeight),
        overallDiameter: Math.round(newOverallDiameter),
        circumference: Math.round(newCircumference)
      },
      differences: {
        diameter: Math.round(diameterDifference),
        circumference: Math.round(circumferenceDifference),
        diameterPercent: Number(diameterPercentDiff.toFixed(2)),
        circumferencePercent: Number(circumferencePercentDiff.toFixed(2))
      },
      effects: {
        speedometerError: Number(speedometerError.toFixed(2)),
        actualSpeedAt100: Number(actualSpeedAt100.toFixed(1)),
        fuelConsumptionChange: Number(fuelConsumptionChange.toFixed(2))
      }
    };
  }, [currentTire, newTire]);

  const formatTireSize = (tire: TireSize) => {
    return `${tire.width}/${tire.profile}R${tire.diameter}`;
  };

  const getRecommendation = () => {
    const diameterDiff = Math.abs(calculations.differences.diameterPercent);
    
    if (diameterDiff <= 1) {
      return { text: "Отличная замена", color: "text-green-600", icon: "✅" };
    } else if (diameterDiff <= 3) {
      return { text: "Допустимая замена", color: "text-yellow-600", icon: "⚠️" };
    } else {
      return { text: "Не рекомендуется", color: "text-red-600", icon: "❌" };
    }
  };

  const handleShare = async () => {
    const text = [
      'Сравнение размеров шин',
      `Текущие: ${formatTireSize(currentTire)}`,
      `Новые: ${formatTireSize(newTire)}`,
      `Разница в диаметре: ${calculations.differences.diameter}мм (${calculations.differences.diameterPercent}%)`,
      `Влияние на спидометр: ${calculations.effects.speedometerError > 0 ? '+' : ''}${calculations.effects.speedometerError}%`
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Калькулятор шин Считай.RU', text });
        return;
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast("Скопировано!", "Расчет сохранен в буфер обмена.");
    } catch (err) {
      showToast("Ошибка", "Не удалось скопировать.", "destructive");
    }
  };

  const handleCompare = () => {
    addItem({
      title: `Шины: ${formatTireSize(currentTire)} → ${formatTireSize(newTire)}`,
      calculatorId: "tire-size",
      data: {
        currentSize: formatTireSize(currentTire),
        newSize: formatTireSize(newTire),
        diameterDifference: calculations.differences.diameter,
        speedometerError: calculations.effects.speedometerError
      },
      params: {
        currentTire,
        newTire
      }
    });
    showToast("Добавлено к сравнению", "Вы можете сравнить этот расчет с другими на странице сравнения.");
  };

  const recommendation = getRecommendation();

  const handleDownloadPDF = async () => {
    showToast("Генерация PDF", "Пожалуйста, подождите...");
    const success = await exportToPDF("tire-report-template", `расчет_шин_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
    if (success) {
      showToast("Успех!", "PDF-отчет успешно сформирован.");
    } else {
      showToast("Ошибка", "Не удалось создать PDF-отчет.", "destructive");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Current Tire */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Car className="w-6 h-6 text-primary" />
              Текущие шины
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-slate-600">Ширина (мм)</label>
                  <span className="font-bold text-lg">{currentTire.width}</span>
                </div>
                <Slider
                  value={[currentTire.width]}
                  onValueChange={v => setCurrentTire({...currentTire, width: v[0]})}
                  min={135}
                  max={335}
                  step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>135</span>
                  <span>335</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-slate-600">Профиль (%)</label>
                  <span className="font-bold text-lg">{currentTire.profile}</span>
                </div>
                <Slider
                  value={[currentTire.profile]}
                  onValueChange={v => setCurrentTire({...currentTire, profile: v[0]})}
                  min={25}
                  max={85}
                  step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>25</span>
                  <span>85</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-slate-600">Диаметр (дюймы)</label>
                  <span className="font-bold text-lg">R{currentTire.diameter}</span>
                </div>
                <Slider
                  value={[currentTire.diameter]}
                  onValueChange={v => setCurrentTire({...currentTire, diameter: v[0]})}
                  min={13}
                  max={24}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>R13</span>
                  <span>R24</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-1">Размер шины</p>
              <p className="text-2xl font-bold text-primary">{formatTireSize(currentTire)}</p>
            </div>
          </div>

          {/* New Tire */}
          <div className="glass-card p-6 space-y-6 border-2 border-green-200 bg-green-50/50">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Car className="w-6 h-6 text-green-600" />
              Новые шины
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-slate-600">Ширина (мм)</label>
                  <span className="font-bold text-lg">{newTire.width}</span>
                </div>
                <Slider
                  value={[newTire.width]}
                  onValueChange={v => setNewTire({...newTire, width: v[0]})}
                  min={135}
                  max={335}
                  step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>135</span>
                  <span>335</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-slate-600">Профиль (%)</label>
                  <span className="font-bold text-lg">{newTire.profile}</span>
                </div>
                <Slider
                  value={[newTire.profile]}
                  onValueChange={v => setNewTire({...newTire, profile: v[0]})}
                  min={25}
                  max={85}
                  step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>25</span>
                  <span>85</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-slate-600">Диаметр (дюймы)</label>
                  <span className="font-bold text-lg">R{newTire.diameter}</span>
                </div>
                <Slider
                  value={[newTire.diameter]}
                  onValueChange={v => setNewTire({...newTire, diameter: v[0]})}
                  min={13}
                  max={24}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>R13</span>
                  <span>R24</span>
                </div>
              </div>
            </div>

            <div className="bg-green-100 p-4 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-1">Размер шины</p>
              <p className="text-2xl font-bold text-green-700">{formatTireSize(newTire)}</p>
            </div>
          </div>

          {/* Info Block */}
          <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
            <Info className="w-5 h-5 flex-shrink-0 text-primary" />
            <div>
              <p className="mb-2">
                <strong>Как читать размер шины:</strong> 205/55R16 означает ширину 205мм, профиль 55% от ширины, радиальная конструкция, диаметр диска 16 дюймов.
              </p>
              <p>
                Рекомендуется не превышать разницу в общем диаметре более ±3% для сохранения точности спидометра и безопасности.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Результаты сравнения
            </h3>

            {/* Recommendation */}
            <div className={`p-4 rounded-xl mb-6 text-center ${
              recommendation.color === 'text-green-600' ? 'bg-green-50 border border-green-200' :
              recommendation.color === 'text-yellow-600' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="text-2xl mb-2">{recommendation.icon}</div>
              <div className={`font-bold ${recommendation.color}`}>
                {recommendation.text}
              </div>
            </div>

            {/* Key Differences */}
            <div className="space-y-4 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Разница в диаметре
                </span>
                <span className="font-semibold">
                  {calculations.differences.diameter > 0 ? '+' : ''}{calculations.differences.diameter}мм
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Погрешность спидометра
                </span>
                <span className={`font-semibold ${
                  Math.abs(calculations.effects.speedometerError) <= 1 ? 'text-green-600' :
                  Math.abs(calculations.effects.speedometerError) <= 3 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {calculations.effects.speedometerError > 0 ? '+' : ''}{calculations.effects.speedometerError}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  При 100 км/ч на спидометре
                </span>
                <span className="font-semibold">
                  {calculations.effects.actualSpeedAt100} км/ч
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Влияние на расход топлива
                </span>
                <span className={`font-semibold ${
                  calculations.effects.fuelConsumptionChange > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {calculations.effects.fuelConsumptionChange > 0 ? '+' : ''}{calculations.effects.fuelConsumptionChange}%
                </span>
              </div>
            </div>

            {/* Detailed Specs */}
            <div className="space-y-4 py-4 border-t border-border">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Подробные характеристики
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Текущие</p>
                  <p className="font-mono">{formatTireSize(currentTire)}</p>
                  <p className="text-xs text-muted-foreground">
                    ⌀ {calculations.current.overallDiameter}мм
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Новые</p>
                  <p className="font-mono">{formatTireSize(newTire)}</p>
                  <p className="text-xs text-muted-foreground">
                    ⌀ {calculations.new.overallDiameter}мм
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Button variant="hero" className="w-full gap-2" onClick={handleDownloadPDF}>
                <Download className="w-5 h-5" />
                Скачать PDF
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
                Поделиться
              </Button>
              <Button variant="secondary" className="w-full gap-2" onClick={handleCompare}>
                <Scale className="w-5 h-5" />
                Добавить к сравнению
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF Template */}
      <div className="fixed -left-[9999px] top-0">
        <div id="tire-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
          <div className="flex justify-between items-start mb-12 border-b-2 border-primary/20 pb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Сравнение размеров шин</h1>
              <p className="text-slate-600">Калькулятор замены шин • Калькулятор Считай.RU</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Дата: {new Date().toLocaleDateString('ru-RU')}</p>
              <p>schitay.ru</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800">Текущие шины</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Размер:</span>
                  <span className="font-semibold font-mono">{formatTireSize(currentTire)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Общий диаметр:</span>
                  <span className="font-semibold">{calculations.current.overallDiameter} мм</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Окружность:</span>
                  <span className="font-semibold">{calculations.current.circumference} мм</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800">Новые шины</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Размер:</span>
                  <span className="font-semibold font-mono">{formatTireSize(newTire)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Общий диаметр:</span>
                  <span className="font-semibold">{calculations.new.overallDiameter} мм</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Окружность:</span>
                  <span className="font-semibold">{calculations.new.circumference} мм</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg mb-8">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Результат сравнения</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Рекомендация</p>
                <p className={`text-xl font-bold ${recommendation.color}`}>
                  {recommendation.icon} {recommendation.text}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Разница в диаметре</p>
                <p className="text-xl font-bold">
                  {calculations.differences.diameter > 0 ? '+' : ''}{calculations.differences.diameter} мм
                  <span className="text-sm font-normal text-slate-600 ml-2">
                    ({calculations.differences.diameterPercent > 0 ? '+' : ''}{calculations.differences.diameterPercent}%)
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-200">
            <h3 className="font-bold text-lg mb-3 text-blue-800">Влияние на автомобиль</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-blue-700">Спидометр</p>
                <p className="text-blue-600">
                  Погрешность: {calculations.effects.speedometerError > 0 ? '+' : ''}{calculations.effects.speedometerError}%
                </p>
                <p className="text-blue-600">
                  При 100 км/ч: {calculations.effects.actualSpeedAt100} км/ч
                </p>
              </div>
              <div>
                <p className="font-semibold text-blue-700">Расход топлива</p>
                <p className="text-blue-600">
                  Изменение: {calculations.effects.fuelConsumptionChange > 0 ? '+' : ''}{calculations.effects.fuelConsumptionChange}%
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 border-t pt-4">
            <p>Рекомендуется не превышать разницу в общем диаметре более ±3% для безопасности.</p>
            <p className="mt-2">Сформировано на schitay.ru • Дата: {new Date().toLocaleString('ru-RU')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TireSizeCalculator;