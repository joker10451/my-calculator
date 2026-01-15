/**
 * Калькулятор КАСКО
 * Расчет стоимости добровольного страхования автомобиля
 */

import { useState, useMemo, useEffect } from "react";
import { Car, Calendar, MapPin, Shield, Users } from "lucide-react";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { useCalculatorHistory, CalculationHistoryItem } from "@/hooks/useCalculatorHistory";

const KASKOCalculator = () => {
  const { addCalculation } = useCalculatorHistory();
  
  const [carValue, setCarValue] = useState(1500000);
  const [carAge, setCarAge] = useState(0);
  const [driverAge, setDriverAge] = useState(30);
  const [driverExperience, setDriverExperience] = useState(10);
  const [region, setRegion] = useState('moscow');
  const [franchise, setFranchise] = useState(0);
  const [coverage, setCoverage] = useState<'full' | 'partial'>('full');

  const calculation = useMemo(() => {
    // Базовый тариф (% от стоимости авто)
    let baseRate = 0.07; // 7% для нового авто

    // Коэффициент возраста авто
    if (carAge === 0) baseRate = 0.07;
    else if (carAge <= 3) baseRate = 0.08;
    else if (carAge <= 5) baseRate = 0.09;
    else if (carAge <= 7) baseRate = 0.10;
    else baseRate = 0.12;

    // Коэффициент возраста и стажа водителя
    let driverCoef = 1.0;
    if (driverAge < 22 || driverExperience < 3) {
      driverCoef = 1.8;
    } else if (driverAge < 25 || driverExperience < 5) {
      driverCoef = 1.5;
    } else if (driverAge < 30 || driverExperience < 7) {
      driverCoef = 1.2;
    }

    // Региональный коэффициент
    const regionCoefs: Record<string, number> = {
      'moscow': 1.5,
      'spb': 1.4,
      'regions': 1.0
    };
    const regionCoef = regionCoefs[region] || 1.0;

    // Коэффициент франшизы (скидка)
    let franchiseCoef = 1.0;
    if (franchise === 15000) franchiseCoef = 0.85;
    else if (franchise === 30000) franchiseCoef = 0.75;
    else if (franchise === 50000) franchiseCoef = 0.65;

    // Коэффициент покрытия
    const coverageCoef = coverage === 'full' ? 1.0 : 0.6;

    // Расчет стоимости
    const baseCost = carValue * baseRate;
    const totalCost = baseCost * driverCoef * regionCoef * franchiseCoef * coverageCoef;
    
    // Экономия от франшизы
    const costWithoutFranchise = baseCost * driverCoef * regionCoef * coverageCoef;
    const savings = costWithoutFranchise - totalCost;

    return {
      baseCost: Math.round(baseCost),
      totalCost: Math.round(totalCost),
      monthlyCost: Math.round(totalCost / 12),
      savings: Math.round(savings),
      baseRate: (baseRate * 100).toFixed(1),
      driverCoef: driverCoef.toFixed(2),
      regionCoef: regionCoef.toFixed(2),
      franchiseCoef: franchiseCoef.toFixed(2),
      coverageCoef: coverageCoef.toFixed(2)
    };
  }, [carValue, carAge, driverAge, driverExperience, region, franchise, coverage]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Сохранение расчета в историю
  useEffect(() => {
    if (calculation.totalCost > 0) {
      const regionLabels = {
        'moscow': 'Москва',
        'spb': 'Санкт-Петербург',
        'regions': 'Регионы'
      };
      
      addCalculation(
        'kasko',
        'Калькулятор КАСКО',
        { carValue, carAge, driverAge, driverExperience, region, franchise, coverage },
        {
          'Стоимость полиса': formatCurrency(calculation.totalCost),
          'Стоимость авто': formatCurrency(carValue),
          'Возраст авто': `${carAge} лет`,
          'Регион': regionLabels[region as keyof typeof regionLabels],
          'Франшиза': franchise > 0 ? formatCurrency(franchise) : 'Без франшизы'
        }
      );
    }
  }, [calculation.totalCost, carValue, carAge, driverAge, driverExperience, region, franchise, coverage, addCalculation]);

  // Данные для экспорта
  const exportData = [
    { Параметр: 'Стоимость автомобиля', Значение: formatCurrency(carValue) },
    { Параметр: 'Возраст автомобиля', Значение: `${carAge} лет` },
    { Параметр: 'Возраст водителя', Значение: `${driverAge} лет` },
    { Параметр: 'Стаж вождения', Значение: `${driverExperience} лет` },
    { Параметр: 'Регион', Значение: region === 'moscow' ? 'Москва' : region === 'spb' ? 'Санкт-Петербург' : 'Регионы' },
    { Параметр: 'Франшиза', Значение: franchise > 0 ? formatCurrency(franchise) : 'Без франшизы' },
    { Параметр: 'Покрытие', Значение: coverage === 'full' ? 'Полное КАСКО' : 'Частичное КАСКО' },
    { Параметр: 'Базовая стоимость', Значение: formatCurrency(calculation.baseCost) },
    { Параметр: 'Стоимость полиса в год', Значение: formatCurrency(calculation.totalCost) },
    { Параметр: 'В месяц', Значение: formatCurrency(calculation.monthlyCost) }
  ];

  // Параметры для share
  const shareParams = {
    carValue,
    carAge,
    driverAge,
    driverExperience,
    region,
    franchise,
    coverage
  };

  // Загрузка расчета из истории
  const handleLoadCalculation = (item: CalculationHistoryItem) => {
    const inputs = item.inputs;
    setCarValue(inputs.carValue);
    setCarAge(inputs.carAge);
    setDriverAge(inputs.driverAge);
    setDriverExperience(inputs.driverExperience);
    setRegion(inputs.region);
    setFranchise(inputs.franchise);
    setCoverage(inputs.coverage);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Панель действий */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Расчет КАСКО</h2>
        <div className="flex items-center gap-2">
          <CalculatorHistory 
            calculatorType="kasko"
            onLoadCalculation={handleLoadCalculation}
          />
          <CalculatorActions
            calculatorId="kasko"
            calculatorName="КАСКО"
            data={exportData}
            printElementId="kasko-results"
            shareParams={shareParams}
          />
        </div>
      </div>
      {/* Стоимость автомобиля */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Стоимость автомобиля
          </label>
          <input
            type="number"
            value={carValue}
            onChange={(e) => setCarValue(Number(e.target.value))}
            className="w-40 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="300000"
          max="5000000"
          step="100000"
          value={carValue}
          onChange={(e) => setCarValue(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>300 000 ₽</span>
          <span>5 000 000 ₽</span>
        </div>
      </div>

      {/* Возраст автомобиля */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Возраст автомобиля (лет)
          </label>
          <input
            type="number"
            value={carAge}
            onChange={(e) => setCarAge(Number(e.target.value))}
            className="w-20 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="0"
          max="15"
          step="1"
          value={carAge}
          onChange={(e) => setCarAge(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Новый</span>
          <span>15 лет</span>
        </div>
      </div>

      {/* Возраст водителя */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Возраст водителя
          </label>
          <input
            type="number"
            value={driverAge}
            onChange={(e) => setDriverAge(Number(e.target.value))}
            className="w-20 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="18"
          max="70"
          step="1"
          value={driverAge}
          onChange={(e) => setDriverAge(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>18 лет</span>
          <span>70 лет</span>
        </div>
      </div>

      {/* Стаж вождения */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold">Стаж вождения (лет)</label>
          <input
            type="number"
            value={driverExperience}
            onChange={(e) => setDriverExperience(Number(e.target.value))}
            className="w-20 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={driverExperience}
          onChange={(e) => setDriverExperience(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 лет</span>
          <span>50 лет</span>
        </div>
      </div>

      {/* Регион */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Регион регистрации
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setRegion('moscow')}
            className={`p-4 rounded-xl border-2 transition-all ${
              region === 'moscow'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">Москва</div>
            <div className="text-sm text-muted-foreground mt-1">Коэф. 1.5</div>
          </button>
          <button
            onClick={() => setRegion('spb')}
            className={`p-4 rounded-xl border-2 transition-all ${
              region === 'spb'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">Санкт-Петербург</div>
            <div className="text-sm text-muted-foreground mt-1">Коэф. 1.4</div>
          </button>
          <button
            onClick={() => setRegion('regions')}
            className={`p-4 rounded-xl border-2 transition-all ${
              region === 'regions'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">Регионы</div>
            <div className="text-sm text-muted-foreground mt-1">Коэф. 1.0</div>
          </button>
        </div>
      </div>

      {/* Франшиза */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Франшиза
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 15000, 30000, 50000].map((value) => (
            <button
              key={value}
              onClick={() => setFranchise(value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                franchise === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">
                {value === 0 ? 'Без франшизы' : `${value.toLocaleString('ru-RU')} ₽`}
              </div>
              {value > 0 && (
                <div className="text-sm text-muted-foreground mt-1">
                  Скидка {((1 - (value === 15000 ? 0.85 : value === 30000 ? 0.75 : 0.65)) * 100).toFixed(0)}%
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Франшиза — сумма ущерба, которую вы оплачиваете сами при наступлении страхового случая
        </p>
      </div>

      {/* Покрытие */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold">Тип покрытия</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setCoverage('full')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              coverage === 'full'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">Полное КАСКО</div>
            <div className="text-sm text-muted-foreground mt-1">
              Угон + ущерб + тотал
            </div>
          </button>
          <button
            onClick={() => setCoverage('partial')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              coverage === 'partial'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">Частичное КАСКО</div>
            <div className="text-sm text-muted-foreground mt-1">
              Только ущерб (скидка 40%)
            </div>
          </button>
        </div>
      </div>

      {/* Результат */}
      <div id="kasko-results" className="glass-card p-6 bg-primary/5 border-primary/20 space-y-6">
        <h3 className="text-xl font-bold">Стоимость КАСКО</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Базовая стоимость</div>
            <div className="text-xl font-bold">
              {formatCurrency(calculation.baseCost)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {calculation.baseRate}% от стоимости авто
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Применяемые коэффициенты:</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Водитель:</span>
                <span className="font-semibold">×{calculation.driverCoef}</span>
              </div>
              <div className="flex justify-between">
                <span>Регион:</span>
                <span className="font-semibold">×{calculation.regionCoef}</span>
              </div>
              <div className="flex justify-between">
                <span>Франшиза:</span>
                <span className="font-semibold">×{calculation.franchiseCoef}</span>
              </div>
              <div className="flex justify-between">
                <span>Покрытие:</span>
                <span className="font-semibold">×{calculation.coverageCoef}</span>
              </div>
            </div>
          </div>

          {calculation.savings > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Экономия с франшизой</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(calculation.savings)}
              </div>
            </div>
          )}

          <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <div className="text-sm text-muted-foreground mb-1">Стоимость полиса в год</div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(calculation.totalCost)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              В месяц: {formatCurrency(calculation.monthlyCost)}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-background/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            ℹ️ Расчет является приблизительным. Точная стоимость зависит от марки и модели автомобиля, 
            условий хранения, дополнительных опций и тарифов страховой компании. 
            Для получения точного расчета обратитесь в страховую компанию.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KASKOCalculator;
