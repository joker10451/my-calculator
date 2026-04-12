const API_URL = 'https://www.cbr-xml-daily.ru/daily_json.js';
const CACHE_KEY = 'cbr_rates';
const CACHE_TTL = 4 * 60 * 60 * 1000;

export interface CurrencyRate {
  charCode: string;
  name: string;
  value: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface CBRData {
  date: string;
  rates: CurrencyRate[];
  keyRate: number;
}

const KEY_RATES: Record<string, number> = {
  '2026-04': 21.0,
  '2026-03': 21.0,
  '2026-02': 21.0,
  '2026-01': 21.0,
  '2025-12': 21.0,
  '2025-11': 21.0,
  '2025-10': 21.0,
  '2025-09': 19.0,
  '2025-08': 18.0,
  '2025-07': 18.0,
  '2025-06': 20.0,
  '2025-05': 21.0,
  '2025-04': 21.0,
};

function getKeyRate(): number {
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return KEY_RATES[key] ?? 21.0;
}

export async function fetchCBRRates(): Promise<CBRData> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        return parsed.data;
      }
    }
  } catch {}

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('CBR API error');

    const data = await response.json();
    const mainCurrencies = ['USD', 'EUR', 'CNY', 'GBP', 'KZT', 'BYN', 'TRY', 'JPY'];

    const rates: CurrencyRate[] = mainCurrencies
      .map(code => {
        const v = data.Valute?.[code];
        if (!v) return null;
        const change = v.Value - v.Previous;
        return {
          charCode: v.CharCode,
          name: v.Name,
          value: v.Value,
          previous: v.Previous,
          change: Math.round(change * 10000) / 10000,
          changePercent: Math.round((change / v.Previous) * 10000) / 100,
        };
      })
      .filter(Boolean) as CurrencyRate[];

    const result: CBRData = {
      date: data.Date,
      rates,
      keyRate: getKeyRate(),
    };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: result }));
    } catch {}

    return result;
  } catch (error) {
    console.warn('Failed to fetch CBR rates:', error);
    return {
      date: new Date().toISOString(),
      rates: [
        { charCode: 'USD', name: 'Доллар США', value: 77, previous: 77, change: 0, changePercent: 0 },
        { charCode: 'EUR', name: 'Евро', value: 90, previous: 90, change: 0, changePercent: 0 },
        { charCode: 'CNY', name: 'Юань', value: 10.5, previous: 10.5, change: 0, changePercent: 0 },
      ],
      keyRate: getKeyRate(),
    };
  }
}
