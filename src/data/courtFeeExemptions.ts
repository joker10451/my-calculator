import { ExemptionCategory } from '@/types/courtFee';

/**
 * Льготные категории для расчета госпошлины
 * Основано на НК РФ статьи 333.36, 333.37
 */
export const EXEMPTION_CATEGORIES: ExemptionCategory[] = [
  {
    id: 'disabled_1_2',
    name: 'Инвалиды I-II группы',
    description: 'Инвалиды I или II группы, дети-инвалиды, инвалиды с детства',
    discountType: 'fixed',
    discountValue: 25000,
    applicableCourts: ['general'],
    legalBasis: 'п.2 ст.333.36 НК РФ'
  },
  {
    id: 'veterans',
    name: 'Ветераны боевых действий',
    description: 'Ветераны боевых действий, ветераны военной службы',
    discountType: 'exempt',
    discountValue: 0,
    applicableCourts: ['general'],
    legalBasis: 'п.3 ст.333.36 НК РФ'
  },
  {
    id: 'consumer_disputes',
    name: 'Потребительские споры',
    description: 'Иски, связанные с нарушением прав потребителей',
    discountType: 'exempt',
    discountValue: 0,
    applicableCourts: ['general'],
    legalBasis: 'п.2 ст.333.36 НК РФ'
  },
  {
    id: 'pensioners',
    name: 'Пенсионеры',
    description: 'Пенсионеры по искам к ПФР и НПФ',
    discountType: 'exempt',
    discountValue: 0,
    applicableCourts: ['general'],
    legalBasis: 'п.2 ст.333.36 НК РФ'
  },
  {
    id: 'disabled_arbitration',
    name: 'Инвалиды I-II группы (арбитраж)',
    description: 'Инвалиды I и II группы в арбитражных судах',
    discountType: 'fixed',
    discountValue: 55000,
    applicableCourts: ['arbitration'],
    legalBasis: 'п.2 ст.333.37 НК РФ'
  }
];

/**
 * Получить доступные льготы для типа суда
 */
export function getAvailableExemptions(courtType: 'general' | 'arbitration'): ExemptionCategory[] {
  return EXEMPTION_CATEGORIES.filter(exemption => 
    exemption.applicableCourts.includes(courtType)
  );
}

/**
 * Найти льготу по ID
 */
export function findExemptionById(id: string): ExemptionCategory | undefined {
  return EXEMPTION_CATEGORIES.find(exemption => exemption.id === id);
}