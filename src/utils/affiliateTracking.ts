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
  offerId?: string;
  placement?: 'result_block' | 'sidebar' | 'hero' | 'footer' | 'blog_inline' | 'widget' | 'unknown';
  abVariant?: 'a' | 'b';
}

/**
 * Отправить событие клика по affiliate ссылке
 */
export function trackAffiliateClick(event: AffiliateClickEvent): void {
  // В проекте используем единое событие `referral_click` через ReferralTracker
  // (Метрика/GA4 конфигурируются в одном месте).
  if (typeof window !== 'undefined') {
try {
    // Lazy import to avoid circular deps in non-browser contexts
    import('@/lib/analytics/referralTracking').then(({ ReferralTracker }) => {
        ReferralTracker.trackClick({
          productId: event.offerId || `${event.partnerName}-${event.productType}`,
          offerId: event.offerId || `${event.partnerName}-${event.productType}`,
          bankId: event.partnerName,
          productType: event.productType,
          referralLink: event.linkUrl,
          _source: 'recommendation',
          placement: event.placement || 'unknown',
          page: event.pageUrl,
          abVariant: event.abVariant,
        });
      });
    } catch {
      // ignore
    }
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
  productType: string
): string {
  return `javascript:void(0)`;
}
