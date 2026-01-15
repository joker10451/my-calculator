/**
 * Калькулятор больничного
 * Расчет пособия по временной нетрудоспособности
 */

import { useState, useMemo, useEffect } from "react";
import { Activity, Calendar, Wallet, TrendingDown } from "lucide-react";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { useCalculatorHistory, CalculationHistoryItem } from "@/hooks/useCalculatorHistory";

const SickLeaveCalculator = () => {
  const { addCalculation } = useCalculatorHistory();
  
  const [sickDays, setSickDays] = useState(7);
  const [avgSalary, setAvgSalary] = useState(100000);
  const [experience, setExperience] = useState<'less5' | '5to8' | 'more8'>('more8');
  const [reason, setReason] = useState<'illness' | 'injury' | 'child'>('illness');

  // Коэффициенты в зависимости от стажа
  const EXPERIENCE_COEFFICIENTS = {
    'less5': 0.6,   // менее 5 лет - 60%
    '5to8': 0.8,    // 5-8 лет - 80%
    'more8': 1.0    // более 8 лет - 100%
  };

  // Максимальная база для расчета (2026)
  const MAX_DAILY_BENEFIT = 4039; // примерно

  const calculation = useMemo(() => {
    // Средний дневной заработок
    const avgDailyEarnings = avgSalary / 30.4; // среднее количество дней в месяце
    
    // Применяем коэффициент стажа
    const coefficient = EXPERIENCE_COEFFICIENTS[experience];
    
    // Рассчитываем дневное пособие
    let dailyBenefit = avgDailyEarnings * coefficient;
    
    // Ограничиваем максимальной суммой
    dailyBenefit = Math.min(dailyBenefit, MAX_DAILY_BENEFIT);
    
    // Первые 3 дня оплачивает работодатель, остальные - ФСС
    const employerDays = reason === 'illness' ? Math.min(3, sickDays) : 0;
    const fssDays = sickDays - employerDays;
    
    const employerPay = dailyBenefit * employerDays;
    const fssPay = dailyBenefit * fssDays;
    const totalPay = employerPay + fssPay;
    
    // НДФЛ 13%
    const ndfl = totalPay * 0.13;
    const netPay = totalPay - ndfl;

    return {
      avgDailyEarnings: Math.round(avgDailyEarnings),
      dailyBenefit: Math.round(dailyBenefit),
      employerDays,
      fssDays,
      employerPay: Math.round(employerPay),
      fssPay: Math.round(fssPay),
      totalPay: Math.round(totalPay),
      ndfl: Math.round(ndfl),
      netPay: Math.round(netPay),
      coefficient
    };
  }, [avgSalary, experience, sickDays, reason]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Сохранение расчета в историю
  useEffect(() => {
    if (calculation.netPay > 0) {
      const experienceLabels = {
        'less5': 'Менее 5 лет',
        '5to8': '5-8 лет',
        'more8': 'Более 8 лет'
      };
      const reasonLabels = {
        'illness': 'Болезнь',
        'injury': 'Травма',
        'child': 'Уход за ребенком'
      };
      
      addCalculation(
        'sick-leave',
        'Калькулятор больничного',
        { sickDays, avgSalary, experience, reason },
        {
          'К выплате': formatCurrency(calculation.netPay),
          'Дней больничного': sickDays.toString(),
          'Средняя зарплата': formatCurrency(avgSalary),
          'Стаж': experienceLabels[experience],
          'Причина': reasonLabels[reason]
        }
      );
    }
  }, [calculation.netPay, sickDays, avgSalary, experience, reason, addCalculation]);

  // Данные для экспорта
  const exportData = [
    { Параметр: 'Дней больничного', Значение: sickDays.toString() },
    { Параметр: 'Средняя зарплата', Значение: formatCurrency(avgSalary) },
    { Параметр: 'Стаж', Значение: experience === 'less5' ? 'Менее 5 лет' : experience === '5to8' ? '5-8 лет' : 'Более 8 лет' },
    { Параметр: 'Причина', Значение: reason === 'illness' ? 'Болезнь' : reason === 'child' ? 'Уход за ребенком' : 'Травма' },
    { Параметр: 'Средний дневной заработок', Значение: formatCurrency(calculation.avgDailyEarnings) },
    { Параметр: 'Дневное пособие', Значение: formatCurrency(calculation.dailyBenefit) },
    { Параметр: 'Итого начислено', Значение: formatCurrency(calculation.totalPay) },
    { Параметр: 'НДФЛ 13%', Значение: formatCurrency(calculation.ndfl) },
    { Параметр: 'К выплате', Значение: formatCurrency(calculation.netPay) }
  ];

  // Параметры для share
  const shareParams = {
    sickDays,
    avgSalary,
    experience,
    reason
  };

  // Загрузка расчета из истории
  const handleLoadCalculation = (item: CalculationHistoryItem) => {
    const inputs = item.inputs;
    setSickDays(inputs.sickDays);
    setAvgSalary(inputs.avgSalary);
    setExperience(inputs.experience);
    setReason(inputs.reason);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Панель действий */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Расчет больничного</h2>
        <div className="flex items-center gap-2">
          <CalculatorHistory 
            calculatorType="sick-leave"
            onLoadCalculation={handleLoadCalculation}
          />
          <CalculatorActions
            calculatorId="sick-leave"
            calculatorName="Больничный"
            data={exportData}
            printElementId="sick-leave-results"
            shareParams={shareParams}
          />
        </div>
      </div>
      {/* Количество дней */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Количество дней больничного
          </label>
          <input
            type="number"
            value={sickDays}
            onChange={(e) => setSickDays(Number(e.target.value))}
            className="w-24 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={sickDays}
          onChange={(e) => setSickDays(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 день</span>
          <span>30 дней</span>
        </div>
      </div>

      {/* Средняя зарплата */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Средняя зарплата за 2 года
          </label>
          <input
            type="number"
            value={avgSalary}
            onChange={(e) => setAvgSalary(Number(e.target.value))}
            className="w-32 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="20000"
          max="300000"
          step="5000"
          value={avgSalary}
          onChange={(e) => setAvgSalary(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>20 000 ₽</span>
          <span>300 000 ₽</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Средняя ежемесячная зарплата за последние 24 месяца
        </p>
      </div>

      {/* Стаж */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Страховой стаж
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: 'less5', label: 'Менее 5 лет', percent: '60%' },
            { value: '5to8', label: '5-8 лет', percent: '80%' },
            { value: 'more8', label: 'Более 8 лет', percent: '100%' }
          ].map(exp => (
            <button
              key={exp.value}
              onClick={() => setExperience(exp.value as any)}
              className={`p-4 rounded-xl border-2 transition-all ${
                experience === exp.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">{exp.label}</div>
              <div className="text-sm text-muted-foreground mt-1">{exp.percent} от среднего заработка</div>
            </button>
          ))}
        </div>
      </div>

      {/* Причина */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold">Причина нетрудоспособности</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
            <input
              type="radio"
              checked={reason === 'illness'}
              onChange={() => setReason('illness')}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Болезнь или травма</div>
              <div className="text-sm text-muted-foreground">Первые 3 дня - работодатель, остальные - ФСС</div>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
            <input
              type="radio"
              checked={reason === 'child'}
              onChange={() => setReason('child')}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Уход за ребенком</div>
              <div className="text-sm text-muted-foreground">Все дни оплачивает ФСС</div>
            </div>
          </label>
        </div>
      </div>

      {/* Результат */}
      <div id="sick-leave-results" className="glass-card p-6 bg-primary/5 border-primary/20 space-y-6">
        <h3 className="text-xl font-bold">Расчет больничного</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Средний дневной заработок</div>
            <div className="text-xl font-bold">
              {formatCurrency(calculation.avgDailyEarnings)}
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Дневное пособие (с учетом стажа {calculation.coefficient * 100}%)
            </div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(calculation.dailyBenefit)}
            </div>
          </div>

          {calculation.employerDays > 0 && (
            <div className="p-4 bg-background rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Оплата работодателем ({calculation.employerDays} дн.)
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(calculation.employerPay)}
              </div>
            </div>
          )}

          {calculation.fssDays > 0 && (
            <div className="p-4 bg-background rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Оплата ФСС ({calculation.fssDays} дн.)
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(calculation.fssPay)}
              </div>
            </div>
          )}

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Итого начислено</div>
            <div className="text-2xl font-bold">
              {formatCurrency(calculation.totalPay)}
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">НДФЛ 13%</div>
            <div className="text-xl font-bold text-red-500">
              -{formatCurrency(calculation.ndfl)}
            </div>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <div className="text-sm text-muted-foreground mb-1">К выплате на руки</div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(calculation.netPay)}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-background/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            ℹ️ Расчет производится по формуле: Средний дневной заработок × Коэффициент стажа × Количество дней.
            При болезни первые 3 дня оплачивает работодатель, остальные - ФСС. Из суммы вычитается НДФЛ 13%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SickLeaveCalculator;
