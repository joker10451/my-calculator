import { useState, useMemo } from 'react';
import { Wallet, Clock, Shield, CreditCard, Zap, CheckCircle, ArrowRight, Star, Gift, Percent, Phone, AlertTriangle, ChevronRight } from 'lucide-react';
import { AffiliateLink } from '@/components/AffiliateLink';
import { SEO, generateFAQSchema } from '@/components/SEO';
import { AFFILIATE_LINKS } from '@/config/affiliateLinks';
import { generateHowToSchema } from '@/utils/seoSchemas';
import { SITE_URL } from '@/shared/constants';

const OFFER_KEY = 'joymoney-loan';
const OFFER = AFFILIATE_LINKS[OFFER_KEY];

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
      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
        <Percent className="w-5 h-5 text-emerald-600" />
        Калькулятор займа
      </h3>

      <div className="space-y-5">
        {/* First loan toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsFirst(true)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              isFirst ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200/50' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Первый займ (0%)
          </button>
          <button
            onClick={() => setIsFirst(false)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              !isFirst ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Повторный
          </button>
        </div>

        {/* Amount */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-slate-700">Сумма займа</label>
            <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{amount.toLocaleString('ru-RU')} ₽</span>
          </div>
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
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-slate-700">Срок (дней)</label>
            <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{days}</span>
          </div>
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
                      ? `bg-${p.color}-600 text-white shadow-sm`
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
        <div className={`rounded-2xl p-5 border-2 ${
          result.isFree
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">К возврату</div>
              <div className={`text-2xl font-black ${result.isFree ? 'text-emerald-600' : 'text-slate-900'}`}>
                {result.totalRepayment.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">Процент</div>
              <div className="text-2xl font-black text-slate-900">{result.totalInterest.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">Ставка/день</div>
              <div className="text-lg font-black text-slate-900">{result.dailyRate}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">В день</div>
              <div className="text-lg font-black text-slate-900">{result.perDay.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>
          {result.isFree && (
            <div className="mt-3 flex items-center gap-2 text-emerald-700 font-bold text-xs bg-white/60 rounded-lg px-3 py-2">
              <CheckCircle className="w-3 h-3" />
              Бесплатно при погашении за {days} дней!
            </div>
          )}
          {result.promoDiscount > 0 && (
            <div className="mt-2 text-amber-600 font-bold text-xs flex items-center gap-1">
              <Gift className="w-3 h-3" />
              Скидка {result.promoDiscount}% по промокоду
            </div>
          )}
        </div>

        <AffiliateLink
          href={OFFER.url}
          partnerName={OFFER.bankId}
          productType={OFFER.productType || 'loan'}
          offerId={OFFER_KEY}
          placement="result_block"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-lg py-4 rounded-2xl hover:from-emerald-700 hover:to-emerald-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-200/50"
        >
          Получить займ
          <ArrowRight className="w-5 h-5" />
        </AffiliateLink>
      </div>
    </div>
  );
}

export default function JoyMoneyPage() {
  const faqSchema = generateFAQSchema([
    { question: 'Что такое «Первый займ 0%»?', answer: 'При первом займе в JoyMoney вы не платите проценты, если погасите займ за 14 дней. При погашении на 22+ день начисляется процент за весь срок по ставке 0,8% в день.' },
    { question: 'Какие документы нужны?', answer: 'Паспорт РФ и СНИЛС. Никаких справок о доходах, поручителей или визитов в офис.' },
    { question: 'Можно ли получить займ с плохой кредитной историей?', answer: 'Да, JoyMoney одобряет займы даже при наличии открытых кредитов или займов в других МФО.' },
    { question: 'Что делать, если не успеваю погасить?', answer: 'Вы можете бесплатно продлить займ или получить индивидуальную схему погашения при просрочке.' },
    { question: 'Как быстро приходят деньги?', answer: 'После одобрения заявки деньги поступают на банковскую карту в течение нескольких минут.' },
  ]);

  const howToSchema = generateHowToSchema(
    'Как получить займ в JoyMoney',
    'Пошаговая инструкция по получению онлайн займа в JoyMoney за 5 минут',
    `${SITE_URL}/joy-money`,
    [
      { name: 'Откройте форму JoyMoney', text: 'Нажмите «Получить займ» и заполните заявку', url: `${SITE_URL}/joy-money#start` },
      { name: 'Заполните заявку', text: 'Укажите паспортные данные и СНИЛС', url: `${SITE_URL}/joy-money#apply` },
      { name: 'Получите решение', text: 'Решение принимается за 2 минуты автоматически', url: `${SITE_URL}/joy-money#decision` },
      { name: 'Получите деньги', text: 'Деньги поступят на банковскую карту', url: `${SITE_URL}/joy-money#receive` },
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO
        title="JoyMoney — займ за 5 минут, первый займ 0% до 30 000 ₽"
        description="Получите займ в JoyMoney за 5 минут. Первый займ под 0% до 30 000 ₽. Без справок, поручителей и визитов в офис. Деньги на карту мгновенно."
        keywords="займ онлайн, первый займ 0%, joymoney займ, микрозайм на карту, займ без отказа, быстрые деньги 2026"
        canonical={`${SITE_URL}/joy-money`}
        structuredData={[faqSchema, howToSchema]}
      />
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
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
            <AffiliateLink
              href={OFFER.url}
              partnerName={OFFER.bankId}
              productType={OFFER.productType || 'loan'}
              offerId={OFFER_KEY}
              placement="hero"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-emerald-700 font-black text-xl py-5 px-12 rounded-2xl hover:bg-emerald-50 hover:scale-105 transition-all shadow-2xl"
            >
              Получить займ
              <ArrowRight className="w-6 h-6" />
            </AffiliateLink>
            <p className="text-sm mt-4 opacity-70">Решение за 2 минуты • Деньги на карту</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Benefits */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Почему JoyMoney</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">Сервис онлайн займов, который всегда поможет</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: 'За 5 минут', desc: 'Заполните заявку и получите деньги на карту. Весь процесс — онлайн.' },
              { icon: Percent, title: 'Первый займ 0%', desc: 'Погасите за 14 дней — не платите ни рубля процентов.' },
              { icon: Shield, title: 'Без отказов', desc: 'Одобряем даже с открытыми кредитами в других МФО.' },
              { icon: Clock, title: 'Продление бесплатно', desc: 'Не успеваете? Бесплатно продлите займ или получите индивидуальный график.' },
              { icon: Gift, title: 'Акции и призы', desc: 'Розыгрыши по пятницам, промокоды на скидку до 100%.' },
              { icon: CreditCard, title: 'До 100 000 ₽', desc: 'При повторных займах сумма увеличивается. Лимит растёт с каждым разом.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:border-slate-200 transition-all">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calculator + How to */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid lg:grid-cols-2 gap-8">
            <LoanCalculator />
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-black text-slate-900 mb-6">Как получить займ?</h3>
              <div className="space-y-4">
                {[
                  'Нажмите «Получить займ» и заполните заявку JoyMoney',
                  'Заполните заявку — паспорт РФ и СНИЛС',
                  'Получите решение за 2 минуты',
                  'Деньги поступят на банковскую карту',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">{i + 1}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 font-medium">{step}</span>
                      {i < 3 && <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Requirements */}
              <div className="mt-6 bg-white rounded-xl p-4 border border-emerald-100">
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Требования
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Гражданство РФ',
                    'Возраст 18–71 год',
                    'Паспорт РФ + СНИЛС',
                    'Банковская карта',
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      {req}
                    </div>
                  ))}
                </div>
              </div>

              <AffiliateLink
                href={OFFER.url}
                partnerName={OFFER.bankId}
                productType={OFFER.productType || 'loan'}
                offerId={OFFER_KEY}
                placement="result_block"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-black text-lg py-4 rounded-2xl hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-200/50"
              >
                Получить займ
                <ArrowRight className="w-5 h-5" />
              </AffiliateLink>
            </div>
          </div>
        </div>

        {/* Promo codes */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Промокоды</h2>
          <p className="text-slate-500 text-center mb-10">Скидка на ставку при повторном займе</p>
          <div className="grid md:grid-cols-3 gap-4">
            {PROMO_CODES.map((promo, i) => (
              <div key={i} className={`bg-${promo.color}-50 rounded-2xl border-2 border-${promo.color}-200 p-6 text-center`}>
                <div className={`text-4xl font-black text-${promo.color}-600 mb-1`}>-{promo.discount}%</div>
                <div className="text-xs text-slate-500 font-medium mb-3">скидка на ставку</div>
                <div className="bg-white rounded-xl px-4 py-3 font-mono font-black text-slate-900 text-lg border border-slate-200">
                  {promo.code}
                </div>
                <p className="text-xs text-slate-400 mt-2">На займы до 29 000 ₽</p>
              </div>
            ))}
          </div>
        </div>

        {/* Repayment methods */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Способы погашения</h2>
          <p className="text-slate-500 text-center mb-10">Выберите удобный способ</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: CreditCard, label: 'Банковская карта', desc: 'Онлайн оплата на сайте' },
              { icon: Wallet, label: 'Сбербанк / Тинькофф', desc: 'Через приложение банка' },
              { icon: Phone, label: 'QIWI', desc: 'Кошелёк и терминалы' },
              { icon: ArrowRight, label: 'По реквизитам', desc: 'Перевод с банковского счёта' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-md hover:border-slate-200 transition-all">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{item.label}</h3>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Частые вопросы</h2>
          <p className="text-slate-500 text-center mb-10">Ответы на главные вопросы</p>
          <div className="space-y-3">
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
                a: 'Вы можете бесплатно продлить займ или получить индивидуальную схему погашения при просрочке.',
              },
              {
                q: 'Как быстро приходят деньги?',
                a: 'После одобрения заявки деньги поступают на банковскую карту в течение нескольких минут.',
              },
            ].map((item, i) => (
              <details key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <summary className="p-5 cursor-pointer font-bold text-slate-900 flex items-center gap-3 list-none hover:bg-slate-50 transition-colors">
                  {item.q}
                </summary>
                <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
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
            <AffiliateLink
              href={OFFER.url}
              partnerName={OFFER.bankId}
              productType={OFFER.productType || 'loan'}
              offerId={OFFER_KEY}
              placement="footer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-emerald-700 font-black text-xl py-5 px-12 rounded-2xl hover:bg-emerald-50 hover:scale-105 transition-all shadow-2xl"
            >
              Получить займ в JoyMoney
              <ArrowRight className="w-6 h-6" />
            </AffiliateLink>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-400 pb-8">
          <p>Не является офертой. Займы выдаются ООО МКК «Джой Мани». Подробности на сайте joy.money.</p>
          {OFFER.erid && <p className="mt-1">Реклама • erid: {OFFER.erid}</p>}
        </div>
      </div>
    </div>
  );
}
