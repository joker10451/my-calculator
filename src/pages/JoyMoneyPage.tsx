import { useState, useMemo } from 'react';
import { Wallet, Clock, Shield, CreditCard, Zap, CheckCircle, ArrowRight, Star, Gift, Percent, Phone, AlertTriangle, ChevronRight } from 'lucide-react';
import { AffiliateLink } from '@/components/AffiliateLink';
import { SEO, generateFAQSchema } from '@/components/SEO';
import { AFFILIATE_LINKS } from '@/config/affiliateLinks';
import { generateHowToSchema } from '@/utils/seoSchemas';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SITE_URL = 'https://schitay-online.ru';
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
    <>
      <Header />
      <div className="min-h-screen bg-slate-950">
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
                Получить деньги
                <ArrowRight className="w-6 h-6" />
              </AffiliateLink>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="max-w-4xl mx-auto text-center text-xs text-white/40 pb-8">
            <p>Не является офертой. Займы выдаются ООО МКК «Джой Мани». Подробности на сайте joy.money.</p>
            {OFFER.erid && <p className="mt-1">Реклама • erid: {OFFER.erid}</p>}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
