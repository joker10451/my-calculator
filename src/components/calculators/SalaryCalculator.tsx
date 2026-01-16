import { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Download, Share2, Info, Wallet, Building2, Coins, PiggyBank, TrendingUp, Scale } from "lucide-react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PSBCardWidget } from "@/components/PSBCardWidget";
import { shouldShowPSBCard, getPSBCardVariant, getPSBCardSource } from "@/lib/psbCardPlacement";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { parseShareableLink } from "@/utils/exportUtils";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";

const SalaryCalculator = () => {
  const { formatCurrency, saveCalculation, addToComparison, showToast } = useCalculatorCommon('salary', 'Зарплатный калькулятор');
  const [salary, setSalary] = useLocalStorage<number>("calc_salary_amount", 100000);

  // Загрузка параметров из расшаренной ссылки
  useEffect(() => {
    const sharedParams = parseShareableLink();
    if (sharedParams && sharedParams.salary) {
      setSalary(sharedParams.salary);
    }
  }, []);

  // Определяем, нужно ли показывать карту ПСБ
  const showPSBCard = shouldShowPSBCard({
    pageType: 'calculator',
    calculatorType: 'salary',
    userHasSalary: true
  });

  const psbCardVariant = getPSBCardVariant({
    pageType: 'calculator'
  });

  const psbCardSource = getPSBCardSource({
    pageType: 'calculator'
  });

  // 2026 Progressive Tax Scale (Russia)
  const calculateTax = (monthlyGross: number) => {
    const yearlyGross = monthlyGross * 12;
    let yearlyTax = 0;

    if (yearlyGross <= 5000000) {
      yearlyTax = yearlyGross * 0.13;
    } else {
      yearlyTax = (5000000 * 0.13) + (yearlyGross - 5000000) * 0.15;
    }

    return {
      yearly: Math.round(yearlyTax),
      monthly: Math.round(yearlyTax / 12),
      effectiveRate: (yearlyTax / yearlyGross * 100).toFixed(1)
    };
  };

  const taxDetails = useMemo(() => calculateTax(salary), [salary]);
  const taxAmount = taxDetails.monthly;
  const netSalary = useMemo(() => salary - taxAmount, [salary, taxAmount]);
  const yearlyNet = useMemo(() => netSalary * 12, [netSalary]);
  const yearlyTax = taxDetails.yearly;
  const effectiveRate = taxDetails.effectiveRate;

  // Сохранение в историю
  useEffect(() => {
    if (salary > 0 && netSalary > 0) {
      saveCalculation(
        { salary },
        {
          'Зарплата': formatCurrency(salary),
          'НДФЛ': formatCurrency(taxAmount),
          'На руки': formatCurrency(netSalary)
        }
      );
    }
  }, [salary, netSalary, taxAmount, saveCalculation, formatCurrency]);

  const chartData = [
    { name: 'На руки', value: netSalary, color: '#3b82f6' },
    { name: 'НДФЛ', value: taxAmount, color: '#ef4444' },
  ];

  const handleDownload = async () => {
    showToast("Генерация PDF", "Пожалуйста, подождите...");
    const success = await exportToPDF("salary-report-template", `расчет_зарплаты_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
    if (success) {
      showToast("Успех!", "PDF-отчет успешно сформирован и скачан.");
    } else {
      showToast("Ошибка", "Не удалось создать PDF-отчет.", "destructive");
    }
  };

  const handleShare = async () => {
    const text = [
      'Расчет зарплаты',
      `Зарплата (Gross): ${formatCurrency(salary)}`,
      `Налог (${effectiveRate}%): -${formatCurrency(taxAmount)}`,
      `На руки (Net): ${formatCurrency(netSalary)}`,
      `В год на руки: ${formatCurrency(yearlyNet)}`
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Расчет зарплаты',
          text: text,
        });
        return;
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(text);
      showToast("Скопировано!", "Расчет сохранен в буфер обмена.");
    } catch (err) {
      showToast("Ошибка", "Не удалось скопировать.", "destructive");
    }
  };

  const handleCompare = () => {
    addToComparison(
      `Зарплата: ${formatCurrency(salary)}`,
      {
        monthlyPayment: netSalary,
        totalOverpayment: taxAmount,
        loanAmount: salary,
        taxRate: parseFloat(effectiveRate)
      },
      {
        salary,
        taxRate: parseFloat(effectiveRate)
      }
    );
  };

  const handleLoadFromHistory = (item: { inputs: { salary?: number } }) => {
    if (item.inputs.salary) {
      setSalary(item.inputs.salary);
    }
  };

  // Данные для экспорта
  const exportData = [{
    'Зарплата (Gross)': formatCurrency(salary),
    'НДФЛ': formatCurrency(taxAmount),
    'Ставка': `${effectiveRate}%`,
    'На руки (Net)': formatCurrency(netSalary),
    'В год на руки': formatCurrency(yearlyNet),
    'В год налог': formatCurrency(yearlyTax)
  }];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Панель действий */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Зарплатный калькулятор</h2>
        <div className="flex gap-2">
          <CalculatorHistory
            calculatorType="salary"
            onLoadCalculation={handleLoadFromHistory}
          />
          <CalculatorActions
            calculatorId="salary"
            calculatorName="Зарплатный калькулятор"
            data={exportData}
            printElementId="salary-results"
            shareParams={{ salary }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-3 space-y-8">

          {/* Salary Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-base font-medium">Зарплата (до вычета)</label>
              <div className="relative">
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="text-right text-lg font-semibold bg-transparent border-none focus:outline-none w-40"
                />
                <span className="absolute right-0 top-0 pointer-events-none text-muted-foreground opacity-0">₽</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-2 border-primary/20 rounded-xl bg-card">
              <span className="text-2xl font-bold">{formatCurrency(salary)}</span>
              <span className="text-sm text-muted-foreground">в месяц</span>
            </div>
            <Slider
              value={[salary]}
              onValueChange={(v) => setSalary(v[0])}
              min={15000}
              max={1000000}
              step={1000}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>15 000 ₽</span>
              <span>1 000 000 ₽</span>
            </div>
          </div>


          {/* Info Block */}
          <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
            <Info className="w-5 h-5 flex-shrink-0 text-primary" />
            <p>
              Стандартная ставка НДФЛ в России — 13%. С 2021 года действует прогрессивная шкала: 15% с доходов свыше 5 млн ₽/год.
            </p>
          </div>

        </div>

        {/* Results */}
        <div id="salary-results" className="lg:col-span-2">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Результаты
            </h3>

            {/* Net Salary */}
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-1">
                На руки (в месяц)
              </div>
              <div className="calc-result animate-count-up">
                {formatCurrency(netSalary)}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Оклад (Gross)
                </span>
                <span className="font-semibold">{formatCurrency(salary)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  НДФЛ ({effectiveRate}%)
                </span>
                <span className="font-semibold text-destructive">
                  -{formatCurrency(taxAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-dashed">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  В год на руки
                </span>
                <span className="font-semibold text-primary">
                  {formatCurrency(yearlyNet)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <PiggyBank className="w-4 h-4" />
                  Налогов за год
                </span>
                <span className="font-semibold text-destructive">
                  {formatCurrency(yearlyTax)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Button variant="hero" className="w-full gap-2" onClick={handleDownload}>
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

      {/* Visualization */}
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h4 className="font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Распределение дохода
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase font-bold">Выгода</p>
              <p className="text-lg font-bold text-blue-500">{Math.round((netSalary / salary) * 100)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase font-bold">Налог</p>
              <p className="text-lg font-bold text-red-500">{Math.round((taxAmount / salary) * 100)}%</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <Wallet className="w-8 h-8" />
          </div>
          <p className="text-muted-foreground mb-2">
            При зарплате <span className="font-bold text-foreground">{formatCurrency(salary)}</span> вы получаете
          </p>
          <div className="text-3xl font-bold text-primary mb-1">
            {formatCurrency(netSalary)}
          </div>
          <p className="text-sm text-muted-foreground">
            каждый месяц на карту
          </p>
        </div>
      </div>

      {/* Рекомендация карты ПСБ для зарплатных клиентов */}
      {showPSBCard && (
        <div className="mt-12 animate-fade-in relative z-0">
          <h3 className="text-xl font-semibold mb-4">Рекомендация для зарплатных клиентов</h3>
          <PSBCardWidget
            source={psbCardSource}
            variant={psbCardVariant}
            className="max-w-2xl relative z-0"
          />
        </div>
      )}

      {/* Hidden PDF Template */}
      <div className="fixed -left-[9999px] top-0">
        <div id="salary-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
          <div className="flex justify-between items-start mb-12 border-b-2 border-primary/20 pb-8">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Считай.RU</h1>
              <p className="text-slate-500 uppercase tracking-widest text-sm font-semibold">Официальный финансовый расчет</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">ОТЧЕТ №{Math.floor(1000 + Math.random() * 9000)}</p>
              <p className="text-slate-500">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-primary" />
              Результаты расчета зарплаты и НДФЛ
            </h2>

            <div className="grid grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-slate-500 text-sm mb-1 uppercase font-semibold">На руки в месяц</p>
                <p className="text-4xl font-black text-primary">{formatCurrency(netSalary)}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-slate-500 text-sm mb-1 uppercase font-semibold">На руки в год</p>
                <p className="text-4xl font-black text-slate-800">{formatCurrency(yearlyNet)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-12">
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Оклад (Gross)</span>
              <span className="font-bold text-slate-900">{formatCurrency(salary)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Эффективная ставка НДФЛ</span>
              <span className="font-bold text-slate-900">{effectiveRate}%</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100 italic">
              <span className="text-slate-600 font-medium">Сумма налога (в месяц)</span>
              <span className="font-bold text-destructive">-{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200 bg-slate-50 px-4 rounded-lg mt-4">
              <span className="text-slate-800 font-bold">ИТОГО К ВЫПЛАТЕ (Net)</span>
              <span className="font-extrabold text-primary text-xl">{formatCurrency(netSalary)}</span>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <p className="text-slate-400 text-xs text-center italic">
              Данный расчет является информационным. Schitay.ru не несет ответственности за точность законодательных изменений.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;
