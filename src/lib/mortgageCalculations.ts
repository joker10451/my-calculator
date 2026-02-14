/**
 * Mortgage calculation logic
 * Extracted to avoid minification issues with large useMemo blocks
 */

export interface ExtraPayment {
  id: string;
  amount: number;
  type: 'one-time' | 'monthly';
  month: number;
  mode: 'reduce-term' | 'reduce-payment';
}

export interface ScheduleItem {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
  isEarly: boolean;
}

export interface ComparisonDataItem {
  name: string;
  current: number;
  standard: number;
}

export interface MortgageCalculationResult {
  loanAmount: number;
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  savings: number;
  termReductionMonths: number;
  schedule: ScheduleItem[];
  comparisonData: ComparisonDataItem[];
  originalMonths: number;
  actualMonths: number;
}

export interface MortgageParams {
  price: number;
  initialPayment: number;
  isInitialPercent: boolean;
  term: number;
  rate: number;
  withMatCapital: boolean;
  paymentType: 'annuity' | 'differentiated';
  extraPayments: ExtraPayment[];
  MAT_CAPITAL: number;
}

export function calculateMortgage(params: MortgageParams): MortgageCalculationResult {
  const {
    price,
    initialPayment,
    isInitialPercent,
    term,
    rate,
    withMatCapital,
    paymentType,
    extraPayments,
    MAT_CAPITAL
  } = params;

  const principalAdjustment = withMatCapital ? MAT_CAPITAL : 0;
  const initialAmount = isInitialPercent ? (price * initialPayment) / 100 : initialPayment;
  const loanAmount = Math.max(0, price - initialAmount - principalAdjustment);
  const months = term * 12;
  const monthlyRate = rate / 100 / 12;

  let totalInterest = 0;
  let totalPaid = 0;
  const schedule: ScheduleItem[] = [];
  const comparisonData: ComparisonDataItem[] = [];

  let remainingBalance = loanAmount;
  let standardBalance = loanAmount;

  // Monthly annuity payment for the original loan (Standard schedule reference)
  const standardMonthlyPayment = monthlyRate === 0 ? loanAmount / months :
    loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

  let currentMonthlyPayment = standardMonthlyPayment;
  let month = 1;

  while (remainingBalance > 1 && month <= 600) { // Max 50 years safety limit
    const interestPayment = remainingBalance * monthlyRate;

    // Find extra payments for this month
    const extraThisMonth = extraPayments
      .filter(ep => ep.type === 'one-time' ? ep.month === month : month >= ep.month)
      .reduce((sum, ep) => sum + ep.amount, 0);

    // Principal payment
    let principalPayment = 0;
    if (paymentType === "annuity") {
      principalPayment = Math.min(remainingBalance, currentMonthlyPayment - interestPayment);
    } else {
      // Differentiated
      const standardPrincipal = loanAmount / months;
      principalPayment = Math.min(remainingBalance, standardPrincipal);
    }

    const totalMonthlyPrincipal = Math.min(remainingBalance, principalPayment + extraThisMonth);
    const totalMonthlyPayment = interestPayment + totalMonthlyPrincipal;

    totalInterest += interestPayment;
    totalPaid += totalMonthlyPayment;
    remainingBalance -= totalMonthlyPrincipal;

    // Check if we need to reduce payment (if mode is reduce-payment)
    const shouldReducePayment = extraPayments.some(ep =>
      ep.mode === 'reduce-payment' && (ep.type === 'one-time' ? ep.month === month : month >= ep.month) && extraThisMonth > 0
    );

    if (shouldReducePayment && remainingBalance > 100 && paymentType === 'annuity') {
      const remainingMonths = months - month;
      if (remainingMonths > 0) {
        currentMonthlyPayment = remainingBalance * (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / (Math.pow(1 + monthlyRate, remainingMonths) - 1);
      }
    }

    // Collect data for charts and schedule
    if (month <= 12 * 30) {
      schedule.push({
        month,
        payment: Math.round(totalMonthlyPayment),
        interest: Math.round(interestPayment),
        principal: Math.round(totalMonthlyPrincipal),
        balance: Math.max(0, Math.round(remainingBalance)),
        isEarly: extraThisMonth > 0
      });
    }

    // Comparison data for line chart
    if (month % 12 === 0 || remainingBalance <= 0) {
      standardBalance = Math.max(0, standardBalance); // Simplified for chart
      comparisonData.push({
        name: `${Math.floor(month / 12)}г`,
        current: Math.round(remainingBalance / 1000),
        standard: Math.round(standardBalance / 1000)
      });
    }

    // Update standard balance for real tracking
    const stdInterest = standardBalance * monthlyRate;
    const stdPrincipal = Math.min(standardBalance, standardMonthlyPayment - stdInterest);
    standardBalance -= stdPrincipal;

    if (remainingBalance <= 0) break;
    month++;
  }

  const standardTotalInterest = (standardMonthlyPayment * months) - loanAmount;
  const savings = Math.max(0, Math.round(standardTotalInterest - totalInterest));
  const actualMonths = Math.min(month, months);

  return {
    loanAmount,
    monthlyPayment: Math.round(schedule[0]?.payment || 0),
    totalAmount: Math.round(totalPaid),
    totalInterest: Math.round(totalInterest),
    savings,
    termReductionMonths: months - actualMonths,
    schedule,
    comparisonData,
    originalMonths: months,
    actualMonths: actualMonths
  };
}
