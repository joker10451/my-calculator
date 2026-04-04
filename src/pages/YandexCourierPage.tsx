import { useState, useMemo } from 'react';
import { Bike, Wallet, Clock, MapPin, Smartphone, Shield, TrendingUp, CheckCircle, ArrowRight, Star, Calendar, Phone } from 'lucide-react';

const REFERRAL_LINK = 'https://trk.ppdu.ru/click/o6eCET0k?erid=CQH36pWzJqVGXC5oLP8WVVNCNqJmbhiUPijGiu4zpwPd7G';

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
      <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        Калькулятор дохода
      </h3>

      <div className="space-y-6">
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
                    ? 'bg-blue-600 text-white'
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
          <label className="text-sm font-bold text-slate-700 mb-2 flex justify-between">
            <span>Заказов в день</span>
            <span className="text-blue-600">{ordersPerDay}</span>
          </label>
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
          <label className="text-sm font-bold text-slate-700 mb-2 flex justify-between">
            <span>Рабочих дней в месяц</span>
            <span className="text-blue-600">{daysPerMonth}</span>
          </label>
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
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-6 border border-blue-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500 font-medium">В день</div>
              <div className="text-3xl font-black text-slate-900">{result.dailyIncome.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium">В месяц</div>
              <div className="text-3xl font-black text-emerald-600">{result.monthlyIncome.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium">Заказов/мес</div>
              <div className="text-xl font-black text-slate-900">{result.ordersPerMonth}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium">Бонус/заказ</div>
              <div className="text-xl font-black text-amber-600">{result.bonusPerOrder > 0 ? `+${result.bonusPerOrder} ₽` : '—'}</div>
            </div>
          </div>
          {result.bonusPerOrder > 0 && (
            <p className="text-xs text-blue-600 font-medium mt-3">🔥 Бонус за 10+ заказов в день включён</p>
          )}
        </div>

        <a
          href={REFERRAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black text-lg py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
        >
          Стать курьером
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

export default function YandexCourierPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 text-slate-900">
        <div className="container mx-auto px-4 py-16 md:py-24">
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
            <a
              href={REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-slate-900 text-white font-black text-xl py-5 px-12 rounded-2xl hover:bg-slate-800 hover:scale-105 transition-all shadow-2xl"
            >
              Стать курьером
              <ArrowRight className="w-6 h-6" />
            </a>
            <p className="text-sm mt-4 opacity-70">Регистрация через партнёра сервиса</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Benefits */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Преимущества</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Свободное расписание', desc: 'Выбирайте удобные слоты. Работайте когда удобно вам.' },
              { icon: Wallet, title: 'Доход до 8 500 ₽/день', desc: 'Заказы поступают 24/7. Ежедневные выплаты для граждан РФ/ЕАЭС.' },
              { icon: TrendingUp, title: 'Бонусы и акции', desc: 'Дополнительные выплаты за количество заказов и активные часы.' },
              { icon: MapPin, title: 'Удобная зона', desc: 'Выбирайте район доставки. Работайте рядом с домом.' },
              { icon: Bike, title: 'Велокурьеры', desc: 'Скидка на велосипед до 20% для партнёров.' },
              { icon: Shield, title: 'Официальное оформление', desc: 'Самозанятость или договор. Всё прозрачно и легально.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition-all">
                <item.icon className="w-10 h-10 text-yellow-500 mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calculator + CTA */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid lg:grid-cols-2 gap-8">
            <CourierIncomeCalculator />
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl border-2 border-amber-200 p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Как начать?</h3>
              <div className="space-y-4">
                {[
                  'Нажмите «Стать курьером» и перейдите на сайт',
                  'Зарегистрируйтесь и выберите тип доставки',
                  'Заберите сумку в курьерском центре',
                  'Начните выполнять заказы и зарабатывать',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">{i + 1}</div>
                    <p className="text-slate-700 font-medium">{step}</p>
                  </div>
                ))}
              </div>
              <a
                href={REFERRAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-black text-lg py-4 rounded-2xl hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-200"
              >
                Начать сейчас
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Требования</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Smartphone, label: 'Android 8.0+ или iPhone iOS 16.5+' },
              { icon: MapPin, label: 'Возраст: от 16/18 лет (зависит от города)' },
              { icon: Shield, label: 'Удостоверение личности' },
              { icon: Bike, label: 'Велокурьеры приветствуются (скидка 20%)' },
              { icon: Calendar, label: 'Мед. книжка: 1 500–2 000 ₽ (за свой счёт)' },
              { icon: Clock, label: 'До 55 лет (пеший/вело), до 65 (авто)' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-6">
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700 font-semibold">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment schedule */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">График выплат</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { period: '1–10 число', payout: '15–20 числа', color: 'blue' },
              { period: '11–20 число', payout: '25–30 числа', color: 'amber' },
              { period: '21–31 число', payout: '5–15 след. месяца', color: 'emerald' },
            ].map((item, i) => (
              <div key={i} className={`bg-${item.color}-50 rounded-2xl border-2 border-${item.color}-200 p-8 text-center`}>
                <div className={`text-sm font-black text-${item.color}-600 uppercase tracking-wider mb-2`}>Заработано</div>
                <div className="text-xl font-black text-slate-900 mb-4">{item.period}</div>
                <div className={`text-sm font-black text-${item.color}-600 uppercase tracking-wider mb-2`}>Выплата</div>
                <div className="text-xl font-black text-slate-900">{item.payout}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-6">
            РФ, ЕАЭС (Киргизия, Казахстан, Армения, Белоруссия) — ежедневные выплаты (самозанятые). Граждане других стран — еженедельные выплаты.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Частые вопросы</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Как закрепляется курьер за мной?',
                a: 'Кандидат закрепляется за ссылкой на 7 дней при условии первой регистрации. Если за 7 дней не активировался — можно зарегистрировать снова.',
              },
              {
                q: 'Кто считается новым курьером?',
                a: 'Новым считается курьер, который выполнил последний заказ в Яндекс.Еде не менее 60 дней назад. Если срок не прошёл — не подлежит оплате.',
              },
              {
                q: 'Что такое целевое действие (ЦД)?',
                a: 'ЦД считается выполненным, если с момента регистрации и выполнения 5 заказов прошло не более 14 дней. Чем больше заказов — тем выше оплата.',
              },
              {
                q: 'На какой срок закрепляется реферал?',
                a: 'Cookie TTL — 60 дней. Холд — 10 дней. Максимальное время обработки — 15 дней.',
              },
              {
                q: 'Курьер не появился в личном кабинете, что делать?',
                a: 'Вероятно, кандидат уже проходил регистрацию ранее. Если «лид зарегистрирован», то 7 дней он закреплён за вашим источником.',
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
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 md:p-14 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-black mb-4">Готовы начать зарабатывать?</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Зарегистрируйтесь через партнёра и начните доставлять уже сегодня
            </p>
            <a
              href={REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-yellow-500 text-slate-900 font-black text-xl py-5 px-12 rounded-2xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-2xl"
            >
              Стать курьером Яндекс.Еда
              <ArrowRight className="w-6 h-6" />
            </a>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                КЦ Яндекс.Еды: 8 (800) 770-04-11
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-400 pb-8">
          <p>Набор ведётся к партнёру сервиса Яндекс.Еда/Яндекс.Лавка, а не в сервис напрямую. Денежные средства выплачиваются партнёром. Все условия сотрудничества определяются партнёром.</p>
        </div>
      </div>
    </div>
  );
}
