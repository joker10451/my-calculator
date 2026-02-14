import { 
  ExemptionManager as IExemptionManager,
  ExemptionCategory,
  CourtType 
} from '@/types/courtFee';
import { EXEMPTION_CATEGORIES } from '@/data/courtFeeExemptions';

/**
 * Менеджер льгот для калькулятора госпошлины
 * Реализует логику применения льгот согласно НК РФ статьи 333.36, 333.37
 */
export class ExemptionManager implements IExemptionManager {
  
  /**
   * Получить доступные льготы для типа суда
   * @param courtType Тип суда ('general' | 'arbitration')
   * @returns Массив применимых льготных категорий
   */
  getAvailableExemptions(courtType: CourtType): ExemptionCategory[] {
    return EXEMPTION_CATEGORIES.filter(exemption => 
      exemption.applicableCourts.includes(courtType)
    );
  }

  /**
   * Валидировать совместимость льготы с типом суда
   * @param exemption Льготная категория
   * @param courtType Тип суда
   * @returns true если льгота применима к данному типу суда
   */
  validateExemption(exemption: ExemptionCategory, courtType: CourtType): boolean {
    if (!exemption || !courtType) {
      return false;
    }

    // Проверяем, что льгота применима к данному типу суда
    if (!exemption.applicableCourts.includes(courtType)) {
      return false;
    }

    // Проверяем корректность типа скидки
    const validDiscountTypes = ['percentage', 'fixed', 'exempt'];
    if (!validDiscountTypes.includes(exemption.discountType)) {
      return false;
    }

    // Проверяем корректность значения скидки
    if (exemption.discountType === 'percentage') {
      // Процентная скидка должна быть от 0 до 100
      return exemption.discountValue >= 0 && exemption.discountValue <= 100;
    } else if (exemption.discountType === 'fixed') {
      // Фиксированная скидка должна быть положительной
      return exemption.discountValue >= 0;
    } else if (exemption.discountType === 'exempt') {
      // Для полного освобождения значение не важно
      return true;
    }

    return false;
  }

  /**
   * Рассчитать размер скидки
   * @param baseFee Базовая сумма госпошлины
   * @param exemption Льготная категория
   * @returns Размер скидки в рублях
   */
  calculateDiscount(baseFee: number, exemption: ExemptionCategory): number {
    if (baseFee < 0) {
      throw new Error('Базовая пошлина не может быть отрицательной');
    }

    if (!exemption) {
      return 0;
    }

    switch (exemption.discountType) {
      case 'exempt':
        // Полное освобождение - скидка равна всей пошлине
        return baseFee;

      case 'fixed':
        // Фиксированная скидка, но не больше самой пошлины
        return Math.min(exemption.discountValue, baseFee);

      case 'percentage':
        // Процентная скидка
        return baseFee * (exemption.discountValue / 100);

      default:
        return 0;
    }
  }

  /**
   * Найти льготу по ID
   * @param id Идентификатор льготы
   * @returns Льготная категория или undefined если не найдена
   */
  findExemptionById(id: string): ExemptionCategory | undefined {
    return EXEMPTION_CATEGORIES.find(exemption => exemption.id === id);
  }

  /**
   * Получить все доступные льготы
   * @returns Массив всех льготных категорий
   */
  getAllExemptions(): ExemptionCategory[] {
    return [...EXEMPTION_CATEGORIES];
  }

  /**
   * Проверить конфликты между льготами
   * Некоторые льготы могут быть взаимоисключающими
   * @param exemptions Массив льгот для проверки
   * @returns true если льготы совместимы
   */
  validateExemptionCompatibility(exemptions: ExemptionCategory[]): boolean {
    if (exemptions.length <= 1) {
      return true;
    }

    // В текущей реализации НК РФ обычно применяется одна льгота
    // Можно расширить логику для специальных случаев
    return exemptions.length === 1;
  }

  /**
   * Получить наиболее выгодную льготу для данной суммы пошлины
   * @param baseFee Базовая сумма госпошлины
   * @param availableExemptions Доступные льготы
   * @returns Наиболее выгодная льгота или undefined
   */
  getBestExemption(baseFee: number, availableExemptions: ExemptionCategory[]): ExemptionCategory | undefined {
    if (availableExemptions.length === 0) {
      return undefined;
    }

    let bestExemption: ExemptionCategory | undefined;
    let maxDiscount = 0;

    for (const exemption of availableExemptions) {
      const discount = this.calculateDiscount(baseFee, exemption);
      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestExemption = exemption;
      }
    }

    return bestExemption;
  }

  /**
   * Получить описание льготы с размером экономии
   * @param baseFee Базовая сумма госпошлины
   * @param exemption Льготная категория
   * @returns Описание льготы с расчетом экономии
   */
  getExemptionDescription(baseFee: number, exemption: ExemptionCategory): string {
    const discount = this.calculateDiscount(baseFee, exemption);
    const finalFee = baseFee - discount;

    let description = `${exemption.name}: ${exemption.description}`;
    
    if (exemption.discountType === 'exempt') {
      description += ` (полное освобождение, экономия ${discount.toLocaleString('ru-RU')} руб.)`;
    } else if (exemption.discountType === 'fixed') {
      description += ` (скидка ${discount.toLocaleString('ru-RU')} руб., к доплате ${finalFee.toLocaleString('ru-RU')} руб.)`;
    } else if (exemption.discountType === 'percentage') {
      description += ` (скидка ${exemption.discountValue}%, экономия ${discount.toLocaleString('ru-RU')} руб.)`;
    }

    description += ` Основание: ${exemption.legalBasis}`;
    
    return description;
  }
}

/**
 * Экспортируем экземпляр менеджера льгот для использования в приложении
 */
export const exemptionManager = new ExemptionManager();