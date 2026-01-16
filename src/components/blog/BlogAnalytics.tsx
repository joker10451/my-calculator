import { useEffect, useRef, useCallback } from 'react';
import {
  trackPageView,
  trackScrollDepth,
  trackCalculatorClick,
  trackCompletion,
  endReadingSession,
} from '@/services/analyticsService';

interface BlogAnalyticsProps {
  articleId: string;
  articleTitle: string;
}

/**
 * Компонент для отслеживания аналитики блога
 * Интегрируется в BlogPostPage для трекинга:
 * - Page views
 * - Scroll depth (25%, 50%, 75%, 100%)
 * - Calculator clicks
 * - Completion events (100% scroll + 5s)
 */
export const BlogAnalytics = ({ articleId, articleTitle }: BlogAnalyticsProps) => {
  const scrollDepthTracked = useRef<Set<number>>(new Set());
  const completionTracked = useRef(false);
  const scrollTo100Ref = useRef(false);
  const timeAt100Ref = useRef<number | null>(null);

  /**
   * Расчет процента прокрутки страницы
   */
  const calculateScrollDepth = useCallback((): number => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Избегаем деления на ноль
    if (documentHeight <= windowHeight) {
      return 100;
    }

    const scrollableHeight = documentHeight - windowHeight;
    const scrollPercentage = (scrollTop / scrollableHeight) * 100;

    return Math.min(Math.max(scrollPercentage, 0), 100);
  }, []);

  /**
   * Обработчик скролла
   */
  const handleScroll = useCallback(() => {
    const depth = calculateScrollDepth();

    // Определяем пороги для отслеживания
    const thresholds = [25, 50, 75, 100];

    thresholds.forEach(threshold => {
      if (depth >= threshold && !scrollDepthTracked.current.has(threshold)) {
        scrollDepthTracked.current.add(threshold);
        trackScrollDepth(articleId, depth);

        // Если достигли 100%, запоминаем время
        if (threshold === 100) {
          scrollTo100Ref.current = true;
          timeAt100Ref.current = Date.now();
        }
      }
    });

    // Проверяем условия для completion
    // Completion = 100% scroll + пребывание на странице 5+ секунд
    if (
      scrollTo100Ref.current &&
      timeAt100Ref.current &&
      !completionTracked.current
    ) {
      const timeAtBottom = Date.now() - timeAt100Ref.current;
      
      if (timeAtBottom >= 5000) {
        // 5 секунд
        completionTracked.current = true;
        trackCompletion(articleId);
      }
    }
  }, [articleId, calculateScrollDepth]);

  /**
   * Отслеживание кликов на калькуляторы
   */
  const handleCalculatorClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href*="/calculator"]') as HTMLAnchorElement;

      if (link) {
        // Извлекаем ID калькулятора из href
        const href = link.getAttribute('href');
        if (href) {
          const calculatorId = href.split('/').pop() || href;
          trackCalculatorClick(articleId, calculatorId);
        }
      }
    },
    [articleId]
  );

  /**
   * Инициализация аналитики при монтировании компонента
   */
  useEffect(() => {
    // Отслеживаем page view
    trackPageView(articleId);

    // Добавляем обработчик скролла
    const throttledHandleScroll = throttle(handleScroll, 300);
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    // Добавляем обработчик кликов на калькуляторы
    document.addEventListener('click', handleCalculatorClick);

    // Проверяем начальную позицию скролла
    handleScroll();

    // Cleanup при размонтировании
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      document.removeEventListener('click', handleCalculatorClick);
      
      // Завершаем сессию чтения
      endReadingSession(articleId);
    };
  }, [articleId, handleScroll, handleCalculatorClick]);

  // Компонент не рендерит ничего видимого
  return null;
};

/**
 * Throttle функция для ограничения частоты вызовов
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    } else {
      // Планируем вызов на конец периода throttle
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func.apply(this, args);
      }, delay - (now - lastCall));
    }
  };
}
