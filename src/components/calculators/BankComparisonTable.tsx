import { useState, useMemo, useEffect } from 'react';
import { BankProductRepository, BankRepository } from '@/lib/database/bankRepository';
import type { Bank, BankProduct, ProductType } from '@/types/bank';
import { Building2, Star, ArrowUpRight, ChevronDown, ChevronUp, Filter, Trophy, TrendingDown, Shield, Percent, Calendar, Wallet } from 'lucide-react';

const BANK_COLORS: Record<string, string> = {
  'Сбербанк': 'bg-green-100 text-green-700',
  'ВТБ': 'bg-blue-100 text-blue-700',
  'Альфа-Банк': 'bg-red-100 text-red-700',
  'Т-Банк': 'bg-yellow-100 text-yellow-700',
  'Газпромбанк': 'bg-sky-100 text-sky-700',
  'Росбанк': 'bg-red-100 text-red-700',
};

function BankLogo({ bank, size = 'w-12 h-12' }: { bank: Bank | undefined; size?: string }) {
  const [imgError, setImgError] = useState(false);
  if (!bank) {
    return <div className={`${size} bg-slate-200 rounded-xl flex items-center justify-center`}><Building2 className="w-6 h-6 text-slate-400" /></div>;
  }
  if (imgError || !bank.logo_url) {
    const initials = bank.name.split(' ').map(w => w[0]).join('').substring(0, 2);
    const color = BANK_COLORS[bank.name] || 'bg-slate-100 text-slate-700';
    return <div className={`${size} ${color} rounded-xl flex items-center justify-center font-black text-xs`}>{initials}</div>;
  }
  return <img src={bank.logo_url} alt={bank.name} className={`${size} rounded-xl object-cover`} onError={() => setImgError(true)} />;
}

const PRODUCT_TYPES: { value: ProductType; label: string; icon: typeof Wallet }[] = [
  { value: 'mortgage', label: 'Ипотека', icon: Building2 },
  { value: 'deposit', label: 'Вклады', icon: Wallet },
  { value: 'credit', label: 'Кредиты', icon: TrendingDown },
  { value: 'card', label: 'Дебетовые карты', icon: Shield },
];

interface ComparisonRow {
  label: string;
  values: (string | number)[];
  bestIndex?: number;
  higherIsBetter?: boolean;
  icon?: typeof Wallet;
}

const FALLBACK_BANKS: Bank[] = [
  { id: '1', name: 'Сбербанк', short_name: 'Сбер', logo_url: '', website_url: 'https://sberbank.ru', overall_rating: 4.2, customer_service_rating: 4.0, reliability_rating: 4.5, processing_speed_rating: 4.0, is_partner: true, commission_rate: 0.15, created_at: '', updated_at: '' },
  { id: '2', name: 'ВТБ', short_name: 'ВТБ', logo_url: '', website_url: 'https://vtb.ru', overall_rating: 4.0, customer_service_rating: 3.8, reliability_rating: 4.2, processing_speed_rating: 3.9, is_partner: true, commission_rate: 0.18, created_at: '', updated_at: '' },
  { id: '3', name: 'Альфа-Банк', short_name: 'Альфа', logo_url: '', website_url: 'https://alfabank.ru', overall_rating: 4.3, customer_service_rating: 4.2, reliability_rating: 4.1, processing_speed_rating: 4.4, is_partner: true, commission_rate: 0.20, created_at: '', updated_at: '' },
  { id: '4', name: 'Т-Банк', short_name: 'Т-Банк', logo_url: '', website_url: 'https://tbank.ru', overall_rating: 4.5, customer_service_rating: 4.6, reliability_rating: 4.3, processing_speed_rating: 4.8, is_partner: true, commission_rate: 0.15, created_at: '', updated_at: '' },
  { id: '5', name: 'Газпромбанк', short_name: 'Газпром', logo_url: '', website_url: 'https://gazprombank.ru', overall_rating: 4.1, customer_service_rating: 4.0, reliability_rating: 4.2, processing_speed_rating: 4.0, is_partner: false, commission_rate: 0.20, created_at: '', updated_at: '' },
];

