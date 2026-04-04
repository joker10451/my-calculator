/**
 * Трекинг кликов по affiliate ссылкам
 * Отправляет события в GA4 и Yandex Metrika
 */

export interface AffiliateClickEvent {
  partnerName: string;
  productType: string;
  linkUrl: string;
  source: string;
  pageUrl: string;
}

/**
 * Отправить событие клика по affiliate ссылке
 */
export function trackAffiliateClick(event: AffiliateClickEvent): void {
  // GA4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'affiliate_click', {
      partner_name: event.partnerName,
      product_type: event.productType,
      link_url: event.linkUrl,
      source: event.source,
    });
  }

  // Yandex Metrika
  if (typeof window !== 'undefined' && (window as any).ym) {
    (window as any).ym(98634609, 'reachGoal', 'affiliate_click', {
      partner: event.partnerName,
      product: event.productType,
      url: event.linkUrl,
    });
  }

  // localStorage для аналитики
  try {
    const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    clicks.push({ ...event, timestamp: Date.now() });
    localStorage.setItem('affiliate_clicks', JSON.stringify(clicks.slice(-100)));
  } catch {
    // ignore
  }
}

/**
 * Получить статистику кликов
 */
export function getAffiliateStats(): Record<string, number> {
  try {
    const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    const stats: Record<string, number> = {};
    clicks.forEach((c: AffiliateClickEvent & { timestamp: number }) => {
      const key = `${c.partnerName} - ${c.productType}`;
      stats[key] = (stats[key] || 0) + 1;
    });
    return stats;
  } catch {
    return {};
  }
}

/**
 * Обёртка для affiliate ссылок с трекингом
 */
export function createAffiliateLink(
  url: string,
  partnerName: string,
  productType: string,
  source: string = 'website'
): string {
  return `javascript:void(0)`;
}
