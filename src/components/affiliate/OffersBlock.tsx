import { Star } from 'lucide-react';
import { AffiliateCTA } from '@/components/AffiliateCTA';
import { AFFILIATE_LINKS } from '@/config/affiliateLinks';

type Placement = 'result_block' | 'sidebar' | 'hero' | 'footer' | 'blog_inline' | 'widget' | 'unknown';

interface OfferKeyConfig {
  key: string;
  label: string;
  partnerName: string;
  productType: string;
}

const OFFERS_BY_PRODUCT: Record<string, OfferKeyConfig[]> = {
  mortgage: [
    { key: 'sberbank-mortgage', label: 'Подобрать ипотеку (Сбер)', partnerName: 'sberbank', productType: 'mortgage' },
    { key: 'vtb-mortgage', label: 'Подобрать ипотеку (ВТБ)', partnerName: 'vtb', productType: 'mortgage' },
    { key: 'partner-promo-1', label: 'Подобрать предложения', partnerName: 'partner', productType: 'mortgage' },
  ],
  credit: [
    { key: 'vtb-credit-card', label: 'Оформить карту (ВТБ)', partnerName: 'vtb', productType: 'credit' },
    { key: 'psb-debit-cashback', label: 'Карта с кэшбэком (ПСБ)', partnerName: 'psb', productType: 'debit' },
  ],
  deposit: [
    { key: 'sberbank-deposit', label: 'Открыть вклад (Сбер)', partnerName: 'sberbank', productType: 'deposit' },
  ],
  insurance: [
    { key: 'renlife-guaranteed-income', label: 'НСЖ “Гарантированный доход”', partnerName: 'renlife', productType: 'insurance' },
    { key: 'pampadu-osago', label: 'Рассчитать ОСАГО онлайн', partnerName: 'pampadu', productType: 'insurance' },
    { key: 'pampadu-kasko', label: 'Рассчитать КАСКО онлайн', partnerName: 'pampadu', productType: 'insurance' },
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
  subtitle = 'Выберите подходящий вариант и продолжите оформление на сайте партнёра.',
}: OffersBlockProps) {
  const offers = OFFERS_BY_PRODUCT[product]
    .map((cfg) => {
      const link = AFFILIATE_LINKS[cfg.key];
      if (!link?.url) return null;
      return { cfg, link };
    })
    .filter(Boolean) as Array<{ cfg: OfferKeyConfig; link: (typeof AFFILIATE_LINKS)[string] }>;

  if (offers.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900">{title}</h3>
          <p className="text-slate-600 mt-1">{subtitle}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
          Подбор из популярных офферов
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {offers.slice(0, 3).map(({ cfg, link }) => (
          <div key={cfg.key} className="rounded-2xl border border-slate-200 p-4 flex flex-col">
            <div className="font-bold text-slate-900">{cfg.label}</div>
            {link.description && <div className="text-sm text-slate-600 mt-1">{link.description}</div>}

            <div className="mt-4">
              <AffiliateCTA
                href={link.url}
                partnerName={cfg.partnerName}
                productType={cfg.productType}
                offerId={cfg.key}
                placement={placement}
                erid={link.erid}
                label="Перейти"
                variant="primary"
                showAdLabel={Boolean(link.erid)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

