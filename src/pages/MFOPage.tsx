import { useState, useMemo } from 'react';
import { SEO, generateFAQSchema } from '@/components/SEO';
import { generateHowToSchema } from '@/utils/seoSchemas';
import { MFO_OFFERS, generateMFOSEOTemplate } from '@/lib/seoPages';
import { useParams, Navigate } from 'react-router-dom';
import { Wallet, Clock, CheckCircle, ArrowRight, Star, Shield, TrendingDown } from 'lucide-react';
import { AffiliateCTA } from '@/components/AffiliateCTA';
import { SITE_URL } from '@/shared/constants';

export default function MFOPage() {
  const { mfo } = useParams<{ mfo: string }>();
  const mfoData = MFO_OFFERS.find(m => m.slug === mfo);

  if (!mfoData) return <Navigate to="/joy-money" replace />;

  const seo = generateMFOSEOTemplate(mfoData);
  const faqSchema = generateFAQSchema(seo.faq);
  const howToSchema = generateHowToSchema(
    `Как получить займ в ${mfoData.name}`,
    `Пошаговая инструкция по получению онлайн займа в ${mfoData.name}`,
    `${SITE_URL}/mfo/${mfoData.slug}`,
    [
      { name: 'Заполните заявку', text: 'Укажите паспортные данные и номер карты', url: mfoData.referralLink },
      { name: 'Дождитесь решения', text: `Автоматическое одобрение за ${mfoData.approvalTime}`, url: mfoData.referralLink },
      { name: 'Получите деньги', text: `До ${mfoData.maxAmount.toLocaleString('ru-RU')} ₽ на карту`, url: mfoData.referralLink },
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical={`${SITE_URL}/mfo/${mfoData.slug}`}
        structuredData={[faqSchema, howToSchema]}
      />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Wallet className="w-4 h-4" />
              Онлайн займ
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">{seo.h1}</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">{seo.intro}</p>
          </div>

          {/* Offer Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-12">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-sm text-slate-500 font-medium mb-1">Макс. сумма</div>
                <div className="text-4xl font-black text-emerald-600">{mfoData.maxAmount.toLocaleString('ru-RU')} ₽</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-500 font-medium mb-1">Одобрение</div>
                <div className="text-4xl font-black text-slate-900">{mfoData.approvalTime}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-500 font-medium mb-1">Ставка</div>
                <div className="text-4xl font-black text-slate-900">{mfoData.rate}%/день</div>
              </div>
            </div>

            {mfoData.firstFree && (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 mb-8 text-center">
                <span className="text-emerald-700 font-black text-lg">🎉 Первый займ 0% — без процентов!</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-8">
              {mfoData.features.map((f, i) => (
                <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-bold">
                  <CheckCircle className="w-3 h-3" />
                  {f}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-black text-slate-900">{mfoData.rating}/5</span>
              </div>
            </div>

            <div className="w-full">
              <AffiliateCTA
                href={mfoData.referralLink}
                partnerName={mfoData.slug}
                productType="loan"
                offerId={`mfo-${mfoData.slug}`}
                placement="hero"
                label="Получить займ"
                variant="primary"
                showAdLabel={false}
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100 p-8 mb-12">
            <h3 className="text-xl font-black text-slate-900 mb-6 text-center">Требования</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Shield, text: 'Гражданство РФ' },
                { icon: Wallet, text: 'Возраст от 18 лет' },
                { icon: Clock, text: `Одобрение за ${mfoData.approvalTime}` },
                { icon: TrendingDown, text: 'Без справок о доходах' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-100">
                  <item.icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-slate-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Частые вопросы</h2>
            <p className="text-slate-500 text-center mb-10">Ответы на вопросы о займе в {mfoData.name}</p>
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
        </div>
      </div>
    </div>
  );
}
