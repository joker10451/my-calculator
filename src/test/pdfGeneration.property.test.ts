/**
 * Property-based тесты для генерации PDF и валидации
 * Feature: api-integration-fixes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { PdfService } from '../lib/pdfService';

// Мокаем jsPDF и html2canvas для тестирования
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297
      }
    },
    addImage: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    output: vi.fn(() => new ArrayBuffer(1024))
  }))
}));

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    width: 100,
    height: 100
  })
}));

describe('PDF Generation Property Tests', () => {
  let pdfService: PdfService;

  beforeEach(() => {
    pdfService = new PdfService();
    
    // Мокаем DOM методы
    global.document = {
      getElementById: vi.fn(),
      createElement: vi.fn(() => ({
        getContext: vi.fn(() => ({
          fillStyle: '',
          fillRect: vi.fn(),
          fillText: vi.fn(),
          strokeStyle: '',
          lineWidth: 0,
          strokeRect: vi.fn(),
          font: '',
          textAlign: '',
          textBaseline: '',
          drawImage: vi.fn()
        })),
        toDataURL: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='),
        width: 100,
        height: 100
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    } as any;

    global.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn()
    } as any;
  });

  /**
   * Property 6: Valid PDF Generation
   * For any valid content input, the PDF generator should create a valid PDF document 
   * without PNG signature errors or corruption
   * **Validates: Requirements 2.1**
   */
  it('Property 6: Valid PDF Generation - should create valid PDF for any valid content', async () => {
    // Feature: api-integration-fixes, Property 6: Valid PDF Generation
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
          filename: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
          content: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          hasImages: fc.boolean(),
          hasTables: fc.boolean()
        }),
        async ({ elementId, filename, content, hasImages, hasTables }) => {
          // Создаем мок элемента
          const mockElement = createMockElement(content, hasImages, hasTables);
          (document.getElementById as any).mockReturnValue(mockElement);

          // Генерируем PDF с упрощенными опциями
          const result = await pdfService.exportToPDF(elementId, filename, {
            quality: 'low',
            validateImages: false,
            maxRetries: 1
          });

          // PDF должен быть успешно создан
          expect(result.success).toBe(true);
          expect(result.filename).toBe(`${filename}.pdf`);
          expect(result.error).toBeUndefined();

          // Если есть предупреждения, они должны быть массивом строк
          if (result.warnings) {
            expect(Array.isArray(result.warnings)).toBe(true);
            result.warnings.forEach(warning => {
              expect(typeof warning).toBe('string');
              expect(warning.length).toBeGreaterThan(0);
            });
          }
        }
      ),
      { numRuns: 20 }
    );
  }, 15000);

  /**
   * Property 11: PDF Output Integrity Verification
   * For any successfully generated PDF, the system should verify the output file integrity 
   * before presenting it to the user
   * **Validates: Requirements 2.6**
   */
  it('Property 11: PDF Output Integrity Verification - should verify PDF integrity', async () => {
    // Feature: api-integration-fixes, Property 11: PDF Output Integrity Verification
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          pdfData: fc.uint8Array({ minLength: 100, maxLength: 10000 }),
          hasValidHeader: fc.boolean(),
          hasValidFooter: fc.boolean()
        }),
        async ({ pdfData, hasValidHeader, hasValidFooter }) => {
          // Модифицируем данные для создания валидного/невалидного PDF
          const modifiedData = createTestPdfData(pdfData, hasValidHeader, hasValidFooter);
          
          // Проверяем валидацию
          const isValid = await pdfService.validatePdfOutput(modifiedData);
          
          // Результат должен соответствовать ожиданиям
          const expectedValid = hasValidHeader && hasValidFooter;
          expect(isValid).toBe(expectedValid);
          
          // Валидация должна быть детерминированной
          const secondValidation = await pdfService.validatePdfOutput(modifiedData);
          expect(secondValidation).toBe(isValid);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Дополнительный property тест: Alternative Format Export Consistency
   * Проверяет консистентность экспорта в альтернативные форматы
   */
  it('Property: Alternative Format Export Consistency - should consistently export to alternative formats', async () => {
    // Feature: api-integration-fixes, Property: Alternative Format Export Consistency
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
          format: fc.constantFrom('html', 'text'),
          content: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          hasStructure: fc.boolean()
        }),
        async ({ elementId, format, content, hasStructure }) => {
          // Создаем мок элемента
          const mockElement = createMockElement(content, false, hasStructure);
          (document.getElementById as any).mockReturnValue(mockElement);

          // Экспортируем в альтернативный формат
          const result1 = await pdfService.exportToAlternativeFormat(elementId, format);
          const result2 = await pdfService.exportToAlternativeFormat(elementId, format);

          // Результаты должны быть одинаковыми (детерминированность)
          expect(result1).toBe(result2);
          
          // Результат должен содержать исходный контент или его обработанную версию
          const trimmedContent = content.trim();
          if (trimmedContent.length > 0) {
            expect(result1.toLowerCase()).toContain(trimmedContent.toLowerCase());
          }
          
          // Результат должен быть непустым
          expect(result1.length).toBeGreaterThan(0);
          
          // Для HTML формата должны быть HTML теги
          if (format === 'html') {
            expect(result1).toContain('<!DOCTYPE html>');
            expect(result1).toContain('<html');
            expect(result1).toContain('</html>');
          }
          
          // Для текстового формата должен быть заголовок
          if (format === 'text') {
            expect(result1).toContain('РЕЗУЛЬТАТ РАСЧЕТА');
            expect(result1).toContain('Schitay.ru');
          }
        }
      ),
      { numRuns: 30 }
    );
  }, 10000);

  /**
   * Дополнительный property тест: PDF Capability Check
   * Проверяет корректность проверки возможностей PDF генерации
   */
  it('Property: PDF Capability Check - should correctly assess PDF generation capabilities', async () => {
    // Feature: api-integration-fixes, Property: PDF Capability Check
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          canvasSupported: fc.boolean(),
          jsPdfAvailable: fc.boolean()
        }),
        async ({ canvasSupported, jsPdfAvailable }) => {
          // Мокаем условия окружения
          if (!canvasSupported) {
            (document.createElement as any).mockReturnValue({
              getContext: () => null
            });
          }

          // Проверяем возможности
          const capabilities = await pdfService.checkPdfCapability();
          
          // Структура ответа должна быть корректной
          expect(typeof capabilities.canGeneratePdf).toBe('boolean');
          expect(Array.isArray(capabilities.availableFormats)).toBe(true);
          expect(Array.isArray(capabilities.recommendations)).toBe(true);
          
          // Альтернативные форматы всегда должны быть доступны
          expect(capabilities.availableFormats).toContain('html');
          expect(capabilities.availableFormats).toContain('text');
          expect(capabilities.availableFormats).toContain('json');
          
          // Если PDF недоступен, должны быть рекомендации
          if (!capabilities.canGeneratePdf) {
            expect(capabilities.recommendations.length).toBeGreaterThan(0);
            expect(capabilities.recommendations.some(r => r.includes('HTML'))).toBe(true);
          }
          
          // PDF должен быть в списке форматов только если доступен
          if (capabilities.canGeneratePdf) {
            expect(capabilities.availableFormats).toContain('pdf');
          } else {
            expect(capabilities.availableFormats).not.toContain('pdf');
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Дополнительный property тест: Error Handling Consistency
   * Проверяет консистентность обработки ошибок
   */
  it('Property: Error Handling Consistency - should handle errors consistently', async () => {
    // Feature: api-integration-fixes, Property: Error Handling Consistency
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementExists: fc.boolean(),
          elementId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
          filename: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
          shouldThrowError: fc.boolean()
        }),
        async ({ elementExists, elementId, filename, shouldThrowError }) => {
          // Настраиваем мок в зависимости от условий
          if (!elementExists) {
            (document.getElementById as any).mockReturnValue(null);
          } else {
            const mockElement = createMockElement('test content', false, false);
            (document.getElementById as any).mockReturnValue(mockElement);
          }

          if (shouldThrowError && elementExists) {
            // Мокаем ошибку в html2canvas
            const html2canvas = await import('html2canvas');
            vi.mocked(html2canvas.default).mockRejectedValueOnce(new Error('Canvas error'));
          }

          // Выполняем операцию с упрощенными настройками
          const result = await pdfService.exportToPDF(elementId, filename, {
            quality: 'low',
            maxRetries: 1,
            validateImages: false
          });

          // Проверяем обработку ошибок
          if (!elementExists) {
            expect(result.success).toBe(false);
            expect(result.error).toContain('не найден');
          } else if (shouldThrowError) {
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            // При ошибке должен быть предложен fallback
            expect(result.fallbackFormat || result.fallbackData).toBeDefined();
          } else {
            expect(result.success).toBe(true);
          }
          
          // Структура результата должна быть консистентной
          expect(typeof result.success).toBe('boolean');
          if (result.error) {
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 20 }
    );
  }, 10000);
});

