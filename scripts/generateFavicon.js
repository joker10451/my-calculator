/**
 * Скрипт для генерации оптимизированного ICO файла из SVG
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Генерирует PNG изображение из SVG с заданным размером
 */
async function generatePNGFromSVG(svgContent, size) {
  // Создаем canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Создаем SVG data URL
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
  
  try {
    // Загружаем изображение
    const img = await loadImage(svgDataUrl);
    
    // Очищаем canvas и рисуем изображение
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    
    // Получаем PNG буфер
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error(`Ошибка генерации PNG размера ${size}:`, error);
    throw error;
  }
}

/**
 * Создает ICO файл из массива PNG изображений
 */
function createICOFile(pngImages) {
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
  const icoBuffer = Buffer.alloc(totalSize);
  let offset = 0;
  
  // Записываем ICO заголовок
  icoBuffer[offset++] = 0x00; // Reserved
  icoBuffer[offset++] = 0x00; // Reserved
  icoBuffer[offset++] = 0x01; // Type: ICO
  icoBuffer[offset++] = 0x00; // Type high byte
  icoBuffer.writeUInt16LE(sortedImages.length, offset); // Count
  offset += 2;
  
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
    icoBuffer.writeUInt32LE(img.data.length, offset);
    offset += 4;
    
    // Смещение данных (little endian)
    icoBuffer.writeUInt32LE(currentDataOffset, offset);
    offset += 4;
    
    currentDataOffset += img.data.length;
  }
  
  // Записываем данные изображений
  for (const img of sortedImages) {
    img.data.copy(icoBuffer, offset);
    offset += img.data.length;
  }
  
  return icoBuffer;
}

/**
 * Генерирует оптимизированный ICO файл из SVG
 */
async function generateOptimizedICO(svgContent, sizes = [16, 32, 48]) {
  const pngImages = [];
  
  console.log('Генерация PNG изображений...');
  
  // Генерируем PNG для каждого размера
  for (const size of sizes) {
    try {
      console.log(`Генерация PNG ${size}x${size}...`);
      const pngData = await generatePNGFromSVG(svgContent, size);
      
      pngImages.push({
        size,
        data: pngData
      });
      
      console.log(`✓ PNG ${size}x${size} сгенерирован (${pngData.length} байт)`);
    } catch (error) {
      console.error(`✗ Ошибка генерации PNG размера ${size}:`, error);
      throw error;
    }
  }
  
  console.log('Создание ICO файла...');
  
  // Создаем ICO файл
  const icoBuffer = createICOFile(pngImages);
  
  console.log(`✓ ICO файл создан (${icoBuffer.length} байт)`);
  
  return icoBuffer;
}

/**
 * Основная функция
 */
async function main() {
  try {
    console.log('🚀 Генерация оптимизированного favicon.ico...');
    
    // Читаем исходный SVG файл
    const svgPath = resolve(__dirname, '../public/icon.svg');
    const svgContent = readFileSync(svgPath, 'utf8');
    
    console.log(`📖 SVG файл прочитан: ${svgPath}`);
    
    // Генерируем ICO файл с размерами 16x16, 32x32, 48x48
    const icoBuffer = await generateOptimizedICO(svgContent, [16, 32, 48]);
    
    // Сохраняем ICO файл
    const icoPath = resolve(__dirname, '../public/favicon.ico');
    writeFileSync(icoPath, icoBuffer);
    
    console.log(`💾 ICO файл сохранен: ${icoPath}`);
    console.log(`📊 Размер файла: ${icoBuffer.length} байт (${(icoBuffer.length / 1024).toFixed(2)} KB)`);
    console.log('✅ Генерация завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка генерации favicon:', error);
    process.exit(1);
  }
}

// Запускаем скрипт
main();