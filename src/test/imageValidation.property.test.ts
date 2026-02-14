/**
 * Property-based тесты для валидации изображений и обработки повреждений
 * Feature: api-integration-fixes
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ImageValidator } from '../lib/ImageValidator';

describe('Image Validation Property Tests', () => {
  const imageValidator = new ImageValidator();

  /**
   * Property 7: Image Corruption Handling
   * For any corrupted or unavailable image resource during PDF generation, 
   * the system should use fallback images or skip problematic images gracefully
   * **Validates: Requirements 2.2**
   */
  it('Property 7: Image Corruption Handling - corrupted images should be handled gracefully', async () => {
    // Feature: api-integration-fixes, Property 7: Image Corruption Handling
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          width: fc.integer({ min: 1, max: 500 }),
          height: fc.integer({ min: 1, max: 500 }),
          corruptionType: fc.constantFrom(
            'invalid_base64',
            'missing_header',
            'truncated_data',
            'invalid_signature',
            'empty_data',
            'malformed_dataurl'
          )
        }),
        async ({ width, height, corruptionType }) => {
          // Генерируем поврежденное изображение
          const corruptedImage = generateCorruptedImage(corruptionType);
          
          // Система должна обнаружить повреждение
          const validation = await imageValidator.validateImageData(corruptedImage);
          expect(validation.isValid).toBe(false);
          expect(validation.error).toBeDefined();
          
          // Система должна предоставить fallback
          const fallbackImage = imageValidator.generateFallbackImage(width, height);
          expect(fallbackImage).toBeDefined();
          expect(fallbackImage.startsWith('data:image/png;base64,')).toBe(true);
          
          // Fallback изображение должно быть валидным
          const fallbackValidation = await imageValidator.validateImageData(fallbackImage);
          expect(fallbackValidation.isValid).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 8: Image Validation Before Processing
   * For any image resource processed during PDF generation, 
   * validation should occur before including it in the final PDF
   * **Validates: Requirements 2.3**
   */
  it('Property 8: Image Validation Before Processing - all images must be validated before use', async () => {
    // Feature: api-integration-fixes, Property 8: Image Validation Before Processing
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          imageType: fc.constantFrom('png', 'jpeg'),
          isValid: fc.boolean()
        }),
        async ({ imageType, isValid }) => {
          // Генерируем изображение (валидное или невалидное)
          const imageData = isValid 
            ? generateValidImageData(imageType)
            : generateCorruptedImage('invalid_signature');
          
          // Валидация должна всегда выполняться
          const validation = await imageValidator.validateImageData(imageData);
          
          // Результат валидации должен соответствовать ожиданиям
          expect(validation.isValid).toBe(isValid);
          
          if (!isValid) {
            // Для невалидных изображений должна быть ошибка
            expect(validation.error).toBeDefined();
            expect(typeof validation.error).toBe('string');
            expect(validation.error!.length).toBeGreaterThan(0);
          }
          
          // Валидация должна быть детерминированной
          const secondValidation = await imageValidator.validateImageData(imageData);
          expect(secondValidation.isValid).toBe(validation.isValid);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Дополнительный property тест: Image Repair Consistency
   * Проверяет, что восстановление изображений работает консистентно
   */
  it('Property: Image Repair Consistency - repair attempts should be consistent', async () => {
    // Feature: api-integration-fixes, Property: Image Repair Consistency
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          repairableType: fc.constantFrom(
            'missing_padding',
            'malformed_dataurl',
            'jpeg_to_png'
          )
        }),
        async ({ repairableType }) => {
          // Генерируем изображение, которое можно восстановить
          const repairableImage = generateRepairableImage(repairableType);
          
          // Первая попытка восстановления
          const repaired1 = await imageValidator.repairImageData(repairableImage);
          
          // Вторая попытка восстановления того же изображения
          const repaired2 = await imageValidator.repairImageData(repairableImage);
          
          // Результаты должны быть одинаковыми
          expect(repaired1).toEqual(repaired2);
          
          // Если восстановление удалось, результат должен быть валидным
          if (repaired1) {
            const validation = await imageValidator.validateImageData(repaired1);
            expect(validation.isValid).toBe(true);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Дополнительный property тест: Fallback Image Properties
   * Проверяет свойства fallback изображений
   */
  it('Property: Fallback Image Properties - fallback images should always be valid and appropriate size', async () => {
    // Feature: api-integration-fixes, Property: Fallback Image Properties
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          width: fc.integer({ min: 1, max: 500 }),
          height: fc.integer({ min: 1, max: 500 })
        }),
        async ({ width, height }) => {
          // Генерируем fallback изображение
          const fallbackImage = imageValidator.generateFallbackImage(width, height);
          
          // Fallback всегда должен быть валидным PNG
          expect(fallbackImage.startsWith('data:image/png;base64,')).toBe(true);
          
          // Fallback должен проходить валидацию
          const validation = await imageValidator.validateImageData(fallbackImage);
          expect(validation.isValid).toBe(true);
          
          // Fallback должен содержать валидные base64 данные
          const base64Part = fallbackImage.split(',')[1];
          expect(base64Part).toBeDefined();
          expect(base64Part.length).toBeGreaterThan(0);
          
          // Проверяем, что base64 можно декодировать
          try {
            atob(base64Part);
            expect(true).toBe(true); // Декодирование прошло успешно
          } catch (error) {
            expect(false).toBe(true); // Не должно быть ошибок декодирования
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Вспомогательные функции для генерации тестовых данных

function generateValidImageData(type: 'png' | 'jpeg'): string {
  // Используем предопределенные валидные изображения
  if (type === 'png') {
    // Минимальное валидное PNG изображение 1x1 пикселя
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  } else {
    // Минимальное валидное JPEG изображение
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';
  }
}

function generateCorruptedImage(corruptionType: string): string {
  const validPng = generateValidImageData('png');
  
  switch (corruptionType) {
    case 'invalid_base64':
      // Портим base64 данные
      return validPng.replace(/[A-Za-z0-9]/g, (match, offset) => 
        offset % 5 === 0 ? '!' : match
      );
      
    case 'missing_header':
      // Убираем data URL заголовок
      return validPng.split(',')[1] || '';
      
    case 'truncated_data':
      // Обрезаем данные
      return validPng.substring(0, validPng.length / 2);
      
    case 'invalid_signature':
      // Портим PNG подпись
      const parts = validPng.split(',');
      if (parts.length === 2) {
        const base64 = parts[1];
        // Заменяем первые символы (которые кодируют PNG подпись)
        const corrupted = 'AAAA' + base64.substring(4);
        return `${parts[0]},${corrupted}`;
      }
      return validPng;
      
    case 'empty_data':
      return '';
      
    case 'malformed_dataurl':
      return 'data:image/png;base64;invalid,format';
      
    default:
      return validPng;
  }
}

function generateRepairableImage(repairType: string): string {
  const validPng = generateValidImageData('png');
  
  switch (repairType) {
    case 'missing_padding':
      // Убираем padding из base64
      const parts = validPng.split(',');
      if (parts.length === 2) {
        const base64 = parts[1].replace(/=/g, '');
        return `${parts[0]},${base64}`;
      }
      return validPng;
      
    case 'malformed_dataurl':
      // Убираем ;base64 маркер
      return validPng.replace(';base64,', ',');
      
    case 'jpeg_to_png':
      // Возвращаем JPEG, который можно конвертировать в PNG
      return generateValidImageData('jpeg');
      
    default:
      return validPng;
  }
}