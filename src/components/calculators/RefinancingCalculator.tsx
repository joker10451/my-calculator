import { useState, useMemo } from 'react';
import { TrendingDown, PiggyBank, Calendar, Percent, ArrowDown, ArrowRight, Download, Share2, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';

interface RefiResult {
  oldMonthly: number;
  newMonthly: number;
  monthlySaving: number;
  totalOldPayment: number;
  totalNewPayment: number;
  totalSaving: number;
  oldRate: number;
  newRate: number;
}

function formatMoney(v: number): string {
  return Math.round(v).toLocaleString('ru-RU');
}

function calcMonthlyPayment(amount: number, annualRate: number, months: number): number {
  if (annualRate === 0) return amount / months;
  const r = annualRate / 100 / 12;
  return amount * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function RefinancingCalculator() {
  const { toast } = useToast();
  const [balance, setBalance] = useState(2000000);
  const [oldRate, setOldRate] = useState(18);
  const [newRate, setNewRate] = useState(14);
  const [remainingMonths, setRemainingMonths] = useState(180);
  const [showResult, setShowResult] = useState(false);

  const result = useMemo<RefiResult | null>(() => {
    if (balance <= 0 || oldRate <= 0 || newRate <= 0 || remainingMonths <= 0) return null;
    if (newRate >= oldRate) return null;

    const oldMonthly = calcMonthlyPayment(balance, oldRate, remainingMonths);
    const newMonthly = calcMonthlyPayment(balance, newRate, remainingMonths);
    const monthlySaving = oldMonthly - newMonthly;
    const totalOldPayment = oldMonthly * remainingMonths;
    const totalNewPayment = newMonthly * remainingMonths;
    const totalSaving = totalOldPayment - totalNewPayment;

    return {
      oldMonthly,
      newMonthly,
      monthlySaving,
      totalOldPayment,
      totalNewPayment,
      totalSaving,
      oldRate,
      newRate,
    };
  }, [balance, oldRate, newRate, remainingMonths]);

  const handleDownload = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('Расчёт выгоды рефинансирования', 20, 25);

    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text(`Ставка: ${result.oldRate}% → ${result.newRate}%`, 20, 45);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Остаток долга: ${formatMoney(balance)} ₽`, 20, 58);
    doc.text(`Срок: ${Math.round(remainingMonths / 12)} лет (${remainingMonths} мес.)`, 20, 68);

    doc.setDrawColor(200);
    doc.line(20, 78, 190, 78);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text('Результат', 20, 95);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Старый платёж: ${formatMoney(result.oldMonthly)} ₽/мес`, 20, 110);
    doc.text(`Новый платёж: ${formatMoney(result.newMonthly)} ₽/мес`, 20, 120);
    doc.text(`Экономия в месяц: ${formatMoney(result.monthlySaving)} ₽`, 20, 130);
    doc.text(`Общая экономия: ${formatMoney(result.totalSaving)} ₽`, 20, 140);

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Сформировано на Schitay.ru — ${new Date().toLocaleDateString('ru-RU')}`, 20, 280);
    doc.save(`рефинансирование_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'Успех!', description: 'PDF-отчёт сформирован.' });
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `Сэкономлю ${formatMoney(result.totalSaving)} ₽ на рефинансировании! Посчитай свою выгоду на Считай.RU`;
    if (navigator.share) {
      await navigator.share({ title: 'Рефинансирование', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Скопировано!', description: 'Текст скопирован в буфер обмена' });
    }
  };

  const rateDiff = oldRate - newRate;
  const isProfitable = result && result.totalSaving > 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
          <TrendingDown className="w-4 h-4" />
          Снизьте переплату по кредиту
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
          Сколько <span className="text-emerald-600">сэкономите</span> на рефинансировании?
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          При ставках 22%+ рефинансирование может сэкономить сотни тысяч рублей. Посчитайте свою выгоду.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm sticky top-24">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              Параметры кредита
            </h2>

            {/* Balance */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Остаток долга</label>
                <span className="text-sm font-black text-blue-600">{formatMoney(balance)} ₽</span>
              </div>
              <input
                type="range"
                min={100000}
                max={20000000}
                step={50000}
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Old Rate */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Текущая ставка</label>
                <span className="text-sm font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg">{oldRate}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={0.1}
                value={oldRate}
                onChange={(e) => setOldRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* New Rate */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Новая ставка</label>
                <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{newRate}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={0.1}
                value={newRate}
                onChange={(e) => setNewRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              {rateDiff > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 rounded-lg px-3 py-2">
                  <ArrowDown className="w-3 h-3" />
                  Снижение на {rateDiff.toFixed(1)} п.п.
                </div>
              )}
              {rateDiff <= 0 && (
                <div className="text-amber-600 text-xs font-bold bg-amber-50 rounded-lg px-3 py-2">
                  ⚠️ Новая ставка должна быть ниже текущей
                </div>
              )}
            </div>

            {/* Remaining Months */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Осталось месяцев</label>
                <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{remainingMonths} ({Math.round(remainingMonths / 12)} лет)</span>
              </div>
              <input
                type="range"
                min={12}
                max={360}
                step={12}
                value={remainingMonths}
                onChange={(e) => setRemainingMonths(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <button
              onClick={() => isProfitable && setShowResult(true)}
              disabled={!isProfitable}
              className={`w-full h-14 font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-2 ${
                isProfitable
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-200/50'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              Рассчитать выгоду
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {!showResult || !result ? (
            <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200 min-h-[500px]">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingDown className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-700 mb-2">Введите параметры</h3>
                <p className="text-slate-500 font-medium">Укажите остаток долга, текущую и новую ставку</p>
              </div>
            </div>
          ) : (
            <div id="refinancing-report" className="space-y-4">
              {/* Main Result */}
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs">Ваша экономия</span>
                  </div>
                  <div className="text-5xl md:text-6xl font-black mb-2 tracking-tight">
                    {formatMoney(result.totalSaving)} ₽
                  </div>
                  <p className="text-emerald-100 text-lg font-medium mb-6">
                    — сэкономите за весь срок
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-xs text-emerald-100 font-medium mb-1">В месяц</div>
                      <div className="text-2xl font-black">{formatMoney(result.monthlySaving)} ₽</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-xs text-emerald-100 font-medium mb-1">Ставка</div>
                      <div className="text-2xl font-black">{result.oldRate}% → {result.newRate}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Percent, value: `${result.oldRate}% → ${result.newRate}%`, label: 'Ставка', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: TrendingDown, value: `${formatMoney(result.oldMonthly)} ₽`, label: 'Старый платёж', color: 'text-red-500', bg: 'bg-red-50' },
                  { icon: ArrowDown, value: `${formatMoney(result.newMonthly)} ₽`, label: 'Новый платёж', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { icon: Calendar, value: `${remainingMonths} мес.`, label: 'Срок', color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-sm transition-all">
                    <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-sm font-black text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Comparison */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">Сравнение платежей</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Старый кредит</div>
                      <div className="text-lg font-black text-red-600">{formatMoney(result.totalOldPayment)} ₽</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">Новый кредит</div>
                      <div className="text-lg font-black text-emerald-600">{formatMoney(result.totalNewPayment)} ₽</div>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-900 font-bold">Экономия</span>
                      <span className="text-emerald-900 font-black text-xl">{formatMoney(result.totalSaving)} ₽</span>
                    </div>
                  </div>
                </div>
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
