import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ImageValidator, ImageValidationResult } from "./ImageValidator";

export interface PdfGenerationOptions {
  quality: 'low' | 'medium' | 'high';
  fallbackFormat: 'html' | 'text' | 'json';
  validateImages: boolean;
  skipCorruptedImages: boolean;
  maxRetries: number;
}

export interface PdfResult {
  success: boolean;
  filename?: string;
  error?: string;
  fallbackFormat?: string;
  fallbackData?: string;
  warnings?: string[];
}

export interface PdfGenerationResult {
  success: boolean;
  outputPath?: string;
  fileSize?: number;
  generationTime: number;
  imagesProcessed: number;
  imagesSkipped: number;
  warnings: string[];
  error?: string;
}

export class PdfService {
  private imageValidator: ImageValidator;
  private defaultOptions: PdfGenerationOptions = {
    quality: 'medium',
    fallbackFormat: 'html',
    validateImages: true,
    skipCorruptedImages: true,
    maxRetries: 3
  };

  constructor() {
    this.imageValidator = new ImageValidator();
  }

  /**
   * Экспортирует элемент в PDF с валидацией изображений и обработкой ошибок
   */
  async exportToPDF(elementId: string, filename: string, options?: Partial<PdfGenerationOptions>): Promise<PdfResult> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };
    const warnings: string[] = [];
    let imagesProcessed = 0;
    let imagesSkipped = 0;

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        return {
          success: false,
          error: `Элемент с ID "${elementId}" не найден`
        };
      }

      // Предварительная валидация изображений в элементе
      if (opts.validateImages) {
        const validationResult = await this.validateElementImages(element, opts.skipCorruptedImages);
        imagesProcessed = validationResult.processed;
        imagesSkipped = validationResult.skipped;
        warnings.push(...validationResult.warnings);
      }

      // Генерируем canvas с обработкой ошибок
      let canvas: HTMLCanvasElement;
      let attempt = 0;
      
      while (attempt < opts.maxRetries) {
        try {
          canvas = await this.generateCanvas(element, opts.quality);
          break;
        } catch (error) {
          attempt++;
          if (attempt >= opts.maxRetries) {
            throw error;
          }
          warnings.push(`Попытка ${attempt} генерации canvas неудачна, повторяем...`);
          await this.delay(1000 * attempt); // Экспоненциальная задержка
        }
      }

      // Валидируем полученное изображение canvas
      const imgData = canvas!.toDataURL("image/png");
      const validation = await this.imageValidator.validateImageData(imgData);
      
      if (!validation.isValid && opts.validateImages) {
        // Пытаемся восстановить изображение
        const repairedData = await this.imageValidator.repairImageData(imgData);
        if (!repairedData) {
          throw new Error(`Не удалось создать валидное изображение: ${validation.error}`);
        }
        warnings.push('Изображение было восстановлено после ошибки валидации');
      }

      // Создаем PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas!.height * pdfWidth) / canvas!.width;

      // Добавляем основное изображение
      pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);

      // Добавляем footer
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text("Сформировано на Schitay.ru - " + new Date().toLocaleDateString(), 10, pdf.internal.pageSize.getHeight() - 10);

      // Сохраняем PDF
      pdf.save(`${filename}.pdf`);

      // Проверяем целостность созданного PDF
      const pdfData = pdf.output('arraybuffer');
      const isValidPdf = await this.validatePdfOutput(new Uint8Array(pdfData));
      
      if (!isValidPdf) {
        warnings.push('Предупреждение: созданный PDF может быть поврежден');
      }

      const generationTime = Date.now() - startTime;

      return {
        success: true,
        filename: `${filename}.pdf`,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      // Пытаемся создать fallback формат
      if (opts.fallbackFormat !== 'json') {
        try {
          const fallbackData = await this.exportToAlternativeFormat(elementId, opts.fallbackFormat);
          return {
            success: false,
            error: errorMessage,
            fallbackFormat: opts.fallbackFormat,
            fallbackData,
            warnings
          };
        } catch (fallbackError) {
          warnings.push(`Ошибка создания fallback формата: ${fallbackError instanceof Error ? fallbackError.message : 'Неизвестная ошибка'}`);
        }
      }

      return {
        success: false,
        error: errorMessage,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    }
  }

  /**
   * Экспортирует в альтернативный формат (HTML или текст)
   */
  async exportToAlternativeFormat(elementId: string, format: 'html' | 'text'): Promise<string> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Элемент с ID "${elementId}" не найден`);
    }

    if (format === 'html') {
      return this.exportToHtml(element);
    } else if (format === 'text') {
      return this.exportToText(element);
    } else {
      throw new Error(`Неподдерживаемый формат: ${format}`);
    }
  }

  /**
   * Экспортирует в JSON формат для программного использования
   */
  async exportToJson(elementId: string): Promise<string> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Элемент с ID "${elementId}" не найден`);
    }

    const data = this.extractStructuredData(element);
    return JSON.stringify(data, null, 2);
  }

  /**
   * Создает загружаемый файл с альтернативным форматом
   */
  async downloadAlternativeFormat(elementId: string, filename: string, format: 'html' | 'text' | 'json'): Promise<void> {
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'html':
        content = await this.exportToAlternativeFormat(elementId, 'html');
        mimeType = 'text/html';
        extension = 'html';
        break;
      case 'text':
        content = await this.exportToAlternativeFormat(elementId, 'text');
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      case 'json':
        content = await this.exportToJson(elementId);
        mimeType = 'application/json';
        extension = 'json';
        break;
      default:
        throw new Error(`Неподдерживаемый формат: ${format}`);
    }

    // Создаем и скачиваем файл
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Проверяет доступность PDF генерации и предлагает альтернативы
   */
  async checkPdfCapability(): Promise<{
    canGeneratePdf: boolean;
    availableFormats: string[];
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    const availableFormats = ['html', 'text', 'json'];

    // Проверяем поддержку canvas
    let canGeneratePdf = false;
    try {
      const testCanvas = document.createElement('canvas');
      const ctx = testCanvas.getContext('2d');
      canGeneratePdf = !!ctx;
      
      if (canGeneratePdf) {
        availableFormats.unshift('pdf');
      } else {
        recommendations.push('PDF генерация недоступна: отсутствует поддержка Canvas');
      }
    } catch (error) {
      recommendations.push('PDF генерация недоступна: ошибка инициализации Canvas');
    }

    // Проверяем доступность jsPDF
    try {
      // Проверяем, что jsPDF загружен
      if (typeof jsPDF === 'undefined') {
        recommendations.push('Библиотека jsPDF не загружена');
        canGeneratePdf = false;
      }
    } catch (error) {
      recommendations.push('Ошибка загрузки библиотеки jsPDF');
      canGeneratePdf = false;
    }

    if (!canGeneratePdf) {
      recommendations.push('Рекомендуется использовать HTML экспорт как альтернативу PDF');
    }

    return {
      canGeneratePdf,
      availableFormats,
      recommendations
    };
  }

  /**
   * Проверяет целостность PDF данных
   */
  async validatePdfOutput(pdfData: Uint8Array): Promise<boolean> {
    try {
      // Проверяем PDF заголовок
      const header = new TextDecoder().decode(pdfData.slice(0, 8));
      if (!header.startsWith('%PDF-')) {
        return false;
      }

      // Проверяем наличие EOF маркера
      const tail = new TextDecoder().decode(pdfData.slice(-10));
      if (!tail.includes('%%EOF')) {
        return false;
      }

      // Базовая проверка структуры пройдена
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Валидирует изображения в элементе
   */
  private async validateElementImages(element: HTMLElement, skipCorrupted: boolean): Promise<{
    processed: number;
    skipped: number;
    warnings: string[];
  }> {
    const images = element.querySelectorAll('img');
    const warnings: string[] = [];
    let processed = 0;
    let skipped = 0;

    for (const img of images) {
      processed++;
      
      if (!img.src || img.src === '') {
        if (skipCorrupted) {
          img.style.display = 'none';
          skipped++;
          warnings.push(`Пропущено изображение без src`);
        }
        continue;
      }

      // Для data URL изображений проводим валидацию
      if (img.src.startsWith('data:image/')) {
        const validation = await this.imageValidator.validateImageData(img.src);
        
        if (!validation.isValid) {
          if (skipCorrupted) {
            // Пытаемся восстановить
            const repaired = await this.imageValidator.repairImageData(img.src);
            if (repaired) {
              img.src = repaired;
              warnings.push(`Восстановлено поврежденное изображение`);
            } else {
              // Заменяем на fallback
              const fallback = this.imageValidator.generateFallbackImage(
                img.width || 100, 
                img.height || 100
              );
              img.src = fallback;
              skipped++;
              warnings.push(`Заменено поврежденное изображение на fallback`);
            }
          }
        }
      }
    }

    return { processed, skipped, warnings };
  }

  /**
   * Генерирует canvas из элемента
   */
  private async generateCanvas(element: HTMLElement, quality: 'low' | 'medium' | 'high'): Promise<HTMLCanvasElement> {
    const scaleMap = { low: 1, medium: 2, high: 3 };
    const scale = scaleMap[quality];

    return html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: false,
      foreignObjectRendering: false
    });
  }

  /**
   * Экспортирует элемент в HTML
   */
  private exportToHtml(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Добавляем базовые стили
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .export-container { max-width: 800px; margin: 0 auto; }
        .export-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .export-footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .calculation-result { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .highlight { background-color: #fff3cd; padding: 5px; border-radius: 3px; }
        @media print { body { margin: 0; } .export-container { max-width: none; } }
      </style>
    `;

    const html = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Экспорт расчета - Schitay.ru</title>
        ${styles}
      </head>
      <body>
        <div class="export-container">
          <div class="export-header">
            <h1>Результат расчета</h1>
            <p>Калькулятор Schitay.ru</p>
          </div>
          ${clone.outerHTML}
          <div class="export-footer">
            <p>Сформировано на <strong>Schitay.ru</strong></p>
            <p>Дата: ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}</p>
            <p>Этот документ можно распечатать или сохранить как веб-страницу</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Экспортирует элемент в текстовый формат
   */
  private exportToText(element: HTMLElement): string {
    // Получаем текстовое содержимое с сохранением структуры
    const textContent = this.extractTextWithStructure(element);
    
    const header = 'РЕЗУЛЬТАТ РАСЧЕТА\n' + 
                  'Калькулятор Schitay.ru\n' +
                  '='.repeat(50) + '\n\n';
    
    const footer = '\n\n' + '-'.repeat(50) + '\n' + 
                  `Сформировано на Schitay.ru\n` +
                  `Дата: ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}\n` +
                  'Для получения актуальных данных посетите schitay.ru';

    return header + textContent + footer;
  }

  /**
   * Извлекает структурированные данные из элемента
   */
  private extractStructuredData(element: HTMLElement): Record<string, unknown> {
    const data: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      source: 'schitay.ru',
      type: 'calculation_result',
      content: {}
    };

    // Извлекаем заголовки
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length > 0) {
      data.content.title = headings[0].textContent?.trim();
    }

    // Извлекаем таблицы
    const tables = element.querySelectorAll('table');
    if (tables.length > 0) {
      data.content.tables = Array.from(tables).map(table => {
        const rows = Array.from(table.querySelectorAll('tr'));
        return rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td, th'));
          return cells.map(cell => cell.textContent?.trim() || '');
        });
      });
    }

    // Извлекаем формы и поля ввода
    const inputs = element.querySelectorAll('input, select, textarea');
    if (inputs.length > 0) {
      data.content.inputs = Array.from(inputs).map(input => ({
        type: input.tagName.toLowerCase(),
        name: input.getAttribute('name') || '',
        value: (input as HTMLInputElement).value || '',
        label: this.findLabelForInput(input)
      }));
    }

    // Извлекаем результаты расчетов (элементы с классами результатов)
    const results = element.querySelectorAll('.result, .calculation-result, .total, .summary');
    if (results.length > 0) {
      data.content.results = Array.from(results).map(result => ({
        text: result.textContent?.trim() || '',
        className: result.className
      }));
    }

    // Извлекаем весь текстовый контент как fallback
    data.content.fullText = element.textContent?.trim() || '';

    return data;
  }

  /**
   * Извлекает текст с сохранением структуры
   */
  private extractTextWithStructure(element: HTMLElement): string {
    let result = '';
    
    // Обрабатываем дочерние элементы
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) {
          result += text + ' ';
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const elem = child as HTMLElement;
        const tagName = elem.tagName.toLowerCase();
        
        switch (tagName) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            result += '\n\n' + '='.repeat(Math.max(1, 7 - parseInt(tagName[1]))) + ' ';
            result += elem.textContent?.trim() + ' ';
            result += '='.repeat(Math.max(1, 7 - parseInt(tagName[1]))) + '\n';
            break;
            
          case 'p':
          case 'div':
            result += '\n' + elem.textContent?.trim() + '\n';
            break;
            
          case 'br':
            result += '\n';
            break;
            
          case 'table':
            result += '\n' + this.tableToText(elem) + '\n';
            break;
            
          case 'ul':
          case 'ol':
            result += '\n' + this.listToText(elem) + '\n';
            break;
            
          default:
            result += this.extractTextWithStructure(elem);
        }
      }
    }
    
    return result;
  }

  /**
   * Конвертирует таблицу в текстовый формат
   */
  private tableToText(table: HTMLElement): string {
    const rows = Array.from(table.querySelectorAll('tr'));
    let result = '';
    
    rows.forEach((row, index) => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      const cellTexts = cells.map(cell => (cell.textContent?.trim() || '').padEnd(20));
      result += cellTexts.join(' | ') + '\n';
      
      // Добавляем разделитель после заголовка
      if (index === 0 && row.querySelector('th')) {
        result += '-'.repeat(cellTexts.join(' | ').length) + '\n';
      }
    });
    
    return result;
  }

  /**
   * Конвертирует список в текстовый формат
   */
  private listToText(list: HTMLElement): string {
    const items = Array.from(list.querySelectorAll('li'));
    const isOrdered = list.tagName.toLowerCase() === 'ol';
    
    return items.map((item, index) => {
      const prefix = isOrdered ? `${index + 1}. ` : '• ';
      return prefix + (item.textContent?.trim() || '');
    }).join('\n');
  }

  /**
   * Находит label для input элемента
   */
  private findLabelForInput(input: Element): string {
    // Ищем по for атрибуту
    const id = input.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) {
        return label.textContent?.trim() || '';
      }
    }
    
    // Ищем родительский label
    const parentLabel = input.closest('label');
    if (parentLabel) {
      return parentLabel.textContent?.trim() || '';
    }
    
    // Ищем предыдущий элемент, который может быть label
    const prevElement = input.previousElementSibling;
    if (prevElement && (prevElement.tagName.toLowerCase() === 'label' || prevElement.textContent)) {
      return prevElement.textContent?.trim() || '';
    }
    
    return '';
  }

  /**
   * Задержка выполнения
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Экспортируем экземпляр сервиса для обратной совместимости
const pdfService = new PdfService();

export const exportToPDF = async (elementId: string, filename: string, stampBase64?: string): Promise<boolean> => {
  try {
    const result = await pdfService.exportToPDF(elementId, filename);
    return result.success;
  } catch (error) {
    console.error("PDF generation failed", error);
    return false;
  }
};

// Экспортируем новый сервис
export { pdfService };
