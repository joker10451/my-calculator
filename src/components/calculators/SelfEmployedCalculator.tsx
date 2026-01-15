/**
 * Калькулятор налогов для ИП и самозанятых
 * Расчет налогов по разным системам налогообложения
 */

import { useState, useMemo, useEffect } from "react";
import { Wallet, TrendingDown, Building2, Users, Calculator } from "lucide-react";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { CalculationHistoryItem } from "@/hooks/useCalculatorHistory";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";

type TaxSystem = 'self-employed' | 'usn-income' | 'usn-profit' | 'patent';

const SelfEmployedCalculator = () => {
  const { formatCurrency, saveCalculation } = useCalculatorCommon('self-employed', 'Калькулятор для самозанятых');
  
  const [taxSystem, setTaxSystem] = useState<TaxSystem>('self-employed');
  const [monthlyIncome, setMonthlyIncome] = useState(100000);
  const [expenses, setExpenses] = useState(30000);
  const [clientType, setClientType] = useState<'individual' | 'legal'>('individual');
  const [patentCost, setPatentCost] = useState(36000); // годовая стоимость патента

  const calculation = useMemo(() => {
    const yearlyIncome = monthlyIncome * 12;
    const yearlyExpenses = expenses * 12;
    const profit = yearlyIncome - yearlyExpenses;

    let tax = 0;
    let pensionContribution = 0;
    let medicalContribution = 0;
    let totalContributions = 0;
    let netIncome = 0;
    let effectiveRate = 0;

    switch (taxSystem) {
      case 'self-employed':
        // Налог на профессиональный доход (НПД)
        // 4% с физлиц, 6% с юрлиц
        const rate = clientType === 'individual' ? 0.04 : 0.06;
        tax = yearlyIncome * rate;
        // Взносы не платятся
        pensionContribution = 0;
        medicalContribution = 0;
        totalContributions = 0;
        netIncome = yearlyIncome - tax;
        effectiveRate = (tax / yearlyIncome) * 100;
        break;

      case 'usn-income':
        // УСН Доходы 6%
        tax = yearlyIncome * 0.06;
        // Фиксированные взносы 2026
        pensionContribution = 49500;
        medicalContribution = 16500;
        // Дополнительный взнос 1% с дохода свыше 300 000
        if (yearlyIncome > 300000) {
          pensionContribution += (yearlyIncome - 300000) * 0.01;
        }
        totalContributions = pensionContribution + medicalContribution;
        // Налог можно уменьшить на взносы (до 100% для ИП без сотрудников)
        tax = Math.max(0, tax - totalContributions);
        netIncome = yearlyIncome - tax - totalContributions;
        effectiveRate = ((tax + totalContributions) / yearlyIncome) * 100;
        break;

      case 'usn-profit':
        // УСН Доходы минус расходы 15%
        tax = Math.max(0, profit * 0.15);
        // Минимальный налог 1% от дохода
        const minTax = yearlyIncome * 0.01;
        tax = Math.max(tax, minTax);
        // Фиксированные взносы
        pensionContribution = 49500;
        medicalContribution = 16500;
        if (yearlyIncome > 300000) {
          pensionContribution += (yearlyIncome - 300000) * 0.01;
        }
        totalContributions = pensionContribution + medicalContribution;
        netIncome = yearlyIncome - yearlyExpenses - tax - totalContributions;
        effectiveRate = ((tax + totalContributions) / yearlyIncome) * 100;
        break;

      case 'patent':
        // Патентная система
        tax = patentCost;
        // Фиксированные взносы
        pensionContribution = 49500;
        medicalContribution = 16500;
        if (yearlyIncome > 300000) {
          pensionContribution += (yearlyIncome - 300000) * 0.01;
        }
        totalContributions = pensionContribution + medicalContribution;
        netIncome = yearlyIncome - tax - totalContributions;
        effectiveRate = ((tax + totalContributions) / yearlyIncome) * 100;
        break;
    }

    return {
      yearlyIncome: Math.round(yearlyIncome),
      yearlyExpenses: Math.round(yearlyExpenses),
      profit: Math.round(profit),
      tax: Math.round(tax),
      pensionContribution: Math.round(pensionContribution),
      medicalContribution: Math.round(medicalContribution),
      totalContributions: Math.round(totalContributions),
      totalPayments: Math.round(tax + totalContributions),
      netIncome: Math.round(netIncome),
      effectiveRate: effectiveRate.toFixed(2),
      monthlyNet: Math.round(netIncome / 12)
    };
  }, [taxSystem, monthlyIncome, expenses, clientType, patentCost]);

  // Сохранение расчета в историю
  useEffect(() => {
    if (calculation.netIncome > 0) {
      const taxSystemLabels = {
        'self-employed': 'Самозанятый (НПД)',
        'usn-income': 'УСН Доходы',
        'usn-profit': 'УСН Доходы-Расходы',
        'patent': 'Патент'
      };
      
      saveCalculation(
        { taxSystem, monthlyIncome, expenses, clientType, patentCost },
        {
          'Чистый доход': formatCurrency(calculation.netIncome),
          'Система': taxSystemLabels[taxSystem],
          'Доход в месяц': formatCurrency(monthlyIncome),
          'Эффективная ставка': `${calculation.effectiveRate}%`
        }
      );
    }
  }, [calculation.netIncome, calculation.effectiveRate, taxSystem, monthlyIncome, expenses, clientType, patentCost, saveCalculation, formatCurrency]);

  // Данные для экспорта
  const exportData = [
    { Параметр: 'Система налогообложения', Значение: taxSystem === 'self-employed' ? 'Самозанятый (НПД)' : taxSystem === 'usn-income' ? 'УСН Доходы' : taxSystem === 'usn-profit' ? 'УСН Доходы-Расходы' : 'Патент' },
    { Параметр: 'Ежемесячный доход', Значение: formatCurrency(monthlyIncome) },
    { Параметр: 'Годовой доход', Значение: formatCurrency(calculation.yearlyIncome) },
    ...(taxSystem === 'usn-profit' ? [{ Параметр: 'Расходы в год', Значение: formatCurrency(calculation.yearlyExpenses) }] : []),
    { Параметр: 'Налог', Значение: formatCurrency(calculation.tax) },
    ...(calculation.totalContributions > 0 ? [{ Параметр: 'Страховые взносы', Значение: formatCurrency(calculation.totalContributions) }] : []),
    { Параметр: 'Чистый доход в год', Значение: formatCurrency(calculation.netIncome) },
    { Параметр: 'Чистый доход в месяц', Значение: formatCurrency(calculation.monthlyNet) },
    { Параметр: 'Эффективная ставка', Значение: `${calculation.effectiveRate}%` }
  ];

  // Параметры для share
  const shareParams = {
    taxSystem,
    monthlyIncome,
    expenses,
    clientType,
    patentCost
  };

  // Загрузка расчета из истории
  const handleLoadCalculation = (item: CalculationHistoryItem) => {
    const inputs = item.inputs;
    setTaxSystem(inputs.taxSystem);
    setMonthlyIncome(inputs.monthlyIncome);
    setExpenses(inputs.expenses);
    setClientType(inputs.clientType);
    setPatentCost(inputs.patentCost);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Панель действий */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Расчет налогов ИП</h2>
        <div className="flex items-center gap-2">
          <CalculatorHistory 
            calculatorType="self-employed"
            onLoadCalculation={handleLoadCalculation}
          />
          <CalculatorActions
            calculatorId="self-employed"
            calculatorName="Налоги ИП"
            data={exportData}
            printElementId="self-employed-results"
            shareParams={shareParams}
          />
        </div>
      </div>
      {/* Выбор системы налогообложения */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Система налогообложения
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setTaxSystem('self-employed')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              taxSystem === 'self-employed'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">Самозанятый (НПД)</div>
            <div className="text-sm text-muted-foreground mt-1">4-6%, без взносов</div>
          </button>
          <button
            onClick={() => setTaxSystem('usn-income')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              taxSystem === 'usn-income'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">УСН Доходы</div>
            <div className="text-sm text-muted-foreground mt-1">6% + взносы</div>
          </button>
          <button
            onClick={() => setTaxSystem('usn-profit')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              taxSystem === 'usn-profit'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">УСН Доходы-Расходы</div>
            <div className="text-sm text-muted-foreground mt-1">15% от прибыли + взносы</div>
          </button>
          <button
            onClick={() => setTaxSystem('patent')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              taxSystem === 'patent'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">Патент</div>
            <div className="text-sm text-muted-foreground mt-1">Фикс. стоимость + взносы</div>
          </button>
        </div>
      </div>

      {/* Доход */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Ежемесячный доход
          </label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="w-32 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="10000"
          max="500000"
          step="5000"
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>10 000 ₽</span>
          <span>500 000 ₽</span>
        </div>
        <div className="text-sm text-muted-foreground">
          В год: {formatCurrency(calculation.yearlyIncome)}
        </div>
      </div>

      {/* Тип клиентов (для самозанятых) */}
      {taxSystem === 'self-employed' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Тип клиентов
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setClientType('individual')}
              className={`p-4 rounded-xl border-2 transition-all ${
                clientType === 'individual'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">Физлица</div>
              <div className="text-sm text-muted-foreground mt-1">Налог 4%</div>
            </button>
            <button
              onClick={() => setClientType('legal')}
              className={`p-4 rounded-xl border-2 transition-all ${
                clientType === 'legal'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">Юрлица</div>
              <div className="text-sm text-muted-foreground mt-1">Налог 6%</div>
            </button>
          </div>
        </div>
      )}

      {/* Расходы (для УСН Доходы-Расходы) */}
      {taxSystem === 'usn-profit' && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <label className="font-semibold flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              Ежемесячные расходы
            </label>
            <input
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="w-32 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="0"
            max={monthlyIncome}
            step="1000"
            value={expenses}
            onChange={(e) => setExpenses(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            В год: {formatCurrency(calculation.yearlyExpenses)}
          </div>
        </div>
      )}

      {/* Стоимость патента */}
      {taxSystem === 'patent' && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <label className="font-semibold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Стоимость патента в год
            </label>
            <input
              type="number"
              value={patentCost}
              onChange={(e) => setPatentCost(Number(e.target.value))}
              className="w-32 text-right text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Зависит от вида деятельности и региона
          </p>
        </div>
      )}

      {/* Результат */}
      <div id="self-employed-results" className="glass-card p-6 bg-primary/5 border-primary/20 space-y-6">
        <h3 className="text-xl font-bold">Расчет налогов</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Годовой доход</div>
            <div className="text-2xl font-bold">
              {formatCurrency(calculation.yearlyIncome)}
            </div>
          </div>

          {taxSystem === 'usn-profit' && (
            <>
              <div className="p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Расходы</div>
                <div className="text-xl font-bold text-red-500">
                  -{formatCurrency(calculation.yearlyExpenses)}
                </div>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Прибыль</div>
                <div className="text-xl font-bold">
                  {formatCurrency(calculation.profit)}
                </div>
              </div>
            </>
          )}

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Налог</div>
            <div className="text-xl font-bold text-red-500">
              -{formatCurrency(calculation.tax)}
            </div>
          </div>

          {calculation.totalContributions > 0 && (
            <>
              <div className="p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Пенсионные взносы</div>
                <div className="text-lg font-bold text-red-500">
                  -{formatCurrency(calculation.pensionContribution)}
                </div>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Медицинские взносы</div>
                <div className="text-lg font-bold text-red-500">
                  -{formatCurrency(calculation.medicalContribution)}
                </div>
              </div>
              <div className="p-4 bg-background rounded-lg border-2 border-red-200">
                <div className="text-sm text-muted-foreground mb-1">Всего платежей</div>
                <div className="text-xl font-bold text-red-500">
                  -{formatCurrency(calculation.totalPayments)}
                </div>
              </div>
            </>
          )}

          <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <div className="text-sm text-muted-foreground mb-1">Чистый доход в год</div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(calculation.netIncome)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              В месяц: {formatCurrency(calculation.monthlyNet)}
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Эффективная ставка</div>
            <div className="text-2xl font-bold">
              {calculation.effectiveRate}%
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-background/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            ℹ️ Расчет учитывает актуальные ставки и взносы 2026 года. 
            {taxSystem === 'self-employed' && ' Самозанятые не платят страховые взносы.'}
            {taxSystem === 'usn-income' && ' Налог УСН можно уменьшить на сумму взносов до 100%.'}
            {taxSystem === 'usn-profit' && ' Минимальный налог составляет 1% от дохода.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelfEmployedCalculator;
