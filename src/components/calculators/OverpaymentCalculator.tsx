import { useState, useMemo } from 'react';
import { Share2, Download, TrendingUp, PiggyBank, AlertTriangle, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';

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
  { name: 'Альфа-Банк', baseRate: 23.5, color: '#EF3124' },
  { name: 'Т-Банк', baseRate: 24.1, color: '#FFDD2D' },
  { name: 'Газпромбанк', baseRate: 22.7, color: '#0066CC' },
  { name: 'Росбанк', baseRate: 23.8, color: '#E30611' },
];

const SHOCK_FACTS = [
  (interest: number) => `Вы подарите банку ${interest.toLocaleString('ru-RU')} ₽ — это как выбросить в мусорку`,
  (interest: number) => `Банк заработает на вас ${interest.toLocaleString('ru-RU')} ₽ — больше, чем вы взяли`,
  (daily: number) => `${daily.toLocaleString('ru-RU')} ₽ в день уходит банку — это ${Math.round(daily / 50)} чашек кофе в день`,
  (percent: number) => `Переплата ${percent}% — вы покупаете ${Math.round(percent / 100 + 1)} квартиры по цене одной`,
];

export function OverpaymentCalculator() {
  const { toast } = useToast();
  const [amount, setAmount] = useState(3000000);
  const [rate, setRate] = useState(22);
  const [term, setTerm] = useState(20);
  const [showResult, setShowResult] = useState(false);

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
    if (totalInterest >= 5000000) equivalentLoss = 'Это стоимость новой машины Toyota Camry';
    else if (totalInterest >= 3000000) equivalentLoss = 'Это стоимость хорошего автомобиля';
    else if (totalInterest >= 1000000) equivalentLoss = 'Это стоимость кругосветного путешествия для двоих';
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

  const handleCalculate = () => {
    if (result) setShowResult(true);
  };

  const handleDownload = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38);
    doc.text('Сколько вы подарите банку?', 20, 25);

    doc.setFontSize(32);
    doc.setTextColor(0, 0, 0);
    doc.text(`${result.totalInterest.toLocaleString('ru-RU')} ₽`, 20, 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Переплата: ${result.overpaymentPercent}%`, 20, 60);
    doc.text(`Ежемесячный платёж: ${result.monthlyPayment.toLocaleString('ru-RU')} ₽`, 20, 70);
    doc.text(`В день банку: ${result.dailyCost.toLocaleString('ru-RU')} ₽`, 20, 80);
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
      doc.text(`Экономия: ${bestBank.savings.toLocaleString('ru-RU')} ₽`, 20, 190);
    }

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Сформировано на Schitay.ru — ${new Date().toLocaleDateString('ru-RU')}`, 20, 280);
    doc.save(`переплата_банку_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'Успех!', description: 'PDF-отчёт успешно сформирован.' });
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `Я переплачу банку ${result.totalInterest.toLocaleString('ru-RU')} ₽ по ипотеке 😱 Посчитай свою переплату на Считай.RU`;
    if (navigator.share) {
      await navigator.share({ title: 'Переплата банку', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Скопировано!', description: 'Текст для шеринга скопирован в буфер обмена' });
    }
  };

  const shockFact = useMemo(() => {
    if (!result) return '';
    const idx = Math.floor(result.overpaymentPercent / 50) % SHOCK_FACTS.length;
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

  return (
    <div className="max-w-5xl mx-auto">
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Calculator className="w-6 h-6 text-blue-600" />
              Ваши данные
            </h2>

            {/* Loan Amount */}
            <div className="space-y-3 mb-8">
              <label className="text-base font-bold text-slate-700">Сумма кредита</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full h-16 text-2xl font-bold border-2 border-slate-200 rounded-2xl px-6 pr-16 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="3 000 000"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₽</span>
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
            <div className="space-y-3 mb-8">
              <label className="text-base font-bold text-slate-700">Ставка по ипотеке</label>
              <div className="relative">
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-full h-16 text-2xl font-bold border-2 border-slate-200 rounded-2xl px-6 pr-16 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="22"
                  step={0.1}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">%</span>
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
              <label className="text-base font-bold text-slate-700">Срок кредита</label>
              <div className="relative">
                <input
                  type="number"
                  value={term}
                  onChange={(e) => setTerm(Math.max(1, Math.min(30, Number(e.target.value))))}
                  className="w-full h-16 text-2xl font-bold border-2 border-slate-200 rounded-2xl px-6 pr-16 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="20"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">лет</span>
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
              onClick={handleCalculate}
              className="w-full h-16 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-xl rounded-2xl hover:from-red-700 hover:to-red-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-200"
            >
              Узнать правду 💸
            </button>
          </div>
        </div>

        {/* Results */}
        {showResult && result && (
          <div id="overpayment-report-template" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Shock Result */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-2xl shadow-red-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8" />
                <span className="font-black uppercase tracking-widest text-sm">Ваш результат</span>
              </div>
              <div className="text-5xl md:text-6xl font-black mb-2">
                {result.totalInterest.toLocaleString('ru-RU')} ₽
              </div>
              <p className="text-red-100 text-lg font-medium mb-6">
                — столько вы подарите банку
              </p>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-white font-bold text-base italic">
                  «{shockFact}»
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <TrendingUp className="w-5 h-5 text-red-500 mb-3" />
                <div className="text-2xl font-black text-slate-900">{result.overpaymentPercent}%</div>
                <div className="text-sm text-slate-500 font-medium">переплата</div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <PiggyBank className="w-5 h-5 text-blue-500 mb-3" />
                <div className="text-2xl font-black text-slate-900">{result.monthlyPayment.toLocaleString('ru-RU')} ₽</div>
                <div className="text-sm text-slate-500 font-medium">платёж/мес</div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="text-2xl font-black text-slate-900">{result.dailyCost.toLocaleString('ru-RU')} ₽</div>
                <div className="text-sm text-slate-500 font-medium">в день банку</div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="text-2xl font-black text-slate-900">{result.yearsToPayOff}</div>
                <div className="text-sm text-slate-500 font-medium">лет кабалы</div>
              </div>
            </div>

            {/* Real Cost */}
            <div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-6">
              <h3 className="font-black text-blue-900 text-lg mb-2">Реальная стоимость</h3>
              <p className="text-blue-800 font-bold text-base mb-3">{result.realCost}</p>
              <p className="text-blue-700 text-sm">💡 {result.equivalentLoss}</p>
            </div>

            {/* Best Bank Comparison */}
            {bestBank && (
              <div className="bg-emerald-50 rounded-2xl border-2 border-emerald-100 p-6">
                <h3 className="font-black text-emerald-900 text-lg mb-4 flex items-center gap-2">
                  💡 Можете сэкономить
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium">Лучший банк: {bestBank.best.name}</span>
                    <span className="text-emerald-900 font-black">{bestBank.best.baseRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600 font-medium">Худший: {bestBank.worst.name}</span>
                    <span className="text-red-700 font-black">{bestBank.worst.baseRate}%</span>
                  </div>
                  <div className="border-t border-emerald-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-900 font-bold">Разница за весь срок</span>
                      <span className="text-emerald-900 font-black text-xl">{bestBank.savings.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
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

        {/* Placeholder when no result */}
        {!showResult && (
          <div className="flex items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 min-h-[400px]">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🏦</div>
              <p className="text-slate-500 font-bold text-lg">Введите данные и нажмите<br />«Узнать правду»</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
