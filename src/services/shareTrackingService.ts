/**
 * Сервис для отслеживания шерингов статей блога
 */

export interface ShareEvent {
  articleId: string;
  articleSlug: string;
  platform: 'vk' | 'telegram' | 'whatsapp' | 'copy_link';
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface ShareStats {
  articleId: string;
  totalShares: number;
  sharesByPlatform: {
    vk: number;
    telegram: number;
    whatsapp: number;
    copy_link: number;
  };
}

class ShareTrackingService {
  private readonly STORAGE_KEY = 'blog_share_stats';
  private readonly SESSION_KEY = 'blog_session_id';

  /**
   * Получает или создает ID сессии
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Отслеживает событие шеринга
   */
  trackShare(articleId: string, articleSlug: string, platform: ShareEvent['platform']): void {
    const event: ShareEvent = {
      articleId,
      articleSlug,
      platform,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
    };

    // Save to localStorage
    this.saveShareEvent(event);

    // Track in analytics
    this.trackInAnalytics(event);

    // Send to backend (if available)
    this.sendToBackend(event);
  }

  /**
   * Сохраняет событие шеринга в localStorage
   */
  private saveShareEvent(event: ShareEvent): void {
    try {
      const stats = this.getShareStats(event.articleId);
      stats.totalShares++;
      stats.sharesByPlatform[event.platform]++;

      const allStats = this.getAllStats();
      allStats[event.articleId] = stats;

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allStats));
    } catch (error) {
      console.error('Failed to save share event:', error);
    }
  }

  /**
   * Получает статистику шерингов для статьи
   */
  getShareStats(articleId: string): ShareStats {
    const allStats = this.getAllStats();
    return allStats[articleId] || {
      articleId,
      totalShares: 0,
      sharesByPlatform: {
        vk: 0,
        telegram: 0,
        whatsapp: 0,
        copy_link: 0,
      },
    };
  }

  /**
   * Получает общее количество шерингов для статьи
   */
  getShareCount(articleId: string): number {
    const stats = this.getShareStats(articleId);
    return stats.totalShares;
  }

  /**
   * Получает всю статистику шерингов
   */
  private getAllStats(): Record<string, ShareStats> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load share stats:', error);
      return {};
    }
  }

  /**
   * Отслеживает событие в аналитике (Yandex Metrika, Google Analytics)
   */
  private trackInAnalytics(event: ShareEvent): void {
    // Yandex Metrika
    if (window.ym) {
      window.ym(98765432, 'reachGoal', 'blog_share', {
        article_id: event.articleId,
        article_slug: event.articleSlug,
        platform: event.platform,
      });
    }

    // Google Analytics (if available)
    if (window.gtag) {
      window.gtag('event', 'share', {
        content_type: 'article',
        content_id: event.articleId,
        method: event.platform,
      });
    }
  }

  /**
   * Отправляет событие на бэкенд (если доступен)
   */
  private async sendToBackend(event: ShareEvent): Promise<void> {
    try {
      // This would be implemented when backend is available
      // await fetch('/api/blog/share', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('Failed to send share event to backend:', error);
    }
  }

  /**
   * Получает топ статей по количеству шерингов
   */
  getTopSharedArticles(limit: number = 10): Array<{ articleId: string; shareCount: number }> {
    const allStats = this.getAllStats();
    return Object.values(allStats)
      .map(stats => ({
        articleId: stats.articleId,
        shareCount: stats.totalShares,
      }))
      .sort((a, b) => b.shareCount - a.shareCount)
      .slice(0, limit);
  }

  /**
   * Очищает статистику шерингов (для тестирования)
   */
  clearStats(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const shareTrackingService = new ShareTrackingService();
