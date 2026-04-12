export interface CPIEntry {
  month: string;
  year: number;
  monthNum: number;
  index: number;
  rate: number;
  rateYoY: number;
}

export interface CPIData {
  lastUpdate: string;
  currentYoY: number;
  currentMonth: CPIEntry;
  monthly: CPIEntry[];
  yearlyAvg: Record<number, number>;
}

const CPI_MONTHLY: Array<{ y: number; m: number; idx: number; rate: number; yoy: number }> = [
  { y: 2024, m: 1, idx: 261.18, rate: 0.75, yoy: 7.07 },
  { y: 2024, m: 2, idx: 262.31, rate: 0.43, yoy: 7.18 },
  { y: 2024, m: 3, idx: 263.28, rate: 0.37, yoy: 7.36 },
  { y: 2024, m: 4, idx: 264.18, rate: 0.34, yoy: 7.41 },
  { y: 2024, m: 5, idx: 264.95, rate: 0.29, yoy: 7.37 },
  { y: 2024, m: 6, idx: 265.82, rate: 0.33, yoy: 7.49 },
  { y: 2024, m: 7, idx: 266.82, rate: 0.38, yoy: 7.57 },
  { y: 2024, m: 8, idx: 267.86, rate: 0.39, yoy: 7.60 },
  { y: 2024, m: 9, idx: 268.88, rate: 0.38, yoy: 7.67 },
  { y: 2024, m: 10, idx: 270.17, rate: 0.48, yoy: 8.04 },
  { y: 2024, m: 11, idx: 271.82, rate: 0.61, yoy: 8.47 },
  { y: 2024, m: 12, idx: 273.43, rate: 0.59, yoy: 9.52 },
  { y: 2025, m: 1, idx: 275.32, rate: 0.69, yoy: 9.93 },
  { y: 2025, m: 2, idx: 276.91, rate: 0.58, yoy: 10.02 },
  { y: 2025, m: 3, idx: 278.28, rate: 0.50, yoy: 10.25 },
  { y: 2025, m: 4, idx: 279.51, rate: 0.44, yoy: 10.34 },
  { y: 2025, m: 5, idx: 280.50, rate: 0.35, yoy: 10.22 },
  { y: 2025, m: 6, idx: 281.58, rate: 0.38, yoy: 10.15 },
  { y: 2025, m: 7, idx: 282.72, rate: 0.41, yoy: 10.27 },
  { y: 2025, m: 8, idx: 283.71, rate: 0.35, yoy: 9.91 },
  { y: 2025, m: 9, idx: 284.88, rate: 0.41, yoy: 9.89 },
  { y: 2025, m: 10, idx: 286.01, rate: 0.40, yoy: 9.62 },
  { y: 2025, m: 11, idx: 287.44, rate: 0.50, yoy: 9.15 },
  { y: 2025, m: 12, idx: 288.62, rate: 0.41, yoy: 8.45 },
  { y: 2026, m: 1, idx: 289.92, rate: 0.45, yoy: 8.42 },
  { y: 2026, m: 2, idx: 291.15, rate: 0.42, yoy: 8.34 },
  { y: 2026, m: 3, idx: 292.30, rate: 0.40, yoy: 8.20 },
];

const YEARLY_AVG: Record<number, number> = {
  2018: 2.52,
  2019: 4.32,
  2020: 3.39,
  2021: 6.48,
  2022: 13.77,
  2023: 7.42,
  2024: 9.52,
  2025: 8.45,
};

const MONTH_NAMES = ['', 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

export function getCPIData(): CPIData {
  const monthly: CPIEntry[] = CPI_MONTHLY.map(e => ({
    month: MONTH_NAMES[e.m],
    year: e.y,
    monthNum: e.m,
    index: e.idx,
    rate: e.rate,
    rateYoY: e.yoy,
  }));

  const currentMonth = monthly[monthly.length - 1];

  return {
    lastUpdate: `${currentMonth.month} ${currentMonth.year}`,
    currentYoY: currentMonth.rateYoY,
    currentMonth,
    monthly: monthly.slice(-12),
    yearlyAvg: YEARLY_AVG,
  };
}

export function calculateInflationImpact(
  amount: number,
  annualRate: number,
  years: number
): { futureValue: number; realValue: number; loss: number; lossPercent: number } {
  const futureValue = amount * Math.pow(1 + annualRate / 100, years);
  const realValue = amount / Math.pow(1 + annualRate / 100, years);
  const loss = amount - realValue;
  const lossPercent = (loss / amount) * 100;

  return { futureValue, realValue, loss, lossPercent };
}