const FALLBACK_PRODUCTS: BankProduct[] = [
  { id: '1', bank_id: '1', product_type: 'mortgage', name: 'Ипотека на готовое жилье', description: 'Покупка готового жилья', interest_rate: 22.5, min_amount: 500000, max_amount: 30000000, min_term: 12, max_term: 360, fees: { application: 0, monthly: 0 }, requirements: { min_income: 50000, min_age: 21 }, features: { early_repayment: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 10, created_at: '', updated_at: '' },
  { id: '2', bank_id: '2', product_type: 'mortgage', name: 'Ипотека Победа', description: 'Специальная программа', interest_rate: 22.9, min_amount: 600000, max_amount: 25000000, min_term: 12, max_term: 300, fees: { application: 0, monthly: 0 }, requirements: { min_income: 45000, min_age: 23 }, features: { early_repayment: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 8, created_at: '', updated_at: '' },
  { id: '3', bank_id: '3', product_type: 'mortgage', name: 'Ипотека Альфа', description: 'Выгодные условия', interest_rate: 23.5, min_amount: 500000, max_amount: 20000000, min_term: 12, max_term: 360, fees: { application: 0, monthly: 0 }, requirements: { min_income: 40000, min_age: 21 }, features: { early_repayment: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 7, created_at: '', updated_at: '' },
  { id: '4', bank_id: '4', product_type: 'mortgage', name: 'Ипотека онлайн', description: 'Оформление онлайн', interest_rate: 24.1, min_amount: 500000, max_amount: 15000000, min_term: 12, max_term: 360, fees: { application: 0, monthly: 0 }, requirements: { min_income: 40000, min_age: 21 }, features: { early_repayment: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 6, created_at: '', updated_at: '' },
  { id: '5', bank_id: '5', product_type: 'mortgage', name: 'Ипотека с господдержкой', description: 'Льготная программа', interest_rate: 22.7, min_amount: 500000, max_amount: 25000000, min_term: 12, max_term: 360, fees: { application: 0, monthly: 0 }, requirements: { min_income: 50000, min_age: 21 }, features: { early_repayment: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 8, created_at: '', updated_at: '' },
  { id: '6', bank_id: '1', product_type: 'deposit', name: 'Лучший %', description: 'Максимальная ставка', interest_rate: 19.5, min_amount: 100000, max_amount: 100000000, min_term: 3, max_term: 36, fees: {}, requirements: { min_age: 18 }, features: { capitalization: true, replenishment: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 10, created_at: '', updated_at: '' },
  { id: '7', bank_id: '2', product_type: 'deposit', name: 'Надёжный', description: 'Повышенная ставка', interest_rate: 20.0, min_amount: 30000, max_amount: 50000000, min_term: 6, max_term: 24, fees: {}, requirements: { min_age: 18 }, features: { capitalization: true, replenishment: false }, available_regions: ['all'], is_active: true, is_featured: true, priority: 8, created_at: '', updated_at: '' },
  { id: '8', bank_id: '3', product_type: 'deposit', name: 'Альфа-Вклад', description: 'С пополнением', interest_rate: 21.0, min_amount: 10000, max_amount: 50000000, min_term: 3, max_term: 36, fees: {}, requirements: { min_age: 18 }, features: { capitalization: true, replenishment: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 9, created_at: '', updated_at: '' },
  { id: '9', bank_id: '4', product_type: 'deposit', name: 'Т-Вклад', description: 'Открытие онлайн', interest_rate: 20.5, min_amount: 50000, max_amount: 30000000, min_term: 3, max_term: 24, fees: {}, requirements: { min_age: 18 }, features: { capitalization: true, replenishment: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 9, created_at: '', updated_at: '' },
  { id: '10', bank_id: '1', product_type: 'credit', name: 'Потребительский кредит', description: 'На любые цели', interest_rate: 22.9, min_amount: 50000, max_amount: 5000000, min_term: 12, max_term: 60, fees: { application: 0, monthly: 0 }, requirements: { min_income: 35000, min_age: 21 }, features: { early_repayment: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 9, created_at: '', updated_at: '' },
  { id: '11', bank_id: '2', product_type: 'credit', name: 'Кредит наличными', description: 'Быстрое одобрение', interest_rate: 23.5, min_amount: 30000, max_amount: 5000000, min_term: 12, max_term: 84, fees: { application: 0, monthly: 0 }, requirements: { min_income: 25000, min_age: 21 }, features: { early_repayment: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 7, created_at: '', updated_at: '' },
  { id: '12', bank_id: '3', product_type: 'credit', name: 'Кредит наличными', description: 'Без залога', interest_rate: 24.5, min_amount: 30000, max_amount: 7500000, min_term: 12, max_term: 60, fees: { application: 0, monthly: 0 }, requirements: { min_income: 30000, min_age: 21 }, features: { early_repayment: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 8, created_at: '', updated_at: '' },
  { id: '13', bank_id: '4', product_type: 'card', name: 'Т-Банк Чёрный', description: 'Кэшбэк до 30%', interest_rate: 5.0, min_amount: 0, max_amount: 0, min_term: 0, max_term: 0, fees: { monthly: 0 }, requirements: { min_age: 18 }, features: { cashback: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 10, created_at: '', updated_at: '' },
  { id: '14', bank_id: '1', product_type: 'card', name: 'СберКарта', description: 'Бонусы Спасибо', interest_rate: 3.5, min_amount: 0, max_amount: 0, min_term: 0, max_term: 0, fees: { monthly: 0 }, requirements: { min_age: 14 }, features: { cashback: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 9, created_at: '', updated_at: '' },
  { id: '15', bank_id: '3', product_type: 'card', name: 'Альфа-Карта', description: 'Кэшбэк до 33%', interest_rate: 4.0, min_amount: 0, max_amount: 0, min_term: 0, max_term: 0, fees: { monthly: 0 }, requirements: { min_age: 18 }, features: { cashback: true, online_application: true }, available_regions: ['all'], is_active: true, is_featured: true, priority: 8, created_at: '', updated_at: '' },
];

export function BankComparisonTable() {
  const [banks, setBanks] = useState<Bank[]>(FALLBACK_BANKS);
  const [products, setProducts] = useState<BankProduct[]>(FALLBACK_PRODUCTS);
  const [selectedType, setSelectedType] = useState<ProductType>('mortgage');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'rate' | 'bank' | 'rating'>('rate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedBank, setExpandedBank] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [banksData, productsData] = await Promise.all([
        BankRepository.getBanks(),
        BankProductRepository.getProducts({ product_type: selectedType, is_active: true }),
      ]);
      
      if (Array.isArray(banksData) && banksData.length > 0) {
        setBanks(banksData);
      }
      if (Array.isArray(productsData) && productsData.length > 0) {
        setProducts(productsData);
      }
    } catch (e) {
      console.warn('Using fallback bank data:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  const bankMap = useMemo(() => {
    const map = new Map<string, Bank>();
    banks.forEach(b => map.set(b.id, b));
    return map;
  }, [banks]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(p => p.is_active);
    if (sortBy === 'rate') {
      filtered.sort((a, b) => sortDir === 'asc' ? a.interest_rate - b.interest_rate : b.interest_rate - a.interest_rate);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => {
        const ra = bankMap.get(a.bank_id)?.overall_rating ?? 0;
        const rb = bankMap.get(b.bank_id)?.overall_rating ?? 0;
        return sortDir === 'asc' ? ra - rb : rb - ra;
      });
    } else {
      filtered.sort((a, b) => {
        const na = bankMap.get(a.bank_id)?.name ?? '';
        const nb = bankMap.get(b.bank_id)?.name ?? '';
        return sortDir === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
      });
    }
    return filtered;
  }, [products, sortBy, sortDir, bankMap]);

  const comparisonRows = useMemo((): ComparisonRow[] => {
    const rows: ComparisonRow[] = [];

    if (selectedType === 'mortgage') {
      rows.push({
        label: 'Ставка',
        values: filteredProducts.map(p => `${p.interest_rate}%`),
        bestIndex: 0,
        higherIsBetter: false,
        icon: Percent,
      });
      rows.push({
        label: 'Мин. сумма',
        values: filteredProducts.map(p => p.min_amount ? `${(p.min_amount / 1000000).toFixed(1)} млн ₽` : '—'),
        icon: Wallet,
      });
      rows.push({
        label: 'Макс. сумма',
        values: filteredProducts.map(p => p.max_amount ? `${(p.max_amount / 1000000).toFixed(0)} млн ₽` : '—'),
        icon: Wallet,
      });
      rows.push({
        label: 'Срок',
        values: filteredProducts.map(p => {
          if (!p.min_term && !p.max_term) return '—';
          const min = p.min_term ? `${Math.round(p.min_term / 12)} г.` : 'от 1 г.';
          const max = p.max_term ? `${Math.round(p.max_term / 12)} л.` : 'до 30 л.';
          return `${min} — ${max}`;
        }),
        icon: Calendar,
      });
      rows.push({
        label: 'Досрочное погашение',
        values: filteredProducts.map(p => p.features?.early_repayment ? '✅ Да' : '❌ Нет'),
        icon: Shield,
      });
      rows.push({
        label: 'Онлайн-заявка',
        values: filteredProducts.map(p => p.features?.online_application ? '✅ Да' : '❌ Нет'),
        icon: Shield,
      });
    } else if (selectedType === 'deposit') {
      rows.push({
        label: 'Ставка',
        values: filteredProducts.map(p => `${p.interest_rate}%`),
        bestIndex: 0,
        higherIsBetter: true,
        icon: Percent,
      });
      rows.push({
        label: 'Мин. сумма',
        values: filteredProducts.map(p => p.min_amount ? `${p.min_amount.toLocaleString('ru-RU')} ₽` : '—'),
        icon: Wallet,
      });
      rows.push({
        label: 'Срок',
        values: filteredProducts.map(p => {
          if (!p.min_term && !p.max_term) return '—';
          return `${p.min_term ?? 1} — ${p.max_term ?? 36} мес.`;
        }),
        icon: Calendar,
      });
      rows.push({
        label: 'Пополнение',
        values: filteredProducts.map(p => p.features?.replenishment ? '✅ Да' : '❌ Нет'),
        icon: Shield,
      });
      rows.push({
        label: 'Капитализация',
        values: filteredProducts.map(p => p.features?.capitalization ? '✅ Да' : '❌ Нет'),
        icon: Shield,
      });
    } else if (selectedType === 'credit') {
      rows.push({
        label: 'Ставка',
        values: filteredProducts.map(p => `от ${p.interest_rate}%`),
        bestIndex: 0,
        higherIsBetter: false,
        icon: Percent,
      });
      rows.push({
        label: 'Мин. сумма',
        values: filteredProducts.map(p => p.min_amount ? `${p.min_amount.toLocaleString('ru-RU')} ₽` : '—'),
        icon: Wallet,
      });
      rows.push({
        label: 'Макс. сумма',
        values: filteredProducts.map(p => p.max_amount ? `${(p.max_amount / 1000000).toFixed(0)} млн ₽` : '—'),
        icon: Wallet,
      });
      rows.push({
        label: 'Срок',
        values: filteredProducts.map(p => {
          if (!p.min_term && !p.max_term) return '—';
          return `${p.min_term ?? 3} — ${p.max_term ?? 60} мес.`;
        }),
        icon: Calendar,
      });
    } else if (selectedType === 'card') {
      rows.push({
        label: 'Кэшбэк',
        values: filteredProducts.map(p => p.features?.cashback ? '✅ Да' : '—'),
        icon: Percent,
      });
      rows.push({
        label: 'Обслуживание',
        values: filteredProducts.map(p => p.fees?.monthly ? `${p.fees.monthly.toLocaleString('ru-RU')} ₽/мес` : 'Бесплатно'),
        bestIndex: 0,
        higherIsBetter: false,
        icon: Wallet,
      });
    }

    // Рейтинг банка — для всех типов
    rows.push({
      label: 'Рейтинг банка',
      values: filteredProducts.map(p => {
        const bank = bankMap.get(p.bank_id);
        return bank?.overall_rating ? `${bank.overall_rating}/5` : '—';
      }),
      bestIndex: 0,
      higherIsBetter: true,
      icon: Star,
    });

    return rows;
  }, [filteredProducts, selectedType, bankMap]);

  const handleSort = (field: 'rate' | 'bank' | 'rating') => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir(field === 'rate' ? 'asc' : 'desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Загрузка предложений банков...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-3xl">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-slate-600 font-bold text-lg mb-2">{error}</p>
        <button onClick={loadData} className="text-blue-600 font-bold hover:underline">Попробовать снова</button>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-3xl">
        <div className="text-5xl mb-4">🏦</div>
        <p className="text-slate-600 font-bold text-lg">Нет предложений в категории «{PRODUCT_TYPES.find(t => t.value === selectedType)?.label}»</p>
        <p className="text-slate-400 mt-2">Попробуйте выбрать другую категорию</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Product Type Tabs */}
      <div className="flex flex-wrap gap-3">
        {PRODUCT_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
              selectedType === type.value
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            <type.icon className="w-4 h-4" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3 text-sm">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-slate-500 font-medium">Сортировка:</span>
        {[
          { key: 'rate' as const, label: 'По ставке' },
          { key: 'rating' as const, label: 'По рейтингу' },
          { key: 'bank' as const, label: 'По банку' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => handleSort(s.key)}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1 ${
              sortBy === s.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.label}
            {sortBy === s.key && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto rounded-3xl border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-6 font-black text-slate-900 text-sm uppercase tracking-wider w-48">
                Параметр
              </th>
              {filteredProducts.map((product, i) => {
                const bank = bankMap.get(product.bank_id);
                const isBest = i === 0 && sortBy === 'rate';
                return (
                  <th key={product.id} className={`p-6 text-center min-w-[200px] ${isBest ? 'bg-emerald-50/50' : ''}`}>
                    <div className="flex flex-col items-center">
                      {isBest && (
                        <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full mb-2">
                          <Trophy className="w-3 h-3" />
                          Лучшее
                        </div>
                      )}
                      <BankLogo bank={bank} />
                      <span className="font-black text-slate-900 text-sm">{bank?.name ?? product.name}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-500">{bank?.overall_rating ?? '—'}</span>
                      </div>
                      {bank?.is_partner && (
                        <span className="mt-1 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Партнёр
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, rowIdx) => (
              <tr key={rowIdx} className={`border-t border-slate-100 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    {row.icon && <row.icon className="w-4 h-4 text-slate-400" />}
                    <span className="font-bold text-slate-700 text-sm">{row.label}</span>
                  </div>
                </td>
                {row.values.map((val, i) => {
                  const isBest = row.bestIndex !== undefined && i === row.bestIndex;
                  return (
                    <td key={i} className={`p-5 text-center ${isBest ? 'bg-emerald-50/30' : ''}`}>
                      <span className={`font-bold text-sm ${isBest ? 'text-emerald-700 font-black' : 'text-slate-700'}`}>
                        {val}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredProducts.map((product, i) => {
          const bank = bankMap.get(product.bank_id);
          const isBest = i === 0 && sortBy === 'rate';
          const isExpanded = expandedBank === product.id;

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                isBest ? 'border-emerald-300 shadow-lg shadow-emerald-100' : 'border-slate-200'
              }`}
            >
              <button
                onClick={() => setExpandedBank(isExpanded ? null : product.id)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <BankLogo bank={bank} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{bank?.name ?? product.name}</span>
                        {isBest && (
                          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                            <Trophy className="w-3 h-3" />
                            Лучшее
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-500">{bank?.overall_rating ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-600">{product.interest_rate}%</div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 ml-auto" /> : <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                  {comparisonRows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex justify-between py-2">
                      <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                      <span className="text-sm text-slate-900 font-bold">{row.values[i]}</span>
                    </div>
                  ))}
                  {bank?.website_url && (
                    <a
                      href={bank.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all"
                    >
                      Перейти на сайт
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-6">
        <h3 className="font-black text-blue-900 text-lg mb-2">💡 Как выбрать?</h3>
        <p className="text-blue-800 font-medium text-sm leading-relaxed">
          {selectedType === 'mortgage' && 'Обращайте внимание не только на ставку, но и на наличие досрочного погашения, онлайн-заявки и дополнительных комиссий. Разница в 0.5% может сэкономить сотни тысяч за весь срок.'}
          {selectedType === 'deposit' && 'Сравнивайте не только ставку, но и условия пополнения, капитализации и досрочного снятия. Вклад с капитализацией может дать больший доход при той же ставке.'}
          {selectedType === 'credit' && 'Потребительский кредит — это не только ставка. Учитывайте страховку, комиссии за обслуживание и возможность досрочного погашения без штрафов.'}
          {selectedType === 'card' && 'Обращайте внимание на кэшбэк, бесплатное обслуживание и процент на остаток. Иногда карта с меньшим кэшбэком, но без платы за обслуживание выгоднее.'}
        </p>
      </div>
    </div>
  );
}
