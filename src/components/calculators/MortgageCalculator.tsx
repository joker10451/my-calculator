import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Calculator, Home, Info, Share2, Wallet, Download, Calendar,
  TrendingDown, PieChart as ChartIcon, Table as TableIcon, Scale,
  Plus, Trash2, TrendingDown as SavingsIcon, Activity,
  LineChart as LineChartIcon, BarChart3, Percent, Clock
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import useLocalStorage from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { useComparison } from "@/context/ComparisonContext";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { useCalculatorHistory } from "@/hooks/useCalculatorHistory";
import { parseShareableLink } from "@/utils/exportUtils";
import { calculateMortgage, type ExtraPayment } from "@/lib/mortgageCalculations";
import { FeatureCard } from "@/components/calculators/FeatureCard";
import { HowToUseSection } from "@/components/calculators/HowToUseSection";

const MortgageCalculator = () => {
  const { toast } = useToast();
  const { addItem } = useComparison();
  const { addCalculation } = useCalculatorHistory();
  const [price, setPrice] = useLocalStorage("mortgage_price", 5000000);
  const [initialPayment, setInitialPayment] = useLocalStorage("mortgage_initial", 1000000);
  const [isInitialPercent, setIsInitialPercent] = useState(false);
  const [term, setTerm] = useLocalStorage("mortgage_term", 20); // years
  const [rate, setRate] = useLocalStorage("mortgage_rate", 18);
  const [withMatCapital, setWithMatCapital] = useState(false);
  const [paymentType, setPaymentType] = useState<"annuity" | "differentiated">("annuity");
  const [extraPayments, setExtraPayments] = useLocalStorage<ExtraPayment[]>("mortgage_extra_payments", []);

  const MAT_CAPITAL = 934058; // Official for 2026 (first child)

  // Загрузка параметров из расшаренной ссылки
  useEffect(() => {
    const sharedParams = parseShareableLink();
    if (sharedParams) {
      if (sharedParams.price) setPrice(sharedParams.price);
      if (sharedParams.initialPayment) setInitialPayment(sharedParams.initialPayment);
      if (sharedParams.term) setTerm(sharedParams.term);
      if (sharedParams.rate) setRate(sharedParams.rate);
      if (sharedParams.withMatCapital !== undefined) setWithMatCapital(sharedParams.withMatCapital);
      if (sharedParams.paymentType) setPaymentType(sharedParams.paymentType);
    }
  }, []);

  const calculations = useMemo(() => {
    const result = calculateMortgage({
      price,
      initialPayment,
      isInitialPercent,
      term,
      rate,
      withMatCapital,
      paymentType,
      extraPayments,
      MAT_CAPITAL
    });

    // Сохраняем в историю
    if (result.monthlyPayment > 0) {
      addCalculation(
        'mortgage',
        'Ипотечный калькулятор',
        { price, initialPayment, term, rate, withMatCapital, paymentType },
        {
          'Ежемесячный платеж': formatCurrency(result.monthlyPayment),
          'Переплата': formatCurrency(result.totalInterest),
          'Экономия': formatCurrency(result.savings)
        }
      );
    }

    return result;
  }, [price, initialPayment, isInitialPercent, term, rate, withMatCapital, paymentType, extraPayments]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDownload = async () => {
    toast({ title: "Генерация PDF", description: "Пожалуйста, подождите..." });
    const success = await exportToPDF("mortgage-report-template", `расчет_ипотеки_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
    if (success) {
      toast({ title: "Успех!", description: "PDF-отчет успешно сформирован." });
    } else {
      toast({ title: "Ошибка", description: "Не удалось создать PDF.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const text = `Расчет ипотеки: ${formatCurrency(price)}. Платеж: ${formatCurrency(calculations.monthlyPayment)}/мес. Переплата: ${formatCurrency(calculations.totalInterest)}. Экономия: ${formatCurrency(calculations.savings)}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Расчет ипотеки Считай.RU', text }); return; } catch (e) { }
    }
    await navigator.clipboard.writeText(text);
    toast({ title: "Скопировано!" });
  };

  const handleCompare = () => {
    addItem({
      title: `Ипотека: ${formatCurrency(price)}`,
      calculatorId: "mortgage",
      data: {
        monthlyPayment: calculations.monthlyPayment,
        totalOverpayment: calculations.totalInterest,
        totalAmount: calculations.totalAmount,
        loanAmount: calculations.loanAmount
      },
      params: {
        price,
        initialPayment,
        term,
        rate,
        paymentType
      }
    });
    toast({
      title: "Добавлено к сравнению",
      description: "Вы можете сравнить этот расчет с другими на странице сравнения."
    });
  };

  const addExtraPayment = () => {
    const newPayment: ExtraPayment = {
      id: Math.random().toString(36).substr(2, 9),
      amount: 100000,
      type: 'one-time',
      month: 12,
      mode: 'reduce-term'
    };
    setExtraPayments([...extraPayments, newPayment]);
  };

  const removeExtraPayment = (id: string) => {
    setExtraPayments(extraPayments.filter(p => p.id !== id));
  };

  const updateExtraPayment = (id: string, updates: Partial<ExtraPayment>) => {
    setExtraPayments(extraPayments.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleLoadFromHistory = (item: any) => {
    if (item.inputs.price) setPrice(item.inputs.price);
    if (item.inputs.initialPayment) setInitialPayment(item.inputs.initialPayment);
    if (item.inputs.term) setTerm(item.inputs.term);
    if (item.inputs.rate) setRate(item.inputs.rate);
    if (item.inputs.withMatCapital !== undefined) setWithMatCapital(item.inputs.withMatCapital);
    if (item.inputs.paymentType) setPaymentType(item.inputs.paymentType);
  };

  // Подготовка данных для экспорта
  const exportData = calculations.schedule.map(item => ({
    'Месяц': item.month,
    'Платеж': formatCurrency(item.payment),
    'Основной долг': formatCurrency(item.principal),
    'Проценты': formatCurrency(item.interest),
    'Остаток': formatCurrency(item.balance),
    'Досрочный': item.isEarly ? 'Да' : 'Нет'
  }));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Панель действий */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ипотечный калькулятор</h2>
        <div className="flex gap-2">
          <CalculatorHistory
            calculatorType="mortgage"
            onLoadCalculation={handleLoadFromHistory}
          />
          <CalculatorActions
            calculatorId="mortgage"
            calculatorName="Ипотечный калькулятор"
            data={exportData}
            printElementId="mortgage-results"
            shareParams={{
              price,
              initialPayment,
              term,
              rate,
              withMatCapital,
              paymentType
            }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-7 space-y-8">
          <div className="glass-card p-6 space-y-8">
            {/* Price */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-lg flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  Стоимость недвижимости
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="text-right text-xl font-bold text-primary bg-transparent border-none focus:outline-none w-40"
                  />
                </div>
              </div>
              <Slider value={[price]} onValueChange={v => setPrice(v[0])} min={500000} max={50000000} step={100000} />
            </div>

            {/* Initial Payment */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-medium text-slate-600">Первоначальный взнос</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsInitialPercent(!isInitialPercent)}
                    className="text-xs bg-muted px-2 py-1 rounded-md hover:bg-muted/80 transition-colors"
                  >
                    {isInitialPercent ? "%" : "₽"}
                  </button>
                  <span className="font-bold">
                    {isInitialPercent ? `${initialPayment}%` : formatCurrency(initialPayment)}
                  </span>
                </div>
              </div>
              <Slider
                value={[initialPayment]}
                onValueChange={v => setInitialPayment(v[0])}
                min={0}
                max={isInitialPercent ? 90 : price * 0.9}
                step={isInitialPercent ? 1 : 100000}
              />
            </div>

            {/* Term and Rate */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-medium text-slate-600">Срок (лет)</label>
                  <span className="font-bold">{term}</span>
                </div>
                <Slider value={[term]} onValueChange={v => setTerm(v[0])} min={1} max={30} step={1} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-medium text-slate-600">Ставка (%)</label>
                  <span className="font-bold">{rate}%</span>
                </div>
                <Slider value={[rate]} onValueChange={v => setRate(v[0])} min={0.1} max={40} step={0.1} />
              </div>
            </div>

            <div className="pt-4 border-t space-y-6">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    checked={paymentType === "annuity"}
                    onChange={() => setPaymentType("annuity")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">Аннуитетный</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    checked={paymentType === "differentiated"}
                    onChange={() => setPaymentType("differentiated")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">Дифференцированный</span>
                </label>
              </div>

              <label className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
                <input
                  type="checkbox"
                  checked={withMatCapital}
                  onChange={() => setWithMatCapital(!withMatCapital)}
                  className="w-5 h-5 rounded border-primary text-primary"
                />
                <div>
                  <p className="font-bold text-sm">Использовать материнский капитал</p>
                  <p className="text-xs text-muted-foreground">Вычесть {formatCurrency(MAT_CAPITAL)} из суммы долга</p>
                </div>
              </label>
            </div>
          </div>

          {/* Extra Payments Section */}
          <div className="glass-card p-6 space-y-6 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <SavingsIcon className="w-5 h-5 text-primary" />
                Досрочные платежи
              </h4>
              <Button variant="outline" size="sm" onClick={addExtraPayment} className="gap-2">
                <Plus className="w-4 h-4" />
                Добавить
              </Button>
            </div>

            {extraPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 bg-background/50 rounded-xl border border-dashed">
                Добавьте разовые или ежемесячные платежи, чтобы увидеть выгоду.
              </p>
            ) : (
              <div className="space-y-4">
                {extraPayments.map((p) => (
                  <div key={p.id} className="bg-background p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-end md:items-center">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Сумма</label>
                        <input
                          type="number"
                          value={p.amount}
                          onChange={(e) => updateExtraPayment(p.id, { amount: Number(e.target.value) })}
                          className="w-full bg-muted/30 border-none rounded px-2 py-1 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Месяц</label>
                        <input
                          type="number"
                          value={p.month}
                          onChange={(e) => updateExtraPayment(p.id, { month: Number(e.target.value) })}
                          className="w-full bg-muted/30 border-none rounded px-2 py-1 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Тип</label>
                        <select
                          value={p.type}
                          onChange={(e) => updateExtraPayment(p.id, { type: e.target.value as any })}
                          className="w-full bg-muted/30 border-none rounded px-2 py-1 text-xs"
                        >
                          <option value="one-time">Разово</option>
                          <option value="monthly">Ежемесячно</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Режим</label>
                        <select
                          value={p.mode}
                          onChange={(e) => updateExtraPayment(p.id, { mode: e.target.value as any })}
                          className="w-full bg-muted/30 border-none rounded px-2 py-1 text-xs"
                        >
                          <option value="reduce-term">Срок</option>
                          <option value="reduce-payment">Платеж</option>
                        </select>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeExtraPayment(p.id)} className="text-destructive h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Tabs defaultValue="schedule">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="schedule" className="gap-2">
                <TableIcon className="w-4 h-4" />
                График
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-2">
                <LineChartIcon className="w-4 h-4" />
                Динамика
              </TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="mt-4">
              <div className="glass-card p-6 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">№</th>
                        <th className="pb-2 font-medium">Платеж</th>
                        <th className="pb-2 font-medium">Основной долг</th>
                        <th className="pb-2 font-medium">Проценты</th>
                        <th className="pb-2 font-medium">Остаток</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.schedule.slice(0, 100).map((item) => (
                        <tr key={item.month} className={`border-b last:border-0 hover:bg-slate-50 transition-colors ${item.isEarly ? 'bg-green-50/50' : ''}`}>
                          <td className="py-2 text-muted-foreground">{item.month}</td>
                          <td className="py-2 font-semibold">
                            {formatCurrency(item.payment)}
                            {item.isEarly && <span className="ml-2 text-[10px] text-green-600 font-bold uppercase">Досрочно</span>}
                          </td>
                          <td className="py-2">{formatCurrency(item.principal)}</td>
                          <td className="py-2 text-destructive">{formatCurrency(item.interest)}</td>
                          <td className="py-2 text-xs text-muted-foreground">{formatCurrency(item.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="charts" className="mt-4">
              <div className="glass-card p-6 h-[400px]">
                <h4 className="font-bold mb-6 text-center">Прогноз изменения остатка долга (тыс. ₽)</h4>
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={calculations.comparisonData}>
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={24} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ChartTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      name="С досрочными"
                      dataKey="current"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCurrent)"
                    />
                    <Area
                      type="monotone"
                      name="Без досрочных"
                      dataKey="standard"
                      stroke="#94A3B8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Results Sidebar */}
        <div id="mortgage-results" className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 sticky top-24 bg-primary/5 border-primary/20 z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-primary" />
              Итоги расчета
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Ваш платеж</p>
                <div className="text-4xl font-black text-primary animate-count-up">
                  {formatCurrency(calculations.monthlyPayment)}
                </div>
              </div>

              {calculations.savings > 0 && (
                <div className="p-4 bg-green-50 rounded-2xl border border-green-200 animate-fade-in">
                  <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                    <SavingsIcon className="w-5 h-5" />
                    Выгода от досрочных
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-green-600 uppercase font-bold">Экономия</p>
                      <p className="text-xl font-black text-green-700">{formatCurrency(calculations.savings)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-green-600 uppercase font-bold">Срок меньше на</p>
                      <p className="text-xl font-black text-green-700">
                        {Math.floor(calculations.termReductionMonths / 12)}г {calculations.termReductionMonths % 12}м
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary/10">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Всего выплат</p>
                  <p className="font-bold">{formatCurrency(calculations.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Переплата</p>
                  <p className="font-bold text-destructive">{formatCurrency(calculations.totalInterest)}</p>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="h-[200px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Тело', value: calculations.loanAmount, color: '#3b82f6' },
                        { name: 'Проценты', value: calculations.totalInterest, color: '#ef4444' }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <ChartTooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 pt-6 border-t border-primary/10">
                <Button className="w-full gap-2 py-6 text-lg" variant="hero" onClick={handleDownload}>
                  <Download className="w-6 h-6" />
                  Скачать отчет
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-2" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                    Поделиться
                  </Button>
                  <Button variant="secondary" className="gap-2" onClick={handleCompare}>
                    <Scale className="w-4 h-4" />
                    К сравнению
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Возможности калькулятора */}
      <div className="calculator-section">
        <h2 className="section-title">О калькуляторе вкладов</h2>
        <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-12">
          Калькулятор ипотеки поможет вам рассчитать доходность банковского депозита с учетом капитализации процентов и регулярных пополнений. Инструмент использует формулу сложных процентов и позволяет сравнить различные варианты размещения средств в банке.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Calculator}
            title="Расчет доходности с капитализацией процентов"
            description="Точный расчет с учетом сложных процентов"
            gradient="blue"
          />
          <FeatureCard
            icon={TrendingDown}
            title="Учет регулярных пополнений вклада"
            description="Добавляйте ежемесячные взносы для увеличения дохода"
            gradient="green"
          />
          <FeatureCard
            icon={Calendar}
            title="Различные периоды капитализации (ежемесячно, ежеквартально, ежегодно)"
            description="Выберите оптимальную частоту начисления процентов"
            gradient="purple"
          />
          <FeatureCard
            icon={Scale}
            title="Сравнение вкладов с разными условиями"
            description="Сопоставьте несколько предложений банков"
            gradient="orange"
          />
          <FeatureCard
            icon={Percent}
            title="Расчет эффективной процентной ставки"
            description="Узнайте реальную доходность с учетом всех факторов"
            gradient="pink"
          />
          <FeatureCard
            icon={BarChart3}
            title="Детальный график начисления процентов"
            description="Визуализация роста вашего капитала"
            gradient="blue"
          />
        </div>
      </div>

      {/* Как пользоваться */}
      <HowToUseSection
        steps={[
          { title: "Введите начальную сумму вклада" },
          { title: "Укажите процентную ставку (уточните актуальную ставку в банке)" },
          { title: "Выберите срок размещения вклада" },
          { title: "Укажите периодичность капитализации процентов" }
        ]}
      />
    </div>
  );
};

export default MortgageCalculator;
