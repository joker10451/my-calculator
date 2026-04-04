import { useState, useMemo } from 'react';
import { Wallet, Clock, Shield, CreditCard, Zap, CheckCircle, ArrowRight, Star, Gift, Percent, Phone, AlertTriangle } from 'lucide-react';

const REFERRAL_LINK = 'https://trk.ppdu.ru/click/ZaiOEayY?erid=Kra23k98b';

const PROMO_CODES = [
  { code: 'JOYMONEY10', discount: 10, color: 'blue' },
  { code: 'JOYMONEY15', discount: 15, color: 'purple' },
  { code: 'JOYMONEY20', discount: 20, color: 'emerald' },
];

function LoanCalculator() {
  const [amount, setAmount] = useState(15000);
  const [days, setDays] = useState(14);
  const [isFirst, setIsFirst] = useState(true);
  const [promoCode, setPromoCode] = useState('');

  const result = useMemo(() => {
    const dailyRate = isFirst ? 0 : 0.8;
    const promoDiscount = PROMO_CODES.find(p => p.code === promoCode.toUpperCase())?.discount ?? 0;
    const effectiveRate = Math.max(0, dailyRate - (dailyRate * promoDiscount / 100));
    const totalInterest = Math.round(amount * effectiveRate / 100 * days);
    const totalRepayment = amount + totalInterest;
    const isFree = isFirst && days <= 14 && totalInterest === 0;

    return {
      totalInterest,
      totalRepayment,
      dailyRate: effectiveRate,
      isFree,
      promoDiscount,
      perDay: Math.round(totalRepayment / days),
    };
  }, [amount, days, isFirst, promoCode]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
        <Percent className="w-6 h-6 text-emerald-600" />
        Калькулятор займа
      </h3>

      <div className="space-y-6">
        {/* First loan toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsFirst(true)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              isFirst ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Первый займ (0%)
          </button>
          <button
            onClick={() => setIsFirst(false)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              !isFirst ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Повторный
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 flex justify-between">
            <span>Сумма займа</span>
            <span className="text-emerald-600 font-black">{amount.toLocaleString('ru-RU')} ₽</span>
          </label>
          <input
            type="range"
            min={1000}
            max={isFirst ? 30000 : 100000}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1 000 ₽</span>
            <span>{isFirst ? '30 000' : '100 000'} ₽</span>
          </div>
        </div>

        {/* Days */}
        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 flex justify-between">
            <span>Срок (дней)</span>
            <span className="text-emerald-600 font-black">{days}</span>
          </label>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Promo code */}
        {!isFirst && (
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              Промокод
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {PROMO_CODES.map(p => (
                <button
                  key={p.code}
                  onClick={() => setPromoCode(p.code)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    promoCode === p.code
                      ? `bg-${p.color}-600 text-white`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  -{p.discount}%
                </button>
              ))}
            </div>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Введите промокод"
              className="w-full h-12 border-2 border-slate-200 rounded-xl px-4 text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
            />
          </div>
        )}

        {/* Results */}
        <div className={`rounded-2xl p-6 border-2 ${
          result.isFree
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500 font-medium">К возврату</div>
              <div className={`text-3xl font-black ${result.isFree ? 'text-emerald-600' : 'text-slate-900'}`}>
                {result.totalRepayment.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium">Процент</div>
              <div className="text-3xl font-black text-slate-900">{result.totalInterest.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium">Ставка/день</div>
              <div className="text-xl font-black text-slate-900">{result.dailyRate}%</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium">В день</div>
              <div className="text-xl font-black text-slate-900">{result.perDay.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>
          {result.isFree && (
            <div className="mt-3 flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle className="w-4 h-4" />
              Бесплатно при погашении за {days} дней!
            </div>
          )}
          {result.promoDiscount > 0 && (
            <div className="mt-2 text-amber-600 font-bold text-sm">
              🎁 Скидка {result.promoDiscount}% по промокоду
            </div>
          )}
        </div>

        <a
          href={REFERRAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-lg py-4 rounded-2xl hover:from-emerald-700 hover:to-emerald-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-200"
        >
          Получить займ
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

export default function JoyMoneyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Star className="w-4 h-4" />
              Первый займ 0%
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
              JoyMoney — займ за 5 минут
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-8 max-w-2xl mx-auto opacity-90">
              Первый займ под 0% до 30 000 ₽. Без справок, поручителей и визитов в офис.
            </p>
            <a
              href={REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-emerald-700 font-black text-xl py-5 px-12 rounded-2xl hover:bg-emerald-50 hover:scale-105 transition-all shadow-2xl"
            >
              Получить займ
              <ArrowRight className="w-6 h-6" />
            </a>
            <p className="text-sm mt-4 opacity-70">Решение за 2 минуты • Деньги на карту</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Benefits */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Почему JoyMoney</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'За 5 минут', desc: 'Заполните заявку и получите деньги на карту. Весь процесс — онлайн.' },
              { icon: Percent, title: 'Первый займ 0%', desc: 'Погасите за 14 дней — не платите ни рубля процентов.' },
              { icon: Shield, title: 'Без отказов', desc: 'Одобряем даже с открытыми кредитами в других МФО.' },
              { icon: Clock, title: 'Продление бесплатно', desc: 'Не успеваете? Бесплатно продлите займ или получите индивидуальный график.' },
              { icon: Gift, title: 'Акции и призы', desc: 'Розыгрыши по пятницам, промокоды на скидку до 100%.' },
              { icon: CreditCard, title: 'До 100 000 ₽', desc: 'При повторных займах сумма увеличивается. Лимит растёт с каждым разом.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition-all">
                <item.icon className="w-10 h-10 text-emerald-500 mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calculator + How to */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid lg:grid-cols-2 gap-8">
            <LoanCalculator />
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200 p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Как получить займ?</h3>
              <div className="space-y-4">
                {[
                  'Нажмите «Получить займ» и перейдите на сайт JoyMoney',
                  'Заполните заявку — паспорт РФ и СНИЛС',
                  'Получите решение за 2 минуты',
                  'Деньги поступят на банковскую карту',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">{i + 1}</div>
                    <p className="text-slate-700 font-medium">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-white rounded-xl p-4 border border-emerald-100">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Требования
                </h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Гражданство РФ
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Возраст от 18 до 71 года
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Паспорт РФ + СНИЛС
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Банковская карта
                  </div>
                </div>
              </div>

              <a
                href={REFERRAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-black text-lg py-4 rounded-2xl hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-200"
              >
                Получить займ
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Promo codes */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Промокоды</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {PROMO_CODES.map((promo, i) => (
              <div key={i} className={`bg-${promo.color}-50 rounded-2xl border-2 border-${promo.color}-200 p-8 text-center`}>
                <div className={`text-4xl font-black text-${promo.color}-600 mb-2`}>-{promo.discount}%</div>
                <div className="text-sm text-slate-500 font-medium mb-4">скидка на ставку</div>
                <div className="bg-white rounded-xl px-4 py-3 font-mono font-black text-slate-900 text-lg border border-slate-200">
                  {promo.code}
                </div>
                <p className="text-xs text-slate-400 mt-2">Действует на займы до 29 000 ₽</p>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-6">
            Промокоды действуют только на повторные займы. Также возможны уникальные промокоды для партнёров.
          </p>
        </div>

        {/* Repayment methods */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Способы погашения</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CreditCard, label: 'Банковская карта', desc: 'Онлайн оплата на сайте' },
              { icon: Wallet, label: 'Сбербанк / Тинькофф', desc: 'Через приложение банка' },
              { icon: Phone, label: 'QIWI', desc: 'Кошелёк и терминалы' },
              { icon: ArrowRight, label: 'По реквизитам', desc: 'Перевод с банковского счёта' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-lg transition-all">
                <item.icon className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">{item.label}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Частые вопросы</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Что такое «Первый займ 0%»?',
                a: 'При первом займе в JoyMoney вы не платите проценты, если погасите займ за 14 дней. При погашении на 22+ день начисляется процент за весь срок по ставке 0,8% в день.',
              },
              {
                q: 'Какие документы нужны?',
                a: 'Паспорт РФ и СНИЛС. Никаких справок о доходах, поручителей или визитов в офис.',
              },
              {
                q: 'Можно ли получить займ с плохой кредитной историей?',
                a: 'Да, JoyMoney одобряет займы даже при наличии открытых кредитов или займов в других МФО.',
              },
              {
                q: 'Что делать, если не успеваю погасить?',
                a: 'Вы можете бесплатно продлить займ или получить индивидуальную схему погашения при просрочке. Свяжитесь с поддержкой JoyMoney.',
              },
              {
                q: 'Как использовать промокод?',
                a: 'Введите промокод при оформлении повторного займа. Промокоды действуют на займы до 29 000 ₽ и дают скидку до 100% на ставку.',
              },
              {
                q: 'Как быстро приходят деньги?',
                a: 'После одобрения заявки деньги поступают на банковскую карту в течение нескольких минут.',
              },
            ].map((item, i) => (
              <details key={i} className="bg-white rounded-2xl border border-slate-200 group">
                <summary className="p-6 cursor-pointer font-bold text-slate-900 text-lg flex items-center gap-3 list-none">
                  {item.q}
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 md:p-14 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-black mb-4">Нужны деньги прямо сейчас?</h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
              Первый займ до 30 000 ₽ без процентов. Решение за 2 минуты, деньги на карту.
            </p>
            <a
              href={REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-emerald-700 font-black text-xl py-5 px-12 rounded-2xl hover:bg-emerald-50 hover:scale-105 transition-all shadow-2xl"
            >
              Получить займ в JoyMoney
              <ArrowRight className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-400 pb-8">
          <p>Не является офертой. Процентные ставки и условия могут изменяться. Подробности на сайте joy.money. Займы выдаются ООО МКК «Джой Мани».</p>
        </div>
      </div>
    </div>
  );
}
