export const FIXED_CONTRIBUTIONS_2026 = 57390;
export const NPD_LIMIT = 2400000;
export const ONE_PCT_THRESHOLD = 300000;
export const NDFL_RATE = 0.13;

export function fmt(n: number): string {
  return Math.round(n).toLocaleString('ru-RU');
}

export function deductionMonthlySaving(income: number, shareFromLegal: number): number {
  return income * 0.01 * (1 + shareFromLegal);
}

export interface NpdResult {
  ratePhysical: number;
  rateLegal: number;
  ratePhysicalNow: number;
  rateLegalNow: number;
  monthlyStable: number;
  monthlyWithDed: number;
  effectiveRate: number;
  monthlySavingFromDed: number;
  monthsDeductionLasts: number | null;
  tax: number;
  rate: number;
  taxYear: number;
  savingsNdfl: number;
  insurance: number;
}

export function calcNpd(income: number, shareFromLegal: number, useDeduction: boolean = false): NpdResult {
  const pct = shareFromLegal;
  const ratePhysical = 0.04;
  const rateLegal = 0.06;
  const ratePhysicalNow = useDeduction ? 0.03 : 0.04;
  const rateLegalNow = useDeduction ? 0.04 : 0.06;
  const blendedStable = (1 - pct) * ratePhysical + pct * rateLegal;
  const blendedNow = (1 - pct) * ratePhysicalNow + pct * rateLegalNow;
  const monthlyStable = Math.round(income * blendedStable);
  const monthlyWithDed = Math.round(income * blendedNow);
  const saving = useDeduction ? Math.round(deductionMonthlySaving(income, pct)) : 0;
  const monthsDeductionLasts = useDeduction && saving > 0 ? Math.ceil(10000 / saving) : null;
  const ndfl = income * NDFL_RATE;
  return {
    ratePhysical,
    rateLegal,
    ratePhysicalNow,
    rateLegalNow,
    monthlyStable,
    monthlyWithDed,
    effectiveRate: blendedStable * 100,
    monthlySavingFromDed: saving,
    monthsDeductionLasts,
    tax: monthlyStable,
    rate: blendedStable * 100,
    taxYear: monthlyStable * 12,
    savingsNdfl: Math.round(ndfl - monthlyStable),
    insurance: 0,
  };
}

export interface UsnResult {
  tax: number;
  taxYear: number;
  rate: number;
  effectiveRate: number;
  insurance: number;
  totalBurden: number;
  savingsNdfl: number;
}

export function calcUsn(income: number, hasEmployees: boolean): UsnResult {
  const baseTax = income * 0.06;
  const annualIncome = income * 12;
  const monthlyFixed = FIXED_CONTRIBUTIONS_2026 / 12;
  const monthlyOnePct = Math.max(0, (annualIncome - ONE_PCT_THRESHOLD) * 0.01) / 12;
  const monthlyContribs = monthlyFixed + monthlyOnePct;

  const maxDeduction = hasEmployees ? baseTax * 0.5 : baseTax;
  const deduction = Math.min(monthlyContribs, maxDeduction);
  const taxPayable = Math.max(0, baseTax - deduction);
  const totalBurden = taxPayable + monthlyContribs;
  const ndfl = income * NDFL_RATE;
  const effectiveRate = income > 0 ? totalBurden / income : 0;

  return {
    tax: Math.round(taxPayable),
    taxYear: Math.round(taxPayable * 12),
    rate: income > 0 ? (taxPayable / income) * 100 : 0,
    effectiveRate: effectiveRate * 100,
    insurance: Math.round(monthlyContribs),
    totalBurden: Math.round(totalBurden),
    savingsNdfl: Math.round(ndfl - taxPayable),
  };
}

export interface PatentResult {
  tax: number;
  taxYear: number;
  rate: number;
  insurance: number;
  totalBurden: number;
  savingsNdfl: number;
}

