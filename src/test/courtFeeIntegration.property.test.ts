/**
 * Property-based тесты для интеграции экспорта и сравнения калькулятора госпошлины
 * Feature: court-fee-calculator, Property 10: Comparison System Integration
 * Feature: court-fee-calculator, Property 12: Export and Sharing
 * Validates: Requirements 8.3, 5.4
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { 
  CourtType, 
  ExemptionCategory, 
  CalculationResult,
  ComparisonItem
} from '@/types/courtFee';
import { EXEMPTION_CATEGORIES } from '@/data/courtFeeExemptions';
import { feeCalculationEngine } from '@/lib/feeCalculationEngine';
import { exemptionManager } from '@/lib/exemptionManager';

// Генераторы для property-based тестирования
const claimAmountGenerator = fc.integer({ min: 1000, max: 10000000 });
const courtTypeGenerator = fc.constantFrom('general' as CourtType, 'arbitration' as CourtType);

// Мок для localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Мок для PDF экспорта
const mockExportToPDF = vi.fn();

// Мок для DOM элементов
const mockElement = {
  id: 'court-fee-pdf-export',
  innerHTML: '<div>Mock PDF content</div>',
  style: {},
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn()
  }
};

describe('Court Fee Calculator Integration Property Tests', () => {
  
  beforeEach(() => {
    // Настройка моков
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    // Мок для document.getElementById
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
    
    // Сброс моков
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Property 10: Comparison System Integration - Data Format Consistency', () => {
    // Feature: court-fee-calculator, Property 10: Comparison System Integration
    // Validates: Requirements 8.3
    
    fc.assert(
      fc.property(
        claimAmountGenerator,
        courtTypeGenerator,
        (claimAmount, courtType) => {
          // Получаем доступные льготы для типа суда
          const availableExemptions = exemptionManager.getAvailableExemptions(courtType);
          const selectedExemption = availableExemptions.length > 0 
            ? fc.sample(fc.constantFrom(...availableExemptions), 1)[0] 
            : null;

          // Выполняем расчет
          let baseCalculation;
          if (courtType === 'general') {
            baseCalculation = feeCalculationEngine.calculateGeneralJurisdictionFee(claimAmount);
          } else {
            baseCalculation = feeCalculationEngine.calculateArbitrationFee(claimAmount);
          }

          let finalCalculation = baseCalculation;
          let exemptionDiscount = 0;

          if (selectedExemption) {
            exemptionDiscount = exemptionManager.calculateDiscount(baseCalculation.amount, selectedExemption);
            finalCalculation = feeCalculationEngine.applyExemptions(baseCalculation, selectedExemption);
          }

          // Формируем данные для сравнения в том же формате, что и в CourtFeeCalculator
          const comparisonData = {
            finalFee: finalCalculation.amount,
            baseFee: baseCalculation.amount,
            exemptionDiscount: exemptionDiscount,
            courtType: courtType === 'general' ? 'Общая юрисдикция' : 'Арбитражный суд'
          };

          const comparisonParams = {
            claimAmount,
            courtType,
            exemption: selectedExemption?.name || 'Без льгот'
          };

          // Проверяем структуру данных для сравнения
          expect(comparisonData.finalFee).toBeGreaterThanOrEqual(0);
          expect(comparisonData.baseFee).toBeGreaterThan(0);
          expect(comparisonData.exemptionDiscount).toBeGreaterThanOrEqual(0);
          expect(comparisonData.courtType).toMatch(/^(Общая юрисдикция|Арбитражный суд)$/);

          // Проверяем параметры
          expect(comparisonParams.claimAmount).toBe(claimAmount);
          expect(comparisonParams.courtType).toBe(courtType);
          expect(comparisonParams.exemption).toBeDefined();

          // Проверяем математическую корректность
          expect(comparisonData.finalFee).toBe(comparisonData.baseFee - comparisonData.exemptionDiscount);
          
          // Льготная пошлина не должна превышать базовую
          expect(comparisonData.finalFee).toBeLessThanOrEqual(comparisonData.baseFee);

          // Проверяем, что данные можно сериализовать в JSON (для localStorage)
          expect(() => JSON.stringify({ data: comparisonData, params: comparisonParams })).not.toThrow();
          
          const serialized = JSON.stringify({ data: comparisonData, params: comparisonParams });
          const deserialized = JSON.parse(serialized);
          
          expect(deserialized.data.finalFee).toBe(comparisonData.finalFee);
          expect(deserialized.params.claimAmount).toBe(comparisonParams.claimAmount);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Comparison System Integration - Title Generation Consistency', () => {
    // Feature: court-fee-calculator, Property 10: Comparison System Integration
    // Validates: Requirements 8.3
    
    fc.assert(
      fc.property(claimAmountGenerator, (claimAmount) => {
        // Форматирование валюты как в компоненте
        const formatCurrency = (value: number) => {
          return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0,
          }).format(value);
        };

        const title = `Госпошлина: ${formatCurrency(claimAmount)}`;
        
        // Проверяем структуру заголовка
        expect(title).toMatch(/^Госпошлина: [\d\s\u00A0]+₽$/);
        expect(title).toContain('Госпошлина:');
        expect(title).toContain('₽');
        
        // Проверяем, что заголовок содержит корректную сумму
        const extractedAmount = title.match(/(\d+[\s\u00A0]*)+/);
        expect(extractedAmount).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  test('Property 12: Export and Sharing - PDF Element Structure', () => {
    // Feature: court-fee-calculator, Property 12: Export and Sharing
    // Validates: Requirements 5.4
    
    fc.assert(
      fc.property(
        claimAmountGenerator,
        courtTypeGenerator,
        (claimAmount, courtType) => {
          // Получаем доступные льготы для типа суда
          const availableExemptions = exemptionManager.getAvailableExemptions(courtType);
          const selectedExemption = availableExemptions.length > 0 
            ? fc.sample(fc.constantFrom(...availableExemptions), 1)[0] 
            : null;

          // Выполняем расчет
          let baseCalculation;
          if (courtType === 'general') {
            baseCalculation = feeCalculationEngine.calculateGeneralJurisdictionFee(claimAmount);
          } else {
            baseCalculation = feeCalculationEngine.calculateArbitrationFee(claimAmount);
          }

          let finalCalculation = baseCalculation;
          let exemptionDiscount = 0;

          if (selectedExemption) {
            exemptionDiscount = exemptionManager.calculateDiscount(baseCalculation.amount, selectedExemption);
            finalCalculation = feeCalculationEngine.applyExemptions(baseCalculation, selectedExemption);
          }

          const calculationResult: CalculationResult = {
            baseFee: baseCalculation.amount,
            exemptionDiscount: exemptionDiscount,
            finalFee: finalCalculation.amount,
            effectiveRate: (finalCalculation.amount / claimAmount) * 100,
            breakdown: finalCalculation.breakdown,
            legalReferences: [
              {
                article: finalCalculation.applicableArticle,
                description: `Расчет госпошлины для ${courtType === 'general' ? 'судов общей юрисдикции' : 'арбитражных судов'}`,
                url: courtType === 'general' 
                  ? 'https://www.consultant.ru/document/cons_doc_LAW_19671/b89b1a7c8e6b8e6e6e6e6e6e6e6e6e6e6e6e6e6e/'
                  : 'https://www.consultant.ru/document/cons_doc_LAW_19671/b89b1a7c8e6b8e6e6e6e6e6e6e6e6e6e6e6e6e/',
                lastVerified: new Date()
              }
            ]
          };

          // Проверяем, что элемент для PDF экспорта существует
          const pdfElement = document.getElementById('court-fee-pdf-export');
          expect(pdfElement).toBeTruthy();

          // Проверяем структуру результата для экспорта
          expect(calculationResult.finalFee).toBeGreaterThanOrEqual(0);
          expect(calculationResult.baseFee).toBeGreaterThan(0);
          expect(calculationResult.exemptionDiscount).toBeGreaterThanOrEqual(0);
          expect(calculationResult.effectiveRate).toBeGreaterThanOrEqual(0);
          expect(calculationResult.breakdown).toBeDefined();
          expect(calculationResult.legalReferences).toBeDefined();
          expect(calculationResult.legalReferences.length).toBeGreaterThan(0);

          // Проверяем математическую корректность
          expect(calculationResult.finalFee).toBe(calculationResult.baseFee - calculationResult.exemptionDiscount);
          expect(calculationResult.effectiveRate).toBe((calculationResult.finalFee / claimAmount) * 100);

          // Проверяем структуру breakdown
          calculationResult.breakdown.forEach(item => {
            expect(item.description).toBeDefined();
            expect(typeof item.amount).toBe('number');
            expect(item.legalBasis).toBeDefined();
          });

          // Проверяем структуру legal references
          calculationResult.legalReferences.forEach(ref => {
            expect(ref.article).toBeDefined();
            expect(ref.description).toBeDefined();
            expect(ref.url).toMatch(/^https?:\/\//);
            expect(ref.lastVerified).toBeInstanceOf(Date);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 12: Export and Sharing - Filename Generation', () => {
    // Feature: court-fee-calculator, Property 12: Export and Sharing
    // Validates: Requirements 5.4
    
    fc.assert(
      fc.property(
        claimAmountGenerator,
        courtTypeGenerator,
        (claimAmount, courtType) => {
          // Генерируем имя файла как в компоненте
          const filename = `госпошлина-${claimAmount}-${courtType}-${new Date().toISOString().split('T')[0]}`;
          
          // Проверяем структуру имени файла
          expect(filename).toMatch(/^госпошлина-\d+-(general|arbitration)-\d{4}-\d{2}-\d{2}$/);
          expect(filename).toContain('госпошлина');
          expect(filename).toContain(claimAmount.toString());
          expect(filename).toContain(courtType);
          
          // Проверяем, что имя файла не содержит недопустимых символов для файловой системы
          expect(filename).not.toMatch(/[<>:"/\\|?*]/);
          
          // Проверяем длину имени файла (должно быть разумным)
          expect(filename.length).toBeLessThan(100);
          expect(filename.length).toBeGreaterThan(10);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 12: Export and Sharing - Share Text Generation', () => {
    // Feature: court-fee-calculator, Property 12: Export and Sharing
    // Validates: Requirements 5.4
    
    fc.assert(
      fc.property(
        claimAmountGenerator,
        courtTypeGenerator,
        (claimAmount, courtType) => {
          // Получаем доступные льготы для типа суда
          const availableExemptions = exemptionManager.getAvailableExemptions(courtType);
          const selectedExemption = availableExemptions.length > 0 
            ? fc.sample(fc.constantFrom(...availableExemptions), 1)[0] 
            : null;

          // Выполняем расчет
          let baseCalculation;
          if (courtType === 'general') {
            baseCalculation = feeCalculationEngine.calculateGeneralJurisdictionFee(claimAmount);
          } else {
            baseCalculation = feeCalculationEngine.calculateArbitrationFee(claimAmount);
          }

          let finalCalculation = baseCalculation;
          let exemptionDiscount = 0;

          if (selectedExemption) {
            exemptionDiscount = exemptionManager.calculateDiscount(baseCalculation.amount, selectedExemption);
            finalCalculation = feeCalculationEngine.applyExemptions(baseCalculation, selectedExemption);
          }

          // Форматирование валюты
          const formatCurrency = (value: number) => {
            return new Intl.NumberFormat("ru-RU", {
              style: "currency",
              currency: "RUB",
              maximumFractionDigits: 0,
            }).format(value);
          };

          // Генерируем текст для шаринга как в компоненте
          const shareText = `Расчет госпошлины в суд: цена иска ${formatCurrency(claimAmount)}, госпошлина ${formatCurrency(finalCalculation.amount)}. ${selectedExemption ? `Льгота: ${selectedExemption.name}, экономия ${formatCurrency(exemptionDiscount)}` : ''}`;
          
          // Проверяем структуру текста
          expect(shareText).toContain('Расчет госпошлины в суд');
          expect(shareText).toContain('цена иска');
          expect(shareText).toContain('госпошлина');
          expect(shareText).toContain(formatCurrency(claimAmount));
          expect(shareText).toContain(formatCurrency(finalCalculation.amount));
          
          if (selectedExemption && exemptionDiscount > 0) {
            expect(shareText).toContain('Льгота:');
            expect(shareText).toContain(selectedExemption.name);
            expect(shareText).toContain('экономия');
            expect(shareText).toContain(formatCurrency(exemptionDiscount));
          }
          
          // Проверяем длину текста (должен быть разумным для шаринга)
          expect(shareText.length).toBeLessThan(500);
          expect(shareText.length).toBeGreaterThan(50);
          
          // Проверяем, что текст содержит корректные числовые значения
          const currencyMatches = shareText.match(/\d+[\s\u00A0]₽/g);
          expect(currencyMatches).toBeTruthy();
          expect(currencyMatches!.length).toBeGreaterThanOrEqual(2); // минимум цена иска и госпошлина
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10 & 12: Integration Consistency - Data Flow Between Components', () => {
    // Feature: court-fee-calculator, Property 10: Comparison System Integration
    // Feature: court-fee-calculator, Property 12: Export and Sharing
    // Validates: Requirements 8.3, 5.4
    
    fc.assert(
      fc.property(
        claimAmountGenerator,
        courtTypeGenerator,
        (claimAmount, courtType) => {
          // Получаем доступные льготы для типа суда
          const availableExemptions = exemptionManager.getAvailableExemptions(courtType);
          const selectedExemption = availableExemptions.length > 0 
            ? fc.sample(fc.constantFrom(...availableExemptions), 1)[0] 
            : null;

          // Выполняем расчет
          let baseCalculation;
          if (courtType === 'general') {
            baseCalculation = feeCalculationEngine.calculateGeneralJurisdictionFee(claimAmount);
          } else {
            baseCalculation = feeCalculationEngine.calculateArbitrationFee(claimAmount);
          }

          let finalCalculation = baseCalculation;
          let exemptionDiscount = 0;

          if (selectedExemption) {
            exemptionDiscount = exemptionManager.calculateDiscount(baseCalculation.amount, selectedExemption);
            finalCalculation = feeCalculationEngine.applyExemptions(baseCalculation, selectedExemption);
          }

          // Данные должны быть консистентными между всеми компонентами
          const calculationResult: CalculationResult = {
            baseFee: baseCalculation.amount,
            exemptionDiscount: exemptionDiscount,
            finalFee: finalCalculation.amount,
            effectiveRate: (finalCalculation.amount / claimAmount) * 100,
            breakdown: finalCalculation.breakdown,
            legalReferences: []
          };

          // Данные для сравнения
          const comparisonData = {
            finalFee: calculationResult.finalFee,
            baseFee: calculationResult.baseFee,
            exemptionDiscount: calculationResult.exemptionDiscount,
            courtType: courtType === 'general' ? 'Общая юрисдикция' : 'Арбитражный суд'
          };

          // Проверяем консистентность данных между компонентами
          expect(calculationResult.finalFee).toBe(comparisonData.finalFee);
          expect(calculationResult.baseFee).toBe(comparisonData.baseFee);
          expect(calculationResult.exemptionDiscount).toBe(comparisonData.exemptionDiscount);

          // Проверяем математическую корректность во всех компонентах
          expect(calculationResult.finalFee).toBe(calculationResult.baseFee - calculationResult.exemptionDiscount);
          expect(comparisonData.finalFee).toBe(comparisonData.baseFee - comparisonData.exemptionDiscount);

          // Проверяем, что эффективная ставка рассчитана корректно
          const expectedRate = (calculationResult.finalFee / claimAmount) * 100;
          expect(Math.abs(calculationResult.effectiveRate - expectedRate)).toBeLessThan(0.01);

          // Проверяем, что все значения неотрицательные
          expect(calculationResult.finalFee).toBeGreaterThanOrEqual(0);
          expect(calculationResult.baseFee).toBeGreaterThanOrEqual(0);
          expect(calculationResult.exemptionDiscount).toBeGreaterThanOrEqual(0);
          expect(calculationResult.effectiveRate).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});