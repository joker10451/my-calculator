import { SEO, generateFAQSchema } from '@/components/SEO';
import { generateHowToSchema } from '@/utils/seoSchemas';
import { Shield, Clock, CheckCircle, ArrowRight, FileText, Car, AlertTriangle, Wallet, Phone, Heart } from 'lucide-react';
import { SITE_URL } from '@/shared/constants';

const REFERRAL_LINK = 'https://trk.ppdu.ru/click/mzjtNLs0?erid=2SDnjf2J17q';

export default function ZettaOSGOPPage() {

  const faqSchema = generateFAQSchema([
    { question: 'Что такое ОСГОП для такси?', answer: 'ОСГОП — это обязательное страхование гражданской ответственности перевозчика. Оно защищает пассажиров в случае аварии и выплачивает компенсацию за вред жизни, здоровью и имуществу.' },
    { question: 'Кто обязан оформлять ОСГОП?', answer: 'Все водители и таксопарки, осуществляющие перевозку пассажиров. С 1 сентября 2024 года это требование обязательно для всех.' },
    { question: 'Какой штраф за отсутствие полиса?', answer: 'С 1 ноября 2024 года: для должностных лиц — от 40 000 до 50 000 ₽, для юридических лиц — от 500 000 до 1 000 000 ₽.' },
    { question: 'Сколько стоит полис ОСГОП?', answer: 'Стоимость рассчитывается индивидуально и начинается от 3 392 ₽ в год. Средняя стоимость — около 4 310 ₽.' },
    { question: 'Как быстро придет полис?', answer: 'Оформленный полис будет направлен на вашу электронную почту в течение 5 рабочих дней.' },
  ]);

  const howToSchema = generateHowToSchema(
    'Как оформить ОСГОП для такси онлайн',
    'Пошаговая инструкция по оформлению обязательного страхования перевозчика в Зетта Страхование',
    `${SITE_URL}/insurance/osgop-taxi`,
    [
      { name: 'Откройте форму', text: 'Нажмите кнопку «Оформить полис»', url: REFERRAL_LINK },
      { name: 'Рассчитайте стоимость', text: 'Укажите данные автомобиля и количество мест', url: REFERRAL_LINK },
      { name: 'Оплатите онлайн', text: 'Оплата картой или по счету для юрлиц', url: REFERRAL_LINK },
      { name: 'Получите полис', text: 'Документ придет на email за 5 дней', url: REFERRAL_LINK },
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO
        title="ОСГОП для такси онлайн — обязательная страховка от 3 392 ₽ | Зетта Страхование"
        description="Оформите ОСГОП для такси за 3 минуты. Штрафы до 1 млн ₽ без полиса. Выплаты до 2 млн ₽ пассажирам. Расчет онлайн, полис на почту."
        keywords="ОСГОП для такси, страховка такси, обязательное страхование перевозчика, Зетта Страхование ОСГОП, штраф за отсутствие ОСГОП"
        canonical={`${SITE_URL}/insurance/osgop-taxi`}
        structuredData={[faqSchema, howToSchema]}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Shield className="w-4 h-4" />
              Обязательно с 1 сентября 2024
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
              ОСГОП для такси за 3 минуты
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-8 max-w-2xl mx-auto opacity-90">
              Избегайте штрафов до 1 000 000 ₽. Оформите обязательную страховку перевозчика от 3 392 ₽/год.
            </p>
            <a
              href={REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-yellow-500 text-slate-900 font-black text-xl py-5 px-12 rounded-2xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-2xl"
            >
              Оформить полис
              <ArrowRight className="w-6 h-6" />
            </a>
            <p className="text-sm mt-4 opacity-70">АО «Зетта Страхование» • Лицензия ЦБ РФ</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Fines Alert */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-black text-red-900 mb-2">Штрафы за отсутствие полиса</h3>
              <p className="text-red-800 font-medium">
                С 1 ноября 2024 года: <span className="font-black">40 000 — 50 000 ₽</span> для должностных лиц, <span className="font-black">500 000 — 1 000 000 ₽</span> для юридических лиц.
              </p>
            </div>
          </div>
        </div>

        {/* Coverage */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Что покрывает страховка?</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">Выплаты пассажирам при аварии, независимо от вины водителя</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Смерть пассажира', value: '2 025 000 ₽', desc: 'Максимальная выплата наследникам' },
              { icon: Heart, title: 'Вред здоровью', value: '2 000 000 ₽', desc: 'Компенсация за травмы и лечение' },
              { icon: Wallet, title: 'Имущество', value: '23 000 ₽', desc: 'За повреждение личных вещей' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-8 text-center hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-black text-slate-900 mb-2">{item.value}</div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Почему Зетта Страхование?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Clock, title: 'Оформление за 3 минуты', desc: 'Расчет для одного или нескольких автомобилей онлайн.' },
              { icon: FileText, title: 'Полис на почту', desc: 'Документ придет на email в течение 5 рабочих дней.' },
              { icon: Car, title: 'Для всех типов авто', desc: 'Возраст автомобиля не старше 25 лет.' },
              { icon: CheckCircle, title: 'Изменения онлайн', desc: 'Вносите правки в полис без визита в офис.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 md:p-14 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Wallet className="w-4 h-4" />
              Средняя стоимость: 4 310 ₽
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Оформите полис прямо сейчас</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Стоимость от 3 392 ₽ в год. Удобная оплата картой или по счету.
            </p>
            <a
              href={REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-yellow-500 text-slate-900 font-black text-xl py-5 px-12 rounded-2xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-2xl"
            >
              Рассчитать стоимость
              <ArrowRight className="w-6 h-6" />
            </a>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Поддержка 24/7
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Частые вопросы</h2>
          <p className="text-slate-500 text-center mb-10">Ответы на вопросы об ОСГОП</p>
          <div className="space-y-3">
            {[
              {
                q: 'Кто должен оформлять ОСГОП?',
                a: 'Все таксопарки, ИП и самозанятые, осуществляющие перевозку пассажиров легковым транспортом.',
              },
              {
                q: 'Какие документы нужны?',
                a: 'Паспорт, данные автомобиля (СТС), лицензия на такси (если есть), реквизиты для юрлиц.',
              },
              {
                q: 'Можно ли оформить на несколько машин?',
                a: 'Да, калькулятор позволяет рассчитать стоимость для нескольких автомобилей сразу.',
              },
              {
                q: 'Что будет если не оформить?',
                a: 'Штрафы с 1 ноября 2024 года: от 40 000 ₽ для должностных лиц и от 500 000 ₽ для компаний.',
              },
            ].map((item, i) => (
              <details key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
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

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-400 pb-8">
          <p>АО «Зетта Страхование». Лицензия ЦБ РФ. Стоимость полиса рассчитывается индивидуально. Не является публичной офертой.</p>
        </div>
      </div>
    </div>
  );
}
