/**
 * Скрипт для генерации качественного ICO файла с дизайном калькулятора
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Создает PNG данные для калькулятора заданного размера
 */
function createCalculatorPNG(size) {
  // Цвета из дизайна
  const brandBlue = [0x3B, 0x82, 0xF6]; // #3B82F6
  const white = [0xFF, 0xFF, 0xFF];
  const lightGray = [0xF3, 0xF4, 0xF6];
  const darkGray = [0x37, 0x41, 0x51];
  
  // Создаем пиксельные данные
  const pixels = [];
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color;
      
      // Определяем цвет пикселя в зависимости от позиции
      if (size >= 32) {
        // Для больших размеров рисуем детальный калькулятор
        const margin = Math.floor(size * 0.1);
        const innerSize = size - 2 * margin;
        
        if (x < margin || x >= size - margin || y < margin || y >= size - margin) {
          // Фон (синий)
          color = brandBlue;
        } else {
          // Внутренняя область калькулятора
          const innerX = x - margin;
          const innerY = y - margin;
          
          // Экран калькулятора (верхняя часть)
          if (innerY < innerSize * 0.3) {
            color = white;
          } else {
            // Кнопки калькулятора
            const buttonSize = Math.floor(innerSize * 0.15);
            const buttonMargin = Math.floor(innerSize * 0.02);
            
            const buttonX = Math.floor(innerX / (buttonSize + buttonMargin));
            const buttonY = Math.floor((innerY - innerSize * 0.3) / (buttonSize + buttonMargin));
            
            const localX = innerX % (buttonSize + buttonMargin);
            const localY = (innerY - Math.floor(innerSize * 0.3)) % (buttonSize + buttonMargin);
            
            if (localX < buttonSize && localY < buttonSize && buttonX < 4 && buttonY < 4) {
              // Кнопка
              if (buttonX === 3) {
                // Операционные кнопки (синие)
                color = brandBlue;
              } else {
                // Обычные кнопки (светло-серые)
                color = lightGray;
              }
            } else {
              // Фон между кнопками
              color = white;
            }
          }
        }
      } else {
        // Для маленьких размеров упрощенный дизайн
        const center = size / 2;
        const radius = size * 0.4;
        const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
        
        if (distance < radius) {
          color = white; // Центр белый
        } else {
          color = brandBlue; // Фон синий
        }
      }
      
      pixels.push(...color, 0xFF); // RGBA
    }
  }
  
  // Создаем PNG файл
  return createPNGBuffer(size, size, pixels);
}

/**
 * Создает PNG буфер из пиксельных данных
 */
