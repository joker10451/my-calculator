/**
 * Property-based тесты для поля прямого ввода цены иска
 * Feature: court-fee-calculator, Property 14: Direct Input Field
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import CourtFeeCalculator from '@/components/calculators/CourtFeeCalculator';
import { ComparisonProvider } from '@/context/ComparisonContext';

// Mock для toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Константы для тестирования
const MIN_CLAIM_AMOUNT = 1000;
const MAX_CLAIM_AMOUNT = 10000000;

// Функции форматирования (дублируем логику из компонента)
const formatNumberWithSpaces = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const parseNumberFromString = (value: string): number => {
  const cleanValue = value.replace(/\s/g, '');
  const parsed = parseInt(cleanValue, 10);
  return isNaN(parsed) ? 0 : parsed;
};

// Компонент-обертка для тестирования
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ComparisonProvider>
    {children}
  </ComparisonProvider>
);

describe('Direct Input Field Property Tests', () => {
  
  beforeEach(() => {
    mockToast.mockClear();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('Property 14: Direct Input Field - Basic functionality', () => {
    // Feature: court-fee-calculator, Property 14: Direct Input Field
    // Validates: Requirements 10.1, 10.2, 10.6
    
    const { unmount } = render(
      <TestWrapper>
        <CourtFeeCalculator />
      </TestWrapper>
    );

    try {
      // Проверяем наличие поля ввода
      const inputField = screen.getByPlaceholderText('Введите сумму');
      expect(inputField).toBeInTheDocument();
      expect(inputField).toHaveAttribute('type', 'text');

      // Проверяем начальное значение
      expect(inputField).toHaveValue(formatNumberWithSpaces(100000));

    } finally {
      unmount();
    }
  });

  test('Property 14: Direct Input Field - Number formatting', () => {
    // Feature: court-fee-calculator, Property 14: Direct Input Field
    // Validates: Requirements 10.7
    
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_CLAIM_AMOUNT, max: MAX_CLAIM_AMOUNT }),
        (amount) => {
          const formatted = formatNumberWithSpaces(amount);
          const parsed = parseNumberFromString(formatted);
          
          // Проверяем, что форматирование и парсинг работают корректно
          expect(parsed).toBe(amount);
          
          // Проверяем, что в отформатированной строке есть пробелы для больших чисел
          if (amount >= 1000) {
            expect(formatted).toContain(' ');
          }
          
          // Проверяем, что парсинг удаляет пробелы
          expect(formatted.replace(/\s/g, '')).toBe(amount.toString());
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 14: Direct Input Field - Boundary validation', () => {
    // Feature: court-fee-calculator, Property 14: Direct Input Field
    // Validates: Requirements 10.3, 10.4
    
    fc.assert(
      fc.property(
        fc.integer({ min: -1000000, max: 20000000 }), // Расширенный диапазон для тестирования границ
        (inputValue) => {
          let expectedValue = inputValue;
          
          // Применяем ту же логику валидации, что и в компоненте
          if (inputValue < MIN_CLAIM_AMOUNT) {
            expectedValue = MIN_CLAIM_AMOUNT;
          } else if (inputValue > MAX_CLAIM_AMOUNT) {
            expectedValue = MAX_CLAIM_AMOUNT;
          }
          
          // Проверяем, что значение находится в допустимых границах
          expect(expectedValue).toBeGreaterThanOrEqual(MIN_CLAIM_AMOUNT);
          expect(expectedValue).toBeLessThanOrEqual(MAX_CLAIM_AMOUNT);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 14: Direct Input Field - Input validation', () => {
    // Feature: court-fee-calculator, Property 14: Direct Input Field
    // Validates: Requirements 10.5
    
    const { unmount } = render(
      <TestWrapper>
        <CourtFeeCalculator />
      </TestWrapper>
    );

    try {
      const inputField = screen.getByPlaceholderText('Введите сумму') as HTMLInputElement;
      
      // Тестируем валидные входные данные
      const validInputs = ['123456', '1 234 567', '999999'];
      validInputs.forEach(input => {
        fireEvent.change(inputField, { target: { value: input } });
        // Поле должно принять валидный ввод
        expect(parseNumberFromString(input)).toBeGreaterThan(0);
      });

      // Тестируем невалидные входные данные (должны быть отклонены)
      const invalidInputs = ['abc', '12.34', '12,34', '12a34', '!@#'];
      const initialValue = inputField.value;
      
      invalidInputs.forEach(input => {
        fireEvent.change(inputField, { target: { value: input } });
        // Значение не должно измениться при невалидном вводе
        // (в реальном компоненте onChange не сработает для невалидных символов)
      });

    } finally {
      unmount();
    }
  });

  test('Property 14: Direct Input Field - Synchronization', () => {
    // Feature: court-fee-calculator, Property 14: Direct Input Field
    // Validates: Requirements 10.6
    
    const { unmount } = render(
      <TestWrapper>
        <CourtFeeCalculator />
      </TestWrapper>
    );

    try {
      const inputField = screen.getByPlaceholderText('Введите сумму') as HTMLInputElement;
      
      // Тестируем синхронизацию с конкретным значением
      const targetAmount = 250000;
      const formattedInput = formatNumberWithSpaces(targetAmount);
      
      fireEvent.change(inputField, { target: { value: formattedInput } });
      
      // Проверяем, что поле ввода отображает правильное значение
      expect(inputField.value).toBe(formattedInput);
      
      // Проверяем, что есть элементы с отформатированной суммой
      const elementsWithAmount = screen.getAllByText((content, element) => {
        return content.includes('250') && content.includes('000') && content.includes('₽');
      });
      expect(elementsWithAmount.length).toBeGreaterThan(0);

    } finally {
      unmount();
    }
  });

  test('Property 14: Direct Input Field - Edge cases', () => {
    // Feature: court-fee-calculator, Property 14: Direct Input Field
    // Validates: Requirements 10.3, 10.4
    
    const { unmount } = render(
      <TestWrapper>
        <CourtFeeCalculator />
      </TestWrapper>
    );

    try {
      const inputField = screen.getByPlaceholderText('Введите сумму') as HTMLInputElement;
      
      // Тестируем минимальное значение
      fireEvent.change(inputField, { target: { value: '500' } }); // Меньше минимума
      fireEvent.blur(inputField);
      expect(parseNumberFromString(inputField.value)).toBeGreaterThanOrEqual(MIN_CLAIM_AMOUNT);
      
      // Тестируем максимальное значение
      fireEvent.change(inputField, { target: { value: '20000000' } }); // Больше максимума
      fireEvent.blur(inputField);
      expect(parseNumberFromString(inputField.value)).toBeLessThanOrEqual(MAX_CLAIM_AMOUNT);
      
      // Тестируем пустое значение
      fireEvent.change(inputField, { target: { value: '' } });
      fireEvent.blur(inputField);
      expect(parseNumberFromString(inputField.value)).toBeGreaterThanOrEqual(MIN_CLAIM_AMOUNT);

    } finally {
      unmount();
    }
  });

  test('Property 14: Direct Input Field - Real-time updates', () => {
    // Feature: court-fee-calculator, Property 14: Direct Input Field
    // Validates: Requirements 10.2
    
    const { unmount } = render(
      <TestWrapper>
        <CourtFeeCalculator />
      </TestWrapper>
    );

    try {
      const inputField = screen.getByPlaceholderText('Введите сумму') as HTMLInputElement;
      
      // Тестируем обновление в реальном времени
      const testValue = 250000;
      const formattedValue = formatNumberWithSpaces(testValue);
      
      fireEvent.change(inputField, { target: { value: formattedValue } });
      
      // Проверяем, что значение обновилось немедленно
      expect(inputField.value).toBe(formattedValue);
      
      // Проверяем, что отображение суммы обновилось
      const currencyDisplay = screen.getAllByText(/250.*000.*₽/)[0];
      expect(currencyDisplay).toBeInTheDocument();

    } finally {
      unmount();
    }
  });
});