// Вспомогательные функции для создания тестовых данных

function createMockElement(content: string, hasImages: boolean, hasStructure: boolean): HTMLElement {
  const element = {
    textContent: content,
    innerText: content,
    outerHTML: `<div>${content}</div>`,
    querySelectorAll: vi.fn((selector: string) => {
      if (selector.includes('img') && hasImages) {
        return [{
          src: 'data:image/png;base64,test',
          width: 100,
          height: 100,
          style: { display: '' }
        }];
      }
      if (selector.includes('h1, h2') && hasStructure) {
        return [{ textContent: 'Test Header' }];
      }
      if (selector.includes('table') && hasStructure) {
        return [{
          querySelectorAll: vi.fn(() => [
            {
              querySelectorAll: vi.fn(() => [
                { textContent: 'Cell 1' },
                { textContent: 'Cell 2' }
              ])
            }
          ])
        }];
      }
      return [];
    }),
    querySelector: vi.fn(() => null),
    childNodes: [],
    cloneNode: vi.fn(() => ({ outerHTML: `<div>${content}</div>` })),
    closest: vi.fn(() => null),
    previousElementSibling: null,
    getAttribute: vi.fn(() => null)
  };

  return element as any;
}

function createTestPdfData(baseData: Uint8Array, hasValidHeader: boolean, hasValidFooter: boolean): Uint8Array {
  const result = new Uint8Array(baseData.length + 20);
  
  // Добавляем PDF заголовок если нужен
  if (hasValidHeader) {
    const header = new TextEncoder().encode('%PDF-1.4\n');
    result.set(header, 0);
    result.set(baseData, header.length);
  } else {
    const invalidHeader = new TextEncoder().encode('INVALID\n');
    result.set(invalidHeader, 0);
    result.set(baseData, invalidHeader.length);
  }
  
  // Добавляем EOF маркер если нужен
  if (hasValidFooter) {
    const footer = new TextEncoder().encode('\n%%EOF');
    result.set(footer, result.length - footer.length);
  }
  
  return result;
}