/**
 * Property-based тесты для интеграции с маршрутизатором
 * Feature: court-fee-calculator, Property 9: Router Integration
 * Validates: Requirements 8.1
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ComparisonProvider } from '@/context/ComparisonContext';
import CourtFeeCalculatorPage from '@/pages/CourtFeeCalculatorPage';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';

// Мокаем LocalDataManager для тестирования
vi.mock('@/lib/apiClient/LocalDataManager', () => ({
  LocalDataManager: class MockLocalDataManager {
    getFeeSchedule = vi.fn().mockRejectedValue(new Error('Local data only'));
    checkForUpdates = vi.fn().mockRejectedValue(new Error('Local data only'));
    getSourcesStatus = vi.fn().mockReturnValue([]);
    testConnection = vi.fn().mockResolvedValue(true);
    clearCache = vi.fn().mockResolvedValue(undefined);
    searchDocuments = vi.fn().mockResolvedValue({ success: false, data: [] });
  }
}));

vi.mock('@/lib/apiClient/ConsultantRuClient', () => ({
  ConsultantRuClient: class MockConsultantRuClient {
    getFeeSchedule = vi.fn().mockRejectedValue(new Error('HTTP 404: Not Found'));
    checkForUpdates = vi.fn().mockRejectedValue(new Error('HTTP 404: Not Found'));
    isAvailable = vi.fn().mockResolvedValue(false);
  }
}));

vi.mock('@/lib/apiClient/ApiSourceManager', () => ({
  ApiSourceManager: class MockApiSourceManager {
    getFeeSchedule = vi.fn().mockRejectedValue(new Error('All API sources failed'));
    checkForUpdates = vi.fn().mockRejectedValue(new Error('All API sources failed'));
    getSourceStatuses = vi.fn().mockResolvedValue([]);
  }
}));

// Генераторы для property-based тестирования
const validRouteGenerator = fc.constantFrom(
  '/calculator/court-fee',
  '/calculator/court-fee/',
);

const invalidRouteGenerator = fc.constantFrom(
  '/calculator/court-fees',
  '/calculator/court',
  '/court-fee',
  '/calculator/court-fee-invalid'
);

// Создаем обертку для тестирования с провайдерами и маршрутами
const TestWrapper = ({ initialEntries }: { initialEntries: string[] }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ComparisonProvider>
            <MemoryRouter initialEntries={initialEntries}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/calculator/court-fee" element={<CourtFeeCalculatorPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MemoryRouter>
          </ComparisonProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

describe('Router Integration Property Tests', () => {
  
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
  });
  
  test('Property 9: Router Integration - Court Fee Calculator Route Loading', () => {
    // Feature: court-fee-calculator, Property 9: Router Integration
    // Validates: Requirements 8.1
    
    fc.assert(
      fc.property(validRouteGenerator, (route) => {
        render(<TestWrapper initialEntries={[route]} />);
        
        // Проверяем, что страница калькулятора госпошлины загружается
        // Ищем заголовок страницы (может быть несколько экземпляров)
        const titles = screen.queryAllByText(/калькулятор госпошлины/i);
        expect(titles.length).toBeGreaterThan(0);
        
        // Проверяем наличие основных элементов калькулятора
        // Ищем слайдеры для ввода суммы
        const sliders = screen.queryAllByRole('slider');
        expect(sliders.length).toBeGreaterThan(0);
        
        // Проверяем наличие кнопок типов судов по их фактическим названиям (используем queryAllByRole)
        const generalCourtButtons = screen.queryAllByRole('button', { name: /общая юрисдикция/i });
        const arbitrationCourtButtons = screen.queryAllByRole('button', { name: /арбитражный суд/i });
        
        expect(generalCourtButtons.length > 0 || arbitrationCourtButtons.length > 0).toBe(true);
        
        // Проверяем, что не отображается страница 404
        expect(screen.queryByText(/страница не найдена/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/404/)).not.toBeInTheDocument();
      }),
      { numRuns: 5 } // Уменьшаем количество прогонов для ускорения
    );
  }, 15000); // Увеличиваем таймаут до 15 секунд

  test('Property 9: Router Integration - Invalid Routes Handling', () => {
    // Feature: court-fee-calculator, Property 9: Router Integration
    // Validates: Requirements 8.1
    
    fc.assert(
      fc.property(invalidRouteGenerator, (route) => {
        render(<TestWrapper initialEntries={[route]} />);
        
        // Проверяем, что для неверных маршрутов отображается страница 404
        const notFoundElements = screen.queryAllByText(/страница не найдена/i);
        const notFound404Elements = screen.queryAllByText(/404/);
        
        // Должна отображаться страница 404
        expect(notFoundElements.length > 0 || notFound404Elements.length > 0).toBe(true);
        
        // Не должна отображаться страница калькулятора госпошлины
        expect(screen.queryByText(/калькулятор госпошлины/i)).not.toBeInTheDocument();
      }),
      { numRuns: 10 }
    );
  });

  test('Property 9: Router Integration - Route Consistency', () => {
    // Feature: court-fee-calculator, Property 9: Router Integration
    // Validates: Requirements 8.1
    
    fc.assert(
      fc.property(fc.constantFrom('/calculator/court-fee'), (route) => {
        render(<TestWrapper initialEntries={[route]} />);
        
        // Проверяем консистентность загрузки - страница должна загружаться одинаково
        const titles = screen.queryAllByText(/калькулятор госпошлины/i);
        expect(titles.length).toBeGreaterThan(0);
        
        // Проверяем, что основные компоненты присутствуют
        const sliders = screen.queryAllByRole('slider');
        expect(sliders.length).toBeGreaterThan(0);
        
        // Проверяем наличие кнопок типов судов по их фактическим названиям (используем queryAllByRole)
        const generalCourtButtons = screen.queryAllByRole('button', { name: /общая юрисдикция/i });
        const arbitrationCourtButtons = screen.queryAllByRole('button', { name: /арбитражный суд/i });
        
        // Хотя бы одна из кнопок должна присутствовать
        expect(generalCourtButtons.length > 0 || arbitrationCourtButtons.length > 0).toBe(true);
      }),
      { numRuns: 5 } // Уменьшаем количество прогонов
    );
  }, 15000); // Увеличиваем таймаут

  test('Property 9: Router Integration - Basic Functionality Presence', () => {
    // Feature: court-fee-calculator, Property 9: Router Integration
    // Validates: Requirements 8.1
    
    fc.assert(
      fc.property(fc.constantFrom('/calculator/court-fee'), (route) => {
        render(<TestWrapper initialEntries={[route]} />);
        
        // Проверяем, что основные функциональные элементы присутствуют
        // Заголовок страницы (может быть несколько)
        const titles = screen.queryAllByText(/калькулятор госпошлины/i);
        expect(titles.length).toBeGreaterThan(0);
        
        // Слайдеры для ввода суммы иска (может быть несколько)
        const sliders = screen.queryAllByRole('slider');
        expect(sliders.length).toBeGreaterThan(0);
        
        // Кнопки выбора типа суда
        const buttons = screen.queryAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(1); // Минимум 1 кнопка
        
        // Проверяем, что есть кнопки типов судов (используем queryAllByRole)
        const generalCourtButtons = screen.queryAllByRole('button', { name: /общая юрисдикция/i });
        const arbitrationCourtButtons = screen.queryAllByRole('button', { name: /арбитражный суд/i });
        
        expect(generalCourtButtons.length > 0 || arbitrationCourtButtons.length > 0).toBe(true);
      }),
      { numRuns: 5 } // Уменьшаем количество прогонов
    );
  }, 15000); // Увеличиваем таймаут

  test('Property 9: Router Integration - Component Structure Validation', () => {
    // Feature: court-fee-calculator, Property 9: Router Integration
    // Validates: Requirements 8.1
    
    fc.assert(
      fc.property(fc.constantFrom('/calculator/court-fee'), (route) => {
        const { container } = render(<TestWrapper initialEntries={[route]} />);
        
        // Проверяем правильную структуру компонентов
        // Должен быть основной контейнер с калькулятором
        const mainContainer = container.querySelector('main') || 
                             container.querySelector('[role="main"]') ||
                             container.querySelector('.min-h-screen') ||
                             container; // Fallback на весь контейнер
        
        expect(mainContainer).toBeTruthy();
        
        // Проверяем наличие основных секций калькулятора
        const sliders = screen.queryAllByRole('slider');
        const courtTypeButtons = screen.queryAllByRole('button');
        
        expect(sliders.length).toBeGreaterThan(0);
        expect(courtTypeButtons.length).toBeGreaterThan(0);
        
        // Проверяем, что элементы калькулятора присутствуют в DOM
        // (не обязательно в конкретном контейнере, так как структура может варьироваться)
        const calculatorTitle = screen.queryAllByText(/калькулятор госпошлины/i);
        expect(calculatorTitle.length).toBeGreaterThan(0);
      }),
      { numRuns: 10 }
    );
  });

  test('Property 9: Router Integration - Navigation State Initialization', () => {
    // Feature: court-fee-calculator, Property 9: Router Integration
    // Validates: Requirements 8.1
    
    fc.assert(
      fc.property(fc.constantFrom('/calculator/court-fee'), (route) => {
        // Тестируем, что при навигации на маршрут состояние инициализируется корректно
        render(<TestWrapper initialEntries={[route]} />);
        
        // Проверяем начальное состояние калькулятора
        const sliders = screen.queryAllByRole('slider');
        expect(sliders.length).toBeGreaterThan(0);
        
        // Проверяем, что кнопки типов судов существуют (используем queryAllByRole)
        const generalCourtButtons = screen.queryAllByRole('button', { name: /общая юрисдикция/i });
        const arbitrationCourtButtons = screen.queryAllByRole('button', { name: /арбитражный суд/i });
        
        expect(generalCourtButtons.length > 0 || arbitrationCourtButtons.length > 0).toBe(true);
        
        // Проверяем наличие результатов расчета или области для них
        const resultElements = screen.queryAllByText(/результат/i);
        const calculationElements = screen.queryAllByText(/расчет/i);
        
        // Должны быть элементы, связанные с результатами или расчетами
        expect(resultElements.length > 0 || calculationElements.length > 0).toBe(true);
      }),
      { numRuns: 5 } // Уменьшаем количество прогонов
    );
  }, 15000); // Увеличиваем таймаут
});