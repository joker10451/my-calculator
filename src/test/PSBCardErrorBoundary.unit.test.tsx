/**
 * Unit тесты для PSBCardErrorBoundary
 * Validates: Requirements 2.1
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PSBCardErrorBoundary } from '@/components/PSBCardErrorBoundary';

// Компонент который выбрасывает ошибку для тестирования
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('PSBCardErrorBoundary', () => {
  // Подавляем console.error для чистоты вывода тестов
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('должен рендерить children когда нет ошибок', () => {
    render(
      <PSBCardErrorBoundary>
        <ThrowError shouldThrow={false} />
      </PSBCardErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('должен показывать fallback UI при ошибке рендеринга', () => {
    render(
      <PSBCardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PSBCardErrorBoundary>
    );

    expect(screen.getByText('Ошибка загрузки карты')).toBeInTheDocument();
    expect(screen.getByText(/не удалось загрузить информацию о карте/i)).toBeInTheDocument();
  });

  it('должен логировать ошибку в консоль', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <PSBCardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PSBCardErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('fallback UI должен содержать иконку ошибки', () => {
    const { container } = render(
      <PSBCardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PSBCardErrorBoundary>
    );

    // Проверяем наличие SVG иконки (lucide-react AlertCircle)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
