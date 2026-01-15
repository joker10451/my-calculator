/**
 * Калькулятор доходности инвестиций
 * Расчет будущей стоимости инвестиций с учетом регулярных пополнений
 */

import { useState, useMemo, useEffect } from "react";
import { TrendingUp, Wallet, Calendar, PiggyBank, Percent } from "lucide-react";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { useCalculatorHistory, CalculationHistoryItem } from "@/hooks/useCalculatorHistory";

const InvestmentCalculator = () => {
  const { addCalculation } = useCalculatorHistory();
  
  const [initialAmount, setInitialAmount] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [taxRate, setTaxRate] = useState(13);

  const calculation = useMemo(() => {
    const months = years * 12;
    const monthlyRate = annualReturn / 100 / 12;
    
    let balance = initialAmount;
    let totalContributions = initialAmount;
    let totalIncome = 0;
    
    // Помесячный расчет с учетом пополнений
    for (let month = 1; month <= months; month++) {
      // Начисление процентов
      const monthlyIncome = balance * monthlyRate;
      balance += monthlyIncome;
      totalIncome += monthlyIncome;
      
      // Пополнение
      balance += monthlyContribution;
      totalContributions += monthlyContribution;
    }
    
    const finalBalance = balance;
    const profit = finalBalance - totalContributions;
    const tax = (profit * taxRate) / 100;
    const netProfit = profit - tax;
    const netBalance = finalBalance - tax;
    
    // Эффективная доходность
    const effectiveReturn = totalContributions > 0 
      ? ((netProfit / totalContributions) * 100)
      : 0;
    
    // Среднегодовая доходность
    const avgYearlyReturn = years > 0 ? effectiveReturn / years : 0;

    return {
      finalBalance: Math.round(finalBalance),
      totalContributions: Math.round(totalContributions),
      profit: Math.round(profit),
      tax: Math.round(tax),
      netProfit: Math.round(netProfit),
      netBalance: Math.round(netBalance),
      effectiveReturn: effectiveReturn.toFixed(2),
      avgYearlyReturn: avgYearlyReturn.toFixed(2),
      months
    };
  }, [initialAmount, monthlyContribution, annualReturn, years, taxRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Сохранение расчета в историю
  useEffect(() => {
    if (calculation.netBalance > 0) {
      addCalculation(
        'investment',
        'Калькулятор инвестиций',
        { initialAmount, monthlyContribution, annualReturn, years, taxRate },
        {
          'Итоговая сумма': formatCurrency(calculation.netBalance),
          'Чистый доход': formatCurrency(calculation.netProfit),
          'Начальная сумма': formatCurrency(initialAmount),
          'Срок': `${years} лет`,
          'Доходность': `${annualReturn}%`
        }
      );
    }
  }, [calculation.netBalance, calculation.netProfit, initialAmount, monthlyContribution, annualReturn, years, taxRate, addCalculation]);

  // Данные для экспорта
  const exportData = [
    { Параметр: 'Начальная сумма', Значение: formatCurrency(initialAmount) },
    { Параметр: 'Ежемесячное пополнение', Значение: formatCurrency(monthlyContribution) },
    { Параметр: 'Годовая доходность', Значение: `${annualReturn}%` },
    { Параметр: 'Срок инвестирования', Значение: `${years} лет` },
    { Параметр: 'Налог на доход', Значение: `${taxRate}%` },
    { Параметр: 'Всего внесено', Значение: formatCurrency(calculation.totalContributions) },
    { Параметр: 'Доход от инвестиций', Значение: formatCurrency(calculation.profit) },
    { Параметр: 'Налог', Значение: formatCurrency(calculation.tax) },
    { Параметр: 'Чистый доход', Значение: formatCurrency(calculation.netProfit) },
    { Параметр: 'Итоговая сумма', Значение: formatCurrency(calculation.netBalance) },
    { Параметр: 'Эффективная доходность', Значение: `${calculation.effectiveReturn}%` }
  ];

  // Параметры для share
  const shareParams = {
    initialAmount,
    monthlyContribution,
    annualReturn,
    years,
    taxRate
  };

  // Загрузка расчета из истории
  const handleLoadCalculation = (item: CalculationHistoryItem) => {
    const inputs = item.inputs;
    setInitialAmount(inputs.initialAmount);
    setMonthlyContribution(inputs.monthlyContribution);
    setAnnualReturn(inputs.annualReturn);
    setYears(inputs.years);
    setTaxRate(inputs.taxRate);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Панель действий */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Расчет инвестиций</h2>
        <div className="flex items-center gap-2">
          <CalculatorHistory 
            calculatorType="investment"
            onLoadCalculation={handleLoadCalculation}
          />
          <CalculatorActions
            calculatorId="investment"
            calculatorName="Инвестиции"
            data={exportData}
            printElementId="investment-results"
            shareParams={shareParams}
          />
        </div>
      </div>
      {/* Начальная сумма */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Начальная сумма
          </label>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(Number(e.target.value))}
            className="w-40 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="0"
          max="5000000"
          step="50000"
          value={initialAmount}
          onChange={(e) => setInitialAmount(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 ₽</span>
          <span>5 000 000 ₽</span>
        </div>
      </div>

      {/* Ежемесячное пополнение */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary" />
            Ежемесячное пополнение
          </label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-40 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="0"
          max="200000"
          step="5000"
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 ₽</span>
          <span>200 000 ₽</span>
        </div>
        <div className="text-sm text-muted-foreground">
          В год: {formatCurrency(monthlyContribution * 12)}
        </div>
      </div>

      {/* Годовая доходность */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Годовая доходность (%)
          </label>
          <input
            type="number"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
            className="w-24 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
            step="0.1"
          />
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="0.5"
          value={annualReturn}
          onChange={(e) => setAnnualReturn(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {[8, 12, 15, 20].map((rate) => (
            <button
              key={rate}
              onClick={() => setAnnualReturn(rate)}
              className="px-3 py-2 text-sm rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-all"
            >
              {rate}%
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Консервативно: 8-10%, Умеренно: 12-15%, Агрессивно: 20%+
        </p>
      </div>

      {/* Срок инвестирования */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Срок инвестирования (лет)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-20 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="1"
          max="30"
          step="1"
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 год</span>
          <span>30 лет</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {calculation.months} месяцев
        </div>
      </div>

      {/* Налог */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            Налог на доход (%)
          </label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-20 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 13, 15].map((rate) => (
            <button
              key={rate}
              onClick={() => setTaxRate(rate)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                taxRate === rate
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary hover:bg-primary/10'
              }`}
            >
              {rate === 0 ? 'ИИС' : `${rate}%`}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          13% — стандартный НДФЛ, 15% — для доходов свыше 5 млн ₽, 0% — ИИС с вычетом типа Б
        </p>
      </div>

      {/* Результат */}
      <div id="investment-results" className="glass-card p-6 bg-primary/5 border-primary/20 space-y-6">
        <h3 className="text-xl font-bold">Результат инвестирования</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Всего внесено</div>
            <div className="text-2xl font-bold">
              {formatCurrency(calculation.totalContributions)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Начальная сумма + {calculation.months} пополнений
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Доход от инвестиций</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{formatCurrency(calculation.profit)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              До уплаты налогов
            </div>
          </div>

          {calculation.tax > 0 && (
            <div className="p-4 bg-background rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Налог {taxRate}%</div>
              <div className="text-xl font-bold text-red-500">
                -{formatCurrency(calculation.tax)}
              </div>
            </div>
          )}

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
            <div className="text-sm text-muted-foreground mb-1">Чистый доход</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{formatCurrency(calculation.netProfit)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              После уплаты налогов
            </div>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <div className="text-sm text-muted-foreground mb-1">Итоговая сумма</div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(calculation.netBalance)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Через {years} {years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Эффективная доходность</div>
              <div className="text-2xl font-bold">
                {calculation.effectiveReturn}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                За весь период
              </div>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Среднегодовая доходность</div>
              <div className="text-2xl font-bold">
                {calculation.avgYearlyReturn}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                В год
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-background/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            ℹ️ Расчет является приблизительным и не учитывает комиссии брокера, инфляцию и волатильность рынка. 
            Прошлая доходность не гарантирует будущих результатов. 
            Инвестиции связаны с риском потери капитала.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;
