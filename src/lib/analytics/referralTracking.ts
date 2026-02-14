/**
 * Система трекинга реферальных кликов и конверсий
 */

import type { BankProduct } from '@/types/bank';

export interface ReferralClickEvent {
  productId: string;
  bankId: string;
  productType: string;
  referralLink: string;
  userId?: string;
  source: 'calculator' | 'comparison' | 'recommendation' | 'blog';
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
    // Интеграция с Yandex Metrika (если настроена)
    if (typeof window !== 'undefined' && (window as Window & { ym?: (id: number, method: string, event: string, data: Record<string, unknown>) => void; YM_COUNTER_ID?: number }).ym) {
      const w = window as Window & { ym: (id: number, method: string, event: string, data: Record<string, unknown>) => void; YM_COUNTER_ID?: number };
      w.ym(
        w.YM_COUNTER_ID || 0,
        'reachGoal',
        eventName,
        data
      );
    }

    // Интеграция с Google Analytics (если настроена)
    if (typeof window !== 'undefined' && (window as Window & { gtag?: (command: string, event: string, data: Record<string, unknown>) => void }).gtag) {
      const w = window as Window & { gtag: (command: string, event: string, data: Record<string, unknown>) => void };
      w.gtag('event', eventName, data);
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
    userId?: string
  ) => {
    ReferralTracker.trackClick({
      productId: product.id,
      bankId: product.bank_id,
      productType: product.product_type,
      referralLink,
      source,
      userId
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
    getPotentialRevenue: ReferralTracker.getPotentialRevenue
  };
}