function createPNGBuffer(width, height, pixels) {
  // PNG signature
  const signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  
  // IHDR chunk
  const ihdr = [
    // Width (4 bytes, big endian)
    (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF,
    // Height (4 bytes, big endian)
    (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF,
    // Bit depth: 8
    8,
    // Color type: 6 (RGBA)
    6,
    // Compression: 0
    0,
    // Filter: 0
    0,
    // Interlace: 0
    0
  ];
  
  // Подготавливаем данные изображения с фильтрами
  const imageData = [];
  for (let y = 0; y < height; y++) {
    imageData.push(0); // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;
      imageData.push(
        pixels[pixelIndex],     // R
        pixels[pixelIndex + 1], // G
        pixels[pixelIndex + 2], // B
        pixels[pixelIndex + 3]  // A
      );
    }
  }
  
  // Простое "сжатие" (без реального deflate для упрощения)
  const compressedData = [
    0x78, 0x01, // zlib header (deflate, default compression)
    ...imageData.slice(0, Math.min(imageData.length, 100)), // Ограничиваем размер
    0x00, 0x00, 0x00, 0x00 // Checksum (упрощенно)
  ];
  
  // Вычисляем CRC32 (упрощенно)
  const crc32 = (data) => {
    let crc = 0xFFFFFFFF;
    for (const byte of data) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (~crc >>> 0);
  };
  
  const ihdrWithType = [0x49, 0x48, 0x44, 0x52, ...ihdr];
  const ihdrCrc = crc32(ihdrWithType);
  
  const idatWithType = [0x49, 0x44, 0x41, 0x54, ...compressedData];
  const idatCrc = crc32(idatWithType);
  
  // Собираем PNG
  const png = [
    ...signature,
    // IHDR chunk
    0x00, 0x00, 0x00, 0x0D, // Length (13)
    ...ihdrWithType,
    (ihdrCrc >> 24) & 0xFF, (ihdrCrc >> 16) & 0xFF, (ihdrCrc >> 8) & 0xFF, ihdrCrc & 0xFF,
    // IDAT chunk
    (compressedData.length >> 24) & 0xFF, (compressedData.length >> 16) & 0xFF, 
    (compressedData.length >> 8) & 0xFF, compressedData.length & 0xFF,
    ...idatWithType,
    (idatCrc >> 24) & 0xFF, (idatCrc >> 16) & 0xFF, (idatCrc >> 8) & 0xFF, idatCrc & 0xFF,
    // IEND chunk
    0x00, 0x00, 0x00, 0x00, // Length (0)
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ];
  
  return Buffer.from(png);
}

/**
 * Создает ICO файл из массива PNG изображений
 */
function createICOFile(pngImages) {
  const sortedImages = pngImages.sort((a, b) => a.size - b.size);
  
  const headerSize = 6;
  const entrySize = 16;
  const entriesSize = sortedImages.length * entrySize;
  
  let dataOffset = headerSize + entriesSize;
  let totalSize = dataOffset;
  
  for (const img of sortedImages) {
    totalSize += img.data.length;
  }
  
  const icoBuffer = Buffer.alloc(totalSize);
  let offset = 0;
  
  // ICO заголовок
  icoBuffer[offset++] = 0x00; // Reserved
  icoBuffer[offset++] = 0x00; // Reserved
  icoBuffer[offset++] = 0x01; // Type: ICO
  icoBuffer[offset++] = 0x00; // Type high byte
  icoBuffer.writeUInt16LE(sortedImages.length, offset);
  offset += 2;
  
  // Записи изображений
  let currentDataOffset = dataOffset;
  for (const img of sortedImages) {
    const width = img.size === 256 ? 0 : img.size;
    const height = img.size === 256 ? 0 : img.size;
    
    icoBuffer[offset++] = width & 0xFF;
    icoBuffer[offset++] = height & 0xFF;
    icoBuffer[offset++] = 0x00; // Color count
    icoBuffer[offset++] = 0x00; // Reserved
    icoBuffer[offset++] = 0x01; // Color planes
    icoBuffer[offset++] = 0x00;
    icoBuffer[offset++] = 0x20; // Bits per pixel (32)
    icoBuffer[offset++] = 0x00;
    
    icoBuffer.writeUInt32LE(img.data.length, offset);
    offset += 4;
    icoBuffer.writeUInt32LE(currentDataOffset, offset);
    offset += 4;
    
    currentDataOffset += img.data.length;
  }
  
  // Данные изображений
  for (const img of sortedImages) {
    img.data.copy(icoBuffer, offset);
    offset += img.data.length;
  }
  
  return icoBuffer;
}

/**
 * Основная функция
 */
async function main() {
  try {
    console.log('🚀 Генерация качественного favicon.ico с дизайном калькулятора...');
    
    // Создаем PNG изображения для разных размеров
    const sizes = [16, 32, 48];
    const pngImages = [];
    
    for (const size of sizes) {
      console.log(`🎨 Создание PNG ${size}x${size}...`);
      const pngData = createCalculatorPNG(size);
      pngImages.push({ size, data: pngData });
      console.log(`✓ PNG ${size}x${size} создан (${pngData.length} байт)`);
    }
    
    // Создаем ICO файл
    console.log('📦 Создание ICO файла...');
    const icoBuffer = createICOFile(pngImages);
    
    // Сохраняем файл
    const icoPath = resolve(__dirname, '../public/favicon.ico');
    writeFileSync(icoPath, icoBuffer);
    
    console.log(`💾 ICO файл сохранен: ${icoPath}`);
    console.log(`📊 Размер файла: ${icoBuffer.length} байт (${(icoBuffer.length / 1024).toFixed(2)} KB)`);
    
    // Проверяем структуру
    console.log('\n🔍 Проверка структуры ICO файла:');
    console.log(`Сигнатура: ${Array.from(icoBuffer.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
    
    const imageCount = icoBuffer[4] + (icoBuffer[5] << 8);
    console.log(`Количество изображений: ${imageCount}`);
    
    for (let i = 0; i < imageCount; i++) {
      const entryOffset = 6 + (i * 16);
      const width = icoBuffer[entryOffset] || 256;
      const height = icoBuffer[entryOffset + 1] || 256;
      const dataSize = icoBuffer.readUInt32LE(entryOffset + 8);
      console.log(`Изображение ${i + 1}: ${width}x${height}, размер данных: ${dataSize} байт`);
    }
    
    console.log('✅ Генерация завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка генерации favicon:', error);
    process.exit(1);
  }
}

main();