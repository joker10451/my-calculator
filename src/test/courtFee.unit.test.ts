/**
 * Unit-тесты для граничных случаев калькулятора госпошлины
 * Validates: Requirements 1.2, 1.4, 2.2, 2.4
 */

import { describe, test, expect } from 'vitest';
import { FeeCalculationEngine } from '@/lib/feeCalculationEngine';
import { EXEMPTION_CATEGORIES } from '@/data/courtFeeExemptions';

const feeEngine = new FeeCalculationEngine();

describe('Court Fee Calculator Unit Tests - Boundary Cases', () => {
  
  describe('General Jurisdiction Court - Boundary Values', () => {
    
    test('Minimum amount (1 ruble) should apply minimum fee', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(1);
      expect(calculation.amount).toBe(400); // Минимум 400 руб.
    });

    test('Boundary at 20,000 rubles - percentage calculation', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(20000);
      expect(calculation.amount).toBe(800); // 20000 * 0.04 = 800
    });

    test('Just above 20,000 rubles - progressive calculation', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(20001);
      expect(calculation.amount).toBe(800.03); // 800 + (20001 - 20000) * 0.03
    });

    test('Boundary at 100,000 rubles', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(100000);
      expect(calculation.amount).toBe(3200); // 800 + (100000 - 20000) * 0.03
    });

    test('Just above 100,000 rubles', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(100001);
      expect(calculation.amount).toBe(3200.02); // 3200 + (100001 - 100000) * 0.02
    });

    test('Boundary at 200,000 rubles', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(200000);
      expect(calculation.amount).toBe(5200); // 3200 + (200000 - 100000) * 0.02
    });

    test('Just above 200,000 rubles', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(200001);
      expect(calculation.amount).toBe(5200.01); // 5200 + (200001 - 200000) * 0.01
    });

    test('Boundary at 1,000,000 rubles', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(1000000);
      expect(calculation.amount).toBe(13200); // 5200 + (1000000 - 200000) * 0.01
    });

    test('Above 1,000,000 rubles - maximum fee', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(1000001);
      expect(calculation.amount).toBe(60000); // Максимум 60,000 руб.
    });

    test('Very large amount - maximum fee', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(10000000);
      expect(calculation.amount).toBe(60000); // Максимум 60,000 руб.
    });
  });

  describe('Arbitration Court - Boundary Values', () => {
    
    test('Minimum amount (1 ruble) should apply minimum fee', () => {
      const calculation = feeEngine.calculateArbitrationFee(1);
      expect(calculation.amount).toBe(2000); // Минимум 2,000 руб.
    });

    test('Boundary at 100,000 rubles - percentage calculation', () => {
      const calculation = feeEngine.calculateArbitrationFee(100000);
      expect(calculation.amount).toBe(4000); // 100000 * 0.04 = 4000
    });

    test('Just above 100,000 rubles - progressive calculation', () => {
      const calculation = feeEngine.calculateArbitrationFee(100001);
      expect(calculation.amount).toBe(4000.03); // 4000 + (100001 - 100000) * 0.03
    });

    test('Boundary at 500,000 rubles', () => {
      const calculation = feeEngine.calculateArbitrationFee(500000);
      expect(calculation.amount).toBe(16000); // 4000 + (500000 - 100000) * 0.03
    });

    test('Just above 500,000 rubles', () => {
      const calculation = feeEngine.calculateArbitrationFee(500001);
      expect(calculation.amount).toBe(16000.02); // 16000 + (500001 - 500000) * 0.02
    });

    test('Boundary at 1,500,000 rubles', () => {
      const calculation = feeEngine.calculateArbitrationFee(1500000);
      expect(calculation.amount).toBe(36000); // 16000 + (1500000 - 500000) * 0.02
    });

    test('Just above 1,500,000 rubles', () => {
      const calculation = feeEngine.calculateArbitrationFee(1500001);
      expect(calculation.amount).toBe(36000.01); // 36000 + (1500001 - 1500000) * 0.01
    });

    test('Boundary at 10,000,000 rubles', () => {
      const calculation = feeEngine.calculateArbitrationFee(10000000);
      expect(calculation.amount).toBe(121000); // 36000 + (10000000 - 1500000) * 0.01
    });

    test('Just above 10,000,000 rubles', () => {
      const calculation = feeEngine.calculateArbitrationFee(10000001);
      expect(calculation.amount).toBe(121000.005); // 121000 + (10000001 - 10000000) * 0.005
    });

    test('Boundary at 500,000,000 rubles', () => {
      const calculation = feeEngine.calculateArbitrationFee(500000000);
      // Правильный расчет: 121000 + (500000000 - 10000000) * 0.005 = 121000 + 490000000 * 0.005 = 121000 + 2450000 = 2571000
      expect(calculation.amount).toBe(2571000);
    });

    test('Above 500,000,000 rubles - maximum fee', () => {
      const calculation = feeEngine.calculateArbitrationFee(500000001);
      expect(calculation.amount).toBe(200000); // Максимум 200,000 руб.
    });

    test('Very large amount - maximum fee', () => {
      const calculation = feeEngine.calculateArbitrationFee(1000000000);
      expect(calculation.amount).toBe(200000); // Максимум 200,000 руб.
    });
  });

  describe('Exemption Application - Edge Cases', () => {
    
    test('Fixed exemption larger than fee should result in zero', () => {
      const baseCalculation = feeEngine.calculateGeneralJurisdictionFee(1000); // 400 руб.
      const exemption = EXEMPTION_CATEGORIES.find(e => e.id === 'disabled_1_2')!; // 25,000 руб. скидка
      
      const exemptionCalculation = feeEngine.applyExemptions(baseCalculation, exemption);
      expect(exemptionCalculation.amount).toBe(0);
    });

    test('Fixed exemption smaller than fee should reduce correctly', () => {
      const baseCalculation = feeEngine.calculateGeneralJurisdictionFee(2000000); // Для суммы свыше 1 млн - 60,000 руб.
      const exemption = EXEMPTION_CATEGORIES.find(e => e.id === 'disabled_1_2')!; // 25,000 руб. скидка
      
      const exemptionCalculation = feeEngine.applyExemptions(baseCalculation, exemption);
      expect(exemptionCalculation.amount).toBe(35000); // 60000 - 25000
    });

    test('Full exemption should result in zero fee', () => {
      const baseCalculation = feeEngine.calculateGeneralJurisdictionFee(50000);
      const exemption = EXEMPTION_CATEGORIES.find(e => e.id === 'veterans')!; // Полное освобождение
      
      const exemptionCalculation = feeEngine.applyExemptions(baseCalculation, exemption);
      expect(exemptionCalculation.amount).toBe(0);
    });

    test('Arbitration exemption should work correctly', () => {
      const baseCalculation = feeEngine.calculateArbitrationFee(200000); // 7,000 руб.
      const exemption = EXEMPTION_CATEGORIES.find(e => e.id === 'disabled_arbitration')!; // 55,000 руб. скидка
      
      const exemptionCalculation = feeEngine.applyExemptions(baseCalculation, exemption);
      expect(exemptionCalculation.amount).toBe(0); // Скидка больше пошлины
    });
  });

  describe('Error Handling', () => {
    
    test('Zero amount should throw error', () => {
      expect(() => feeEngine.calculateGeneralJurisdictionFee(0)).toThrow('Цена иска должна быть положительным числом');
      expect(() => feeEngine.calculateArbitrationFee(0)).toThrow('Цена иска должна быть положительным числом');
    });

    test('Negative amount should throw error', () => {
      expect(() => feeEngine.calculateGeneralJurisdictionFee(-100)).toThrow('Цена иска должна быть положительным числом');
      expect(() => feeEngine.calculateArbitrationFee(-100)).toThrow('Цена иска должна быть положительным числом');
    });
  });

  describe('Calculation Structure Validation', () => {
    
    test('General jurisdiction calculation should have correct structure', () => {
      const calculation = feeEngine.calculateGeneralJurisdictionFee(50000);
      
      expect(calculation.amount).toBeGreaterThan(0);
      expect(calculation.formula).toBeDefined();
      expect(calculation.breakdown).toBeDefined();
      expect(calculation.breakdown.length).toBeGreaterThan(0);
      expect(calculation.applicableArticle).toBe('ст. 333.19 НК РФ');
      
      // Проверяем структуру breakdown
      calculation.breakdown.forEach(item => {
        expect(item.description).toBeDefined();
        expect(item.amount).toBeDefined();
        expect(item.legalBasis).toBeDefined();
      });
    });

    test('Arbitration calculation should have correct structure', () => {
      const calculation = feeEngine.calculateArbitrationFee(150000);
      
      expect(calculation.amount).toBeGreaterThan(0);
      expect(calculation.formula).toBeDefined();
      expect(calculation.breakdown).toBeDefined();
      expect(calculation.breakdown.length).toBeGreaterThan(0);
      expect(calculation.applicableArticle).toBe('ст. 333.21 НК РФ');
      
      // Проверяем структуру breakdown
      calculation.breakdown.forEach(item => {
        expect(item.description).toBeDefined();
        expect(item.amount).toBeDefined();
        expect(item.legalBasis).toBeDefined();
      });
    });

    test('Exemption calculation should add breakdown item', () => {
      const baseCalculation = feeEngine.calculateGeneralJurisdictionFee(30000);
      const exemption = EXEMPTION_CATEGORIES.find(e => e.id === 'disabled_1_2')!;
      
      const exemptionCalculation = feeEngine.applyExemptions(baseCalculation, exemption);
      
      expect(exemptionCalculation.breakdown.length).toBe(baseCalculation.breakdown.length + 1);
      
      // Последний элемент должен быть льготой
      const lastItem = exemptionCalculation.breakdown[exemptionCalculation.breakdown.length - 1];
      expect(lastItem.description).toContain('Льгота');
      expect(lastItem.amount).toBeLessThan(0); // Скидка должна быть отрицательной
      expect(lastItem.legalBasis).toBe(exemption.legalBasis);
    });
  });
});