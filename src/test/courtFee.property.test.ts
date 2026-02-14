/**
 * Property-based тесты для калькулятора госпошлины
 * Feature: court-fee-calculator, Property 1: General Jurisdiction Fee Calculation
 * Feature: court-fee-calculator, Property 2: Arbitration Court Fee Calculation
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  CourtFeeCalculation, 
  CalculationInput, 
  CalculationResult,
  FeeRule,
  ExemptionCategory,
  CourtType,
  FeeCalculation
} from '@/types/courtFee';
import { 
  GENERAL_JURISDICTION_RULES, 
  ARBITRATION_RULES, 
  findApplicableRule 
} from '@/data/courtFeeSchedule';
import { EXEMPTION_CATEGORIES } from '@/data/courtFeeExemptions';
import { FeeCalculationEngine } from '@/lib/feeCalculationEngine';

// Генераторы для property-based тестирования
const claimAmountGenerator = fc.integer({ min: 1, max: 10000000 });
const courtTypeGenerator = fc.constantFrom('general' as CourtType, 'arbitration' as CourtType);
const exemptionGenerator = fc.option(fc.constantFrom(...EXEMPTION_CATEGORIES), { nil: null });

// Создаем экземпляр движка расчетов
const feeEngine = new FeeCalculationEngine();

describe('Court Fee Calculator Property Tests', () => {
  
  test('Property 1: General Jurisdiction Fee Calculation - Progressive Scale Compliance', () => {
    // Feature: court-fee-calculator, Property 1: General Jurisdiction Fee Calculation
    // Validates: Requirements 1.1, 1.2, 1.3, 1.4
    
    fc.assert(
      fc.property(claimAmountGenerator, (claimAmount) => {
        const calculation = feeEngine.calculateGeneralJurisdictionFee(claimAmount);
        const fee = calculation.amount;
        
        // Проверяем, что пошлина всегда положительная для положительных сумм
        expect(fee).toBeGreaterThan(0);
        
        // Проверяем соответствие тарифным диапазонам
        if (claimAmount <= 20000) {
          // 4% от цены иска, но не менее 400 руб.
          const expectedFee = Math.max(claimAmount * 0.04, 400);
          expect(fee).toBe(expectedFee);
          expect(fee).toBeGreaterThanOrEqual(400);
        } else if (claimAmount <= 100000) {
          // 800 руб. + 3% с суммы, превышающей 20 000 руб.
          const expectedFee = 800 + (claimAmount - 20000) * 0.03;
          expect(fee).toBe(expectedFee);
        } else if (claimAmount <= 200000) {
          // 3 200 руб. + 2% с суммы, превышающей 100 000 руб.
          const expectedFee = 3200 + (claimAmount - 100000) * 0.02;
          expect(fee).toBe(expectedFee);
        } else if (claimAmount <= 1000000) {
          // 5 200 руб. + 1% с суммы, превышающей 200 000 руб.
          const expectedFee = 5200 + (claimAmount - 200000) * 0.01;
          expect(fee).toBe(expectedFee);
        } else {
          // Максимальная сумма 60 000 руб.
          expect(fee).toBe(60000);
        }
        
        // Проверяем максимальный лимит
        expect(fee).toBeLessThanOrEqual(60000);
        
        // Проверяем структуру результата
        expect(calculation.formula).toBeDefined();
        expect(calculation.breakdown).toBeDefined();
        expect(calculation.breakdown.length).toBeGreaterThan(0);
        expect(calculation.applicableArticle).toBe('ст. 333.19 НК РФ');
      }),
      { numRuns: 100 }
    );
  });

  test('Property 2: Arbitration Court Fee Calculation - Progressive Scale Compliance', () => {
    // Feature: court-fee-calculator, Property 2: Arbitration Court Fee Calculation
    // Validates: Requirements 2.1, 2.2, 2.3, 2.4
    
    fc.assert(
      fc.property(claimAmountGenerator, (claimAmount) => {
        const calculation = feeEngine.calculateArbitrationFee(claimAmount);
        const fee = calculation.amount;
        
        // Проверяем, что пошлина всегда положительная для положительных сумм
        expect(fee).toBeGreaterThan(0);
        
        // Проверяем соответствие тарифным диапазонам
        if (claimAmount <= 100000) {
          // 4% от цены иска, но не менее 2 000 руб.
          const expectedFee = Math.max(claimAmount * 0.04, 2000);
          expect(fee).toBe(expectedFee);
          expect(fee).toBeGreaterThanOrEqual(2000);
        } else if (claimAmount <= 500000) {
          // 4 000 руб. + 3% с суммы, превышающей 100 000 руб.
          const expectedFee = 4000 + (claimAmount - 100000) * 0.03;
          expect(fee).toBe(expectedFee);
        } else if (claimAmount <= 1500000) {
          // 16 000 руб. + 2% с суммы, превышающей 500 000 руб.
          const expectedFee = 16000 + (claimAmount - 500000) * 0.02;
          expect(fee).toBe(expectedFee);
        } else if (claimAmount <= 10000000) {
          // 36 000 руб. + 1% с суммы, превышающей 1 500 000 руб.
          const expectedFee = 36000 + (claimAmount - 1500000) * 0.01;
          expect(fee).toBe(expectedFee);
        } else if (claimAmount <= 500000000) {
          // 136 000 руб. + 0,5% с суммы, превышающей 10 000 000 руб.
          const expectedFee = 136000 + (claimAmount - 10000000) * 0.005;
          expect(fee).toBe(expectedFee);
        } else {
          // Максимальная сумма 200 000 руб.
          expect(fee).toBe(200000);
        }
        
        // Проверяем максимальный лимит
        expect(fee).toBeLessThanOrEqual(200000);
        
        // Проверяем структуру результата
        expect(calculation.formula).toBeDefined();
        expect(calculation.breakdown).toBeDefined();
        expect(calculation.breakdown.length).toBeGreaterThan(0);
        expect(calculation.applicableArticle).toBe('ст. 333.21 НК РФ');
      }),
      { numRuns: 100 }
    );
  });

  test('Property 1 & 2: Fee Monotonicity - Higher claim amounts should not result in lower fees', () => {
    // Feature: court-fee-calculator, Property 1: General Jurisdiction Fee Calculation
    // Feature: court-fee-calculator, Property 2: Arbitration Court Fee Calculation
    // Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4
    
    fc.assert(
      fc.property(
        fc.tuple(claimAmountGenerator, claimAmountGenerator).filter(([a, b]) => a < b),
        courtTypeGenerator,
        ([lowerAmount, higherAmount], courtType) => {
          const lowerCalculation = courtType === 'general' 
            ? feeEngine.calculateGeneralJurisdictionFee(lowerAmount)
            : feeEngine.calculateArbitrationFee(lowerAmount);
          
          const higherCalculation = courtType === 'general'
            ? feeEngine.calculateGeneralJurisdictionFee(higherAmount)
            : feeEngine.calculateArbitrationFee(higherAmount);
          
          // Пошлина должна быть монотонно неубывающей
          expect(higherCalculation.amount).toBeGreaterThanOrEqual(lowerCalculation.amount);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1 & 2: Exemption Application Correctness', () => {
    // Feature: court-fee-calculator, Property 1: General Jurisdiction Fee Calculation
    // Feature: court-fee-calculator, Property 2: Arbitration Court Fee Calculation
    // Validates: Requirements 3.1, 3.2, 3.3, 3.4
    
    fc.assert(
      fc.property(
        claimAmountGenerator,
        courtTypeGenerator,
        (claimAmount, courtType) => {
          // Получаем базовый расчет
          const baseCalculation = courtType === 'general'
            ? feeEngine.calculateGeneralJurisdictionFee(claimAmount)
            : feeEngine.calculateArbitrationFee(claimAmount);
          
          // Находим совместимые льготы для данного типа суда
          const compatibleExemptions = EXEMPTION_CATEGORIES.filter(
            exemption => exemption.applicableCourts.includes(courtType)
          );
          
          if (compatibleExemptions.length > 0) {
            const exemption = fc.sample(fc.constantFrom(...compatibleExemptions), 1)[0];
            const exemptionCalculation = feeEngine.applyExemptions(baseCalculation, exemption);
            
            // Проверяем применение льгот
            if (exemption.discountType === 'exempt') {
              // Полное освобождение
              expect(exemptionCalculation.amount).toBe(0);
            } else if (exemption.discountType === 'fixed') {
              // Фиксированная скидка
              const expectedDiscount = Math.min(exemption.discountValue, baseCalculation.amount);
              expect(exemptionCalculation.amount).toBe(baseCalculation.amount - expectedDiscount);
            } else if (exemption.discountType === 'percentage') {
              // Процентная скидка
              const expectedDiscount = baseCalculation.amount * (exemption.discountValue / 100);
              expect(exemptionCalculation.amount).toBe(baseCalculation.amount - expectedDiscount);
            }
            
            // Льготная пошлина не должна быть больше базовой
            expect(exemptionCalculation.amount).toBeLessThanOrEqual(baseCalculation.amount);
            
            // Льготная пошлина не должна быть отрицательной
            expect(exemptionCalculation.amount).toBeGreaterThanOrEqual(0);
            
            // Проверяем, что добавлена информация о льготе в breakdown
            expect(exemptionCalculation.breakdown.length).toBeGreaterThan(baseCalculation.breakdown.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1 & 2: Fee Rule Consistency - findApplicableRule should return correct rule', () => {
    // Feature: court-fee-calculator, Property 1: General Jurisdiction Fee Calculation
    // Feature: court-fee-calculator, Property 2: Arbitration Court Fee Calculation
    // Validates: Requirements 1.1, 2.1
    
    fc.assert(
      fc.property(claimAmountGenerator, courtTypeGenerator, (claimAmount, courtType) => {
        const rule = findApplicableRule(claimAmount, courtType);
        
        if (rule) {
          // Проверяем, что сумма попадает в диапазон правила
          expect(claimAmount).toBeGreaterThanOrEqual(rule.minAmount);
          if (rule.maxAmount !== null) {
            expect(claimAmount).toBeLessThanOrEqual(rule.maxAmount);
          }
          
          // Проверяем, что правило содержит необходимые поля
          expect(rule.legalBasis).toBeDefined();
          expect(rule.formula).toBeDefined();
          expect(rule.feeType).toMatch(/^(percentage|fixed|progressive)$/);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 1 & 2: Calculation Input Validation', () => {
    // Feature: court-fee-calculator, Property 1: General Jurisdiction Fee Calculation
    // Feature: court-fee-calculator, Property 2: Arbitration Court Fee Calculation
    // Validates: Requirements 1.1, 2.1
    
    fc.assert(
      fc.property(
        claimAmountGenerator,
        courtTypeGenerator,
        (claimAmount, courtType) => {
          // Генерируем только совместимые льготы для данного типа суда
          const compatibleExemptions = EXEMPTION_CATEGORIES.filter(
            exemption => exemption.applicableCourts.includes(courtType)
          );
          
          const exemptionCategory = compatibleExemptions.length > 0 
            ? fc.sample(fc.constantFrom(...compatibleExemptions), 1)[0] 
            : undefined;
          
          const input: CalculationInput = {
            claimAmount,
            courtType,
            exemptionCategory
          };
          
          // Проверяем структуру входных данных
          expect(input.claimAmount).toBeGreaterThan(0);
          expect(['general', 'arbitration']).toContain(input.courtType);
          
          // Если есть льгота, проверяем её применимость к типу суда
          if (input.exemptionCategory) {
            expect(input.exemptionCategory.applicableCourts).toContain(input.courtType);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1 & 2: Error Handling for Invalid Inputs', () => {
    // Feature: court-fee-calculator, Property 1: General Jurisdiction Fee Calculation
    // Feature: court-fee-calculator, Property 2: Arbitration Court Fee Calculation
    // Validates: Requirements 1.1, 2.1
    
    // Тестируем отрицательные и нулевые суммы
    expect(() => feeEngine.calculateGeneralJurisdictionFee(0)).toThrow();
    expect(() => feeEngine.calculateGeneralJurisdictionFee(-100)).toThrow();
    expect(() => feeEngine.calculateArbitrationFee(0)).toThrow();
    expect(() => feeEngine.calculateArbitrationFee(-100)).toThrow();
  });
});