export function calcPatent(income: number, patentCost: number): PatentResult {
  const monthlyFixed = FIXED_CONTRIBUTIONS_2026 / 12;
  const tax = patentCost / 12;
  const ndfl = income * NDFL_RATE;
  return {
    tax: Math.round(tax),
    taxYear: Math.round(patentCost),
    rate: income > 0 ? (tax / income) * 100 : 0,
    insurance: Math.round(monthlyFixed),
    totalBurden: Math.round(tax + monthlyFixed),
    savingsNdfl: Math.round(ndfl - tax),
  };
}

export interface ComparisonResult {
  npd: NpdResult;
  usn: UsnResult;
  winner: 'npd' | 'usn' | 'tie';
  npdBurden: number;
  usnBurden: number;
  monthlySavings: number;
  annualSavings: number;
  npdAvailable: boolean;
  intersectionIncome: number | null;
  npdMonthlyWithDeduction: number;
  npdDeductionMonthsLeft: number | null;
  npdMonthlySavingFromDed: number;
}

export function compareNpdVsUsn(
  income: number,
  legalShare: number,
  hasEmployees: boolean,
  useNpdDeduction: boolean = false
): ComparisonResult {
  const pct = legalShare / 100;

  const npdResult = calcNpd(income, pct, useNpdDeduction);
  const ndfl = income * NDFL_RATE;

  const usnResult = calcUsn(income, hasEmployees);

  const npdBurden = npdResult.monthlyStable;
  const usnBurden = usnResult.totalBurden;

  const diff = Math.abs(npdBurden - usnBurden);
  const threshold = Math.max(npdBurden, usnBurden) * 0.02;
  let winner: ComparisonResult['winner'] = 'tie';
  if (diff > threshold) {
    winner = npdBurden < usnBurden ? 'npd' : 'usn';
  }

  const npdAvailable = income * 12 <= NPD_LIMIT;
  const intersectionIncome = findIntersection(legalShare, hasEmployees);

  return {
    npd: npdResult,
    usn: usnResult,
    winner,
    npdBurden,
    usnBurden,
    monthlySavings: diff,
    annualSavings: diff * 12,
    npdAvailable,
    intersectionIncome,
    npdMonthlyWithDeduction: npdResult.monthlyWithDed,
    npdDeductionMonthsLeft: npdResult.monthsDeductionLasts,
    npdMonthlySavingFromDed: npdResult.monthlySavingFromDed,
  };
}

function usnBurdenAt(income: number, hasEmployees: boolean): number {
  const baseTax = income * 0.06;
  const annualIncome = income * 12;
  const monthlyFixed = FIXED_CONTRIBUTIONS_2026 / 12;
  const monthlyOnePct = Math.max(0, (annualIncome - ONE_PCT_THRESHOLD) * 0.01) / 12;
  const monthlyContribs = monthlyFixed + monthlyOnePct;
  const maxDeduction = hasEmployees ? baseTax * 0.5 : baseTax;
  const deduction = Math.min(monthlyContribs, maxDeduction);
  const usnTax = Math.max(0, baseTax - deduction);
  return usnTax + monthlyContribs;
}

export function findIntersection(
  legalShare: number,
  hasEmployees: boolean
): number | null {
  const npdRate = (legalShare / 100) * 0.06 + (1 - legalShare / 100) * 0.04;
  const threshold = 100;
  let lo = 10000;
  let hi = 200000;

  const loDiff = lo * npdRate - usnBurdenAt(lo, hasEmployees);
  const hiDiff = hi * npdRate - usnBurdenAt(hi, hasEmployees);
  if (Math.abs(loDiff) < threshold) return lo;
  if (loDiff < 0 && hiDiff < 0) return null;
  if (loDiff > 0 && hiDiff > 0) return null;

  for (let iter = 0; iter < 50; iter++) {
    const mid = Math.round((lo + hi) / 2 / 1000) * 1000;
    if (mid <= lo || mid >= hi) break;
    const npdTax = mid * npdRate;
    const usnLoad = usnBurdenAt(mid, hasEmployees);
    if (npdTax < usnLoad) lo = mid;
    else hi = mid;
  }

  return hi;
}
