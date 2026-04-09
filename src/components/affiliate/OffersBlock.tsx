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
}

const OFFERS_BY_PRODUCT: Record<string, OfferKeyConfig[]> = {
  mortgage: [
    { key: 'partner-promo-1', label: 'Подобрать предложения', partnerName: 'partner', productType: 'mortgage' },
  ],
  credit: [
    { key: 'vtb-credit-card', label: 'Оформить карту (ВТБ)', partnerName: 'vtb', productType: 'credit' },
  ],
  deposit: [
    { key: 'psb-debit-cashback', label: 'ПСБ «Твой кешбэк»', partnerName: 'psb', productType: 'debit' },
    { key: 'tbank-all-airlines-debit', label: 'Т‑Банк ALL Airlines', partnerName: 'tbank', productType: 'debit' },
  ],
  insurance: [
    { key: 'renlife-guaranteed-income', label: 'НСЖ “Гарантированный доход”', partnerName: 'renlife', productType: 'insurance' },
    { key: 'pari-tick-insurance', label: 'СК ПАРИ — защита от клеща', partnerName: 'pari', productType: 'insurance' },
  ],
  loan: [
    { key: 'joymoney-loan', label: 'JoyMoney — займ онлайн', partnerName: 'joymoney', productType: 'loan' },
  ],
  vacancies: [
    { key: 'pampadu-offer-31ba9c13', label: 'Курьер Яндекс.Еда/Лавка', partnerName: 'pampadu', productType: 'vacancies' },
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
    <section className="surface-card p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-slate-600 dark:text-slate-300 mt-1">{subtitle}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Подборка обновляется регулярно. Стоимость для пользователя не меняется.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
          Подбор из популярных предложений
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {orderedOffers.slice(0, 3).map(({ cfg, link }) => (
          <div key={cfg.key} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col bg-white/60 dark:bg-slate-900/60">
            <div className="font-bold text-slate-900 dark:text-slate-100">{cfg.label}</div>
            {link.description && <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{link.description}</div>}
            {link.updatedAt && (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                {link.updatedAt && <div>Актуально: {link.updatedAt}</div>}
              </div>
            )}

            <div className="mt-4">
              <AffiliateCTA
                href={link.url}
                partnerName={cfg.partnerName}
                productType={cfg.productType}
                offerId={cfg.key}
                placement={placement}
                erid={link.erid}
                label={ctaVariant === 'a' ? 'Подробнее' : 'Смотреть условия'}
                variant="primary"
                showAdLabel={Boolean(link.erid)}
                abVariant={ctaVariant}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

