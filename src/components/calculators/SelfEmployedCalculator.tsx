import { useState, useMemo } from 'react';
import { Calculator, Download, Share2, Shield, Wallet, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';

function formatMoney(v: number): string {
  return Math.round(v).toLocaleString('ru-RU');
}

export function SelfEmployedCalculator() {
  const { toast } = useToast();
  const [income, setIncome] = useState(100000);
  const [regime, setRegime] = useState<'self-employed' | 'ip-usn' | 'ip-patent'>('self-employed');
  const [hasEmployees, setHasEmployees] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    let tax = 0;
    let insurance = 0;
    let netIncome = 0;
    let effectiveRate = 0;
    let details = '';

    if (regime === 'self-employed') {
      if (hasEmployees) {
        tax = income * 0.06;
        details = '6% от дохода (как ИП на УСН)';
      } else {
        tax = income * 0.04;
        details = '4% от дохода (самозанятый без сотрудников)';
      }
      insurance = 0;
      netIncome = income - tax;
      effectiveRate = (tax / income) * 100;
    } else if (regime === 'ip-usn') {
      tax = income * 0.06;
      insurance = 49500 / 12;
      netIncome = income - tax - insurance;
      effectiveRate = ((tax + insurance) / income) * 100;
      details = '6% от дохода + страховые взносы';
    } else {
      tax = income * 0.06;
      insurance = 49500 / 12;
      netIncome = income - tax - insurance;
      effectiveRate = ((tax + insurance) / income) * 100;
      details = 'Патентная система (стоимость патента зависит от региона)';
    }

    return {
      tax: Math.round(tax),
      insurance: Math.round(insurance),
      netIncome: Math.round(netIncome),
      effectiveRate: Math.round(effectiveRate * 10) / 10,
      details,
      totalPayments: Math.round(tax + insurance),
    };
  }, [income, regime, hasEmployees]);

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('Расчёт налогов для самозанятых/ИП', 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(`Доход: ${formatMoney(income)} ₽/мес`, 20, 45);
    doc.text(`Режим: ${regime === 'self-employed' ? 'Самозанятость' : regime === 'ip-usn' ? 'ИП на УСН' : 'ИП на патенте'}`, 20, 55);

    doc.setDrawColor(200);
    doc.line(20, 65, 190, 65);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text('Результат', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Налог: ${formatMoney(result.tax)} ₽/мес`, 20, 95);
    doc.text(`Страховые взносы: ${formatMoney(result.insurance)} ₽/мес`, 20, 105);
    doc.text(`Чистый доход: ${formatMoney(result.netIncome)} ₽/мес`, 20, 115);
    doc.text(`Эффективная ставка: ${result.effectiveRate}%`, 20, 125);

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Сформировано на Schitay.ru — ${new Date().toLocaleDateString('ru-RU')}`, 20, 280);
    doc.save(`налоги_${regime}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'Успех!', description: 'PDF-отчёт сформирован.' });
  };

  const handleShare = async () => {
    const text = `Мой чистый доход как ${regime === 'self-employed' ? 'самозанятого' : 'ИП'}: ${formatMoney(result.netIncome)} ₽/мес при доходе ${formatMoney(income)} ₽. Посчитай свой на Считай.RU`;
    if (navigator.share) {
      await navigator.share({ title: 'Налоги самозанятых', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Скопировано!', description: 'Текст скопирован в буфер обмена' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
          <Shield className="w-4 h-4" />
          Налоги 2026
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
          Калькулятор налогов <span className="text-emerald-600">самозанятых</span> и ИП
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Рассчитайте налоги и страховые взносы. Сравните режимы: самозанятость, УСН, патент.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Input */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm sticky top-24">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Calculator className="w-5 h-5 text-blue-600" />
              Параметры
            </h2>

            {/* Regime */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-bold text-slate-700">Режим налогообложения</label>
              {[
                { value: 'self-employed' as const, label: 'Самозанятость (НПД)', desc: '4-6% от дохода' },
                { value: 'ip-usn' as const, label: 'ИП на УСН', desc: '6% + страховые взносы' },
                { value: 'ip-patent' as const, label: 'ИП на патенте', desc: 'Фиксированная стоимость' },
              ].map(r => (
                <button
                  key={r.value}
                  onClick={() => setRegime(r.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    regime === r.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">{r.label}</div>
                  <div className="text-xs text-slate-500">{r.desc}</div>
                </button>
              ))}
            </div>

            {/* Income */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Доход в месяц</label>
                <span className="text-sm font-black text-emerald-600">{formatMoney(income)} ₽</span>
              </div>
              <input
                type="range"
                min={10000}
                max={1000000}
                step={5000}
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Employees */}
            {regime === 'self-employed' && (
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEmployees}
                    onChange={(e) => setHasEmployees(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-bold text-slate-700">Есть наёмные сотрудники</span>
                </label>
              </div>
            )}

            <button
              onClick={() => setShowResult(true)}
              className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-lg rounded-2xl hover:from-emerald-700 hover:to-emerald-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-200/50"
            >
              Рассчитать налоги
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {!showResult ? (
            <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200 min-h-[500px]">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-700 mb-2">Введите параметры</h3>
                <p className="text-slate-500 font-medium">Выберите режим налогообложения и укажите доход</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Main Result */}
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs">Чистый доход</span>
                  </div>
                  <div className="text-5xl md:text-6xl font-black mb-2 tracking-tight">
                    {formatMoney(result.netIncome)} ₽
                  </div>
                  <p className="text-emerald-100 text-lg font-medium mb-6">
                    в месяц после налогов
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-xs text-emerald-100 font-medium mb-1">Налог</div>
                      <div className="text-2xl font-black">{formatMoney(result.tax)} ₽</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-xs text-emerald-100 font-medium mb-1">Эфф. ставка</div>
                      <div className="text-2xl font-black">{result.effectiveRate}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Детализация</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Доход</span>
                    <span className="font-black text-slate-900">{formatMoney(income)} ₽</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Налог ({result.details})</span>
                    <span className="font-black text-red-600">-{formatMoney(result.tax)} ₽</span>
                  </div>
                  {result.insurance > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Страховые взносы</span>
                      <span className="font-black text-red-600">-{formatMoney(result.insurance)} ₽</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-900 font-bold">Итого к оплате</span>
                    <span className="font-black text-emerald-600">{formatMoney(result.totalPayments)} ₽</span>
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
