import React, { useState, useMemo } from 'react';
import { Calculator, AlertCircle, Coins, PieChart, InfoIcon } from 'lucide-react';

export default function DepositTaxCalculator() {
  const [totalInterest, setTotalInterest] = useState<number>(350000);
  const [keyRate, setKeyRate] = useState<number>(15.0);
  const [isHighIncome, setIsHighIncome] = useState<boolean>(false);

  const results = useMemo(() => {
    const nonTaxableBase = 1000000 * (keyRate / 100);
    const taxableBase = Math.max(0, totalInterest - nonTaxableBase);
    const taxRate = isHighIncome ? 15 : 13;
    const taxAmount = taxableBase * (taxRate / 100);
    const netProfit = totalInterest - taxAmount;

    return {
      nonTaxableBase,
      taxableBase,
      taxRate,
      taxAmount,
      netProfit,
    };
  }, [totalInterest, keyRate, isHighIncome]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-surface-primary rounded-xl shadow-lg border border-border-default">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-default">
        <div className="p-3 bg-accent-primary/10 rounded-xl text-accent-primary">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Расчет НДФЛ со вкладов (налог на проценты)</h2>
          <p className="text-text-secondary text-sm">Узнайте, сколько налога нужно заплатить за 2025-2026 год</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Общая сумма полученных процентов (за год)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={totalInterest || ''}
                  onChange={(e) => setTotalInterest(Number(e.target.value))}
                  className="w-full p-3 pr-12 text-lg sm:text-xl font-bold rounded-xl border border-border-default bg-surface-secondary text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-shadow"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">₽</span>
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                Укажите сумму процентов, которые вы реально получили по всем вашим банковским вкладам и накопительным счетам во всех банках за расчетный год.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Максимальная ключевая ставка ЦБ в году
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={keyRate || ''}
                  onChange={(e) => setKeyRate(Number(e.target.value))}
                  className="w-full p-3 pr-12 text-lg sm:text-xl font-bold rounded-xl border border-border-default bg-surface-secondary text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-shadow"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">%</span>
              </div>
              <p className="text-xs text-text-tertiary mt-2 flex items-start gap-1">
                <InfoIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Для доходов 2025 года максимальная ставка была 25%, для 2026 — пока 18%. Укажите ожидаемый максимум на 1-е число любого месяца года.</span>
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-surface-secondary rounded-xl border border-border-default">
              <input
                type="checkbox"
                id="highIncome"
                checked={isHighIncome}
                onChange={(e) => setIsHighIncome(e.target.checked)}
                className="w-5 h-5 rounded border-border-default text-accent-primary focus:ring-accent-primary"
              />
              <label htmlFor="highIncome" className="text-sm font-medium text-text-primary cursor-pointer">
                Мой совокупный годовой доход больше 5 млн руб. (ставка 15%)
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-surface-secondary rounded-xl border border-border-default">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent-primary" />
              Результат расчета
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border-default">
                <span className="text-text-secondary">Необлагаемый лимит (вычет):</span>
                <span className="font-bold text-accent-success">{formatCurrency(results.nonTaxableBase)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-border-default">
                <span className="text-text-secondary">Сумма, с которой берется налог:</span>
                <span className="font-bold text-text-primary">{formatCurrency(results.taxableBase)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border-default">
                <span className="text-text-secondary">Ставка НДФЛ:</span>
                <span className="font-bold text-text-primary">{results.taxRate}%</span>
              </div>

              <div className="mt-6 p-4 bg-accent-error/10 rounded-xl border border-accent-error/20">
                <div className="text-sm text-accent-error font-medium mb-1">Налог к уплате (до 1 декабря):</div>
                <div className="text-3xl font-black text-accent-error">
                  {formatCurrency(results.taxAmount)}
                </div>
              </div>

              {results.taxAmount === 0 && (
                <div className="flex items-start gap-2 p-3 bg-accent-success/10 text-accent-success rounded-lg text-sm mt-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>Вам не нужно платить налог. Ваш доход от процентов не превысил необлагаемый лимит ({formatCurrency(results.nonTaxableBase)}).</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-accent-primary/5 rounded-xl border border-accent-primary/20">
            <Coins className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-text-primary">
              <p className="font-medium mb-1">Важно знать:</p>
              <ul className="list-disc pl-4 space-y-1 text-text-secondary mt-1">
                <li>Банки сами передают данные в налоговую до 1 февраля.</li>
                <li>Вам придет уведомление в кабинете налогоплательщика осенью.</li>
                <li>Оплатить налог нужно самостоятельно до 1 декабря следующего года.</li>
                <li>Налог удерживается только с <strong>процентов</strong>, сумма самого вклада не облагается!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
