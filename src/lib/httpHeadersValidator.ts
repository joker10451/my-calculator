/**
 * Утилита для валидации HTTP заголовков favicon файлов
 * Используется для проверки корректности настройки сервера
 */

export interface FaviconFile {
  path: string;
  expectedMimeType: string;
  expectedCacheControl: string;
  name: string;
}

export const FAVICON_FILES: FaviconFile[] = [
  {
    path: '/favicon.ico',
    expectedMimeType: 'image/x-icon',
    expectedCacheControl: 'public, max-age=31536000, immutable',
    name: 'favicon.ico'
  },
  {
    path: '/icon.svg',
    expectedMimeType: 'image/svg+xml',
    expectedCacheControl: 'public, max-age=31536000, immutable',
    name: 'icon.svg'
  },
  {
    path: '/apple-touch-icon.png',
    expectedMimeType: 'image/png',
    expectedCacheControl: 'public, max-age=31536000, immutable',
    name: 'apple-touch-icon.png'
  },
  {
    path: '/icon-192.png',
    expectedMimeType: 'image/png',
    expectedCacheControl: 'public, max-age=31536000, immutable',
    name: 'icon-192.png'
  },
  {
    path: '/icon-512.png',
    expectedMimeType: 'image/png',
    expectedCacheControl: 'public, max-age=31536000, immutable',
    name: 'icon-512.png'
  },
  {
    path: '/manifest.json',
    expectedMimeType: 'application/json',
    expectedCacheControl: 'public, max-age=86400',
    name: 'manifest.json'
  }
];

export interface HttpHeadersValidationResult {
  file: FaviconFile;
  isAccessible: boolean;
  hasCorrectMimeType: boolean;
  hasCorrectCacheControl: boolean;
  hasSecurityHeaders: boolean;
  hasCompressionSupport: boolean;
  actualHeaders: Record<string, string>;
  errors: string[];
}

/**
 * Проверяет HTTP заголовки для favicon файла
 */
export async function validateFaviconHeaders(
  file: FaviconFile,
  baseUrl: string = ''
): Promise<HttpHeadersValidationResult> {
  const result: HttpHeadersValidationResult = {
    file,
    isAccessible: false,
    hasCorrectMimeType: false,
    hasCorrectCacheControl: false,
    hasSecurityHeaders: false,
    hasCompressionSupport: false,
    actualHeaders: {},
    errors: []
  };

  try {
    const response = await fetch(`${baseUrl}${file.path}`, {
      method: 'HEAD', // Используем HEAD для получения только заголовков
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    result.isAccessible = response.ok;

    if (!response.ok) {
      result.errors.push(`HTTP ${response.status}: ${response.statusText}`);
      return result;
    }

    // Собираем все заголовки
    response.headers.forEach((value, key) => {
      result.actualHeaders[key.toLowerCase()] = value;
    });

    // Проверяем MIME тип
    const contentType = result.actualHeaders['content-type'];
    if (contentType) {
      result.hasCorrectMimeType = contentType.includes(file.expectedMimeType);
      if (!result.hasCorrectMimeType) {
        result.errors.push(
          `Неверный MIME тип: ожидался "${file.expectedMimeType}", получен "${contentType}"`
        );
      }
    } else {
      result.errors.push('Отсутствует заголовок Content-Type');
    }

    // Проверяем Cache-Control
    const cacheControl = result.actualHeaders['cache-control'];
    if (cacheControl) {
      result.hasCorrectCacheControl = cacheControl.includes('public') && 
                                     cacheControl.includes('max-age');
      if (!result.hasCorrectCacheControl) {
        result.errors.push(
          `Неверный Cache-Control: ожидался "${file.expectedCacheControl}", получен "${cacheControl}"`
        );
      }
    } else {
      result.errors.push('Отсутствует заголовок Cache-Control');
    }

    // Проверяем заголовки безопасности
    const securityHeaders = [
      'x-content-type-options',
      'access-control-allow-origin',
      'cross-origin-resource-policy'
    ];

    let securityHeadersCount = 0;
    securityHeaders.forEach(header => {
      if (result.actualHeaders[header]) {
        securityHeadersCount++;
      }
    });

    result.hasSecurityHeaders = securityHeadersCount >= 2;
    if (!result.hasSecurityHeaders) {
      result.errors.push('Недостаточно заголовков безопасности');
    }

    // Проверяем поддержку сжатия
    const vary = result.actualHeaders['vary'];
    const contentEncoding = result.actualHeaders['content-encoding'];
    
    result.hasCompressionSupport = 
      (vary && vary.includes('Accept-Encoding')) ||
      (contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('br')));

    if (!result.hasCompressionSupport && 
        (file.name.endsWith('.svg') || file.name.endsWith('.json'))) {
      result.errors.push('Отсутствует поддержка сжатия для текстового файла');
    }

  } catch (error) {
    result.errors.push(`Ошибка запроса: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }

  return result;
}

/**
 * Проверяет HTTP заголовки для всех favicon файлов
 */
export async function validateAllFaviconHeaders(
  baseUrl: string = ''
): Promise<HttpHeadersValidationResult[]> {
  const results = await Promise.all(
    FAVICON_FILES.map(file => validateFaviconHeaders(file, baseUrl))
  );

  return results;
}

/**
 * Генерирует отчет о валидации HTTP заголовков
 */
export function generateHeadersValidationReport(
  results: HttpHeadersValidationResult[]
): string {
  let report = '# Отчет о валидации HTTP заголовков favicon файлов\n\n';

  results.forEach(result => {
    report += `## ${result.file.name}\n\n`;
    report += `- **Доступность**: ${result.isAccessible ? '✅' : '❌'}\n`;
    report += `- **MIME тип**: ${result.hasCorrectMimeType ? '✅' : '❌'}\n`;
    report += `- **Кэширование**: ${result.hasCorrectCacheControl ? '✅' : '❌'}\n`;
    report += `- **Безопасность**: ${result.hasSecurityHeaders ? '✅' : '❌'}\n`;
    report += `- **Сжатие**: ${result.hasCompressionSupport ? '✅' : '❌'}\n\n`;

    if (result.errors.length > 0) {
      report += '**Ошибки:**\n';
      result.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }

    if (Object.keys(result.actualHeaders).length > 0) {
      report += '**Фактические заголовки:**\n';
      Object.entries(result.actualHeaders).forEach(([key, value]) => {
        report += `- ${key}: ${value}\n`;
      });
      report += '\n';
    }

    report += '---\n\n';
  });

  return report;
}

/**
 * Проверяет, все ли favicon файлы настроены корректно
 */
export function areAllFaviconHeadersValid(
  results: HttpHeadersValidationResult[]
): boolean {
  return results.every(result => 
    result.isAccessible &&
    result.hasCorrectMimeType &&
    result.hasCorrectCacheControl &&
    result.hasSecurityHeaders
  );
}