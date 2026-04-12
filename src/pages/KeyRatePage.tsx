import { Link } from 'react-router-dom';
import { Percent, TrendingDown, TrendingUp, ArrowRight, Calculator, Info, Calendar } from 'lucide-react';
import { SEO, generateFAQSchema } from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_URL } from '@/shared/constants';

const KEY_RATE_HISTORY = [
  { date: '2026-04-10', rate: 15.0, change: -1 },
  { date: '2026-02-14', rate: 16.0, change: -2 },
  { date: '2025-12-20', rate: 18.0, change: -2 },
  { date: '2025-10-24', rate: 20.0, change: -1 },
  { date: '2025-07-25', rate: 21.0, change: -1 },
  { date: '2025-06-06', rate: 22.0, change: -2 },
  { date: '2025-04-25', rate: 24.0, change: 0 },
  { date: '2025-03-21', rate: 24.0, change: -1 },
  { date: '2025-02-14', rate: 25.0, change: -2 },
  { date: '2024-12-20', rate: 27.0, change: 2 },
  { date: '2024-10-25', rate: 25.0, change: 2 },
  { date: '2024-07-26', rate: 23.0, change: 2 },
  { date: '2024-04-26', rate: 21.0, change: 1 },
  { date: '2024-03-22', rate: 20.0, change: 0 },
  { date: '2023-12-15', rate: 20.0, change: 2 },
  { date: '2023-07-21', rate: 18.0, change: 2 },
  { date: '2023-04-14', rate: 16.0, change: 0 },
  { date: '2022-09-16', rate: 7.5, change: -1.5 },
  { date: '2022-07-29', rate: 9.0, change: -3 },
  { date: '2022-06-16', rate: 12.0, change: -3 },
  { date: '2022-04-08', rate: 15.0, change: -3 },
  { date: '2022-02-11', rate: 18.0, change: -3 },
  { date: '2021-07-23', rate: 6.5, change: 0 },
];

const CURRENT = KEY_RATE_HISTORY[0];

const FAQ = [
  { question: 'Какая ключевая ставка ЦБ РФ сегодня?', answer: `Ключевая ставка ЦБ РФ на ${new Date(CURRENT.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} составляет ${CURRENT.rate}%.` },
  { question: 'На что влияет ключевая ставка?', answer: 'Ключевая ставка влияет на ставки по ипотеке, кредитам и вкладам. При высокой ставке кредиты дороже, но вклады выгоднее. При низкой — наоборот.' },
  { question: 'Когда ЦБ меняет ставку?', answer: 'Совет директоров ЦБ РФ рассматривает ставку 8 раз в год — примерно раз в 1.5 месяца. Решение принимается на основе инфляции и прогнозов.' },
  { question: 'Что будет со ставкой в 2026 году?', answer: 'Прогнозы аналитиков: ЦБ продолжил цикл снижения ставки. К концу 2026 года возможно снижение до 12-14% при устойчивом замедлении инфляции. Но ЦБ не даёт точных прогнозов.' },
];

