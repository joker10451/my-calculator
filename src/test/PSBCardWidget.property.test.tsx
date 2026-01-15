/**
 * Property-based тесты для компонента PSBCardWidget
 * Проверяют универсальные свойства корректности
 * 
 * Feature: psb-card-integration
 * Property 2: Commission data is never rendered
 * Validates: Requirements 2.5, 5.6
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { PSBCardWidget } from '@/components/PSBCardWidget';
import type { PSBCardWidgetProps } from '@/components/PSBCardWidget';

// Мокаем ReferralButton
vi.mock('@/components/ReferralButton', () => ({
  ReferralButton: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="referral-button">
      {children}
    </button>
  )
}));

// Мокаем useReferralTracking
vi.mock('@/lib/analytics/referralTracking', () => ({
  useReferralTracking: () => ({
    trackClick: vi.fn()
  })
}));

describe('PSBCardWidget Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 2: Commission data is never rendered
   * 
   * Для любых props компонента PSBCardWidget, отрендеренный HTML
   * не должен содержать информацию о комиссии (числа 1633, 1774)
   * или слова связанные с комиссией ("комиссия", "выплата")
   * 
   * Validates: Requirements 2.5, 5.6
   */
  test('Property 2: Commission data is never rendered', () => {
    // Генератор для source
    const sourceArb = fc.constantFrom<PSBCardWidgetProps['source']>(
      'calculator',
      'comparison',
      'blog',
      'recommendation'
    );

    // Генератор для variant
    const variantArb = fc.constantFrom<PSBCardWidgetProps['variant']>(
      'compact',
      'full',
      undefined
    );

    // Генератор для className
    const classNameArb = fc.oneof(
      fc.constant(''),
      fc.constant('custom-class'),
      fc.constant('test-class-1 test-class-2'),
      fc.constant(undefined)
    );

    // Генератор для showDetails
    const showDetailsArb = fc.oneof(
      fc.constant(true),
      fc.constant(false),
      fc.constant(undefined)
    );

    // Генератор для всех props
    const propsArb = fc.record({
      source: sourceArb,
      variant: variantArb,
      className: classNameArb,
      showDetails: showDetailsArb
    });

    // Запускаем property test с минимум 100 итерациями
    fc.assert(
      fc.property(propsArb, (props) => {
        // Рендерим компонент с сгенерированными props
        const { container } = render(
          <PSBCardWidget
            source={props.source}
            variant={props.variant}
            className={props.className}
            showDetails={props.showDetails}
          />
        );

        // Получаем весь HTML
        const html = container.innerHTML;
        const htmlLowerCase = html.toLowerCase();

        // Проверяем что комиссионные числа не присутствуют
        expect(html).not.toContain('1633');
        expect(html).not.toContain('1774');

        // Проверяем что слова связанные с комиссией не присутствуют
        expect(htmlLowerCase).not.toContain('комиссия');
        expect(htmlLowerCase).not.toContain('выплата');
        expect(htmlLowerCase).not.toContain('commission');
        expect(htmlLowerCase).not.toContain('payment');
        expect(htmlLowerCase).not.toContain('revenue');
        expect(htmlLowerCase).not.toContain('доход');

        // Очищаем после каждого теста
        cleanup();
      }),
      {
        numRuns: 100, // минимум 100 итераций
        verbose: true
      }
    );
  });

  /**
   * Дополнительный property тест: Проверка что erid всегда присутствует
   * 
   * Для любых props компонента PSBCardWidget, отрендеренный HTML
   * должен содержать erid идентификатор для соблюдения рекламного законодательства
   */
  test('Property: ERID is always present in rendered output', () => {
    const sourceArb = fc.constantFrom<PSBCardWidgetProps['source']>(
      'calculator',
      'comparison',
      'blog',
      'recommendation'
    );

    const variantArb = fc.constantFrom<PSBCardWidgetProps['variant']>(
      'compact',
      'full',
      undefined
    );

    const showDetailsArb = fc.boolean();

    const propsArb = fc.record({
      source: sourceArb,
      variant: variantArb,
      showDetails: showDetailsArb
    });

    fc.assert(
      fc.property(propsArb, (props) => {
        const { container } = render(
          <PSBCardWidget
            source={props.source}
            variant={props.variant}
            showDetails={props.showDetails}
          />
        );

        const html = container.innerHTML;

        // Проверяем что erid присутствует
        expect(html).toContain('erid');
        expect(html).toContain('2SDnjehD1C8');
        expect(html).toContain('Реклама');

        cleanup();
      }),
      {
        numRuns: 100,
        verbose: true
      }
    );
  });

  /**
   * Дополнительный property тест: Проверка структурной целостности
   * 
   * Для любых props компонента PSBCardWidget, компонент должен
   * рендериться без ошибок и содержать основные элементы
   */
  test('Property: Component renders without errors for all valid props', () => {
    const sourceArb = fc.constantFrom<PSBCardWidgetProps['source']>(
      'calculator',
      'comparison',
      'blog',
      'recommendation'
    );

    const variantArb = fc.constantFrom<PSBCardWidgetProps['variant']>(
      'compact',
      'full',
      undefined
    );

    const classNameArb = fc.option(fc.string(), { nil: undefined });
    const showDetailsArb = fc.option(fc.boolean(), { nil: undefined });

    const propsArb = fc.record({
      source: sourceArb,
      variant: variantArb,
      className: classNameArb,
      showDetails: showDetailsArb
    });

    fc.assert(
      fc.property(propsArb, (props) => {
        // Компонент должен рендериться без выброса исключений
        expect(() => {
          const { container } = render(
            <PSBCardWidget
              source={props.source}
              variant={props.variant}
              className={props.className}
              showDetails={props.showDetails}
            />
          );

          // Проверяем наличие основных элементов
          expect(container.querySelector('[role="region"]')).toBeTruthy();
          expect(container.querySelector('button[data-testid="referral-button"]')).toBeTruthy();

          cleanup();
        }).not.toThrow();
      }),
      {
        numRuns: 100,
        verbose: true
      }
    );
  });
});
