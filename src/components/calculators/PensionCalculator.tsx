/**
 * Калькулятор пенсии
 * Расчет страховой пенсии по старости
 */

import { useState, useMemo, useEffect } from "react";
import { Users, Calendar, Wallet, TrendingUp } from "lucide-react";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { useCalculatorHistory, CalculationHistoryItem } from "@/hooks/useCalculatorHistory";

const PensionCalculator = () => {
  const { addCalculation } = useCalculatorHistory();
  
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthYear, setBirthYear] = useState(1970);
  const [workExperience, setWorkExperience] = useState(30);
  const [averageSalary, setAverageSalary] = useState(50000);
  const [pensionPoints, setPensionPoints] = useState(100);

  const calculation = useMemo(() => {
    const currentYear = 2026;
    const age = currentYear - birthYear;
    
    // Пенсионный возраст с учетом реформы
    const retirementAge = gender === 'male' ? 65 : 60;
    const yearsToRetirement = Math.max(0, retirementAge - age);
    const retirementYear = currentYear + yearsToRetirement;
    
    // Стоимость пенсионного балла в 2026 году
    const pointCost = 133.05; // примерная стоимость
    
    // Фиксированная выплата в 2026 году
    const fixedPayment = 8134.88;
    
    // Расчет пенсионных баллов за год
    const maxSalaryForPoints = 2225000; // максимальная зарплата для начисления баллов
    const yearlyPoints = (averageSalary * 12 / maxSalaryForPoints) * 10;
    
    // Прогноз баллов к пенсии
    const futurePoints = pensionPoints + (yearlyPoints * yearsToRetirement);
    
    // Расчет пенсии
    const insurancePart = futurePoints * pointCost;
    const totalPension = insurancePart + fixedPayment;
    
    // Коэффициент замещения (отношение пенсии к зарплате)
    const replacementRate = (totalPension / averageSalary) * 100;
    
    // Минимальный стаж для пенсии (15 лет с 2024 года)
    const minExperience = 15;
    const hasMinExperience = workExperience >= minExperience;
    
    // Минимальные баллы для пенсии (30 баллов с 2025 года)
    const minPoints = 30;
    const hasMinPoints = futurePoints >= minPoints;
    
    const canRetire = hasMinExperience && hasMinPoints;

    return {
      age,
      retirementAge,
      yearsToRetirement,
      retirementYear,
      currentPoints: Math.round(pensionPoints * 10) / 10,
      yearlyPoints: Math.round(yearlyPoints * 10) / 10,
      futurePoints: Math.round(futurePoints * 10) / 10,
      fixedPayment: Math.round(fixedPayment),
      insurancePart: Math.round(insurancePart),
      totalPension: Math.round(totalPension),
      replacementRate: Math.round(replacementRate * 10) / 10,
      canRetire,
      hasMinExperience,
      hasMinPoints,
      minExperience,
      minPoints
    };
  }, [gender, birthYear, workExperience, averageSalary, pensionPoints]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Сохранение расчета в историю
  useEffect(() => {
    if (calculation.totalPension > 0) {
      addCalculation(
        'pension',
        'Калькулятор пенсии',
        { gender, birthYear, workExperience, averageSalary, pensionPoints },
        {
          'Размер пенсии': formatCurrency(calculation.totalPension),
          'Возраст': `${calculation.age} лет`,
          'Стаж': `${workExperience} лет`,
          'Баллы': calculation.futurePoints.toString(),
          'До пенсии': calculation.yearsToRetirement > 0 ? `${calculation.yearsToRetirement} лет` : 'На пенсии'
        }
      );
    }
  }, [calculation.totalPension, calculation.age, calculation.futurePoints, calculation.yearsToRetirement, gender, birthYear, workExperience, averageSalary, pensionPoints, addCalculation]);

  // Данные для экспорта
  const exportData = [
    { Параметр: 'Пол', Значение: gender === 'male' ? 'Мужчина' : 'Женщина' },
    { Параметр: 'Год рождения', Значение: birthYear.toString() },
    { Параметр: 'Возраст', Значение: `${calculation.age} лет` },
    { Параметр: 'Трудовой стаж', Значение: `${workExperience} лет` },
    { Параметр: 'Средняя зарплата', Значение: formatCurrency(averageSalary) },
    { Параметр: 'Текущие баллы', Значение: calculation.currentPoints.toString() },
    { Параметр: 'Баллов за год', Значение: calculation.yearlyPoints.toString() },
    { Параметр: 'Баллы к пенсии', Значение: calculation.futurePoints.toString() },
    { Параметр: 'Выход на пенсию', Значение: calculation.yearsToRetirement > 0 ? `Через ${calculation.yearsToRetirement} лет (${calculation.retirementYear})` : 'Уже на пенсии' },
    { Параметр: 'Фиксированная выплата', Значение: formatCurrency(calculation.fixedPayment) },
    { Параметр: 'Страховая часть', Значение: formatCurrency(calculation.insurancePart) },
    { Параметр: 'Размер пенсии', Значение: formatCurrency(calculation.totalPension) },
    { Параметр: 'Коэффициент замещения', Значение: `${calculation.replacementRate}%` }
  ];

  // Параметры для share
  const shareParams = {
    gender,
    birthYear,
    workExperience,
    averageSalary,
    pensionPoints
  };

  // Загрузка расчета из истории
  const handleLoadCalculation = (item: CalculationHistoryItem) => {
    const inputs = item.inputs;
    setGender(inputs.gender);
    setBirthYear(inputs.birthYear);
    setWorkExperience(inputs.workExperience);
    setAverageSalary(inputs.averageSalary);
    setPensionPoints(inputs.pensionPoints);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Панель действий */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Прогноз пенсии</h2>
        <div className="flex items-center gap-2">
          <CalculatorHistory 
            calculatorType="pension"
            onLoadCalculation={handleLoadCalculation}
          />
          <CalculatorActions
            calculatorId="pension"
            calculatorName="Пенсия"
            data={exportData}
            printElementId="pension-results"
            shareParams={shareParams}
          />
        </div>
      </div>
      {/* Пол */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Пол
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGender('male')}
            className={`p-4 rounded-xl border-2 transition-all ${
              gender === 'male'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">Мужчина</div>
            <div className="text-sm text-muted-foreground mt-1">Пенсия в 65 лет</div>
          </button>
          <button
            onClick={() => setGender('female')}
            className={`p-4 rounded-xl border-2 transition-all ${
              gender === 'female'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">Женщина</div>
            <div className="text-sm text-muted-foreground mt-1">Пенсия в 60 лет</div>
          </button>
        </div>
      </div>

      {/* Год рождения */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Год рождения
          </label>
          <input
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
            className="w-24 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="1950"
          max="2010"
          step="1"
          value={birthYear}
          onChange={(e) => setBirthYear(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1950</span>
          <span>2010</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Ваш возраст: {calculation.age} лет
        </div>
      </div>

      {/* Трудовой стаж */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold">Трудовой стаж (лет)</label>
          <input
            type="number"
            value={workExperience}
            onChange={(e) => setWorkExperience(Number(e.target.value))}
            className="w-20 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={workExperience}
          onChange={(e) => setWorkExperience(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 лет</span>
          <span>50 лет</span>
        </div>
      </div>

      {/* Средняя зарплата */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Средняя зарплата
          </label>
          <input
            type="number"
            value={averageSalary}
            onChange={(e) => setAverageSalary(Number(e.target.value))}
            className="w-32 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="15000"
          max="200000"
          step="5000"
          value={averageSalary}
          onChange={(e) => setAverageSalary(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>15 000 ₽</span>
          <span>200 000 ₽</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Баллов за год: {calculation.yearlyPoints}
        </div>
      </div>

      {/* Накопленные баллы */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Накопленные пенсионные баллы
          </label>
          <input
            type="number"
            value={pensionPoints}
            onChange={(e) => setPensionPoints(Number(e.target.value))}
            className="w-24 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
            step="0.1"
          />
        </div>
        <input
          type="range"
          min="0"
          max="300"
          step="1"
          value={pensionPoints}
          onChange={(e) => setPensionPoints(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>300</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Узнать количество баллов можно на Госуслугах
        </div>
      </div>

      {/* Результат */}
      <div id="pension-results" className="glass-card p-6 bg-primary/5 border-primary/20 space-y-6">
        <h3 className="text-xl font-bold">Прогноз пенсии</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Выход на пенсию</div>
            <div className="text-2xl font-bold">
              {calculation.yearsToRetirement > 0 
                ? `Через ${calculation.yearsToRetirement} лет (${calculation.retirementYear} год)`
                : 'Уже на пенсии'
              }
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              В возрасте {calculation.retirementAge} лет
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Пенсионные баллы</div>
            <div className="text-xl font-bold">
              {calculation.currentPoints} → {calculation.futurePoints}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Текущие → К пенсии
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Фиксированная выплата</div>
            <div className="text-xl font-bold">
              {formatCurrency(calculation.fixedPayment)}
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Страховая часть</div>
            <div className="text-xl font-bold">
              {formatCurrency(calculation.insurancePart)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {calculation.futurePoints} баллов × 133.05 ₽
            </div>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <div className="text-sm text-muted-foreground mb-1">Размер пенсии</div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(calculation.totalPension)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {calculation.replacementRate}% от текущей зарплаты
            </div>
          </div>

          {/* Условия выхода на пенсию */}
          <div className="p-4 bg-background rounded-lg space-y-2">
            <div className="font-semibold mb-2">Условия выхода на пенсию:</div>
            <div className="flex items-center gap-2">
              <span className={calculation.hasMinExperience ? 'text-green-500' : 'text-red-500'}>
                {calculation.hasMinExperience ? '✓' : '✗'}
              </span>
              <span className="text-sm">
                Стаж {workExperience} лет (минимум {calculation.minExperience} лет)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={calculation.hasMinPoints ? 'text-green-500' : 'text-red-500'}>
                {calculation.hasMinPoints ? '✓' : '✗'}
              </span>
              <span className="text-sm">
                Баллы {calculation.futurePoints} (минимум {calculation.minPoints})
              </span>
            </div>
            {!calculation.canRetire && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                ⚠️ Условия для выхода на пенсию не выполнены
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-background/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            ℹ️ Расчет является приблизительным и основан на данных 2026 года. 
            Стоимость балла и фиксированная выплата ежегодно индексируются. 
            Точную информацию о пенсионных правах можно получить на Госуслугах или в ПФР.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PensionCalculator;
