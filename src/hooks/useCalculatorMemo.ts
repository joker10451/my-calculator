import { useMemo, DependencyList } from 'react';

/**
 * Хук для мемоизации сложных расчетов в калькуляторах
 * Предотвращает лишние пересчеты при изменении несвязанных параметров
 */
export const useCalculatorMemo = <T>(
  calculateFn: () => T,
  deps: DependencyList
): T => {
  return useMemo(() => {
    try {
      return calculateFn();
    } catch (error) {
      console.error('Ошибка в расчетах:', error);
      // Возвращаем безопасное значение по умолчанию
      return {} as T;
    }
  }, deps);
};

/**
 * Хук для расчета кредита/ипотеки с аннуитетными платежами
 */
export const useAnnuityCalculation = (
  principal: number,
  annualRate: number,
  termMonths: number
) => {
  return useCalculatorMemo(() => {
    if (principal <= 0 || termMonths <= 0) {
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        overpaymentPercent: 0,
      };
    }

    const monthlyRate = annualRate / 100 / 12;
    
    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = principal / termMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, termMonths);
      monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
    }

    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - principal;
    const overpaymentPercent = (totalInterest / principal) * 100;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      overpaymentPercent: Number(overpaymentPercent.toFixed(2)),
    };
  }, [principal, annualRate, termMonths]);
};

/**
 * Хук для расчета дифференцированных платежей
 */
export const useDifferentiatedCalculation = (
  principal: number,
  annualRate: number,
  termMonths: number
) => {
  return useCalculatorMemo(() => {
    if (principal <= 0 || termMonths <= 0) {
      return {
        firstPayment: 0,
        lastPayment: 0,
        averagePayment: 0,
        totalPayment: 0,
        totalInterest: 0,
      };
    }

    const monthlyRate = annualRate / 100 / 12;
    const principalPayment = principal / termMonths;
    
    let totalPayment = 0;
    let remainingPrincipal = principal;
    
    const payments: number[] = [];
    
    for (let month = 1; month <= termMonths; month++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const payment = principalPayment + interestPayment;
      payments.push(payment);
      totalPayment += payment;
      remainingPrincipal -= principalPayment;
    }

    const totalInterest = totalPayment - principal;
    const averagePayment = totalPayment / termMonths;

    return {
      firstPayment: Math.round(payments[0]),
      lastPayment: Math.round(payments[payments.length - 1]),
      averagePayment: Math.round(averagePayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    };
  }, [principal, annualRate, termMonths]);
};

/**
 * Хук для расчета вклада с капитализацией
 */
export const useDepositCalculation = (
  initialAmount: number,
  annualRate: number,
  termMonths: number,
  monthlyReplenishment: number = 0
) => {
  return useCalculatorMemo(() => {
    if (initialAmount <= 0 || termMonths <= 0) {
      return {
        finalAmount: 0,
        totalInterest: 0,
        totalInvested: 0,
      };
    }

    const monthlyRate = annualRate / 100 / 12;
    let balance = initialAmount;
    let totalInterest = 0;

    for (let month = 1; month <= termMonths; month++) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest + monthlyReplenishment;
    }

    const totalInvested = initialAmount + (monthlyReplenishment * termMonths);

    return {
      finalAmount: Math.round(balance),
      totalInterest: Math.round(totalInterest),
      totalInvested: Math.round(totalInvested),
    };
  }, [initialAmount, annualRate, termMonths, monthlyReplenishment]);
};
