import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown, Calculator } from 'lucide-react';
import { BANK_RATES, type BankRateData } from '@/data/bankRates';

type ProductType = 'mortgage' | 'credit' | 'deposit';
type SortField = string;
type SortDir = 'asc' | 'desc';

function formatAmount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} млн ₽`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} тыс. ₽`;
  return `${value} ₽`;
}

export function BankComparisonTable() {
  const [activeTab, setActiveTab] = useState<ProductType>('mortgage');
  const [sortField, setSortField] = useState<SortField>('rate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-muted-foreground" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-primary" />
      : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  const sortedBanks = useMemo(() => {
    const sorted = [...BANK_RATES];
    sorted.sort((a, b) => {
      let aVal: number, bVal: number;
      if (activeTab === 'mortgage') {
        if (sortField === 'rate') { aVal = a.mortgage.rate; bVal = b.mortgage.rate; }
        else if (sortField === 'maxAmount') { aVal = a.mortgage.maxAmount; bVal = b.mortgage.maxAmount; }
        else if (sortField === 'downPayment') { aVal = a.mortgage.minDownPayment; bVal = b.mortgage.minDownPayment; }
        else { aVal = a.rating; bVal = b.rating; }
      } else if (activeTab === 'credit') {
        if (sortField === 'rate') { aVal = a.credit.rate; bVal = b.credit.rate; }
        else if (sortField === 'maxAmount') { aVal = a.credit.maxAmount; bVal = b.credit.maxAmount; }
        else { aVal = a.rating; bVal = b.rating; }
      } else {
        if (sortField === 'rate') { aVal = a.deposit.rate; bVal = b.deposit.rate; }
        else if (sortField === 'minAmount') { aVal = a.deposit.minAmount; bVal = b.deposit.minAmount; }
        else { aVal = a.rating; bVal = b.rating; }
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [activeTab, sortField, sortDir]);

  const tabs: { id: ProductType; label: string }[] = [
    { id: 'mortgage', label: 'Ипотека' },
    { id: 'credit', label: 'Кредиты' },
    { id: 'deposit', label: 'Вклады' },
  ];

  const getCalcLink = (bank: BankRateData) => {
    if (activeTab === 'mortgage') return `/calculator/mortgage?rate=${bank.mortgage.rate}`;
    if (activeTab === 'credit') return `/calculator/credit?rate=${bank.credit.rate}`;
    return `/calculator/deposit?rate=${bank.deposit.rate}`;
  };

  return (
    <div>
      {/* Табы */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSortField('rate'); setSortDir('asc'); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold text-foreground">Банк</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer select-none" onClick={() => handleSort('rate')}>
                <span className="inline-flex items-center gap-1.5">Ставка <SortIcon field="rate" /></span>
              </th>
              {activeTab === 'mortgage' && (
                <>
                  <th className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer select-none hidden sm:table-cell" onClick={() => handleSort('maxAmount')}>
                    <span className="inline-flex items-center gap-1.5">Макс. сумма <SortIcon field="maxAmount" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer select-none hidden md:table-cell" onClick={() => handleSort('downPayment')}>
                    <span className="inline-flex items-center gap-1.5">Мин. взнос <SortIcon field="downPayment" /></span>
                  </th>
                </>
              )}
              {activeTab === 'credit' && (
                <th className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer select-none hidden sm:table-cell" onClick={() => handleSort('maxAmount')}>
                  <span className="inline-flex items-center gap-1.5">Макс. сумма <SortIcon field="maxAmount" /></span>
                </th>
              )}
              {activeTab === 'deposit' && (
                <th className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer select-none hidden sm:table-cell" onClick={() => handleSort('minAmount')}>
                  <span className="inline-flex items-center gap-1.5">Мин. сумма <SortIcon field="minAmount" /></span>
                </th>
              )}
              <th className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer select-none hidden lg:table-cell" onClick={() => handleSort('rating')}>
                <span className="inline-flex items-center gap-1.5">Рейтинг <SortIcon field="rating" /></span>
              </th>
              <th className="text-right px-4 py-3 font-semibold text-foreground">Расчёт</th>
            </tr>
          </thead>
          <tbody>
            {sortedBanks.map((bank, idx) => (
              <tr key={bank.slug} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx === 0 ? 'bg-primary/[0.03]' : ''}`}>
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-foreground">{bank.name}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-lg font-black ${idx === 0 ? 'text-primary' : 'text-foreground'}`}>
                    {activeTab === 'mortgage' && `${bank.mortgage.rate}%`}
                    {activeTab === 'credit' && `${bank.credit.rate}%`}
                    {activeTab === 'deposit' && `${bank.deposit.rate}%`}
                  </span>
                </td>
                {activeTab === 'mortgage' && (
                  <>
                    <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">{formatAmount(bank.mortgage.maxAmount)}</td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">от {bank.mortgage.minDownPayment}%</td>
                  </>
                )}
                {activeTab === 'credit' && (
                  <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">{formatAmount(bank.credit.maxAmount)}</td>
                )}
                {activeTab === 'deposit' && (
                  <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">от {formatAmount(bank.deposit.minAmount)}</td>
                )}
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <span className="text-amber-400 font-bold">{'★'.repeat(Math.round(bank.rating))}</span>
                  <span className="text-xs text-muted-foreground ml-1">{bank.rating}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link
                    to={getCalcLink(bank)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                  >
                    <Calculator className="w-3 h-3" />
                    Рассчитать
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
