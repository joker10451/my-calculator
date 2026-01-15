/**
 * Property-based тесты для утилит кешбэка
 * Feature: yandex-cashback-integration, Property 7: UTM parameter generation
 * Validates: Requirements 3.3
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  generateUTMParameters,
  generateCashbackUrl,
  shouldShowCashbackTip,
  validatePartnerUrl,
  generateSessionId,
  getOrCreateSessionId
} from '@/lib/cashbackUtils';
import { CashbackSource, CalculatorType } from '@/types/cashback';

// Генераторы для property-based тестирования
const cashbackSourceGenerator = fc.constantFrom('footer', 'credit', 'mortgage', 'salary') as fc.Arbitrary<CashbackSource>;
const calculatorTypeGenerator = fc.constantFrom('credit', 'mortgage', 'salary') as fc.Arbitrary<CalculatorType>;
const amountGenerator = fc.integer({ min: 1, max: 10000000 });
const optionalAmountGenerator = fc.option(amountGenerator, { nil: undefined });

describe('Cashback Utils Property Tests', () => {
  
  test('Property 7: UTM parameter generation - All UTM parameters should be valid and consistent', () => {
    // Feature: yandex-cashback-integration, Property 7: UTM parameter generation
    // Validates: Requirements 3.3
    
    fc.assert(
      fc.property(
        cashbackSourceGenerator,
        optionalAmountGenerator,
        (source, amount) => {
          const utmParams = generateUTMParameters(source, amount);
          
          // Проверяем обязательные UTM параметры
          expect(utmParams.source).toBeDefined();
          expect(utmParams.source).toMatch(/^cashback_(footer|credit|mortgage|salary)$/);
          expect(utmParams.medium).toBe('referral');
          expect(utmParams.campaign).toBe('calculator_integration');
          
          // Проверяем соответствие source и utm_source
          const expectedUtmSource = `cashback_${source}`;
          expect(utmParams.source).toBe(expectedUtmSource);
          
          // Проверяем content параметр при наличии суммы
          if (amount !== undefined) {
            expect(utmParams.content).toBeDefined();
            expect(utmParams.content).toMatch(/^amount_\d+k$/);
            
            // Проверяем корректность округления суммы в content
            const expectedContent = `amount_${Math.floor(amount / 1000)}k`;
            expect(utmParams.content).toBe(expectedContent);
          } else {
            // Если суммы нет, content должен быть undefined
            expect(utmParams.content).toBeUndefined();
          }
          
          // Проверяем, что все значения являются строками (кроме undefined)
          expect(typeof utmParams.source).toBe('string');
          expect(typeof utmParams.medium).toBe('string');
          expect(typeof utmParams.campaign).toBe('string');
          if (utmParams.content !== undefined) {
            expect(typeof utmParams.content).toBe('string');
          }
          if (utmParams.term !== undefined) {
            expect(typeof utmParams.term).toBe('string');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7: Cashback URL generation - Generated URLs should be valid and contain UTM parameters', () => {
    // Feature: yandex-cashback-integration, Property 7: UTM parameter generation
    // Validates: Requirements 3.3
    
    fc.assert(
      fc.property(
        cashbackSourceGenerator,
        optionalAmountGenerator,
        (source, amount) => {
          const result = generateCashbackUrl(source, amount);
          
          // Проверяем структуру результата
          expect(result.url).toBeDefined();
          expect(result.utmParameters).toBeDefined();
          
          // Проверяем, что URL валидный
          expect(() => new URL(result.url)).not.toThrow();
          
          const parsedUrl = new URL(result.url);
          
          // Проверяем базовый URL
          expect(parsedUrl.origin + parsedUrl.pathname).toBe('https://ya.cc/8WF6y8');
          
          // Проверяем наличие UTM параметров в URL
          expect(parsedUrl.searchParams.get('utm_source')).toBe(result.utmParameters.source);
          expect(parsedUrl.searchParams.get('utm_medium')).toBe(result.utmParameters.medium);
          expect(parsedUrl.searchParams.get('utm_campaign')).toBe(result.utmParameters.campaign);
          
          // Проверяем content параметр
          if (result.utmParameters.content) {
            expect(parsedUrl.searchParams.get('utm_content')).toBe(result.utmParameters.content);
          }
          
          // Проверяем term параметр
          if (result.utmParameters.term) {
            expect(parsedUrl.searchParams.get('utm_term')).toBe(result.utmParameters.term);
          }
          
          // Проверяем соответствие UTM параметров в результате и URL
          expect(result.utmParameters.source).toBe(parsedUrl.searchParams.get('utm_source'));
          expect(result.utmParameters.medium).toBe(parsedUrl.searchParams.get('utm_medium'));
          expect(result.utmParameters.campaign).toBe(parsedUrl.searchParams.get('utm_campaign'));
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7: UTM source consistency - Same source should always generate same UTM source', () => {
    // Feature: yandex-cashback-integration, Property 7: UTM parameter generation
    // Validates: Requirements 3.3
    
    fc.assert(
      fc.property(
        cashbackSourceGenerator,
        fc.tuple(optionalAmountGenerator, optionalAmountGenerator),
        (source, [amount1, amount2]) => {
          const utmParams1 = generateUTMParameters(source, amount1);
          const utmParams2 = generateUTMParameters(source, amount2);
          
          // UTM source должен быть одинаковым для одного и того же источника
          expect(utmParams1.source).toBe(utmParams2.source);
          expect(utmParams1.medium).toBe(utmParams2.medium);
          expect(utmParams1.campaign).toBe(utmParams2.campaign);
          
          // Только content может отличаться в зависимости от суммы
          if (amount1 === amount2) {
            expect(utmParams1.content).toBe(utmParams2.content);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7: Amount encoding in UTM content - Amount should be correctly encoded', () => {
    // Feature: yandex-cashback-integration, Property 7: UTM parameter generation
    // Validates: Requirements 3.3
    
    fc.assert(
      fc.property(
        cashbackSourceGenerator,
        amountGenerator,
        (source, amount) => {
          const utmParams = generateUTMParameters(source, amount);
          
          expect(utmParams.content).toBeDefined();
          
          // Извлекаем число из content
          const contentMatch = utmParams.content!.match(/^amount_(\d+)k$/);
          expect(contentMatch).not.toBeNull();
          
          const encodedAmount = parseInt(contentMatch![1], 10);
          const expectedAmount = Math.floor(amount / 1000);
          
          expect(encodedAmount).toBe(expectedAmount);
          
          // Проверяем граничные случаи
          if (amount < 1000) {
            expect(encodedAmount).toBe(0);
          } else if (amount >= 1000 && amount < 2000) {
            expect(encodedAmount).toBe(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7: URL validation - Partner URL validation should work correctly', () => {
    // Feature: yandex-cashback-integration, Property 7: UTM parameter generation
    // Validates: Requirements 3.3
    
    // Тестируем валидные URL
    expect(validatePartnerUrl('https://ya.cc/8WF6y8')).toBe(true);
    expect(validatePartnerUrl('https://ya.cc/test')).toBe(true);
    
    // Тестируем невалидные URL
    expect(validatePartnerUrl('http://ya.cc/test')).toBe(false); // не HTTPS
    expect(validatePartnerUrl('https://example.com/test')).toBe(false); // не ya.cc
    expect(validatePartnerUrl('invalid-url')).toBe(false); // невалидный URL
    expect(validatePartnerUrl('')).toBe(false); // пустая строка
    
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          const isValid = validatePartnerUrl(url);
          
          if (isValid) {
            // Если URL считается валидным, он должен быть HTTPS и содержать ya.cc
            expect(url).toMatch(/^https:\/\/.*ya\.cc/);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 7: Session ID generation - Session IDs should be unique and valid', () => {
    // Feature: yandex-cashback-integration, Property 7: UTM parameter generation
    // Validates: Requirements 3.3
    
    // Генерируем несколько session ID и проверяем их уникальность
    const sessionIds = Array.from({ length: 100 }, () => generateSessionId());
    const uniqueSessionIds = new Set(sessionIds);
    
    // Все session ID должны быть уникальными
    expect(uniqueSessionIds.size).toBe(sessionIds.length);
    
    // Проверяем формат session ID
    sessionIds.forEach(sessionId => {
      expect(sessionId).toMatch(/^cashback_\d+_[a-z0-9]{9}$/);
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(20);
    });
  });
});