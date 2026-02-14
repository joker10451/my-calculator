/**
 * Property-based тесты для ExemptionManager
 * Feature: court-fee-calculator, Property 3: Exemption Application
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  ExemptionCategory,
  CourtType,
  FeeCalculation
} from '@/types/courtFee';
import { EXEMPTION_CATEGORIES } from '@/data/courtFeeExemptions';
import { ExemptionManager } from '@/lib/exemptionManager';
import { FeeCalculationEngine } from '@/lib/feeCalculationEngine';

// Генераторы для property-based тестирования
const baseFeeGenerator = fc.float({ min: 0, max: 200000, noNaN: true });
const courtTypeGenerator = fc.constantFrom('general' as CourtType, 'arbitration' as CourtType);
const exemptionManager = new ExemptionManager();
const feeEngine = new FeeCalculationEngine();

describe('ExemptionManager Property Tests', () => {
  
  test('Property 3: Exemption Application - Discount Calculation Correctness', () => {
    // Feature: court-fee-calculator, Property 3: Exemption Application
    // Validates: Requirements 3.1, 3.2, 3.3, 3.4
    
    fc.assert(
      fc.property(
        baseFeeGenerator,
        courtTypeGenerator,
        (baseFee, courtType) => {
          // Получаем доступные льготы для данного типа суда
          const availableExemptions = exemptionManager.getAvailableExemptions(courtType);
          
          if (availableExemptions.length > 0) {
            // Выбираем случайную льготу из доступных
            const exemption = fc.sample(fc.constantFrom(...availableExemptions), 1)[0];
            
            // Рассчитываем скидку
            const discount = exemptionManager.calculateDiscount(baseFee, exemption);
            
            // Проверяем корректность расчета скидки
            if (exemption.discountType === 'exempt') {
              // Полное освобождение - скидка равна всей пошлине
              expect(discount).toBe(baseFee);
            } else if (exemption.discountType === 'fixed') {
              // Фиксированная скидка, но не больше самой пошлины
              const expectedDiscount = Math.min(exemption.discountValue, baseFee);
              expect(discount).toBe(expectedDiscount);
              expect(discount).toBeLessThanOrEqual(baseFee);
              expect(discount).toBeGreaterThanOrEqual(0);
            } else if (exemption.discountType === 'percentage') {
              // Процентная скидка
              const expectedDiscount = baseFee * (exemption.discountValue / 100);
              expect(discount).toBeCloseTo(expectedDiscount, 2);
              expect(discount).toBeLessThanOrEqual(baseFee);
              expect(discount).toBeGreaterThanOrEqual(0);
            }
            
            // Скидка никогда не должна быть больше базовой пошлины
            expect(discount).toBeLessThanOrEqual(baseFee);
            
            // Скидка не должна быть отрицательной
            expect(discount).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 3: Exemption Application - Court Type Compatibility', () => {
    // Feature: court-fee-calculator, Property 3: Exemption Application
    // Validates: Requirements 3.1, 3.2, 3.3, 3.4
    
    fc.assert(
      fc.property(
        courtTypeGenerator,
        (courtType) => {
          // Получаем доступные льготы для данного типа суда
          const availableExemptions = exemptionManager.getAvailableExemptions(courtType);
          
          // Все возвращенные льготы должны быть применимы к данному типу суда
          availableExemptions.forEach(exemption => {
            expect(exemption.applicableCourts).toContain(courtType);
            expect(exemptionManager.validateExemption(exemption, courtType)).toBe(true);
          });
          
          // Проверяем, что льготы для другого типа суда не включены
          const allExemptions = exemptionManager.getAllExemptions();
          const incompatibleExemptions = allExemptions.filter(
            exemption => !exemption.applicableCourts.includes(courtType)
          );
          
          incompatibleExemptions.forEach(exemption => {
            expect(availableExemptions).not.toContain(exemption);
            expect(exemptionManager.validateExemption(exemption, courtType)).toBe(false);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 3: Exemption Application - Integration with FeeCalculationEngine', () => {
    // Feature: court-fee-calculator, Property 3: Exemption Application
    // Validates: Requirements 3.1, 3.2, 3.3, 3.4
    
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000000 }),
        courtTypeGenerator,
        (claimAmount, courtType) => {
          // Получаем базовый расчет
          const baseCalculation = courtType === 'general'
            ? feeEngine.calculateGeneralJurisdictionFee(claimAmount)
            : feeEngine.calculateArbitrationFee(claimAmount);
          
          // Получаем совместимые льготы
          const compatibleExemptions = exemptionManager.getAvailableExemptions(courtType);
          
          if (compatibleExemptions.length > 0) {
            const exemption = fc.sample(fc.constantFrom(...compatibleExemptions), 1)[0];
            
            // Применяем льготу через FeeCalculationEngine
            const exemptionCalculation = feeEngine.applyExemptions(baseCalculation, exemption);
            
            // Рассчитываем ожидаемую скидку через ExemptionManager
            const expectedDiscount = exemptionManager.calculateDiscount(baseCalculation.amount, exemption);
            const expectedFinalAmount = baseCalculation.amount - expectedDiscount;
            
            // Проверяем, что результаты совпадают
            expect(exemptionCalculation.amount).toBeCloseTo(expectedFinalAmount, 2);
            
            // Льготная пошлина не должна быть больше базовой
            expect(exemptionCalculation.amount).toBeLessThanOrEqual(baseCalculation.amount);
            
            // Льготная пошлина не должна быть отрицательной
            expect(exemptionCalculation.amount).toBeGreaterThanOrEqual(0);
            
            // Проверяем, что добавлена информация о льготе в breakdown
            expect(exemptionCalculation.breakdown.length).toBeGreaterThan(baseCalculation.breakdown.length);
            
            // Последний элемент breakdown должен содержать информацию о льготе
            const lastBreakdownItem = exemptionCalculation.breakdown[exemptionCalculation.breakdown.length - 1];
            expect(lastBreakdownItem.description).toContain('Льгота');
            expect(lastBreakdownItem.amount).toBeLessThan(0); // Скидка должна быть отрицательной
            expect(lastBreakdownItem.legalBasis).toBe(exemption.legalBasis);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 3: Exemption Application - Validation Rules', () => {
    // Feature: court-fee-calculator, Property 3: Exemption Application
    // Validates: Requirements 3.1, 3.2, 3.3, 3.4
    
    fc.assert(
      fc.property(
        courtTypeGenerator,
        (courtType) => {
          const allExemptions = exemptionManager.getAllExemptions();
          
          allExemptions.forEach(exemption => {
            const isValid = exemptionManager.validateExemption(exemption, courtType);
            
            if (exemption.applicableCourts.includes(courtType)) {
              // Если льгота применима к типу суда, валидация должна пройти
              expect(isValid).toBe(true);
              
              // Проверяем корректность типа скидки
              expect(['percentage', 'fixed', 'exempt']).toContain(exemption.discountType);
              
              // Проверяем корректность значения скидки
              if (exemption.discountType === 'percentage') {
                expect(exemption.discountValue).toBeGreaterThanOrEqual(0);
                expect(exemption.discountValue).toBeLessThanOrEqual(100);
              } else if (exemption.discountType === 'fixed') {
                expect(exemption.discountValue).toBeGreaterThanOrEqual(0);
              }
              
              // Проверяем наличие обязательных полей
              expect(exemption.id).toBeDefined();
              expect(exemption.name).toBeDefined();
              expect(exemption.description).toBeDefined();
              expect(exemption.legalBasis).toBeDefined();
              
            } else {
              // Если льгота не применима к типу суда, валидация должна провалиться
              expect(isValid).toBe(false);
            }
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 3: Exemption Application - Best Exemption Selection', () => {
    // Feature: court-fee-calculator, Property 3: Exemption Application
    // Validates: Requirements 3.1, 3.2, 3.3, 3.4
    
    fc.assert(
      fc.property(
        baseFeeGenerator.filter(fee => fee > 0),
        courtTypeGenerator,
        (baseFee, courtType) => {
          const availableExemptions = exemptionManager.getAvailableExemptions(courtType);
          
          if (availableExemptions.length > 0) {
            const bestExemption = exemptionManager.getBestExemption(baseFee, availableExemptions);
            
            if (bestExemption) {
              const bestDiscount = exemptionManager.calculateDiscount(baseFee, bestExemption);
              
              // Проверяем, что выбранная льгота действительно дает максимальную скидку
              availableExemptions.forEach(exemption => {
                const discount = exemptionManager.calculateDiscount(baseFee, exemption);
                expect(bestDiscount).toBeGreaterThanOrEqual(discount);
              });
              
              // Лучшая льгота должна быть из списка доступных
              expect(availableExemptions).toContain(bestExemption);
              
              // Лучшая льгота должна быть валидной для данного типа суда
              expect(exemptionManager.validateExemption(bestExemption, courtType)).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 3: Exemption Application - Error Handling', () => {
    // Feature: court-fee-calculator, Property 3: Exemption Application
    // Validates: Requirements 3.1, 3.2, 3.3, 3.4
    
    // Тестируем обработку некорректных входных данных
    expect(() => exemptionManager.calculateDiscount(-100, EXEMPTION_CATEGORIES[0]))
      .toThrow('Базовая пошлина не может быть отрицательной');
    
    // Тестируем обработку null/undefined льгот
    expect(exemptionManager.calculateDiscount(1000, null as any)).toBe(0);
    expect(exemptionManager.calculateDiscount(1000, undefined as any)).toBe(0);
    
    // Тестируем валидацию с некорректными данными
    expect(exemptionManager.validateExemption(null as any, 'general')).toBe(false);
    expect(exemptionManager.validateExemption(EXEMPTION_CATEGORIES[0], null as any)).toBe(false);
    
    // Тестируем поиск несуществующей льготы
    expect(exemptionManager.findExemptionById('nonexistent')).toBeUndefined();
  });

  test('Property 3: Exemption Application - Exemption Description Generation', () => {
    // Feature: court-fee-calculator, Property 3: Exemption Application
    // Validates: Requirements 3.1, 3.2, 3.3, 3.4
    
    fc.assert(
      fc.property(
        baseFeeGenerator.filter(fee => fee > 0),
        courtTypeGenerator,
        (baseFee, courtType) => {
          const availableExemptions = exemptionManager.getAvailableExemptions(courtType);
          
          availableExemptions.forEach(exemption => {
            const description = exemptionManager.getExemptionDescription(baseFee, exemption);
            
            // Описание должно содержать название льготы
            expect(description).toContain(exemption.name);
            
            // Описание должно содержать правовое основание
            expect(description).toContain(exemption.legalBasis);
            
            // Описание должно содержать информацию об экономии
            if (exemption.discountType === 'exempt') {
              expect(description).toContain('полное освобождение');
              expect(description).toContain('экономия');
            } else if (exemption.discountType === 'fixed') {
              expect(description).toContain('скидка');
              expect(description).toContain('к доплате');
            } else if (exemption.discountType === 'percentage') {
              expect(description).toContain(`${exemption.discountValue}%`);
              expect(description).toContain('экономия');
            }
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});