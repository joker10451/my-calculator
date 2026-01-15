/**
 * Хелпер для определения где показывать карту ПСБ
 * Обеспечивает контекстуально уместное размещение карты на сайте
 */

/**
 * Типы страниц где может отображаться карта
 */
export type PageType = 
  | 'home'
  | 'calculator'
  | 'comparison'
  | 'blog'
  | 'products'
  | 'category'
  | 'other';

/**
 * Типы калькуляторов
 */
export type CalculatorType =
  | 'salary'
  | 'mortgage'
  | 'credit'
  | 'deposit'
  | 'refinancing'
  | 'currency'
  | 'other';

/**
 * Контекст для определения релевантности показа карты
 */
export interface PlacementContext {
  pageType: PageType;
  calculatorType?: CalculatorType;
  hasOtherBankProducts?: boolean;
  userHasSalary?: boolean;
}

/**
 * Определяет, нужно ли показывать карту ПСБ на данной странице
 * 
 * Правила размещения:
 * - Показывать только на релевантных страницах (калькуляторы зарплаты, списки карт)
 * - Не показывать на нерелевантных страницах (калькулятор ЖКХ, здоровье и т.д.)
 * - Показывать естественным образом, без навязчивости
 * 
 * @param context - Контекст страницы
 * @returns true если карту нужно показать
 */
export function shouldShowPSBCard(context: PlacementContext): boolean {
  const { pageType, calculatorType, hasOtherBankProducts, userHasSalary } = context;
  
  // На главной странице не показываем (слишком общая)
  if (pageType === 'home') {
    return false;
  }
  
  // На странице сравнения не показываем (пользователь уже сравнивает результаты)
  if (pageType === 'comparison') {
    return false;
  }
  
  // На странице списка продуктов показываем
  if (pageType === 'products') {
    return true;
  }
  
  // На странице категории банковских продуктов показываем
  if (pageType === 'category' && hasOtherBankProducts) {
    return true;
  }
  
  // На калькуляторах показываем только релевантные
  if (pageType === 'calculator' && calculatorType) {
    // Релевантные калькуляторы для зарплатной карты
    const relevantCalculators: CalculatorType[] = [
      'salary',      // калькулятор зарплаты - основной
      'deposit',     // вклады - релевантно (надбавка ко вкладам)
      'mortgage',    // ипотека - может быть интересно
      'credit',      // кредит - может быть интересно
      'refinancing'  // рефинансирование - может быть интересно
    ];
    
    return relevantCalculators.includes(calculatorType);
  }
  
  // На блоге показываем только если статья о банковских продуктах
  if (pageType === 'blog' && hasOtherBankProducts) {
    return true;
  }
  
  // По умолчанию не показываем
  return false;
}

/**
 * Определяет вариант отображения карты в зависимости от контекста
 * 
 * @param context - Контекст страницы
 * @returns 'compact' для списков, 'full' для отдельных страниц
 */
export function getPSBCardVariant(context: PlacementContext): 'compact' | 'full' {
  const { pageType, hasOtherBankProducts } = context;
  
  // В списках продуктов используем компактный вариант
  if (pageType === 'products' || (pageType === 'category' && hasOtherBankProducts)) {
    return 'compact';
  }
  
  // На калькуляторах используем полный вариант
  if (pageType === 'calculator') {
    return 'full';
  }
  
  // По умолчанию компактный
  return 'compact';
}

/**
 * Определяет source для аналитики в зависимости от типа страницы
 * 
 * @param context - Контекст страницы
 * @returns source для трекинга
 */
export function getPSBCardSource(context: PlacementContext): 'calculator' | 'comparison' | 'blog' | 'products' {
  const { pageType } = context;
  
  switch (pageType) {
    case 'calculator':
      return 'calculator';
    case 'comparison':
      return 'comparison';
    case 'blog':
      return 'blog';
    case 'products':
    case 'category':
      return 'products';
    default:
      return 'products';
  }
}
