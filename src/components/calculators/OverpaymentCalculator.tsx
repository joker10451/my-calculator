import { useState, useMemo, useEffect } from 'react';
import { Share2, Download, TrendingUp, PiggyBank, AlertTriangle, Calculator, Building2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { generateShareableLink, parseShareableLink } from '@/utils/exportUtils';

interface OverpaymentResult {
  totalPaid: number;
  totalInterest: number;
  overpaymentPercent: number;
  monthlyPayment: number;
  realCost: string;
  equivalentLoss: string;
  yearsToPayOff: number;
  dailyCost: number;
}

const BANK_PROGRAMS = [
  { name: 'Сбербанк', baseRate: 22.5, color: '#21A038' },
  { name: 'ВТБ', baseRate: 22.9, color: '#003B7E' },
  { name: 'Газпромбанк', baseRate: 22.7, color: '#0066CC' },
  { name: 'Альфа-Банк', baseRate: 23.5, color: '#EF3124' },
  { name: 'Росбанк', baseRate: 23.8, color: '#E30611' },
  { name: 'Т-Банк', baseRate: 24.1, color: '#FFDD2D' },
];

const SHOCK_FACTS = [
  (interest: number) => `Вы подарите банку ${interest.toLocaleString('ru-RU')} ₽ — это как выбросить в мусорку`,
  (interest: number) => `Банк заработает на вас ${interest.toLocaleString('ru-RU')} ₽ — больше, чем вы взяли`,
  (daily: number) => `${daily.toLocaleString('ru-RU')} ₽ в день уходит банку — это ${Math.round(daily / 50)} чашек кофе в день`,
  (percent: number) => `Переплата ${percent}% — вы покупаете ${Math.round(percent / 100 + 1)} квартиры по цене одной`,
];

function formatMoney(value: number): string {
  return value.toLocaleString('ru-RU');
}

export function OverpaymentCalculator() {
  const { toast } = useToast();
  const [amount, setAmount] = useState(3000000);
  const [rate, setRate] = useState(22);
  const [term, setTerm] = useState(20);
  const [showResult, setShowResult] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('shock');

  useEffect(() => {
    const params = parseShareableLink();
    if (params) {
      if (typeof params.amount === 'number') setAmount(params.amount);
      if (typeof params.rate === 'number') setRate(params.rate);
      if (typeof params.term === 'number') setTerm(params.term);
    }
  }, []);

  useEffect(() => {
    setShowResult(false);
    setExpandedSection('shock');
  }, [amount, rate, term]);

  const result = useMemo<OverpaymentResult | null>(() => {
    if (amount <= 0 || rate <= 0 || term <= 0) return null;

    const monthlyRate = rate / 100 / 12;
    const months = term * 12;
    const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - amount;
    const overpaymentPercent = (totalInterest / amount) * 100;
    const dailyCost = totalInterest / (term * 365);

    let realCost = '';
    if (overpaymentPercent >= 200) realCost = 'Вы покупаете 3 квартиры по цене одной!';
    else if (overpaymentPercent >= 100) realCost = 'Вы переплачиваете больше, чем взяли в долг';
    else if (overpaymentPercent >= 50) realCost = 'Каждый третий рубль уходит банку';
    else realCost = 'Переплата умеренная, но всё равно ощутимая';

    let equivalentLoss = '';
    if (totalInterest >= 5000000) equivalentLoss = 'Это стоимость новой Toyota Camry';
    else if (totalInterest >= 3000000) equivalentLoss = 'Это стоимость хорошего автомобиля';
    else if (totalInterest >= 1000000) equivalentLoss = 'Это кругосветное путешествие для двоих';
    else if (totalInterest >= 500000) equivalentLoss = 'Это отпуск на Мальдивах каждый год';
    else equivalentLoss = 'Это новый iPhone каждый месяц на весь срок кредита';

    return {
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest),
      overpaymentPercent: Math.round(overpaymentPercent),
      monthlyPayment: Math.round(monthlyPayment),
      realCost,
      equivalentLoss,
      yearsToPayOff: term,
      dailyCost: Math.round(dailyCost),
    };
  }, [amount, rate, term]);

  const shockFact = useMemo(() => {
    if (!result) return '';
    const idx = Math.min(Math.floor(result.overpaymentPercent / 50), SHOCK_FACTS.length - 1);
    return SHOCK_FACTS[idx](
      idx === 0 ? result.totalInterest :
      idx === 1 ? result.totalInterest :
      idx === 2 ? result.dailyCost :
      result.overpaymentPercent
    );
  }, [result]);

  const bestBank = useMemo(() => {
    if (!result) return null;
    const sorted = [...BANK_PROGRAMS].sort((a, b) => a.baseRate - b.baseRate);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const monthlyRateBest = best.baseRate / 100 / 12;
    const monthlyRateWorst = worst.baseRate / 100 / 12;
    const months = term * 12;
    const paymentBest = amount * (monthlyRateBest * Math.pow(1 + monthlyRateBest, months)) / (Math.pow(1 + monthlyRateBest, months) - 1);
    const paymentWorst = amount * (monthlyRateWorst * Math.pow(1 + monthlyRateWorst, months)) / (Math.pow(1 + monthlyRateWorst, months) - 1);
    const savings = Math.round((paymentWorst - paymentBest) * months);
    return { best, worst, savings };
  }, [amount, term]);

  const handleDownload = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38);
    doc.text('Сколько вы подарите банку?', 20, 25);

    doc.setFontSize(32);
    doc.setTextColor(0, 0, 0);
    doc.text(`${formatMoney(result.totalInterest)} ₽`, 20, 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Переплата: ${result.overpaymentPercent}%`, 20, 60);
    doc.text(`Ежемесячный платёж: ${formatMoney(result.monthlyPayment)} ₽`, 20, 70);
    doc.text(`В день банку: ${formatMoney(result.dailyCost)} ₽`, 20, 80);
    doc.text(`Срок: ${result.yearsToPayOff} лет`, 20, 90);

    doc.setDrawColor(200);
    doc.line(20, 100, 190, 100);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text('Реальная стоимость', 20, 115);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(result.realCost, 20, 125);
    doc.text(result.equivalentLoss, 20, 135);

    if (bestBank) {
      doc.setDrawColor(200);
      doc.line(20, 145, 190, 145);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text('Сравнение банков', 20, 160);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Лучший: ${bestBank.best.name} (${bestBank.best.baseRate}%)`, 20, 170);
      doc.text(`Худший: ${bestBank.worst.name} (${bestBank.worst.baseRate}%)`, 20, 180);
      doc.text(`Экономия: ${formatMoney(bestBank.savings)} ₽`, 20, 190);
    }

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Сформировано на Schitay.ru — ${new Date().toLocaleDateString('ru-RU')}`, 20, 280);
    doc.save(`переплата_банку_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'Успех!', description: 'PDF-отчёт успешно сформирован.' });
  };

  const handleShare = async () => {
    if (!result) return;
    const link = generateShareableLink('overpayment', { amount, rate, term });
    if (navigator.share) {
      await navigator.share({ title: 'Переплата банку', text: `Моя переплата: ${formatMoney(result.totalInterest)} ₽`, url: link });
    } else {
      await navigator.clipboard.writeText(link);
      toast({ title: 'Скопировано!', description: 'Ссылка на расчёт скопирована в буфер обмена' });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
          <AlertTriangle className="w-4 h-4" />
          Шокирующая правда об ипотеке
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
          Сколько вы <span className="text-red-600">подарите</span> банку?
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          87% заёмщиков не знают, что переплачивают больше, чем взяли в долг. Проверьте себя.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Input Form — 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm sticky top-24">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Calculator className="w-5 h-5 text-blue-600" />
              Параметры кредита
            </h2>

            {/* Loan Amount */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Сумма кредита</label>
                <span className="text-sm font-black text-blue-600">{formatMoney(amount)} ₽</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full h-14 text-xl font-bold border-2 border-slate-200 rounded-2xl px-5 pr-14 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="3 000 000"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₽</span>
              </div>
              <input
                type="range"
                min={500000}
                max={30000000}
                step={100000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>500 тыс</span>
                <span>30 млн</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Ставка</label>
                <span className="text-sm font-black text-blue-600">{rate}%</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-full h-14 text-xl font-bold border-2 border-slate-200 rounded-2xl px-5 pr-14 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="22"
                  step={0.1}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Term */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Срок</label>
                <span className="text-sm font-black text-blue-600">{term} лет</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={term}
                  onChange={(e) => setTerm(Math.max(1, Math.min(30, Number(e.target.value))))}
                  className="w-full h-14 text-xl font-bold border-2 border-slate-200 rounded-2xl px-5 pr-16 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="20"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">лет</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Calculate Button */}
            <button
              onClick={() => result && setShowResult(true)}
              className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-lg rounded-2xl hover:from-red-700 hover:to-red-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-200/50"
            >
              Узнать правду 💸
            </button>
          </div>
        </div>

        {/* Results — 3 columns */}
        <div className="lg:col-span-3">
          {!showResult || !result ? (
            <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200 min-h-[500px]">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-700 mb-2">Введите параметры кредита</h3>
                <p className="text-slate-500 font-medium">Укажите сумму, ставку и срок, чтобы увидеть реальную переплату</p>
              </div>
            </div>
          ) : (
            <div id="overpayment-report-template" className="space-y-4">
              {/* Shock Result Card */}
              <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl p-8 text-white shadow-2xl shadow-red-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs">Ваш результат</span>
                  </div>
                  <div className="text-5xl md:text-6xl font-black mb-2 tracking-tight">
                    {formatMoney(result.totalInterest)} ₽
                  </div>
                  <p className="text-red-100 text-lg font-medium mb-6">
                    — столько вы подарите банку
                  </p>
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <p className="text-white font-bold text-base italic">
                      «{shockFact}»
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: TrendingUp, value: `${result.overpaymentPercent}%`, label: 'Переплата', color: 'text-red-500', bg: 'bg-red-50' },
                  { icon: PiggyBank, value: `${formatMoney(result.monthlyPayment)} ₽`, label: 'Платёж/мес', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: TrendingUp, value: `${formatMoney(result.dailyCost)} ₽`, label: 'В день банку', color: 'text-amber-500', bg: 'bg-amber-50' },
                  { icon: TrendingUp, value: `${result.yearsToPayOff}`, label: 'Лет кабалы', color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-sm transition-all">
                    <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-xl font-black text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Expandable Sections */}
              <div className="space-y-3">
                {/* Real Cost */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('realcost')}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Info className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-bold text-slate-900">Реальная стоимость</span>
                    </div>
                    {expandedSection === 'realcost' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  {expandedSection === 'realcost' && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                        <p className="text-blue-900 font-bold text-base mb-2">{result.realCost}</p>
                        <p className="text-blue-700 text-sm flex items-start gap-2">
                          <span>💡</span>
                          <span>{result.equivalentLoss}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank Comparison */}
                {bestBank && (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('banks')}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="font-bold text-slate-900">Сравнение банков</span>
                      </div>
                      {expandedSection === 'banks' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>
                    {expandedSection === 'banks' && (
                      <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Лучший банк</div>
                            <div className="text-emerald-900 font-black text-lg">{bestBank.best.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-emerald-700">{bestBank.best.baseRate}%</div>
                          </div>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs text-red-600 font-bold uppercase tracking-wider">Худший банк</div>
                            <div className="text-red-900 font-black text-lg">{bestBank.worst.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-red-700">{bestBank.worst.baseRate}%</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-900 font-bold">Экономия за весь срок</span>
                            <span className="text-emerald-900 font-black text-xl">{formatMoney(bestBank.savings)} ₽</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleShare}
                  className="flex-1 h-14 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Поделиться
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 h-14 bg-white border-2 border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
