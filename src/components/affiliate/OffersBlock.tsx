import { Star } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { AffiliateCTA } from '@/components/AffiliateCTA';
import { AFFILIATE_LINKS } from '@/config/affiliateLinks';
import { trackUxEvent } from '@/lib/analytics/uxMetrics';

type Placement = 'result_block' | 'sidebar' | 'hero' | 'footer' | 'blog_inline' | 'widget' | 'unknown';

interface OfferKeyConfig {
  key: string;
  label: string;
  partnerName: string;
  productType: string;
  isPopular?: boolean;
  bestValue?: boolean;
}

const OFFERS_BY_PRODUCT: Record<string, OfferKeyConfig[]> = {
  mortgage: [
    { key: 'partner-promo-1', label: 'Подобрать предложения', partnerName: 'partner', productType: 'mortgage', isPopular: true },
  ],
  credit: [
    { key: 'vtb-credit-card', label: 'Оформить карту (ВТБ)', partnerName: 'vtb', productType: 'credit', bestValue: true },
  ],
  deposit: [
    { key: 'psb-debit-cashback', label: 'ПСБ «Твой кешбэк»', partnerName: 'psb', productType: 'debit', bestValue: true },
    { key: 'tbank-all-airlines-debit', label: 'Т‑Банк ALL Airlines', partnerName: 'tbank', productType: 'debit', isPopular: true },
  ],
  insurance: [
    { key: 'renlife-guaranteed-income', label: 'НСЖ “Гарантированный доход”', partnerName: 'renlife', productType: 'insurance', isPopular: true },
    { key: 'pari-tick-insurance', label: 'СК ПАРИ — защита от клеща', partnerName: 'pari', productType: 'insurance' },
  ],
  auto_insurance: [
    { key: 'pampadu-osago', label: 'Сравнить ОСАГО онлайн', partnerName: 'pampadu', productType: 'insurance', isPopular: true, bestValue: true },
    { key: 'pampadu-kasko', label: 'Рассчитать КАСКО онлайн', partnerName: 'pampadu', productType: 'insurance' },
  ],
  loan: [
    { key: 'joymoney-loan', label: 'JoyMoney — займ онлайн', partnerName: 'joymoney', productType: 'loan', isPopular: true },
  ],
  vacancies: [
    { key: 'pampadu-offer-31ba9c13', label: 'Курьер Яндекс.Еда/Лавка', partnerName: 'pampadu', productType: 'vacancies', isPopular: true },
    { key: 'ruki-vacancy-moscow', label: 'Сервис «Руки» — мастера по ремонту', partnerName: 'ruki', productType: 'vacancies' },
  ],
};

export interface OffersBlockProps {
  product: keyof typeof OFFERS_BY_PRODUCT;
  placement?: Placement;
  title?: string;
  subtitle?: string;
}

export function OffersBlock({
  product,
  placement = 'result_block',
  title = 'Предложения по вашему расчёту',
  subtitle = 'Выберите подходящий вариант среди доступных предложений.',
}: OffersBlockProps) {
  const ctaVariant = useMemo<'a' | 'b'>(() => {
    const key = `ab_cta_${product}`;
    const stored = localStorage.getItem(key);
    if (stored === 'a' || stored === 'b') return stored;
    const assigned = Math.random() < 0.5 ? 'a' : 'b';
    localStorage.setItem(key, assigned);
    trackUxEvent('ab_variant_assigned', {
      page: typeof window !== 'undefined' ? window.location.pathname : '/unknown',
      section: 'offers_block',
      value: `${product}:${assigned}`,
    });
    return assigned;
  }, [product]);

  const offers = OFFERS_BY_PRODUCT[product]
    .map((cfg) => {
      const link = AFFILIATE_LINKS[cfg.key];
      if (!link?.url) return null;
      return { cfg, link };
    })
    .filter(Boolean) as Array<{ cfg: OfferKeyConfig; link: (typeof AFFILIATE_LINKS)[string] }>;

  const orderedOffers = useMemo(() => {
    if (ctaVariant === 'a') return offers;
    // Variant B: rotate first card to test order impact
    if (offers.length < 2) return offers;
    return [...offers.slice(1), offers[0]];
  }, [offers, ctaVariant]);

  useEffect(() => {
    trackUxEvent('ab_variant_assigned', {
      page: typeof window !== 'undefined' ? window.location.pathname : '/unknown',
      section: 'offers_block_impression',
      value: `${product}:${ctaVariant}`,
      extra: { type: 'impression' },
    });
  }, [product, ctaVariant]);

  if (offers.length === 0) return null;

  return (
    <section className="surface-card p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-3">{title}</h3>
          <p className="text-slate-600 dark:text-slate-300 font-medium">{subtitle}</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Проверено экспертом
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-tighter">
              Стоимость не меняется • Безопасная сделка
            </p>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" className="w-full h-full object-cover opacity-80" />
              </div>
            ))}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Выбрали 2.4к+ пользователей</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orderedOffers.slice(0, 3).map(({ cfg, link }) => (
          <div 
            key={cfg.key} 
            className={`group rounded-3xl border ${cfg.bestValue ? 'border-emerald-500/50 bg-emerald-50/30' : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60'} p-6 flex flex-col hover:border-emerald-500 transition-all duration-500 hover:shadow-2xl relative overflow-hidden`}
          >
            {cfg.bestValue && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                Лучший выбор
              </div>
            )}
            {cfg.isPopular && !cfg.bestValue && (
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                Популярно
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden p-2 shadow-sm">
                <img 
                  src={`https://cdn.brandfetch.io/${cfg.partnerName}.com/icon`} 
                  alt={cfg.partnerName} 
                  onError={(e) => { (e.target as HTMLImageElement).src = '/partners/default.png'; }}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-black text-slate-900 dark:text-slate-100 text-lg leading-tight">{cfg.label}</div>
            </div>

            {link.description && <div className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed flex-1">{link.description}</div>}
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
              <AffiliateCTA
                href={link.url}
                partnerName={cfg.partnerName}
                productType={cfg.productType}
                offerId={cfg.key}
                placement={placement}
                erid={link.erid}
                label={cfg.bestValue ? (ctaVariant === 'a' ? 'Получить выгоду' : 'Оформить сейчас') : (ctaVariant === 'a' ? 'Узнать больше' : 'Смотреть условия')}
                variant={cfg.bestValue ? "success" : "primary"}
                showAdLabel={Boolean(link.erid)}
                abVariant={ctaVariant}
              />
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Обновлено: {link.updatedAt || 'сегодня'}</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

