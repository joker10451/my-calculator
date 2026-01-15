/**
 * Утилита для генерации favicon файлов из SVG
 */

export interface FaviconConfig {
  source: string;        // Путь к исходному SVG
  outputDir: string;     // Директория для сохранения
  sizes: number[];       // Массив размеров для генерации
}

export interface GeneratedFavicon {
  filename: string;
  size: number;
  format: 'ico' | 'png' | 'svg';
  path: string;
}

/**
 * Генерирует PNG изображение из SVG с заданным размером
 */
export async function generatePNGFromSVG(svgContent: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Создаем canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Не удалось получить контекст canvas'));
        return;
      }
      
      canvas.width = size;
      canvas.height = size;
      
      // Создаем изображение из SVG
      const img = new Image();
      
      img.onload = () => {
        try {
          // Очищаем canvas
          ctx.clearRect(0, 0, size, size);
          
          // Рисуем изображение
          ctx.drawImage(img, 0, 0, size, size);
          
          // Получаем PNG data URL
          const pngDataUrl = canvas.toDataURL('image/png');
          resolve(pngDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Ошибка загрузки SVG изображения'));
      };
      
      // Создаем blob URL для SVG
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      img.src = svgUrl;
      
      // Очищаем URL после использования
      setTimeout(() => {
        URL.revokeObjectURL(svgUrl);
      }, 1000);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Создает ICO файл из массива PNG изображений
 */
export function createICOFile(pngImages: { size: number; data: Uint8Array }[]): Uint8Array {
  // Сортируем изображения по размеру
  const sortedImages = pngImages.sort((a, b) => a.size - b.size);
  
  // Вычисляем размер ICO файла
  const headerSize = 6; // ICO заголовок
  const entrySize = 16; // Размер каждой записи
  const entriesSize = sortedImages.length * entrySize;
  
  let dataOffset = headerSize + entriesSize;
  let totalSize = dataOffset;
  
  // Добавляем размеры данных изображений
  for (const img of sortedImages) {
    totalSize += img.data.length;
  }
  
  // Создаем буфер для ICO файла
  const icoBuffer = new Uint8Array(totalSize);
  let offset = 0;
  
  // Записываем ICO заголовок
  icoBuffer[offset++] = 0x00; // Reserved
  icoBuffer[offset++] = 0x00; // Reserved
  icoBuffer[offset++] = 0x01; // Type: ICO
  icoBuffer[offset++] = 0x00; // Type high byte
  icoBuffer[offset++] = sortedImages.length & 0xFF; // Count low byte
  icoBuffer[offset++] = (sortedImages.length >> 8) & 0xFF; // Count high byte
  
  // Записываем записи изображений
  let currentDataOffset = dataOffset;
  for (const img of sortedImages) {
    const width = img.size === 256 ? 0 : img.size; // 0 означает 256
    const height = img.size === 256 ? 0 : img.size;
    
    icoBuffer[offset++] = width & 0xFF; // Width
    icoBuffer[offset++] = height & 0xFF; // Height
    icoBuffer[offset++] = 0x00; // Color count (0 для PNG)
    icoBuffer[offset++] = 0x00; // Reserved
    icoBuffer[offset++] = 0x01; // Color planes (low byte)
    icoBuffer[offset++] = 0x00; // Color planes (high byte)
    icoBuffer[offset++] = 0x20; // Bits per pixel (low byte) - 32 для PNG
    icoBuffer[offset++] = 0x00; // Bits per pixel (high byte)
    
    // Размер данных (little endian)
    const dataSize = img.data.length;
    icoBuffer[offset++] = dataSize & 0xFF;
    icoBuffer[offset++] = (dataSize >> 8) & 0xFF;
    icoBuffer[offset++] = (dataSize >> 16) & 0xFF;
    icoBuffer[offset++] = (dataSize >> 24) & 0xFF;
    
    // Смещение данных (little endian)
    icoBuffer[offset++] = currentDataOffset & 0xFF;
    icoBuffer[offset++] = (currentDataOffset >> 8) & 0xFF;
    icoBuffer[offset++] = (currentDataOffset >> 16) & 0xFF;
    icoBuffer[offset++] = (currentDataOffset >> 24) & 0xFF;
    
    currentDataOffset += dataSize;
  }
  
  // Записываем данные изображений
  for (const img of sortedImages) {
    icoBuffer.set(img.data, offset);
    offset += img.data.length;
  }
  
  return icoBuffer;
}

/**
 * Конвертирует data URL в Uint8Array
 */
export function dataURLToUint8Array(dataURL: string): Uint8Array {
  const base64 = dataURL.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}

/**
 * Генерирует оптимизированный ICO файл из SVG
 */
export async function generateOptimizedICO(svgContent: string, sizes: number[] = [16, 32, 48]): Promise<Uint8Array> {
  const pngImages: { size: number; data: Uint8Array }[] = [];
  
  // Генерируем PNG для каждого размера
  for (const size of sizes) {
    try {
      const pngDataURL = await generatePNGFromSVG(svgContent, size);
      const pngData = dataURLToUint8Array(pngDataURL);
      
      pngImages.push({
        size,
        data: pngData
      });
    } catch (error) {
      console.error(`Ошибка генерации PNG размера ${size}:`, error);
      throw error;
    }
  }
  
  // Создаем ICO файл
  return createICOFile(pngImages);
}

/**
 * Сохраняет данные в файл (для Node.js окружения)
 */
export function saveToFile(data: Uint8Array, filename: string): void {
  if (typeof window !== 'undefined') {
    // Браузерное окружение - создаем ссылку для скачивания
    const blob = new Blob([data], { type: 'image/x-icon' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  } else {
    // Node.js окружение
    const fs = require('fs');
    fs.writeFileSync(filename, Buffer.from(data));
  }
}