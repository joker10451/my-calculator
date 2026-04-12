import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Download, Share2, Shield, Home, Heart, GraduationCap, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { formatMoney } from '@/lib/utils';

export function TaxDeductionCalculator() {
  const { toast } = useToast();
  const [deductionType, setDeductionType] = useState<'property' | 'social' | 'education' | 'medical' | 'pension'>('property');
  const [expense, setExpense] = useState(2000000);
  const [income, setIncome] = useState(1200000);
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    let maxBase = 0;
    let label = '';
    let description = '';

    switch (deductionType) {
      case 'property':
        maxBase = 2000000;
        label = 'Имущественный вычет (покупка жилья)';
        description = 'Максимум 260 000 ₽ (13% от 2 млн ₽) + до 390 000 ₽ за проценты по ипотеке';
        break;
      case 'social':
        maxBase = 110000;
        label = 'Социальный вычет (лечение, фитнес)';
        description = 'Максимум 14 300 ₽ (13% от 110 000 ₽)';
        break;
      case 'education':
        maxBase = 110000;
        label = 'Вычет за обучение';
        description = 'Максимум 14 300 ₽ (13% от 110 000 ₽) за себя или ребёнка (50 000 ₽)';
        break;
      case 'medical':
        maxBase = 110000;
        label = 'Вычет за лечение';
        description = 'Максимум 14 300 ₽ (13% от 110 000 ₽). За дорогостоящее лечение — без лимита';
        break;
      case 'pension':
        maxBase = 110000;
        label = 'Вычет за пенсионные взносы';
        description = 'Максимум 14 300 ₽ (13% от 110 000 ₽)';
        break;
    }

    const actualBase = Math.min(expense, maxBase);
    const taxPaid = income * 0.13;
    const refund = Math.min(actualBase * 0.13, taxPaid);
    const canGetFull = refund >= actualBase * 0.13;

    return {
      maxBase,
      actualBase,
      refund: Math.round(refund),
      maxRefund: Math.round(maxBase * 0.13),
      taxPaid: Math.round(taxPaid),
      label,
      description,
      canGetFull,
    };
  }, [deductionType, expense, income]);

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('Расчёт налогового вычета', 20, 25);
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(`Тип: ${result.label}`, 20, 45);
    doc.text(`Расходы: ${formatMoney(expense)} ₽`, 20, 55);
    doc.text(`НДФЛ уплачен: ${formatMoney(result.taxPaid)} ₽/год`, 20, 65);
    doc.setDrawColor(200);
    doc.line(20, 75, 190, 75);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('К возврату:', 20, 90);
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129);
    doc.text(`${formatMoney(result.refund)} ₽`, 20, 110);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Сформировано на Schitay.ru — ${new Date().toLocaleDateString('ru-RU')}`, 20, 280);
    doc.save(`налоговый-вычет_${deductionType}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'Успех!', description: 'PDF-отчёт сформирован.' });
  };

  const handleShare = async () => {
    const text = `Могу вернуть ${formatMoney(result.refund)} ₽ налогового вычета! Посчитай свой на Считай.RU`;
    if (navigator.share) {
      await navigator.share({ title: 'Налоговый вычет', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Скопировано!', description: 'Текст скопирован в буфер обмена' });
    }
  };

  const icons: Record<string, typeof Home> = {
    property: Home,
    social: Heart,
    education: GraduationCap,
    medical: Heart,
    pension: Wallet,
  };
  const Icon = icons[deductionType] || Home;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
          <Shield className="w-4 h-4" />
          Верните деньги от государства
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
          Калькулятор <span className="text-emerald-600">налогового вычета</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Узнайте, сколько денег вы можете вернуть от государства за покупку жилья, лечение, обучение и другие расходы.
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

            {/* Deduction Type */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-bold text-slate-700">Тип вычета</label>
              {[
                { value: 'property' as const, label: 'Покупка жилья', icon: Home },
                { value: 'social' as const, label: 'Лечение / фитнес', icon: Heart },
                { value: 'education' as const, label: 'Обучение', icon: GraduationCap },
                { value: 'medical' as const, label: 'Дорогостоящее лечение', icon: Heart },
                { value: 'pension' as const, label: 'Пенсионные взносы', icon: Wallet },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setDeductionType(t.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    deductionType === t.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <t.icon className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="font-bold text-sm text-slate-900">{t.label}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Expense */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Ваши расходы</label>
                <span className="text-sm font-black text-emerald-600">{formatMoney(expense)} ₽</span>
              </div>
              <input
                type="range"
                min={10000}
                max={deductionType === 'property' ? 10000000 : 500000}
                step={10000}
                value={expense}
                onChange={(e) => setExpense(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Income */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Годовой доход (до НДФЛ)</label>
                <span className="text-sm font-black text-blue-600">{formatMoney(income)} ₽</span>
              </div>
              <input
                type="range"
                min={100000}
                max={10000000}
                step={50000}
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <button
              onClick={() => setShowResult(true)}
              className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-lg rounded-2xl hover:from-emerald-700 hover:to-emerald-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-200/50"
            >
              Рассчитать вычет
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {!showResult ? (
            <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200 min-h-[500px]">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-700 mb-2">Введите параметры</h3>
                <p className="text-slate-500 font-medium">Выберите тип вычета и укажите расходы</p>
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
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs">{result.label}</span>
                  </div>
                  <div className="text-5xl md:text-6xl font-black mb-2 tracking-tight">
                    {formatMoney(result.refund)} ₽
                  </div>
                  <p className="text-emerald-100 text-lg font-medium mb-6">
                    можно вернуть от государства
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-xs text-emerald-100 font-medium mb-1">Макс. возврат</div>
                      <div className="text-2xl font-black">{formatMoney(result.maxRefund)} ₽</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-xs text-emerald-100 font-medium mb-1">НДФЛ уплачен</div>
                      <div className="text-2xl font-black">{formatMoney(result.taxPaid)} ₽</div>
                    </div>
                  </div>
                  {!result.canGetFull && (
                    <div className="mt-4 bg-amber-500/20 rounded-xl p-3 border border-amber-400/30">
                      <p className="text-amber-100 text-sm font-medium">
                        ⚠️ Вашего уплаченного НДФЛ недостаточно для полного вычета. Остаток можно перенести на следующий год.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Детализация</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">{result.description}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Ваши расходы</span>
                    <span className="font-black text-slate-900">{formatMoney(expense)} ₽</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">База для вычета</span>
                    <span className="font-black text-slate-900">{formatMoney(result.actualBase)} ₽</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-900 font-bold">К возврату (13%)</span>
                    <span className="font-black text-emerald-600 text-xl">{formatMoney(result.refund)} ₽</span>
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
