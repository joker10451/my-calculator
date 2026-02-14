/**
 * Скрипт для тестирования совместимости с различными браузерами
 * Проверяет fallback механизмы для старых браузеров
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌐 Тестирование совместимости с браузерами...\n');

// Определяем поддержку форматов различными браузерами
const browserSupport = {
  'IE8': { ico: true, svg: false, png: true },
  'IE11': { ico: true, svg: true, png: true },
  'Chrome 90+': { ico: true, svg: true, png: true },
  'Firefox 90+': { ico: true, svg: true, png: true },
  'Safari 14+': { ico: true, svg: true, png: true },
  'Safari iOS 14+': { ico: true, svg: true, png: true },
  'Chrome Android': { ico: true, svg: true, png: true },
  'Samsung Internet': { ico: true, svg: true, png: true }
};

// Проверяем наличие файлов для каждого браузера
let allCompatibilityTestsPassed = true;

for (const [browser, support] of Object.entries(browserSupport)) {
  console.log(`🔍 Тестирование ${browser}:`);
  
  // ICO файл (универсальный fallback)
  if (support.ico) {
    const icoPath = path.resolve(path.dirname(__dirname), 'public/favicon.ico');
    if (fs.existsSync(icoPath)) {
      const icoBuffer = fs.readFileSync(icoPath);
      
      // Проверяем ICO сигнатуру
      if (icoBuffer[0] === 0x00 && icoBuffer[1] === 0x00 && icoBuffer[2] === 0x01 && icoBuffer[3] === 0x00) {
        console.log(`   ✅ ICO поддержка: favicon.ico доступен`);
      } else {
        console.log(`   ❌ ICO поддержка: некорректный формат favicon.ico`);
        allCompatibilityTestsPassed = false;
      }
    } else {
      console.log(`   ❌ ICO поддержка: favicon.ico не найден`);
      allCompatibilityTestsPassed = false;
    }
  }
  
  // SVG файл (современные браузеры)
  if (support.svg) {
    const svgPath = path.resolve(path.dirname(__dirname), 'public/icon.svg');
    if (fs.existsSync(svgPath)) {
      const svgContent = fs.readFileSync(svgPath, 'utf8');
      
      if (svgContent.includes('<svg') && svgContent.includes('xmlns')) {
        console.log(`   ✅ SVG поддержка: icon.svg доступен`);
      } else {
        console.log(`   ❌ SVG поддержка: некорректный формат icon.svg`);
        allCompatibilityTestsPassed = false;
      }
    } else {
      console.log(`   ❌ SVG поддержка: icon.svg не найден`);
      allCompatibilityTestsPassed = false;
    }
  } else {
    console.log(`   ⚠️  SVG поддержка: не поддерживается (fallback на ICO)`);
  }
  
  // PNG файлы (мобильные устройства)
  if (support.png && (browser.includes('iOS') || browser.includes('Android'))) {
    if (browser.includes('iOS')) {
      const appleTouchIconPath = path.resolve(path.dirname(__dirname), 'public/apple-touch-icon.png');
      if (fs.existsSync(appleTouchIconPath)) {
        const pngBuffer = fs.readFileSync(appleTouchIconPath);
        
        // Проверяем PNG сигнатуру
        if (pngBuffer[0] === 0x89 && pngBuffer[1] === 0x50 && pngBuffer[2] === 0x4E && pngBuffer[3] === 0x47) {
          // Проверяем размеры
          const width = pngBuffer.readUInt32BE(16);
          const height = pngBuffer.readUInt32BE(20);
          
          if (width === 180 && height === 180) {
            console.log(`   ✅ Apple Touch Icon: 180x180 доступен`);
          } else {
            console.log(`   ❌ Apple Touch Icon: некорректные размеры ${width}x${height}`);
            allCompatibilityTestsPassed = false;
          }
        } else {
          console.log(`   ❌ Apple Touch Icon: некорректный формат PNG`);
          allCompatibilityTestsPassed = false;
        }
      } else {
        console.log(`   ❌ Apple Touch Icon: файл не найден`);
        allCompatibilityTestsPassed = false;
      }
    }
    
    if (browser.includes('Android') || browser.includes('Chrome Android') || browser.includes('Samsung')) {
      // Проверяем PWA иконки
      const pwaIcons = [
        { path: 'public/icon-192.png', size: 192 },
        { path: 'public/icon-512.png', size: 512 }
      ];
      
      for (const icon of pwaIcons) {
        const iconPath = path.resolve(path.dirname(__dirname), icon.path);
        if (fs.existsSync(iconPath)) {
          const pngBuffer = fs.readFileSync(iconPath);
          
          if (pngBuffer[0] === 0x89 && pngBuffer[1] === 0x50 && pngBuffer[2] === 0x4E && pngBuffer[3] === 0x47) {
            const width = pngBuffer.readUInt32BE(16);
            const height = pngBuffer.readUInt32BE(20);
            
            if (width === icon.size && height === icon.size) {
              console.log(`   ✅ PWA Icon: ${icon.size}x${icon.size} доступен`);
            } else {
              console.log(`   ❌ PWA Icon: некорректные размеры ${width}x${height}, ожидается ${icon.size}x${icon.size}`);
              allCompatibilityTestsPassed = false;
            }
          } else {
            console.log(`   ❌ PWA Icon: некорректный формат PNG`);
            allCompatibilityTestsPassed = false;
          }
        } else {
          console.log(`   ❌ PWA Icon: ${icon.path} не найден`);
          allCompatibilityTestsPassed = false;
        }
      }
    }
  }
  
  console.log('');
}

// Проверяем fallback логику в HTML
console.log('🔄 Проверка fallback механизмов в HTML...');

const indexPath = path.resolve(path.dirname(__dirname), 'index.html');
if (fs.existsSync(indexPath)) {
  const htmlContent = fs.readFileSync(indexPath, 'utf8');
  
  // Проверяем порядок favicon ссылок
  const faviconLinks = [];
  const linkRegex = /<link[^>]*rel="icon"[^>]*>/g;
  let match;
  
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    faviconLinks.push({
      content: match[0],
      index: match.index
    });
  }
  
  if (faviconLinks.length >= 2) {
    // Проверяем, что ICO идет перед SVG
    const icoLink = faviconLinks.find(link => link.content.includes('favicon.ico'));
    const svgLink = faviconLinks.find(link => link.content.includes('icon.svg'));
    
    if (icoLink && svgLink) {
      if (icoLink.index < svgLink.index) {
        console.log('   ✅ Порядок fallback корректен: ICO перед SVG');
      } else {
        console.log('   ❌ Некорректный порядок fallback: SVG перед ICO');
        allCompatibilityTestsPassed = false;
      }
    }
    
    // Проверяем наличие sizes атрибута для ICO
    if (icoLink && icoLink.content.includes('sizes=')) {
      console.log('   ✅ ICO ссылка содержит sizes атрибут');
    } else {
      console.log('   ⚠️  ICO ссылка не содержит sizes атрибут (рекомендуется)');
    }
    
    // Проверяем наличие type атрибута для SVG
    if (svgLink && svgLink.content.includes('type="image/svg+xml"')) {
      console.log('   ✅ SVG ссылка содержит корректный MIME type');
    } else {
      console.log('   ❌ SVG ссылка не содержит корректный MIME type');
      allCompatibilityTestsPassed = false;
    }
  } else {
    console.log('   ❌ Недостаточно favicon ссылок в HTML');
    allCompatibilityTestsPassed = false;
  }
  
  // Проверяем Apple Touch Icon
  if (htmlContent.includes('rel="apple-touch-icon"')) {
    console.log('   ✅ Apple Touch Icon ссылка присутствует');
  } else {
    console.log('   ❌ Apple Touch Icon ссылка отсутствует');
    allCompatibilityTestsPassed = false;
  }
  
  // Проверяем Web App Manifest
  if (htmlContent.includes('rel="manifest"')) {
    console.log('   ✅ Web App Manifest ссылка присутствует');
  } else {
    console.log('   ❌ Web App Manifest ссылка отсутствует');
    allCompatibilityTestsPassed = false;
  }
} else {
  console.log('   ❌ index.html не найден');
  allCompatibilityTestsPassed = false;
}

console.log('\n' + '='.repeat(60));

if (allCompatibilityTestsPassed) {
  console.log('🎉 ВСЕ ТЕСТЫ СОВМЕСТИМОСТИ ПРОЙДЕНЫ!');
  console.log('✅ Legacy браузеры поддерживаются (ICO fallback)');
  console.log('✅ Современные браузеры поддерживаются (SVG)');
  console.log('✅ Мобильные устройства поддерживаются (PNG)');
  console.log('✅ PWA установка поддерживается');
  console.log('✅ Fallback механизмы настроены корректно');
  
  console.log('\n📱 Поддерживаемые платформы:');
  console.log('   • Internet Explorer 8+ (ICO)');
  console.log('   • Internet Explorer 11+ (ICO + SVG)');
  console.log('   • Chrome 90+ (ICO + SVG + PWA)');
  console.log('   • Firefox 90+ (ICO + SVG + PWA)');
  console.log('   • Safari 14+ (ICO + SVG + Apple Touch Icon)');
  console.log('   • iOS Safari (Apple Touch Icon)');
  console.log('   • Android Chrome (PWA Icons)');
  console.log('   • Samsung Internet (PWA Icons)');
  
  process.exit(0);
} else {
  console.log('❌ НЕКОТОРЫЕ ТЕСТЫ СОВМЕСТИМОСТИ НЕ ПРОЙДЕНЫ!');
  console.log('Проверьте ошибки выше и исправьте их.');
  process.exit(1);
}