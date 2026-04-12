import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { AffiliateCTA } from '@/components/AffiliateCTA';
import { AFFILIATE_LINKS } from '@/config/affiliateLinks';
import { trackUxEvent } from '@/lib/analytics/uxMetrics';

type Category = NonNullable<(typeof AFFILIATE_LINKS)[string]['category']>;

const SITE_URL = 'https://schitay-online.ru';

type Offer = {
  id: string;
  url: string;
  bankId: string;
  productType?: string;
  commission?: number;
  description?: string;
  erid?: string;
  title?: string;
  category?: Category;
  badges?: string[];
  updatedAt?: string;
  eligibility?: string[];
  restrictions?: string[];
  publicDetails?: string;
  priority?: number;
};

function asOffers(): Offer[] {
  return Object.entries(AFFILIATE_LINKS).map(([id, o]) => ({
    id,
    url: o.url,
    bankId: o.bankId,
    productType: o.productType,
    commission: o.commission,
    description: o.description,
    erid: o.erid,
    title: o.title,
    category: o.category,
    badges: o.badges,
    updatedAt: o.updatedAt,
    eligibility: o.eligibility,
    restrictions: o.restrictions,
    publicDetails: o.publicDetails,
    priority: o.priority,
  }));
}

export default function OffersCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const queryFromUrl = searchParams.get('q') || '';
  const initialCategory: Category | 'all' = (
    categoryFromUrl &&
    ['mortgage', 'credit', 'debit', 'deposit', 'loan', 'insurance', 'vacancies', 'other'].includes(categoryFromUrl)
  )
    ? (categoryFromUrl as Category)
    : 'all';

  const [category, setCategory] = useState<Category | 'all'>(initialCategory);
  const [query, setQuery] = useState(queryFromUrl);
  const deferredQuery = useDeferredValue(query);

  const allOffers = useMemo(() => {
    const offers = asOffers()
      .filter((o) => o.url && o.title && o.url.includes('trk.ppdu.ru'))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return offers;
  }, []);

  const categories = useMemo(() => {
    const set = new Set<Category>();
    allOffers.forEach((o) => {
      if (o.category) set.add(o.category);
    });
    const order: Category[] = [
      'mortgage',
      'credit',
      'debit',
      'deposit',
      'loan',
      'insurance',
      'vacancies',
      'other',
    ];
    const sorted = Array.from(set).sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    return ['all', ...sorted] as const;
  }, [allOffers]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return allOffers.filter((o) => {
      if (category !== 'all' && o.category !== category) return false;
      if (!q) return true;
      const hay = `${o.title || ''} ${o.description || ''} ${o.bankId} ${o.productType || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allOffers, category, deferredQuery]);

  useEffect(() => {
    trackUxEvent('filter_used', {
      page: '/offers',
      section: 'category',
      value: category,
    });
  }, [category]);

  useEffect(() => {
    if (query.trim()) {
      trackUxEvent('filter_used', {
        page: '/offers',
        section: 'search',
        value: query.trim(),
      });
    }
  }, [query]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (category !== 'all') nextParams.set('category', category);
    if (query.trim()) nextParams.set('q', query.trim());
    setSearchParams(nextParams, { replace: true });
  }, [category, query, setSearchParams]);

  const clearFilters = () => {
    setCategory('all');
    setQuery('');
    trackUxEvent('filter_used', {
      page: '/offers',
      section: 'reset',
      value: 'clear_all',
    });
  };

  useEffect(() => {
    if (filtered.length === 0) {
      trackUxEvent('empty_state_seen', {
        page: '/offers',
        section: 'offers_list',
      });
    }
  }, [filtered.length]);

  return (
    <div className="min-h-screen bg-slate-950">
      <SEO
        title="Каталог предложений"
        description="Подборка актуальных предложений: карты, страхование, займы и вакансии."
        canonical={`${SITE_URL}/offers/`}
        keywords="предложения, банки, ипотека, кредитные карты, вклады, ОСАГО, КАСКО, вакансии"
      />

      <div className="container mx-auto px-4 pt-24 pb-14">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight">
              Каталог предложений
            </h1>
            <p className="text-slate-300 mt-2">
              Выберите категорию и изучите доступные предложения.
            </p>
          </div>

          <div className="surface-card p-5 md:p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-2">Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category | 'all')}
                  className="field-control field-control-lg"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'all' && 'Все'}
                      {c === 'mortgage' && 'Ипотека'}
                      {c === 'credit' && 'Кредиты'}
                      {c === 'debit' && 'Карты'}
                      {c === 'deposit' && 'Вклады'}
                      {c === 'loan' && 'Займы'}
                      {c === 'insurance' && 'Страхование'}
                      {c === 'vacancies' && 'Вакансии'}
                      {c === 'other' && 'Другое'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-2">Поиск</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Например: ипотека, ВТБ, ОСАГО, курьер…"
                  className="field-control field-control-lg"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((o) => (
              <article
                key={o.id}
                className="surface-card surface-card-hover p-5 flex h-full flex-col"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {o.title}
                    </h2>
                    {o.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {o.description}
                      </p>
                    )}
                  </div>
                </div>

                {o.badges && o.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {o.badges.slice(0, 5).map((b) => (
                      <span
                        key={b}
                        className="chip-muted"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}

                {(o.eligibility?.length || o.restrictions?.length || o.publicDetails || o.updatedAt) && (
                  <div className="mt-4 surface-muted p-3 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                    {o.updatedAt && (
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">Актуализация:</span> {o.updatedAt}
                      </div>
                    )}
                    {o.eligibility && o.eligibility.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">Кому подходит:</span>{' '}
                        {o.eligibility.slice(0, 2).join(' • ')}
                      </div>
                    )}
                    {o.restrictions && o.restrictions.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">Ограничения:</span> {o.restrictions[0]}
                      </div>
                    )}
                    {o.publicDetails && (
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">Условия:</span> {o.publicDetails}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 border-t border-slate-200/80 dark:border-slate-800 pt-4">
                  <AffiliateCTA
                    href={o.url}
                    partnerName={o.bankId}
                    productType={o.productType || 'other'}
                    offerId={o.id}
                    placement="hero"
                    erid={o.erid}
                    label="Подробнее"
                    variant="primary"
                    showAdLabel={Boolean(o.erid)}
                  />
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-slate-300 mt-10">
              Ничего не найдено. Попробуйте другую категорию или запрос.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

