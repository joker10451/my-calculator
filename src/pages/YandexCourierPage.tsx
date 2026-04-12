import { useState, useMemo } from 'react';
import { Bike, Wallet, Clock, MapPin, Shield, TrendingUp, CheckCircle, ArrowRight, Star, Phone, ChevronRight } from 'lucide-react';
import { AffiliateLink } from '@/components/AffiliateLink';
import { SEO, generateFAQSchema } from '@/components/SEO';
import { AFFILIATE_LINKS } from '@/config/affiliateLinks';
import { generateHowToSchema } from '@/utils/seoSchemas';
import { Link } from 'react-router-dom';

const SITE_URL = 'https://schitay-online.ru';
const COURIER_OFFER_KEY = 'pampadu-offer-31ba9c13';
const COURIER_OFFER = AFFILIATE_LINKS[COURIER_OFFER_KEY] ?? null;

interface IncomeResult {
  dailyIncome: number;
  monthlyIncome: number;
  ordersPerDay: number;
  ordersPerMonth: number;
  bonusPerOrder: number;
}

function CourierIncomeCalculator() {
  const [ordersPerDay, setOrdersPerDay] = useState(15);
  const [daysPerMonth, setDaysPerMonth] = useState(22);
  const [city, setCity] = useState<'moscow' | 'spb' | 'other'>('moscow');

  const rates = useMemo(() => ({
    moscow: { base: 120, bonus: 45 },
    spb: { base: 100, bonus: 35 },
    other: { base: 80, bonus: 25 },
  }), []);

  const result = useMemo<IncomeResult>(() => {
    const rate = rates[city];
    const bonusPerOrder = ordersPerDay >= 10 ? rate.bonus : 0;
    const dailyIncome = ordersPerDay * (rate.base + bonusPerOrder);
    return {
      dailyIncome: Math.round(dailyIncome),
      monthlyIncome: Math.round(dailyIncome * daysPerMonth),
      ordersPerDay,
      ordersPerMonth: ordersPerDay * daysPerMonth,
      bonusPerOrder,
    };
  }, [ordersPerDay, daysPerMonth, city, rates]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        Калькулятор дохода
      </h3>

      <div className="space-y-5">
        {/* City */}
        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 block">Город</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'moscow' as const, label: 'Москва' },
              { value: 'spb' as const, label: 'СПб' },
              { value: 'other' as const, label: 'Другие' },
            ]).map(c => (
              <button
                key={c.value}
                onClick={() => setCity(c.value)}
                className={`py-3 rounded-xl font-bold text-sm transition-all ${
                  city === c.value
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders per day */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-slate-700">Заказов в день</label>
            <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{ordersPerDay}</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={ordersPerDay}
            onChange={(e) => setOrdersPerDay(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>5</span>
            <span>30</span>
          </div>
        </div>

        {/* Days per month */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-slate-700">Рабочих дней</label>
            <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{daysPerMonth}</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={daysPerMonth}
            onChange={(e) => setDaysPerMonth(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-5 border border-blue-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">В день</div>
              <div className="text-2xl font-black text-slate-900">{result.dailyIncome.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">В месяц</div>
              <div className="text-2xl font-black text-emerald-600">{result.monthlyIncome.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">Заказов/мес</div>
              <div className="text-lg font-black text-slate-900">{result.ordersPerMonth}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">Бонус/заказ</div>
              <div className="text-lg font-black text-amber-600">{result.bonusPerOrder > 0 ? `+${result.bonusPerOrder} ₽` : '—'}</div>
            </div>
          </div>
          {result.bonusPerOrder > 0 && (
            <div className="mt-3 flex items-center gap-2 text-blue-700 font-bold text-xs bg-white/60 rounded-lg px-3 py-2">
              <Star className="w-3 h-3" />
              Бонус за 10+ заказов в день включён
            </div>
          )}
        </div>

        <AffiliateLink
          href={COURIER_OFFER?.url}
          partnerName={COURIER_OFFER?.bankId}
          productType={COURIER_OFFER?.productType || 'vacancies'}
          offerId={COURIER_OFFER_KEY}
          placement="result_block"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black text-lg py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-200/50"
        >
          Стать курьером
          <ArrowRight className="w-5 h-5" />
        </AffiliateLink>
      </div>
    </div>
  );
}

export default function YandexCourierPage() {
  const faqSchema = generateFAQSchema([
    { question: 'Можно ли совмещать с учёбой или основной работой?', answer: 'Да, обычно можно выбирать удобные слоты и выходить в удобные дни.' },
    { question: 'Нужен ли собственный транспорт?', answer: 'Не обязательно: обычно доступны пешие и велоформаты, а в ряде городов доступен и автоформат.' },
    { question: 'Какие документы нужны для старта?', answer: 'Обычно требуются удостоверение личности и данные для оформления в приложении.' },
    { question: 'Как быстро можно начать выполнять заказы?', answer: 'После заполнения анкеты и завершения оформления обычно можно начать в ближайшие дни.' },
  ]);

  const howToSchema = generateHowToSchema(
    'Как стать курьером Яндекс.Еда',
    'Пошаговая инструкция по регистрации курьером в Яндекс.Еда / Яндекс.Лавка',
    `${SITE_URL}/courier-yandex`,
    [
      { name: 'Откройте форму', text: 'Нажмите «Стать курьером» и заполните анкету', url: `${SITE_URL}/courier-yandex#start` },
      { name: 'Зарегистрируйтесь', text: 'Заполните заявку и выберите тип доставки (пеший, вело, авто)', url: `${SITE_URL}/courier-yandex#register` },
      { name: 'Заберите сумку', text: 'Придите в курьерский центр и получите термосумку', url: `${SITE_URL}/courier-yandex#bag` },
      { name: 'Начните зарабатывать', text: 'Выполняйте заказы и получайте ежедневные выплаты', url: `${SITE_URL}/courier-yandex#earn` },
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO
        title="Курьер Яндекс.Еда / Яндекс.Лавка — доход до 8 500 ₽/день"
        description="Работа курьером в Яндекс.Еда или Яндекс.Лавка: доход до 8 500 ₽ в день, свободное расписание и ежедневные выплаты."
        keywords="курьер яндекс еда, работа курьером, яндекс лавка курьер, доход курьера, работа с ежедневной оплатой, курьер доставка 2026"
        canonical={`${SITE_URL}/courier-yandex`}
        structuredData={[faqSchema, howToSchema]}
      />
      {/* Hero */}
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 text-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Star className="w-4 h-4" />
              Набор курьеров 2026
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
              Курьер в Яндекс.Еда / Яндекс.Лавка
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-8 max-w-2xl mx-auto opacity-90">
              Доход до 8 500 ₽ в день. Свободное расписание. Ежедневные выплаты.
            </p>
            <AffiliateLink
              href={COURIER_OFFER?.url}
              partnerName={COURIER_OFFER?.bankId}
              productType={COURIER_OFFER?.productType || 'vacancies'}
              offerId={COURIER_OFFER_KEY}
              placement="hero"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-slate-900 text-white font-black text-xl py-5 px-12 rounded-2xl hover:bg-slate-800 hover:scale-105 transition-all shadow-2xl"
            >
              Стать курьером
              <ArrowRight className="w-6 h-6" />
            </AffiliateLink>
            <p className="text-sm mt-4 opacity-70">Онлайн-анкета и быстрый старт</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Benefits */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Преимущества</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">Почему тысячи людей выбирают доставку</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Clock, title: 'Свободное расписание', desc: 'Выбирайте удобные слоты. Работайте когда удобно вам.' },
              { icon: Wallet, title: 'Доход до 8 500 ₽/день', desc: 'Заказы поступают 24/7. Ежедневные выплаты для граждан РФ/ЕАЭС.' },
              { icon: TrendingUp, title: 'Бонусы и акции', desc: 'Дополнительные выплаты за количество заказов и активные часы.' },
              { icon: MapPin, title: 'Удобная зона', desc: 'Выбирайте район доставки. Работайте рядом с домом.' },
              { icon: Bike, title: 'Велокурьеры', desc: 'Скидка на велосипед до 20% по условиям сервиса.' },
              { icon: Shield, title: 'Официальное оформление', desc: 'Самозанятость или договор. Всё прозрачно и легально.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:border-slate-200 transition-all">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-amber-500" />
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
            <CourierIncomeCalculator />
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl border-2 border-amber-200 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-black text-slate-900 mb-6">Как выйти на первые заказы?</h3>
              <div className="space-y-4">
                {[
                  'Заполните анкету и выберите удобный формат доставки',
                  'Дождитесь подтверждения и завершите оформление',
                  'Подготовьтесь к первому выходу (приложение и экипировка)',
                  'Выходите на линию и выполняйте первые заказы',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">{i + 1}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 font-medium">{step}</span>
                      {i < 3 && <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Requirements */}
              <div className="mt-6 bg-white rounded-xl p-4 border border-amber-100">
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  Требования
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Android 8.0+ / iOS 16.5+',
                    'Возраст от 16/18 лет',
                    'Удостоверение личности',
                    'Велокурьеры (скидка 20%)',
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      {req}
                    </div>
                  ))}
                </div>
              </div>

              <AffiliateLink
                href={COURIER_OFFER?.url}
                partnerName={COURIER_OFFER?.bankId}
                productType={COURIER_OFFER?.productType || 'vacancies'}
                offerId={COURIER_OFFER_KEY}
                placement="result_block"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-black text-lg py-4 rounded-2xl hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-200/50"
              >
                Начать сейчас
                <ArrowRight className="w-5 h-5" />
              </AffiliateLink>
            </div>
          </div>
        </div>

        {/* Payment schedule */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">График выплат</h2>
          <p className="text-slate-500 text-center mb-10">Регулярные выплаты по расписанию</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { period: '1–10 число', payout: '15–20 числа', color: 'blue' },
              { period: '11–20 число', payout: '25–30 числа', color: 'amber' },
              { period: '21–31 число', payout: '5–15 след. месяца', color: 'emerald' },
            ].map((item, i) => (
              <div key={i} className={`bg-${item.color}-50 rounded-2xl border-2 border-${item.color}-200 p-6 text-center`}>
                <div className={`text-xs font-black text-${item.color}-600 uppercase tracking-wider mb-2`}>Заработано</div>
                <div className="text-lg font-black text-slate-900 mb-3">{item.period}</div>
                <div className="flex items-center justify-center">
                  <ChevronRight className={`w-4 h-4 text-${item.color}-400`} />
                </div>
                <div className={`text-xs font-black text-${item.color}-600 uppercase tracking-wider mt-2 mb-1`}>Выплата</div>
                <div className="text-lg font-black text-slate-900">{item.payout}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-6">
            РФ, ЕАЭС — ежедневные выплаты (самозанятые). Другие страны — еженедельные выплаты.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Частые вопросы</h2>
          <p className="text-slate-500 text-center mb-10">Ответы на главные вопросы</p>
          <div className="space-y-3">
            {[
              {
                q: 'Можно ли работать не каждый день?',
                a: 'Да, обычно можно выбирать удобные слоты и работать в комфортном графике.',
              },
              {
                q: 'Нужен ли собственный транспорт?',
                a: 'Не обязательно: обычно доступны пешие и велоформаты, а в ряде городов доступен автоформат.',
              },
              {
                q: 'Какой доход можно ожидать?',
                a: 'Доход зависит от города, количества заказов, часов на линии и бонусных программ.',
              },
              {
                q: 'Сколько занимает старт после анкеты?',
                a: 'Обычно от нескольких часов до нескольких дней, в зависимости от города и скорости оформления.',
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
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 md:p-14 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-black mb-4">Готовы начать зарабатывать?</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Выберите удобный график и начните работать в доставке в комфортном режиме
            </p>
            <AffiliateLink
              href={COURIER_OFFER?.url}
              partnerName={COURIER_OFFER?.bankId}
              productType={COURIER_OFFER?.productType || 'vacancies'}
              offerId={COURIER_OFFER_KEY}
              placement="footer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-yellow-500 text-slate-900 font-black text-xl py-5 px-12 rounded-2xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-2xl"
            >
              Стать курьером Яндекс.Еда
              <ArrowRight className="w-6 h-6" />
            </AffiliateLink>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
              <Phone className="w-4 h-4" />
              КЦ Яндекс.Еды: 8 (800) 770-04-11
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-400 pb-8">
          <p>Набор ведётся в сервис доставки, а не по прямому трудовому договору с Яндекс.Еда/Яндекс.Лавка.</p>
          {COURIER_OFFER?.erid && <p className="mt-1">Реклама • erid: {COURIER_OFFER?.erid}</p>}
          <p className="mt-2">
            Ищете другую вакансию?{" "}
            <Link to="/offers?category=vacancies&q=руки" className="text-slate-500 hover:text-slate-300 underline">
              Смотреть вакансию «Сервис Руки»
            </Link>
          </p>
          <p className="mt-1">
            Отдельная страница:{" "}
            <Link to="/ruki-masters" className="text-slate-500 hover:text-slate-300 underline">
              /ruki-masters
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
