/**
 * Утилита для расчета conversion rate (коэффициента конверсии)
 * 
 * Conversion rate = (clicks / views) * 100
 */

/**
 * Рассчитывает conversion rate на основе количества просмотров и кликов
 * 
 * @param views - Количество просмотров
 * @param clicks - Количество кликов
 * @returns Conversion rate в процентах (0-100)
 * 
 * Edge cases:
 * - Если views = 0, возвращает 0 (нельзя делить на ноль)
 * - Если clicks > views, возвращает максимум 100 (технически невозможно, но обрабатываем)
 * - Отрицательные значения обрабатываются как 0
 */
export function calculateConversionRate(views: number, clicks: number): number {
  // Обработка edge case: отрицательные значения
  const normalizedViews = Math.max(0, views);
  const normalizedClicks = Math.max(0, clicks);
  
  // Edge case: zero views возвращает 0
  if (normalizedViews === 0) {
    return 0;
  }
  
  // Расчет conversion rate
  const conversionRate = (normalizedClicks / normalizedViews) * 100;
  
  // Edge case: clicks > views возвращает максимум 100
  return Math.min(conversionRate, 100);
}

/**
 * Рассчитывает conversion rate на основе массивов событий
 * 
 * @param viewEvents - Массив событий просмотров
 * @param clickEvents - Массив событий кликов
 * @returns Conversion rate в процентах (0-100)
 */
export function calculateConversionRateFromEvents(
  viewEvents: unknown[],
  clickEvents: unknown[]
): number {
  return calculateConversionRate(viewEvents.length, clickEvents.length);
}
