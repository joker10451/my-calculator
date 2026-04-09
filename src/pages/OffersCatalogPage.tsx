import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { AffiliateCTA } from '@/components/AffiliateCTA';
import { AFFILIATE_LINKS } from '@/config/affiliateLinks';
import { getUxBaselineSnapshot, trackUxEvent } from '@/lib/analytics/uxMetrics';

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
  const [baseline] = useState(() => getUxBaselineSnapshot());

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
    const q = query.trim().toLowerCase();
    return allOffers.filter((o) => {
      if (category !== 'all' && o.category !== category) return false;
      if (!q) return true;
      const hay = `${o.title || ''} ${o.description || ''} ${o.bankId} ${o.productType || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allOffers, category, query]);

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
    <div className="min-h-screen bg-slate-50/40">
      <SEO
        title="Каталог офферов"
        description="Подборка партнёрских офферов с вашими реферальными ссылками: карты, страхование, займы и вакансии."
        canonical={`${SITE_URL}/offers/`}
        keywords="офферы, партнерские ссылки, банки, ипотека, кредитные карты, вклады, ОСАГО, КАСКО, вакансии"
      />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Каталог офферов
            </h1>
            <p className="text-slate-600 mt-2">
              Выберите категорию и изучите доступные офферы с реферальными ссылками.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white/80 p-4 text-xs text-slate-600">
            Baseline UX: событий {baseline.totalUxEvents}, зафиксировано {baseline.capturedAt.slice(0, 10)}.
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-2">Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category | 'all')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'all' ? 'Все' : c === 'vacancies' ? 'Вакансии' : c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-800 block mb-2">Поиск</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Например: ипотека, ВТБ, ОСАГО, курьер…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((o) => (
              <div key={o.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-black text-slate-900">{o.title}</div>
                    {o.description && <div className="text-slate-600 mt-1">{o.description}</div>}
                  </div>
                  {typeof o.commission === 'number' && o.commission > 0 && (
                    <div className="text-xs font-black bg-emerald-50 text-emerald-700 px-3 py-2 rounded-full border border-emerald-200">
                      до {o.commission.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>

                {o.badges && o.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {o.badges.slice(0, 5).map((b) => (
                      <span
                        key={b}
                        className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6">
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
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-slate-600 mt-10">
              Ничего не найдено. Попробуйте другую категорию или запрос.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

