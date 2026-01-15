/**
 * Калькулятор отпускных
 * Расчет отпускных выплат по Трудовому кодексу РФ
 */

import { useState, useMemo, useEffect } from "react";
import { Calendar, Wallet, TrendingUp, Info } from "lucide-react";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { useCalculatorHistory, CalculationHistoryItem } from "@/hooks/useCalculatorHistory";

const VacationCalculator = () => {
  const { addCalculation } = useCalculatorHistory();
  
  const [vacationDays, setVacationDays] = useState(14);
  const [salary, setSalary] = useState(100000);
  const [bonuses, setBonuses] = useState(0);
  const [workedMonths, setWorkedMonths] = useState(12);
  const [excludedDays, setExcludedDays] = useState(0);

  const AVERAGE_DAYS_IN_MONTH = 29.3; // По ТК РФ

  const calculation = useMemo(() => {
    // Общий доход за расчетный период
    const totalIncome = (salary * workedMonths) + bonuses;
    
    // Количество календарных дней в расчетном периоде
    const totalDays = (AVERAGE_DAYS_IN_MONTH * workedMonths) - excludedDays;
    
    // Средний дневной заработок
    const avgDailyEarnings = totalDays > 0 ? totalIncome / totalDays : 0;
    
    // Сумма отпускных
    const vacationPay = avgDailyEarnings * vacationDays;
    
    // НДФЛ 13%
    const ndfl = vacationPay * 0.13;
    
    // К выплате
    const netPay = vacationPay - ndfl;

    return {
      totalIncome: Math.round(totalIncome),
      avgDailyEarnings: Math.round(avgDailyEarnings),
      vacationPay: Math.round(vacationPay),
      ndfl: Math.round(ndfl),
      netPay: Math.round(netPay),
      totalDays: Math.round(totalDays)
    };
  }, [salary, bonuses, workedMonths, excludedDays, vacationDays]);

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
      addCalculation(
        'vacation',
        'Калькулятор отпускных',
        { vacationDays, salary, bonuses, workedMonths, excludedDays },
        {
          'К выплате': formatCurrency(calculation.netPay),
          'Дней отпуска': vacationDays.toString(),
          'Зарплата': formatCurrency(salary),
          'Отработано': `${workedMonths} мес.`
        }
      );
    }
  }, [calculation.netPay, vacationDays, salary, bonuses, workedMonths, excludedDays, addCalculation]);

  // Данные для экспорта
  const exportData = [
    { Параметр: 'Дней отпуска', Значение: vacationDays.toString() },
    { Параметр: 'Ежемесячная зарплата', Значение: formatCurrency(salary) },
    { Параметр: 'Премии', Значение: formatCurrency(bonuses) },
    { Параметр: 'Отработано месяцев', Значение: workedMonths.toString() },
    { Параметр: 'Исключаемые дни', Значение: excludedDays.toString() },
    { Параметр: 'Средний дневной заработок', Значение: formatCurrency(calculation.avgDailyEarnings) },
    { Параметр: 'Сумма отпускных', Значение: formatCurrency(calculation.vacationPay) },
    { Параметр: 'НДФЛ 13%', Значение: formatCurrency(calculation.ndfl) },
    { Параметр: 'К выплате', Значение: formatCurrency(calculation.netPay) }
  ];

  // Параметры для share
  const shareParams = {
    vacationDays,
    salary,
    bonuses,
    workedMonths,
    excludedDays
  };

  // Загрузка расчета из истории
  const handleLoadCalculation = (item: CalculationHistoryItem) => {
    const inputs = item.inputs;
    setVacationDays(inputs.vacationDays);
    setSalary(inputs.salary);
    setBonuses(inputs.bonuses);
    setWorkedMonths(inputs.workedMonths);
    setExcludedDays(inputs.excludedDays);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Панель действий */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Расчет отпускных</h2>
        <div className="flex items-center gap-2">
          <CalculatorHistory 
            calculatorType="vacation"
            onLoadCalculation={handleLoadCalculation}
          />
          <CalculatorActions
            calculatorId="vacation"
            calculatorName="Отпускные"
            data={exportData}
            printElementId="vacation-results"
            shareParams={shareParams}
          />
        </div>
      </div>
      {/* Количество дней отпуска */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Количество дней отпуска
          </label>
          <input
            type="number"
            value={vacationDays}
            onChange={(e) => setVacationDays(Number(e.target.value))}
            className="w-24 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="1"
          max="56"
          value={vacationDays}
          onChange={(e) => setVacationDays(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 день</span>
          <span>56 дней</span>
        </div>
      </div>

      {/* Зарплата */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Ежемесячная зарплата
          </label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="w-32 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="20000"
          max="500000"
          step="5000"
          value={salary}
          onChange={(e) => setSalary(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>20 000 ₽</span>
          <span>500 000 ₽</span>
        </div>
      </div>

      {/* Премии и бонусы */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Премии за расчетный период
          </label>
          <input
            type="number"
            value={bonuses}
            onChange={(e) => setBonuses(Number(e.target.value))}
            className="w-32 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Укажите сумму всех премий и бонусов за последние 12 месяцев
        </p>
      </div>

      {/* Отработанные месяцы */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold">Отработано полных месяцев</label>
          <input
            type="number"
            value={workedMonths}
            onChange={(e) => setWorkedMonths(Math.min(12, Math.max(1, Number(e.target.value))))}
            className="w-20 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="1"
          max="12"
          value={workedMonths}
          onChange={(e) => setWorkedMonths(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 месяц</span>
          <span>12 месяцев</span>
        </div>
      </div>

      {/* Исключаемые дни */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Исключаемые дни
          </label>
          <input
            type="number"
            value={excludedDays}
            onChange={(e) => setExcludedDays(Number(e.target.value))}
            className="w-20 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Дни больничного, отпуска за свой счет и другие исключаемые периоды
        </p>
      </div>

      {/* Результат */}
      <div id="vacation-results" className="glass-card p-6 bg-primary/5 border-primary/20 space-y-6">
        <h3 className="text-xl font-bold">Расчет отпускных</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Средний дневной заработок</div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(calculation.avgDailyEarnings)}
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Сумма отпускных (до вычета НДФЛ)</div>
            <div className="text-2xl font-bold">
              {formatCurrency(calculation.vacationPay)}
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

        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Расчетный период:</span>
            <span className="font-medium">{workedMonths} мес.</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Общий доход:</span>
            <span className="font-medium">{formatCurrency(calculation.totalIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Календарных дней:</span>
            <span className="font-medium">{calculation.totalDays}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Дней отпуска:</span>
            <span className="font-medium">{vacationDays}</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-background/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            ℹ️ Расчет производится по формуле: (Зарплата за 12 мес. + Премии) / (29.3 × Отработанные месяцы - Исключаемые дни) × Дни отпуска.
            Из суммы вычитается НДФЛ 13%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VacationCalculator;
