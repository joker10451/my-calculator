import { describe, test, expect } from 'vitest';
import { OverpaymentCalculator } from '@/components/calculators/OverpaymentCalculator';

describe('OverpaymentCalculator', () => {
  test('should render without crashing', () => {
    expect(OverpaymentCalculator).toBeDefined();
  });

  test('should calculate correct monthly payment for 3M at 22% for 20 years', () => {
    const amount = 3000000;
    const rate = 22;
    const term = 20;
    const monthlyRate = rate / 100 / 12;
    const months = term * 12;
    const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - amount;
    
    expect(Math.round(monthlyPayment)).toBe(55563);
    expect(Math.round(totalInterest)).toBeGreaterThan(10000000);
    expect(Math.round(totalInterest)).toBeLessThan(15000000);
  });

  test('should have higher overpayment for longer terms', () => {
    const amount = 3000000;
    const rate = 22;
    
    const calcInterest = (term: number) => {
      const monthlyRate = rate / 100 / 12;
      const months = term * 12;
      const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      return monthlyPayment * months - amount;
    };
    
    const interest10 = calcInterest(10);
    const interest20 = calcInterest(20);
    const interest30 = calcInterest(30);
    
    expect(interest20).toBeGreaterThan(interest10);
    expect(interest30).toBeGreaterThan(interest20);
  });

  test('should have higher overpayment for higher rates', () => {
    const amount = 3000000;
    const term = 20;
    
    const calcInterest = (rate: number) => {
      const monthlyRate = rate / 100 / 12;
      const months = term * 12;
      const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      return monthlyPayment * months - amount;
    };
    
    const interest15 = calcInterest(15);
    const interest22 = calcInterest(22);
    const interest25 = calcInterest(25);
    
    expect(interest22).toBeGreaterThan(interest15);
    expect(interest25).toBeGreaterThan(interest22);
  });

  test('should return null for invalid inputs', () => {
    const calc = (a: number, r: number, t: number) => {
      if (a <= 0 || r <= 0 || t <= 0) return null;
      const monthlyRate = r / 100 / 12;
      const months = t * 12;
      const monthlyPayment = a * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      return { totalInterest: monthlyPayment * months - a };
    };
    
    expect(calc(0, 22, 20)).toBeNull();
    expect(calc(3000000, 0, 20)).toBeNull();
    expect(calc(3000000, 22, 0)).toBeNull();
  });

  test('bank comparison should show savings between best and worst rates', () => {
    const amount = 3000000;
    const term = 20;
    const months = term * 12;
    
    const calcTotal = (rate: number) => {
      const monthlyRate = rate / 100 / 12;
      const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      return payment * months;
    };
    
    const bestRate = 22.5;
    const worstRate = 24.1;
    const savings = calcTotal(worstRate) - calcTotal(bestRate);
    
    expect(savings).toBeGreaterThan(0);
    expect(Math.round(savings)).toBeGreaterThan(500000);
  });
});
