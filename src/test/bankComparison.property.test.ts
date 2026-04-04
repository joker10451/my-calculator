import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

describe('Bank Comparison - Property Tests', () => {
  test('monthly payment should increase with higher interest rate', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 500000, max: 30000000 }),
        fc.integer({ min: 1, max: 30 }),
        fc.double({ min: 5, max: 25 }),
        (amount, termYears, rate) => {
          const monthlyRate = rate / 100 / 12;
          const months = termYears * 12;
          const payment1 = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
          const payment2 = amount * ((monthlyRate + 0.01) * Math.pow(1 + monthlyRate + 0.01, months)) / (Math.pow(1 + monthlyRate + 0.01, months) - 1);
          expect(payment2).toBeGreaterThan(payment1);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('total overpayment should always be positive for rates > 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 30000000 }),
        fc.integer({ min: 1, max: 30 }),
        fc.double({ min: 0.1, max: 30 }),
        (amount, termYears, rate) => {
          const monthlyRate = rate / 100 / 12;
          const months = termYears * 12;
          const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
          const totalPaid = payment * months;
          expect(totalPaid).toBeGreaterThan(amount);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('shorter term should always result in less total interest', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 500000, max: 30000000 }),
        fc.integer({ min: 5, max: 30 }),
        fc.double({ min: 5, max: 30 }),
        (amount, termYears, rate) => {
          const monthlyRate = rate / 100 / 12;
          const calcTotal = (years: number) => {
            const m = years * 12;
            const p = amount * (monthlyRate * Math.pow(1 + monthlyRate, m)) / (Math.pow(1 + monthlyRate, m) - 1);
            return p * m - amount;
          };
          const shorter = calcTotal(Math.max(1, termYears - 5));
          const longer = calcTotal(termYears);
          expect(longer).toBeGreaterThan(shorter);
        }
      ),
      { numRuns: 100 }
    );
  });
});
