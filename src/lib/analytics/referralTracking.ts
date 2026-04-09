/**
 * Система трекинга реферальных кликов и конверсий
 */

import type { BankProduct } from '@/types/bank';
import { trackEvent } from '@/lib/analytics/googleAnalytics';
import { trackYandexGoal } from '@/hooks/useYandexMetrika';

export interface ReferralClickEvent {
  productId: string;
  bankId: string;
  productType: string;
  referralLink: string;
  userId?: string;
  source: 'calculator' | 'comparison' | 'recommendation' | 'blog';
  /**
   * Позиция/плейсмент на странице, чтобы мерить CTR по месту показа
   */
  placement?: 'result_block' | 'sidebar' | 'hero' | 'footer' | 'blog_inline' | 'widget' | 'unknown';
  /**
   * Человекочитаемый/стабильный ID оффера (для разрезов аналитики)
   */
  offerId?: string;
  /**
   * Вариант A/B для CTA в момент клика
   */
  abVariant?: 'a' | 'b';
  /**
   * URL страницы, где произошёл клик (удобно для выгрузок)
   */
  page?: string;
  timestamp: Date;
}

export interface ReferralConversionEvent {
  productId: string;
  bankId: string;
  userId?: string;
  conversionType: 'application' | 'approval' | 'funding';
  amount?: number;
  commission?: number;
  timestamp: Date;
}

/**
 * Класс для трекинга реферальных событий
 */
export class ReferralTracker {
  private static STORAGE_KEY = 'referral_clicks';
  private static CONVERSION_KEY = 'referral_conversions';

  /**
   * Отслеживание клика по реферальной ссылке
   */
  static trackClick(event: Omit<ReferralClickEvent, 'timestamp'>): void {
    const clickEvent: ReferralClickEvent = {
      ...event,
      timestamp: new Date()
    };

    // Сохраняем в localStorage
    this.saveClickEvent(clickEvent);

    // Отправляем в аналитику (если настроена)
    this.sendToAnalytics('referral_click', clickEvent);

    // Логируем для отладки
    console.log('Referral click tracked:', clickEvent);
  }

  /**
   * Отслеживание конверсии
   */
  static trackConversion(event: Omit<ReferralConversionEvent, 'timestamp'>): void {
    const conversionEvent: ReferralConversionEvent = {
      ...event,
      timestamp: new Date()
    };

    // Сохраняем в localStorage
    this.saveConversionEvent(conversionEvent);

    // Отправляем в аналитику
    this.sendToAnalytics('referral_conversion', conversionEvent);

    console.log('Referral conversion tracked:', conversionEvent);
  }

  /**
   * Получить все клики пользователя
   */
  static getUserClicks(userId?: string): ReferralClickEvent[] {
    const clicks = this.getClickEvents();
    
    if (userId) {
      return clicks.filter(click => click.userId === userId);
    }
    
    return clicks;
  }

  /**
   * Получить статистику по кликам
   */
  static getClickStatistics(): {
    totalClicks: number;
    clicksByBank: Record<string, number>;
    clicksByProduct: Record<string, number>;
    clicksBySource: Record<string, number>;
  } {
    const clicks = this.getClickEvents();
    
    const clicksByBank: Record<string, number> = {};
    const clicksByProduct: Record<string, number> = {};
    const clicksBySource: Record<string, number> = {};
    
    clicks.forEach(click => {
      clicksByBank[click.bankId] = (clicksByBank[click.bankId] || 0) + 1;
      clicksByProduct[click.productType] = (clicksByProduct[click.productType] || 0) + 1;
      clicksBySource[click.source] = (clicksBySource[click.source] || 0) + 1;
    });
    
    return {
      totalClicks: clicks.length,
      clicksByBank,
      clicksByProduct,
      clicksBySource
    };
  }

  /**
   * Получить потенциальный доход
   */
  static getPotentialRevenue(): number {
    const conversions = this.getConversionEvents();
    return conversions.reduce((sum, conv) => sum + (conv.commission || 0), 0);
  }

