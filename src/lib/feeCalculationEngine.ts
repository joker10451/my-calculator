import { 
  FeeCalculation, 
  FeeCalculationEngine as IFeeCalculationEngine,
  ExemptionCategory,
  FeeBreakdownItem,
  CourtType
} from '@/types/courtFee';
import { 
  getFeeRules, 
  findApplicableRule,
  GENERAL_JURISDICTION_RULES,
  ARBITRATION_RULES
} from '@/data/courtFeeSchedule';
import { exemptionManager } from './exemptionManager';

/**
 * Движок расчета госпошлины в суд
 * Реализует расчеты согласно НК РФ статьи 333.19, 333.21
 */
export class FeeCalculationEngine implements IFeeCalculationEngine {
  
  /**
   * Рассчитать госпошлину для суда общей юрисдикции
   * Согласно ст. 333.19 НК РФ
   */
  calculateGeneralJurisdictionFee(amount: number): FeeCalculation {
    if (amount <= 0) {
      throw new Error('Цена иска должна быть положительным числом');
    }

    const calculatedFee = this.calculateGeneralProgressiveFee(amount);
    const rule = findApplicableRule(amount, 'general');
    
    if (!rule) {
      throw new Error('Не найдено применимое правило для расчета госпошлины');
    }

    const breakdown: FeeBreakdownItem[] = [{
      description: 'Расчет госпошлины',
      amount: calculatedFee,
      formula: rule.formula,
      legalBasis: rule.legalBasis
    }];

    return {
      amount: calculatedFee,
      formula: rule.formula,
      breakdown: breakdown,
      applicableArticle: 'ст. 333.19 НК РФ'
    };
  }

  /**
   * Рассчитать госпошлину для арбитражного суда
   * Согласно ст. 333.21 НК РФ
   */
  calculateArbitrationFee(amount: number): FeeCalculation {
    if (amount <= 0) {
      throw new Error('Цена иска должна быть положительным числом');
    }

    const calculatedFee = this.calculateArbitrationProgressiveFee(amount);
    const rule = findApplicableRule(amount, 'arbitration');
    
    if (!rule) {
      throw new Error('Не найдено применимое правило для расчета госпошлины');
    }

    const breakdown: FeeBreakdownItem[] = [{
      description: 'Расчет госпошлины',
      amount: calculatedFee,
      formula: rule.formula,
      legalBasis: rule.legalBasis
    }];

    return {
      amount: calculatedFee,
      formula: rule.formula,
      breakdown: breakdown,
      applicableArticle: 'ст. 333.21 НК РФ'
    };
  }

  /**
   * Применить льготы к расчету
   */
  applyExemptions(calculation: FeeCalculation, exemption: ExemptionCategory): FeeCalculation {
    // Используем ExemptionManager для расчета скидки
    const discountAmount = exemptionManager.calculateDiscount(calculation.amount, exemption);
    const newAmount = calculation.amount - discountAmount;

    const newBreakdown = [...calculation.breakdown];
    
    if (discountAmount > 0) {
      newBreakdown.push({
        description: `Льгота: ${exemption.name}`,
        amount: -discountAmount,
        formula: exemption.discountType === 'exempt' 
          ? 'Полное освобождение' 
          : exemption.discountType === 'fixed'
          ? `Скидка ${exemption.discountValue} руб.`
          : `Скидка ${exemption.discountValue}%`,
        legalBasis: exemption.legalBasis
      });
    }

    return {
      amount: newAmount,
      formula: `${calculation.formula} - льгота ${discountAmount} руб. = ${newAmount} руб.`,
      breakdown: newBreakdown,
      applicableArticle: calculation.applicableArticle
    };
  }

  /**
   * Рассчитать прогрессивную госпошлину для судов общей юрисдикции
   */
  private calculateGeneralProgressiveFee(amount: number): number {
    if (amount <= 20000) {
      return Math.max(amount * 0.04, 400);
    } else if (amount <= 100000) {
      return 800 + (amount - 20000) * 0.03;
    } else if (amount <= 200000) {
      return 3200 + (amount - 100000) * 0.02;
    } else if (amount <= 1000000) {
      return 5200 + (amount - 200000) * 0.01;
    } else {
      // Для сумм свыше 1,000,000 руб. - фиксированная ставка 60,000 руб.
      return 60000;
    }
  }

  /**
   * Рассчитать прогрессивную госпошлину для арбитражных судов
   */
  private calculateArbitrationProgressiveFee(amount: number): number {
    if (amount <= 100000) {
      return Math.max(amount * 0.04, 2000);
    } else if (amount <= 500000) {
      return 4000 + (amount - 100000) * 0.03;
    } else if (amount <= 1500000) {
      return 16000 + (amount - 500000) * 0.02;
    } else if (amount <= 10000000) {
      return 36000 + (amount - 1500000) * 0.01;
    } else if (amount <= 500000000) {
      return 121000 + (amount - 10000000) * 0.005;
    } else {
      return 200000;
    }
  }
}

/**
 * Экспортируем экземпляр движка для использования в приложении
 */
export const feeCalculationEngine = new FeeCalculationEngine();