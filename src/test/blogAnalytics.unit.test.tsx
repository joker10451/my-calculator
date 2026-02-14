import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { BlogAnalytics } from '@/components/blog/BlogAnalytics';
import * as analyticsService from '@/services/analyticsService';

// Mock аналитического сервиса
vi.mock('@/services/analyticsService', () => ({
  trackPageView: vi.fn(),
  trackScrollDepth: vi.fn(),
  trackCalculatorClick: vi.fn(),
  trackCompletion: vi.fn(),
  endReadingSession: vi.fn(),
}));

describe('Unit Tests: BlogAnalytics Component', () => {
  const mockArticleId = 'test-article-123';
  const mockArticleTitle = 'Тестовая статья';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 2400, // 3x window height
    });

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  /**
   * Тест записи page view при монтировании
   * Requirements: 6.1
   */
  test('Tracks page view on mount', () => {
    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    expect(analyticsService.trackPageView).toHaveBeenCalledTimes(1);
    expect(analyticsService.trackPageView).toHaveBeenCalledWith(mockArticleId);
  });

  /**
   * Тест завершения сессии чтения при размонтировании
   * Requirements: 6.2
   */
  test('Ends reading session on unmount', () => {
    const { unmount } = render(
      <BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />
    );

    expect(analyticsService.endReadingSession).not.toHaveBeenCalled();

    unmount();

    expect(analyticsService.endReadingSession).toHaveBeenCalledTimes(1);
    expect(analyticsService.endReadingSession).toHaveBeenCalledWith(mockArticleId);
  });

  /**
   * Тест отслеживания scroll depth при прокрутке
   * Requirements: 6.3
   */
  test('Tracks scroll depth when scrolling', () => {
    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    // Имитируем прокрутку до 25%
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 400, // 25% of scrollable height (1600)
    });

    // Триггерим событие scroll
    window.dispatchEvent(new Event('scroll'));

    // Ждем throttle (300ms)
    vi.advanceTimersByTime(300);

    expect(analyticsService.trackScrollDepth).toHaveBeenCalled();
  });

  /**
   * Тест определения scroll depth
   * Requirements: 6.3
   */
  test('Calculates scroll depth correctly', () => {
    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    // Прокручиваем до 50%
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 800, // 50% of scrollable height (1600)
    });

    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(300);

    // Проверяем, что trackScrollDepth был вызван с глубиной около 50
    expect(analyticsService.trackScrollDepth).toHaveBeenCalled();
    const callArgs = (analyticsService.trackScrollDepth as any).mock.calls[0];
    expect(callArgs[0]).toBe(mockArticleId);
    expect(callArgs[1]).toBeGreaterThanOrEqual(45);
    expect(callArgs[1]).toBeLessThanOrEqual(55);
  });

  /**
   * Тест отслеживания кликов на калькуляторы
   * Requirements: 6.4
   */
  test('Tracks calculator clicks', () => {
    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    // Имитируем клик на ссылку калькулятора
    // Создаем mock элемент ссылки
    const mockLink = {
      href: '/calculator/mortgage',
      getAttribute: vi.fn((attr) => attr === 'href' ? '/calculator/mortgage' : null),
      closest: vi.fn((selector) => selector === 'a[href*="/calculator"]' ? mockLink : null),
    };

    // Создаем событие клика
    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', {
      value: mockLink,
      writable: false,
    });

    // Диспатчим событие
    document.dispatchEvent(clickEvent);

    expect(analyticsService.trackCalculatorClick).toHaveBeenCalledTimes(1);
    expect(analyticsService.trackCalculatorClick).toHaveBeenCalledWith(
      mockArticleId,
      'mortgage'
    );
  });

  /**
   * Тест игнорирования кликов на не-калькуляторы
   */
  test('Does not track clicks on non-calculator links', () => {
    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    // Имитируем клик на обычную ссылку
    const mockLink = {
      href: '/blog/another-article',
      getAttribute: vi.fn((attr) => attr === 'href' ? '/blog/another-article' : null),
      closest: vi.fn((selector) => selector === 'a[href*="/calculator"]' ? null : mockLink),
    };

    // Создаем событие клика
    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', {
      value: mockLink,
      writable: false,
    });

    // Диспатчим событие
    document.dispatchEvent(clickEvent);

    expect(analyticsService.trackCalculatorClick).not.toHaveBeenCalled();
  });

  /**
   * Тест отслеживания completion
   * Requirements: 6.6
   */
  test('Tracks completion when scrolled to 100% and stayed for 5s', () => {
    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    // Прокручиваем до 100%
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 1600, // 100% of scrollable height
    });

    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(300);

    // Completion не должен быть отслежен сразу
    expect(analyticsService.trackCompletion).not.toHaveBeenCalled();

    // Ждем 5 секунд
    vi.advanceTimersByTime(5000);

    // Триггерим еще один scroll для проверки условия
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(300);

    // Теперь completion должен быть отслежен
    expect(analyticsService.trackCompletion).toHaveBeenCalledTimes(1);
    expect(analyticsService.trackCompletion).toHaveBeenCalledWith(mockArticleId);
  });

  /**
   * Тест предотвращения дублирования scroll depth событий
   */
  test('Does not track same scroll depth threshold twice', () => {
    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    // Прокручиваем до 50%
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 800,
    });

    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(300);

    const firstCallCount = (analyticsService.trackScrollDepth as any).mock.calls.length;

    // Прокручиваем еще раз до той же глубины
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(300);

    // Количество вызовов не должно увеличиться
    expect((analyticsService.trackScrollDepth as any).mock.calls.length).toBe(firstCallCount);
  });

  /**
   * Тест throttling scroll событий
   */
  test('Throttles scroll events to 300ms', () => {
    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    // Быстро триггерим несколько scroll событий
    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(50); // 50ms между событиями
    }

    // Должно быть вызвано меньше раз, чем количество событий
    const callCount = (analyticsService.trackScrollDepth as any).mock.calls.length;
    expect(callCount).toBeLessThan(10);
  });

  /**
   * Тест обработки edge case: документ короче окна
   */
  test('Handles case when document is shorter than window', () => {
    // Устанавливаем высоту документа меньше окна
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 600, // Меньше window.innerHeight (800)
    });

    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(300);

    // Должен отследить 100% scroll depth
    expect(analyticsService.trackScrollDepth).toHaveBeenCalled();
  });

  /**
   * Тест клика на вложенный элемент внутри ссылки на калькулятор
   */
  test('Tracks calculator click when clicking nested element', () => {
    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    // Имитируем клик на вложенный элемент внутри ссылки
    const mockLink = {
      href: '/calculator/credit',
      getAttribute: vi.fn((attr) => attr === 'href' ? '/calculator/credit' : null),
      closest: vi.fn((selector) => selector === 'a[href*="/calculator"]' ? mockLink : null),
    };

    const mockSpan = {
      closest: vi.fn((selector) => selector === 'a[href*="/calculator"]' ? mockLink : null),
    };

    // Создаем событие клика на вложенный элемент
    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', {
      value: mockSpan,
      writable: false,
    });

    // Диспатчим событие
    document.dispatchEvent(clickEvent);

    expect(analyticsService.trackCalculatorClick).toHaveBeenCalledTimes(1);
    expect(analyticsService.trackCalculatorClick).toHaveBeenCalledWith(
      mockArticleId,
      'credit'
    );
  });

  /**
   * Тест начальной проверки scroll position
   */
  test('Checks initial scroll position on mount', () => {
    // Устанавливаем начальную позицию скролла
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 400, // 25%
    });

    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    // Должен отследить начальную позицию
    expect(analyticsService.trackScrollDepth).toHaveBeenCalled();
  });

  /**
   * Тест предотвращения дублирования completion
   */
  test('Does not track completion twice', () => {
    render(<BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />);

    // Прокручиваем до 100%
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 1600,
    });

    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(300);

    // Ждем 5 секунд и триггерим scroll
    vi.advanceTimersByTime(5000);
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(300);

    expect(analyticsService.trackCompletion).toHaveBeenCalledTimes(1);

    // Триггерим еще раз
    vi.advanceTimersByTime(1000);
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(300);

    // Не должно быть второго вызова
    expect(analyticsService.trackCompletion).toHaveBeenCalledTimes(1);
  });

  /**
   * Тест компонент не рендерит видимые элементы
   */
  test('Component renders nothing visible', () => {
    const { container } = render(
      <BlogAnalytics articleId={mockArticleId} articleTitle={mockArticleTitle} />
    );

    // Компонент не должен добавлять элементы в DOM
    expect(container.firstChild).toBeNull();
  });
});
