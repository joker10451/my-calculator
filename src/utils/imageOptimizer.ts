/**
 * Image Optimizer Utilities
 * Утилиты для оптимизации изображений в блоге
 */

export interface ImageData {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface OptimizedImageData extends ImageData {
  webpUrl?: string;
  loading?: 'lazy' | 'eager';
  srcset?: string;
}

/**
 * Генерирует alt tag для изображения на основе контекста
 * @param context - Контекст изображения (заголовок статьи, описание и т.д.)
 * @param imageUrl - URL изображения
 * @returns Alt text для изображения
 */
export function generateAltTag(context: {
  articleTitle?: string;
  imageDescription?: string;
  keywords?: string[];
}, imageUrl: string): string {
  // Если есть явное описание изображения, используем его
  if (context.imageDescription && context.imageDescription.trim().length > 0) {
    return context.imageDescription.trim();
  }
  
  // Пытаемся извлечь информацию из имени файла
  const fileName = imageUrl.split('/').pop()?.split('.')[0] || '';
  const fileNameWords = fileName
    .replace(/[-_]/g, ' ')
    .replace(/\d+/g, '')
    .trim();
  
  // Если есть заголовок статьи, используем его как основу
  const cleanTitle = context.articleTitle?.trim() || '';
  // Проверяем, что заголовок содержит хотя бы одну букву или цифру
  if (cleanTitle.length > 0 && /[a-zA-Zа-яА-ЯёЁ0-9]/.test(cleanTitle)) {
    if (fileNameWords.length > 0) {
      return `${cleanTitle} - ${fileNameWords}`;
    }
    return `Иллюстрация к статье: ${cleanTitle}`;
  }
  
  // Если есть ключевые слова, используем их
  if (context.keywords && context.keywords.length > 0) {
    const keywordsText = context.keywords.slice(0, 3).join(', ');
    return `Изображение по теме: ${keywordsText}`;
  }
  
  // Fallback: используем имя файла или общее описание
  if (fileNameWords.length > 0) {
    return fileNameWords;
  }
  
  return 'Изображение статьи';
}

/**
 * Конвертирует URL изображения в WebP формат
 * @param imageUrl - Оригинальный URL изображения
 * @returns URL изображения в WebP формате
 */
export function convertToWebP(imageUrl: string): string {
  // Проверяем, не является ли изображение уже WebP
  if (imageUrl.toLowerCase().endsWith('.webp')) {
    return imageUrl;
  }
  
  // Заменяем расширение на .webp
  const urlWithoutExtension = imageUrl.replace(/\.(jpg|jpeg|png|gif)$/i, '');
  return `${urlWithoutExtension}.webp`;
}

/**
 * Оптимизирует данные изображения для использования в блоге
 * @param image - Данные изображения
 * @param options - Опции оптимизации
 * @returns Оптимизированные данные изображения
 */
export function optimizeImage(
  image: ImageData,
  options: {
    convertToWebP?: boolean;
    addLazyLoading?: boolean;
    isBelowFold?: boolean;
    generateSrcset?: boolean;
  } = {}
): OptimizedImageData {
  const {
    convertToWebP: shouldConvertToWebP = false, // Отключено: WebP файлы не сгенерированы
    addLazyLoading = true,
    isBelowFold = true,
    generateSrcset = false, // Отключено: responsive варианты не сгенерированы
  } = options;
  
  const optimized: OptimizedImageData = { ...image };
  
  // Конвертируем в WebP, если требуется
  if (shouldConvertToWebP) {
    optimized.webpUrl = convertToWebP(image.url);
  }
  
  // Добавляем lazy loading для изображений ниже fold
  if (addLazyLoading && isBelowFold) {
    optimized.loading = 'lazy';
  } else {
    optimized.loading = 'eager';
  }
  
  // Генерируем srcset для responsive images
  if (generateSrcset) {
    optimized.srcset = generateSrcSet(image.url, image.width);
  }
  
  return optimized;
}

/**
 * Генерирует srcset для responsive images
 * @param imageUrl - URL изображения
 * @param originalWidth - Оригинальная ширина изображения
 * @returns Строка srcset
 */
function generateSrcSet(imageUrl: string, originalWidth: number): string {
  const sizes = [320, 640, 768, 1024, 1280, 1920];
  const applicableSizes = sizes.filter(size => size <= originalWidth);
  
  if (applicableSizes.length === 0) {
    return imageUrl;
  }
  
  const urlWithoutExtension = imageUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  const extension = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || '.jpg';
  
  const srcsetParts = applicableSizes.map(size => {
    return `${urlWithoutExtension}-${size}w${extension} ${size}w`;
  });
  
  // Добавляем оригинальное изображение
  srcsetParts.push(`${imageUrl} ${originalWidth}w`);
  
  return srcsetParts.join(', ');
}

/**
 * Добавляет lazy loading атрибут к HTML изображению
 * @param imageHtml - HTML код изображения
 * @param isBelowFold - Находится ли изображение ниже fold
 * @returns HTML код с добавленным атрибутом loading
 */
export function addLazyLoading(imageHtml: string, isBelowFold: boolean = true): string {
  // Если изображение выше fold, используем eager loading
  const loadingValue = isBelowFold ? 'lazy' : 'eager';
  
  // Проверяем, есть ли уже атрибут loading
  if (imageHtml.includes('loading=')) {
    // Заменяем существующий атрибут
    return imageHtml.replace(/loading=["']?(lazy|eager)["']?/i, `loading="${loadingValue}"`);
  }
  
  // Добавляем атрибут loading перед закрывающим >
  return imageHtml.replace(/<img([^>]*)>/i, `<img$1 loading="${loadingValue}">`);
}

/**
 * Обрабатывает все изображения в HTML контенте
 * @param htmlContent - HTML контент статьи
 * @param options - Опции обработки
 * @returns Обработанный HTML контент
 */
export function processImagesInContent(
  htmlContent: string,
  options: {
    addLazyLoading?: boolean;
    firstImageEager?: boolean;
    generateAltTags?: boolean;
    articleTitle?: string;
  } = {}
): string {
  const {
    addLazyLoading: shouldAddLazyLoading = true,
    firstImageEager = true,
    generateAltTags = false,
    articleTitle = '',
  } = options;
  
  let processedContent = htmlContent;
  let imageCount = 0;
  
  // Регулярное выражение для поиска img тегов
  const imgRegex = /<img([^>]*)>/gi;
  
  processedContent = processedContent.replace(imgRegex, (match) => {
    imageCount++;
    let processedImg = match;
    
    // Первое изображение (обычно featured) загружаем сразу
    const isBelowFold = !(firstImageEager && imageCount === 1);
    
    // Добавляем lazy loading
    if (shouldAddLazyLoading) {
      processedImg = addLazyLoading(processedImg, isBelowFold);
    }
    
    // Генерируем alt tags, если требуется и их нет
    if (generateAltTags && !match.includes('alt=')) {
      const altText = generateAltTag({ articleTitle }, match);
      processedImg = processedImg.replace(/<img/i, `<img alt="${altText}"`);
    }
    
    return processedImg;
  });
  
  return processedContent;
}

/**
 * Проверяет, все ли изображения в контенте имеют alt атрибуты
 * @param htmlContent - HTML контент
 * @returns true, если все изображения имеют alt атрибуты
 */
export function validateImageAltTags(htmlContent: string): boolean {
  const imgRegex = /<img([^>]*)>/gi;
  const images = htmlContent.match(imgRegex);
  
  if (!images || images.length === 0) {
    return true; // Нет изображений - валидация пройдена
  }
  
  // Проверяем каждое изображение на наличие alt атрибута
  for (const img of images) {
    // Проверяем наличие alt атрибута (даже пустого)
    if (!img.match(/alt=["'][^"']*["']/i) && !img.match(/alt=[^\s>]+/i)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Извлекает все изображения из HTML контента
 * @param htmlContent - HTML контент
 * @returns Массив данных изображений
 */
export function extractImagesFromContent(htmlContent: string): ImageData[] {
  const images: ImageData[] = [];
  const imgRegex = /<img([^>]*)>/gi;
  
  let match;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const imgTag = match[0];
    
    // Извлекаем атрибуты
    const srcMatch = imgTag.match(/src=["']([^"']*)["']/i);
    // Улучшенное извлечение alt с поддержкой экранированных кавычек
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i) || imgTag.match(/alt=([^\s>]+)/i);
    const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i);
    const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i);
    
    if (srcMatch) {
      images.push({
        url: srcMatch[1],
        alt: altMatch ? altMatch[1] : '',
        width: widthMatch ? parseInt(widthMatch[1], 10) : 0,
        height: heightMatch ? parseInt(heightMatch[1], 10) : 0,
      });
    }
  }
  
  return images;
}
