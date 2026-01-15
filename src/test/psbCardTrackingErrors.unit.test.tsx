/**
 * Unit тесты для обработки ошибок трекинга в PSBCardWidget
 * Validates: Requirements 3.1, 3.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PSBCardWidget } from '@/components/PSBCardWidget';
import * as referralTracking from '@/lib/analytics/referralTracking';
import * as yandexMetrika from '@/hooks/useYandexMetrika';

// Мокаем модули
vi.mock('@/lib/analytics/referralTracking');
vi.mock('@/hooks/useYandexMetrika');

describe('PSBCardWidget - Tracking Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Мокаем window.open
    global.window.open = vi.fn();
  });

  it('должен открыть ссылку даже если trackClick выбрасывает ошибку', () => {
    // Настраиваем мок чтобы trackClick выбрасывал ошибку
    const mockTrackClick = vi.fn(() => {
      throw new Error('Tracking failed');
    });
    
    vi.mocked(referralTracking.useReferralTracking).mockReturnValue({
      trackClick: mockTrackClick,
      trackView: vi.fn(),
      getClickCount: vi.fn(),
      getViewCount: vi.fn()
    });

    vi.mocked(yandexMetrika.trackYandexGoal).mockImplementation(() => {});

    // Подавляем console.error для чистоты вывода
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<PSBCardWidget source="calculator" />);

    const button = screen.getByRole('button', { name: /оформить дебетовую карту/i });
    fireEvent.click(button);

    // Проверяем что ошибка была залогирована
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error tracking PSB card click:',
      expect.any(Error)
    );

    // Проверяем что ссылка всё равно открылась
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('trk.ppdu.ru'),
      '_blank',
      'noopener,noreferrer'
    );

    consoleErrorSpy.mockRestore();
  });

  it('должен открыть ссылку даже если trackYandexGoal выбрасывает ошибку при клике', () => {
    let callCount = 0;
    // Настраиваем мок чтобы trackYandexGoal выбрасывал ошибку только при клике (второй вызов)
    vi.mocked(yandexMetrika.trackYandexGoal).mockImplementation(() => {
      callCount++;
      if (callCount > 1) {
        throw new Error('Yandex Metrika failed on click');
      }
    });

    vi.mocked(referralTracking.useReferralTracking).mockReturnValue({
      trackClick: vi.fn(),
      trackView: vi.fn(),
      getClickCount: vi.fn(),
      getViewCount: vi.fn()
    });

    // Подавляем console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<PSBCardWidget source="calculator" />);

    const button = screen.getByRole('button', { name: /оформить дебетовую карту/i });
    fireEvent.click(button);

    // Проверяем что ошибка была залогирована
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Проверяем что ссылка всё равно открылась
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('trk.ppdu.ru'),
      '_blank',
      'noopener,noreferrer'
    );

    consoleErrorSpy.mockRestore();
  });

  it('должен логировать предупреждение если popup заблокирован', () => {
    // Мокаем window.open чтобы вернуть null (popup blocked)
    global.window.open = vi.fn().mockReturnValue(null);

    vi.mocked(referralTracking.useReferralTracking).mockReturnValue({
      trackClick: vi.fn(),
      trackView: vi.fn(),
      getClickCount: vi.fn(),
      getViewCount: vi.fn()
    });

    vi.mocked(yandexMetrika.trackYandexGoal).mockImplementation(() => {});

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<PSBCardWidget source="calculator" />);

    const button = screen.getByRole('button', { name: /оформить дебетовую карту/i });
    fireEvent.click(button);

    // Проверяем что предупреждение было залогировано
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Popup blocked. Please allow popups for this site.'
    );

    consoleWarnSpy.mockRestore();
  });

  it('не должен блокировать UI при ошибках трекинга', () => {
    // trackYandexGoal работает нормально при монтировании
    vi.mocked(yandexMetrika.trackYandexGoal).mockImplementation(() => {});

    vi.mocked(referralTracking.useReferralTracking).mockReturnValue({
      trackClick: vi.fn(() => {
        throw new Error('Tracking failed');
      }),
      trackView: vi.fn(),
      getClickCount: vi.fn(),
      getViewCount: vi.fn()
    });

    // Подавляем console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Компонент должен рендериться без ошибок
    expect(() => {
      render(<PSBCardWidget source="calculator" />);
    }).not.toThrow();

    // Кнопка должна быть кликабельна
    const button = screen.getByRole('button', { name: /оформить дебетовую карту/i });
    expect(button).toBeInTheDocument();
    
    // Клик не должен вызывать краш
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();

    // Ссылка должна открыться несмотря на ошибки
    expect(window.open).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