export default function KeyRatePage() {
  const faqSchema = generateFAQSchema(FAQ);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <SEO
        title={`Ключевая ставка ЦБ РФ сегодня — ${CURRENT.rate}% | Считай.RU`}
        description={`Ключевая ставка ЦБ РФ на сегодня: ${CURRENT.rate}%. Динамика, влияние на ипотеку, кредиты и вклады. Калькуляторы с учётом актуальной ставки.`}
        keywords="ключевая ставка цб рф сегодня 2026, ставка центробанка, ключевая ставка ипотека, цб рф ставка"
        canonical={`${SITE_URL}/key-rate`}
        structuredData={[faqSchema]}
      />
      <Header />

      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Calendar className="w-4 h-4" />
                Обновлено {new Date(CURRENT.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-4 tracking-tight">
                Ключевая ставка ЦБ РФ
              </h1>
              <div className="text-7xl md:text-8xl font-black text-amber-400 my-6">{CURRENT.rate}%</div>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                На сегодня. Влияет на все ставки по кредитам, ипотеке и вкладам в России.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-12">
              <div className="surface-card p-5 text-center border-t-4 border-t-blue-500">
                <Calculator className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-200 mb-1">Ипотека</h3>
                <p className="text-2xl font-black text-blue-400">от 5%</p>
                <p className="text-xs text-slate-500">IT / семейная / льготная</p>
              </div>
              <div className="surface-card p-5 text-center border-t-4 border-t-emerald-500">
                <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-200 mb-1">Вклады</h3>
                <p className="text-2xl font-black text-emerald-400">до 16%</p>
                <p className="text-xs text-slate-500">Топ ставки банков</p>
              </div>
              <div className="surface-card p-5 text-center border-t-4 border-t-red-500">
                <Percent className="w-5 h-5 text-red-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-200 mb-1">Кредиты</h3>
                <p className="text-2xl font-black text-red-400">от 18%</p>
                <p className="text-xs text-slate-500">Потребительские</p>
              </div>
            </div>

            <div className="surface-card p-6 mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-slate-200">Что значит ключевая ставка для тебя?</h2>
              </div>
              <div className="space-y-3 text-sm text-slate-400">
                <p>Ключевая ставка — это процент, под который ЦБ выдаёт кредиты банкам. От неё зависят <strong className="text-slate-200">все ставки</strong> в экономике:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Высокая ставка → кредиты дорогие, вклады выгодные, инфляция тормозится</li>
                  <li>Низкая ставка → кредиты дешёвые, вклады невыгодные, экономика растёт</li>
                </ul>
                <p>Сейчас ставка <strong className="text-amber-400">{CURRENT.rate}%</strong> — ЦБ снижает её, но она всё ещё <strong className="text-red-400">выше нейтральной</strong>. Вклады ещё выгодные, а кредиты постепенно дешевеют.</p>
              </div>
            </div>

            <div className="surface-card p-6 mb-12">
              <h2 className="text-lg font-bold text-slate-200 mb-4">Динамика ставки</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase">
                      <th className="text-left py-2 pr-4">Дата</th>
                      <th className="text-right py-2 px-4">Ставка</th>
                      <th className="text-right py-2 pl-4">Изменение</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KEY_RATE_HISTORY.slice(0, 12).map((entry, i) => (
                      <tr key={i} className="border-t border-slate-800">
                        <td className="py-2 pr-4 text-slate-300">
                          {new Date(entry.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-2 px-4 text-right font-bold text-slate-200">{entry.rate}%</td>
                        <td className="py-2 pl-4 text-right">
                          {entry.change > 0 && <span className="text-red-400 font-bold flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" />+{entry.change}</span>}
                          {entry.change < 0 && <span className="text-emerald-400 font-bold flex items-center justify-end gap-1"><TrendingDown className="w-3 h-3" />{entry.change}</span>}
                          {entry.change === 0 && <span className="text-slate-500">без изменений</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-lg font-bold text-slate-200 mb-6">Частые вопросы</h2>
              <div className="space-y-3">
                {FAQ.map((item, i) => (
                  <details key={i} className="surface-card overflow-hidden group">
                    <summary className="p-5 cursor-pointer font-bold text-slate-200 flex items-center gap-3 list-none hover:bg-slate-800/50 transition-colors">
                      {item.question}
                    </summary>
                    <div className="px-5 pb-5 text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/calculator/mortgage" className="surface-card surface-card-hover p-5 flex items-center gap-3">
                <Calculator className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-bold text-slate-200">Ипотечный калькулятор</p>
                  <p className="text-xs text-slate-500">С учётом ставки {CURRENT.rate}%</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-500" />
              </Link>
              <Link to="/calculator/deposit" className="surface-card surface-card-hover p-5 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-bold text-slate-200">Калькулятор вкладов</p>
                  <p className="text-xs text-slate-500">Доходность при {CURRENT.rate}%</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-500" />
              </Link>
              <Link to="/calculator/inflation" className="surface-card surface-card-hover p-5 flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm font-bold text-slate-200">Калькулятор инфляции</p>
                  <p className="text-xs text-slate-500">Потеря покупательной способности</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-500" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
