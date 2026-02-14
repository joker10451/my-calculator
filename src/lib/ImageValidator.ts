/**
 * ImageValidator - класс для валидации изображений и восстановления после ошибок
 * Обеспечивает проверку PNG подписи, восстановление поврежденных изображений
 * и генерацию fallback изображений
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  repairedData?: string;
  usedFallback?: boolean;
}

export interface ImageRepairOptions {
  maxRepairAttempts: number;
  generateFallbackOnFailure: boolean;
  fallbackColor: string;
  fallbackText: string;
}

export class ImageValidator {
  private static readonly PNG_SIGNATURE = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  private static readonly JPEG_SIGNATURE = [0xFF, 0xD8, 0xFF];
  
  private readonly defaultOptions: ImageRepairOptions = {
    maxRepairAttempts: 3,
    generateFallbackOnFailure: true,
    fallbackColor: '#f0f0f0',
    fallbackText: 'Изображение недоступно'
  };

  /**
   * Валидирует данные изображения
   */
  async validateImageData(imageData: string): Promise<ImageValidationResult> {
    try {
      if (!imageData || typeof imageData !== 'string') {
        return {
          isValid: false,
          error: 'Пустые или некорректные данные изображения'
        };
      }

      // Проверяем формат data URL
      if (!imageData.startsWith('data:image/')) {
        return {
          isValid: false,
          error: 'Некорректный формат data URL'
        };
      }

      // Извлекаем base64 данные
      const base64Data = imageData.split(',')[1];
      if (!base64Data) {
        return {
          isValid: false,
          error: 'Отсутствуют base64 данные'
        };
      }

      // Декодируем base64 в бинарные данные
      const binaryData = this.base64ToUint8Array(base64Data);
      
      // Проверяем подпись файла
      const signatureValid = this.validateFileSignature(binaryData, imageData);
      
      if (!signatureValid) {
        return {
          isValid: false,
          error: 'Некорректная подпись файла изображения'
        };
      }

      // Проверяем, можно ли загрузить изображение
      const loadTest = await this.testImageLoad(imageData);
      if (!loadTest) {
        return {
          isValid: false,
          error: 'Изображение не может быть загружено браузером'
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: `Ошибка валидации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }

  /**
   * Пытается восстановить поврежденные данные изображения
   */
  async repairImageData(imageData: string, options?: Partial<ImageRepairOptions>): Promise<string | null> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      // Попытка 1: Исправление base64 padding
      let repairedData = this.fixBase64Padding(imageData);
      let validation = await this.validateImageData(repairedData);
      
      if (validation.isValid) {
        return repairedData;
      }

      // Попытка 2: Исправление data URL формата
      repairedData = this.fixDataUrlFormat(imageData);
      validation = await this.validateImageData(repairedData);
      
      if (validation.isValid) {
        return repairedData;
      }

      // Попытка 3: Попробовать конвертировать в PNG если это JPEG
      if (imageData.includes('data:image/jpeg')) {
        repairedData = await this.convertToValidPng(imageData);
        if (repairedData) {
          validation = await this.validateImageData(repairedData);
          if (validation.isValid) {
            return repairedData;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Ошибка восстановления изображения:', error);
      return null;
    }
  }

  /**
   * Генерирует fallback изображение заданного размера
   */
  generateFallbackImage(width: number, height: number, options?: Partial<ImageRepairOptions>): string {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Не удалось получить контекст canvas');
      }

      // Заливаем фон
      ctx.fillStyle = opts.fallbackColor;
      ctx.fillRect(0, 0, width, height);

      // Добавляем текст
      ctx.fillStyle = '#666666';
      ctx.font = `${Math.min(width, height) / 10}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(opts.fallbackText, width / 2, height / 2);

      // Добавляем рамку
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Ошибка генерации fallback изображения:', error);
      // Возвращаем минимальное валидное PNG изображение 1x1 пикселя
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    }
  }

  /**
   * Проверяет подпись файла
   */
  private validateFileSignature(binaryData: Uint8Array, originalData: string): boolean {
    if (binaryData.length < 8) {
      return false;
    }

    // Проверяем PNG подпись
    if (originalData.includes('data:image/png')) {
      return this.checkSignature(binaryData, ImageValidator.PNG_SIGNATURE);
    }

    // Проверяем JPEG подпись
    if (originalData.includes('data:image/jpeg') || originalData.includes('data:image/jpg')) {
      return this.checkSignature(binaryData, ImageValidator.JPEG_SIGNATURE);
    }

    return false;
  }

  /**
   * Проверяет соответствие подписи
   */
  private checkSignature(data: Uint8Array, signature: number[]): boolean {
    if (data.length < signature.length) {
      return false;
    }

    for (let i = 0; i < signature.length; i++) {
      if (data[i] !== signature[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Конвертирует base64 в Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  }

  /**
   * Тестирует загрузку изображения в браузере
   */
  private testImageLoad(imageData: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Устанавливаем таймаут для предотвращения зависания
      setTimeout(() => resolve(false), 5000);
      
      img.src = imageData;
    });
  }

  /**
   * Исправляет padding в base64
   */
  private fixBase64Padding(imageData: string): string {
    const parts = imageData.split(',');
    if (parts.length !== 2) {
      return imageData;
    }

    let base64 = parts[1];
    
    // Добавляем недостающий padding
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    return `${parts[0]},${base64}`;
  }

  /**
   * Исправляет формат data URL
   */
  private fixDataUrlFormat(imageData: string): string {
    // Исправляем распространенные ошибки в data URL
    let fixed = imageData;
    
    // Убираем лишние пробелы
    fixed = fixed.replace(/\s+/g, '');
    
    // Исправляем отсутствующий base64 маркер
    if (fixed.includes('data:image/') && !fixed.includes(';base64,')) {
      fixed = fixed.replace('data:image/', 'data:image/');
      if (fixed.includes(',') && !fixed.includes(';base64,')) {
        fixed = fixed.replace(',', ';base64,');
      }
    }

    return fixed;
  }

  /**
   * Конвертирует JPEG в валидный PNG
   */
  private async convertToValidPng(jpegData: string): Promise<string | null> {
    try {
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(null);
              return;
            }

            ctx.drawImage(img, 0, 0);
            const pngData = canvas.toDataURL('image/png');
            resolve(pngData);
          } catch (error) {
            resolve(null);
          }
        };
        
        img.onerror = () => resolve(null);
        
        setTimeout(() => resolve(null), 5000);
        
        img.src = jpegData;
      });
    } catch (error) {
      return null;
    }
  }
}