import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO, generateFAQSchema } from '@/components/SEO';
import { BANKS, generateBankDepositSEOTemplate } from '@/lib/seoPages';
import { Building2, Star, CheckCircle, ArrowRight, PiggyBank } from 'lucide-react';

const SITE_URL = 'https://schitay-online.ru';

export default function BankDepositPage() {
  const { bank } = useParams<{ bank: string }>();
  const bankData = BANKS.find(b => b.bankSlug === bank);

  if (!bankData) return <Navigate to="/calculator/deposit" replace />;

  const seo = generateBankDepositSEOTemplate(bankData);
  const faqSchema = generateFAQSchema(seo.faq);

  const exampleDeposit = 1000000;
  const monthlyRate = bankData.depositRate / 100 / 12;
  const yearlyIncome = exampleDeposit * (bankData.depositRate / 100);
  const withCapitalization = exampleDeposit * Math.pow(1 + monthlyRate, 12) - exampleDeposit;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical={`${SITE_URL}/bank/${bankData.bankSlug}/deposit`}
        structuredData={[faqSchema]}
      />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <PiggyBank className="w-4 h-4" />
              Вклады 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">{seo.h1}</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">{seo.intro}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-12">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-sm text-slate-500 font-medium mb-1">Ставка по вкладу</div>
                <div className="text-4xl font-black text-amber-600">{bankData.depositRate}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-500 font-medium mb-1">Доход за 1 год*</div>
                <div className="text-4xl font-black text-slate-900">{Math.round(yearlyIncome).toLocaleString('ru-RU')} ₽</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-500 font-medium mb-1">С капитализацией</div>
                <div className="text-4xl font-black text-emerald-600">{Math.round(withCapitalization).toLocaleString('ru-RU')} ₽</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center mb-8">*Расчёт для вклада 1 000 000 ₽ на 12 месяцев</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {bankData.features.map((f, i) => (
                <span key={i} className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-bold">
                  <CheckCircle className="w-3 h-3" />
                  {f}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="font-black text-slate-900">{bankData.rating}/5</span>
              <span className="text-sm text-slate-500">— {bankData.bankName}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl border-2 border-amber-100 p-8 mb-12 text-center">
            <PiggyBank className="w-10 h-10 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-900 mb-2">Калькулятор доходности вклада</h2>
            <p className="text-slate-600 mb-6">Рассчитайте точный доход с учётом капитализации, пополнения и налога</p>
            <Link
              to="/calculator/deposit"
              className="inline-flex items-center gap-2 bg-amber-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-amber-700 transition-all"
            >
              Калькулятор вкладов
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Частые вопросы</h2>
            <p className="text-slate-500 text-center mb-10">Ответы на вопросы о вкладах в {bankData.bankName}</p>
            <div className="space-y-3">
              {seo.faq.map((item, i) => (
                <details key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
                  <summary className="p-5 cursor-pointer font-bold text-slate-900 flex items-center gap-3 list-none hover:bg-slate-50 transition-colors">
                    {item.question}
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link to={`/bank/${bankData.bankSlug}/mortgage`} className="surface-card surface-card-hover p-5 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-bold text-slate-900">Ипотека {bankData.bankName}</p>
                <p className="text-sm text-slate-500">от {bankData.mortgageRate}%</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
            </Link>
            <Link to={`/bank/${bankData.bankSlug}/credit`} className="surface-card surface-card-hover p-5 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold text-slate-900">Кредит {bankData.bankName}</p>
                <p className="text-sm text-slate-500">от {bankData.creditRate}%</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