  /**
   * Сквозной отчет по воронке реферальных переходов
   */
  static getFunnelReport() {
    const clicks = this.getClickEvents();
    const conversions = this.getConversionEvents();

    const byOffer = clicks.reduce<Record<string, number>>((acc, click) => {
      const key = click.offerId || 'unknown_offer';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const byPlacement = clicks.reduce<Record<string, number>>((acc, click) => {
      const key = click.placement || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const byPage = clicks.reduce<Record<string, number>>((acc, click) => {
      const key = click.page || 'unknown_page';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const recentClicks = clicks.filter((click) => new Date(click.timestamp).getTime() >= dayAgo).length;

    return {
      totals: {
        clicks: clicks.length,
        conversions: conversions.length,
        conversionRate: clicks.length > 0 ? (conversions.length / clicks.length) * 100 : 0,
      },
      recent: {
        clicks24h: recentClicks,
      },
      byOffer,
      byPlacement,
      byPage,
    };
  }

  /**
   * Сигналы мониторинга качества трекинга
   */
  static getTrackingHealth() {
    const report = this.getFunnelReport();
    const issues: string[] = [];

    if (report.recent.clicks24h === 0) {
      issues.push('Нет кликов по реферальным CTA за последние 24 часа');
    }
    if (report.totals.clicks > 0 && report.totals.conversionRate < 0.2) {
      issues.push('Низкая конверсия воронки (<0.2%)');
    }
    if (Object.keys(report.byPlacement).length <= 1) {
      issues.push('Клики идут из одного placement — возможен перекос воронки');
    }

    return {
      status: issues.length === 0 ? 'ok' as const : 'warning' as const,
      issues,
    };
  }

  /**
   * Очистить старые события (старше 90 дней)
   */
  static cleanupOldEvents(): void {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const clicks = this.getClickEvents().filter(
      click => new Date(click.timestamp) > ninetyDaysAgo
    );
    
    const conversions = this.getConversionEvents().filter(
      conv => new Date(conv.timestamp) > ninetyDaysAgo
    );
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clicks));
    localStorage.setItem(this.CONVERSION_KEY, JSON.stringify(conversions));
  }

  // Приватные методы
  private static saveClickEvent(event: ReferralClickEvent): void {
    const clicks = this.getClickEvents();
    clicks.push(event);
    
    // Ограничиваем количество сохраненных событий (последние 1000)
    const limitedClicks = clicks.slice(-1000);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedClicks));
  }

  private static saveConversionEvent(event: ReferralConversionEvent): void {
    const conversions = this.getConversionEvents();
    conversions.push(event);
    
    localStorage.setItem(this.CONVERSION_KEY, JSON.stringify(conversions));
  }

  private static getClickEvents(): ReferralClickEvent[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading click events:', error);
      return [];
    }
  }

  private static getConversionEvents(): ReferralConversionEvent[] {
    try {
      const data = localStorage.getItem(this.CONVERSION_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading conversion events:', error);
      return [];
    }
  }

  private static sendToAnalytics(eventName: string, data: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;

    // Яндекс.Метрика (единая точка, с корректным counter id из useYandexMetrika)
    try {
      trackYandexGoal(eventName, data);
    } catch {
      // ignore
    }

    // GA4 (единая точка)
    try {
      trackEvent(eventName, data);
    } catch {
      // ignore
    }

    // Можно добавить отправку на ваш сервер
    // fetch('/api/analytics/referral', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ event: eventName, data })
    // });
  }
}

/**
 * Хук для использования в React компонентах
 */
export function useReferralTracking() {
  const trackClick = (
    product: BankProduct,
    referralLink: string,
    source: ReferralClickEvent['source'],
    userId?: string,
    extras?: Pick<ReferralClickEvent, 'placement' | 'offerId' | 'page' | 'abVariant'>
  ) => {
    ReferralTracker.trackClick({
      productId: product.id,
      bankId: product.bank_id,
      productType: product.product_type,
      referralLink,
      source,
      userId,
      placement: extras?.placement,
      offerId: extras?.offerId,
      page: extras?.page,
      abVariant: extras?.abVariant,
    });
  };

  const trackConversion = (
    product: BankProduct,
    conversionType: ReferralConversionEvent['conversionType'],
    amount?: number,
    commission?: number,
    userId?: string
  ) => {
    ReferralTracker.trackConversion({
      productId: product.id,
      bankId: product.bank_id,
      conversionType,
      amount,
      commission,
      userId
    });
  };

  return {
    trackClick,
    trackConversion,
    getStatistics: ReferralTracker.getClickStatistics,
    getPotentialRevenue: ReferralTracker.getPotentialRevenue,
    getFunnelReport: ReferralTracker.getFunnelReport,
    getTrackingHealth: ReferralTracker.getTrackingHealth,
  };
}
