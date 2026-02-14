/**
 * Скрипт для тестирования поддержки форматов favicon
 * Проверяет наличие и корректность всех необходимых файлов
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Тестирование поддержки форматов favicon...\n');

// Список требуемых файлов
const requiredFiles = [
  {
    path: 'public/favicon.ico',
    format: 'ICO',
    description: 'Legacy браузеры и поисковые системы',
    signature: [0x00, 0x00, 0x01, 0x00]
  },
  {
    path: 'public/icon.svg',
    format: 'SVG',
    description: 'Современные браузеры',
    signature: '<svg'
  },
  {
    path: 'public/apple-touch-icon.png',
    format: 'PNG',
    description: 'iOS устройства',
    signature: [0x89, 0x50, 0x4E, 0x47]
  },
  {
    path: 'public/icon-192.png',
    format: 'PNG',
    description: 'PWA 192x192',
    signature: [0x89, 0x50, 0x4E, 0x47]
  },
  {
    path: 'public/icon-512.png',
    format: 'PNG',
    description: 'PWA 512x512',
    signature: [0x89, 0x50, 0x4E, 0x47]
  },
  {
    path: 'public/manifest.json',
    format: 'JSON',
    description: 'PWA манифест',
    signature: '{'
  }
];

let allTestsPassed = true;

// Проверяем каждый файл
for (const file of requiredFiles) {
  const filePath = path.resolve(path.dirname(__dirname), file.path);
  
  console.log(`📁 Проверка ${file.format}: ${file.path}`);
  console.log(`   Назначение: ${file.description}`);
  
  // Проверяем существование файла
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ ОШИБКА: Файл не найден`);
    allTestsPassed = false;
    continue;
  }
  
  // Читаем файл
  const fileBuffer = fs.readFileSync(filePath);
  const fileSizeKB = (fileBuffer.length / 1024).toFixed(2);
  
  console.log(`   📊 Размер: ${fileSizeKB} KB`);
  
  // Проверяем сигнатуру файла
  let signatureValid = false;
  
  if (Array.isArray(file.signature)) {
    // Бинарная сигнатура
    signatureValid = file.signature.every((byte, index) => fileBuffer[index] === byte);
  } else {
    // Текстовая сигнатура
    const content = fileBuffer.toString('utf8');
    signatureValid = content.includes(file.signature);
  }
  
  if (signatureValid) {
    console.log(`   ✅ Формат корректен`);
  } else {
    console.log(`   ❌ ОШИБКА: Некорректный формат файла`);
    allTestsPassed = false;
  }
  
  // Дополнительные проверки для конкретных форматов
  if (file.format === 'ICO') {
    // Проверяем количество изображений в ICO
    const imageCount = fileBuffer[4] + (fileBuffer[5] << 8);
    console.log(`   🖼️  Количество изображений: ${imageCount}`);
    
    if (imageCount >= 1 && imageCount <= 10) {
      console.log(`   ✅ Количество изображений корректно`);
    } else {
      console.log(`   ❌ ОШИБКА: Некорректное количество изображений`);
      allTestsPassed = false;
    }
  }
  
  if (file.format === 'PNG') {
    // Проверяем размеры PNG
    const width = fileBuffer.readUInt32BE(16);
    const height = fileBuffer.readUInt32BE(20);
    console.log(`   📐 Размеры: ${width}x${height}`);
    
    // Проверяем ожидаемые размеры
    if (file.path.includes('apple-touch-icon')) {
      if (width === 180 && height === 180) {
        console.log(`   ✅ Размеры Apple Touch Icon корректны`);
      } else {
        console.log(`   ❌ ОШИБКА: Apple Touch Icon должен быть 180x180`);
        allTestsPassed = false;
      }
    } else if (file.path.includes('192')) {
      if (width === 192 && height === 192) {
        console.log(`   ✅ Размеры PWA 192 корректны`);
      } else {
        console.log(`   ❌ ОШИБКА: PWA иконка должна быть 192x192`);
        allTestsPassed = false;
      }
    } else if (file.path.includes('512')) {
      if (width === 512 && height === 512) {
        console.log(`   ✅ Размеры PWA 512 корректны`);
      } else {
        console.log(`   ❌ ОШИБКА: PWA иконка должна быть 512x512`);
        allTestsPassed = false;
      }
    }
  }
  
  if (file.format === 'SVG') {
    const content = fileBuffer.toString('utf8');
    
    // Проверяем наличие обязательных атрибутов
    if (content.includes('xmlns')) {
      console.log(`   ✅ SVG namespace корректен`);
    } else {
      console.log(`   ❌ ОШИБКА: Отсутствует xmlns в SVG`);
      allTestsPassed = false;
    }
    
    // Проверяем отсутствие вредоносного кода
    if (!content.toLowerCase().includes('<script')) {
      console.log(`   ✅ SVG безопасен (нет script тегов)`);
    } else {
      console.log(`   ❌ ОШИБКА: SVG содержит script теги`);
      allTestsPassed = false;
    }
  }
  
  if (file.format === 'JSON') {
    try {
      const manifest = JSON.parse(fileBuffer.toString('utf8'));
      
      // Проверяем обязательные поля манифеста
      if (manifest.name && manifest.icons && Array.isArray(manifest.icons)) {
        console.log(`   ✅ Структура манифеста корректна`);
        
        // Проверяем наличие иконок нужных размеров
        const iconSizes = manifest.icons.map(icon => icon.sizes);
        if (iconSizes.includes('192x192') && iconSizes.includes('512x512')) {
          console.log(`   ✅ Иконки PWA присутствуют`);
        } else {
          console.log(`   ❌ ОШИБКА: Отсутствуют иконки 192x192 или 512x512`);
          allTestsPassed = false;
        }
      } else {
        console.log(`   ❌ ОШИБКА: Некорректная структура манифеста`);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`   ❌ ОШИБКА: Некорректный JSON - ${error.message}`);
      allTestsPassed = false;
    }
  }
  
  console.log('');
}

// Проверяем HTML структуру
console.log('🔗 Проверка HTML структуры...');

const indexPath = path.resolve(path.dirname(__dirname), 'index.html');
if (fs.existsSync(indexPath)) {
  const htmlContent = fs.readFileSync(indexPath, 'utf8');
  
  // Проверяем наличие favicon ссылок
  const faviconChecks = [
    { pattern: /rel="icon".*href="\/favicon\.ico"/, name: 'favicon.ico ссылка' },
    { pattern: /rel="icon".*href="\/icon\.svg"/, name: 'icon.svg ссылка' },
    { pattern: /rel="apple-touch-icon".*href="\/apple-touch-icon\.png"/, name: 'Apple Touch Icon ссылка' },
    { pattern: /rel="manifest".*href="\/manifest\.json"/, name: 'Manifest ссылка' }
  ];
  
  for (const check of faviconChecks) {
    if (check.pattern.test(htmlContent)) {
      console.log(`   ✅ ${check.name} найдена`);
    } else {
      console.log(`   ❌ ОШИБКА: ${check.name} не найдена`);
      allTestsPassed = false;
    }
  }
  
  // Проверяем порядок fallback (ICO перед SVG)
  const icoIndex = htmlContent.indexOf('favicon.ico');
  const svgIndex = htmlContent.indexOf('icon.svg');
  
  if (icoIndex < svgIndex) {
    console.log(`   ✅ Порядок fallback корректен (ICO перед SVG)`);
  } else {
    console.log(`   ❌ ОШИБКА: Некорректный порядок fallback`);
    allTestsPassed = false;
  }
} else {
  console.log(`   ❌ ОШИБКА: index.html не найден`);
  allTestsPassed = false;
}

console.log('\n' + '='.repeat(50));

if (allTestsPassed) {
  console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!');
  console.log('✅ Поддержка форматов favicon настроена корректно');
  console.log('✅ Fallback механизмы работают');
  console.log('✅ Мобильные устройства поддерживаются');
  console.log('✅ PWA иконки настроены');
  process.exit(0);
} else {
  console.log('❌ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОЙДЕНЫ!');
  console.log('Проверьте ошибки выше и исправьте их.');
  process.exit(1);
}