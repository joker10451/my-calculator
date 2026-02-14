#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Создание оптимизированных PWA иконок
function createOptimizedPWAIcons() {
  console.log('🎨 Создание оптимизированных PWA иконок...\n');

  // SVG шаблон для PWA иконок с брендингом
  const createPWAIconSVG = (size, includeBrandText = false) => {
    const fontSize = size >= 512 ? 24 : 16;
    const brandTextY = size >= 512 ? 40 : 30;
    const calculatorScale = size / 192;
    
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.125)}" fill="#3B82F6"/>
  
  ${includeBrandText ? `<text x="${size/2}" y="${brandTextY}" fill="white" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle">Считай.RU</text>` : ''}
  
  <!-- Calculator body -->
  <rect x="${Math.round(size * 0.2)}" y="${Math.round(size * 0.25)}" width="${Math.round(size * 0.6)}" height="${Math.round(size * 0.6)}" rx="${Math.round(size * 0.04)}" fill="white"/>
  
  <!-- Display -->
  <rect x="${Math.round(size * 0.25)}" y="${Math.round(size * 0.3)}" width="${Math.round(size * 0.5)}" height="${Math.round(size * 0.1)}" rx="${Math.round(size * 0.02)}" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="${size/2}" y="${Math.round(size * 0.37)}" fill="#374151" font-family="monospace" font-size="${Math.round(size * 0.04)}" text-anchor="middle">123.45</text>
  
  <!-- Button grid -->
  <g fill="#f3f4f6" stroke="#e2e8f0" stroke-width="1">
    <!-- Row 1 -->
    <rect x="${Math.round(size * 0.25)}" y="${Math.round(size * 0.45)}" width="${Math.round(size * 0.08)}" height="${Math.round(size * 0.06)}" rx="2"/>
    <rect x="${Math.round(size * 0.35)}" y="${Math.round(size * 0.45)}" width="${Math.round(size * 0.08)}" height="${Math.round(size * 0.06)}" rx="2"/>
    <rect x="${Math.round(size * 0.45)}" y="${Math.round(size * 0.45)}" width="${Math.round(size * 0.08)}" height="${Math.round(size * 0.06)}" rx="2"/>
    <rect x="${Math.round(size * 0.55)}" y="${Math.round(size * 0.45)}" width="${Math.round(size * 0.2)}" height="${Math.round(size * 0.06)}" rx="2" fill="#3B82F6"/>
    
    <!-- Row 2 -->
    <rect x="${Math.round(size * 0.25)}" y="${Math.round(size * 0.53)}" width="${Math.round(size * 0.08)}" height="${Math.round(size * 0.06)}" rx="2"/>
    <rect x="${Math.round(size * 0.35)}" y="${Math.round(size * 0.53)}" width="${Math.round(size * 0.08)}" height="${Math.round(size * 0.06)}" rx="2"/>
    <rect x="${Math.round(size * 0.45)}" y="${Math.round(size * 0.53)}" width="${Math.round(size * 0.08)}" height="${Math.round(size * 0.06)}" rx="2"/>
    <rect x="${Math.round(size * 0.55)}" y="${Math.round(size * 0.53)}" width="${Math.round(size * 0.2)}" height="${Math.round(size * 0.06)}" rx="2" fill="#3B82F6"/>
    
    <!-- Row 3 -->
    <rect x="${Math.round(size * 0.25)}" y="${Math.round(size * 0.61)}" width="${Math.round(size * 0.18)}" height="${Math.round(size * 0.06)}" rx="2"/>
    <rect x="${Math.round(size * 0.45)}" y="${Math.round(size * 0.61)}" width="${Math.round(size * 0.08)}" height="${Math.round(size * 0.06)}" rx="2"/>
    <rect x="${Math.round(size * 0.55)}" y="${Math.round(size * 0.61)}" width="${Math.round(size * 0.2)}" height="${Math.round(size * 0.06)}" rx="2" fill="#3B82F6"/>
  </g>
  
  <!-- Button labels -->
  <g fill="#374151" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.025)}" text-anchor="middle" font-weight="bold">
    <text x="${Math.round(size * 0.29)}" y="${Math.round(size * 0.49)}">7</text>
    <text x="${Math.round(size * 0.39)}" y="${Math.round(size * 0.49)}">8</text>
    <text x="${Math.round(size * 0.49)}" y="${Math.round(size * 0.49)}">9</text>
    <text x="${Math.round(size * 0.29)}" y="${Math.round(size * 0.57)}">4</text>
    <text x="${Math.round(size * 0.39)}" y="${Math.round(size * 0.57)}">5</text>
    <text x="${Math.round(size * 0.49)}" y="${Math.round(size * 0.57)}">6</text>
    <text x="${Math.round(size * 0.34)}" y="${Math.round(size * 0.65)}">0</text>
    <text x="${Math.round(size * 0.49)}" y="${Math.round(size * 0.65)}">.</text>
  </g>
  
  <!-- Operation symbols -->
  <g fill="white" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.03)}" text-anchor="middle" font-weight="bold">
    <text x="${Math.round(size * 0.65)}" y="${Math.round(size * 0.49)}">÷</text>
    <text x="${Math.round(size * 0.65)}" y="${Math.round(size * 0.57)}">×</text>
    <text x="${Math.round(size * 0.65)}" y="${Math.round(size * 0.65)}">=</text>
  </g>
</svg>`;
  };

  // Создаем оптимизированные SVG файлы
  const icon192SVG = createPWAIconSVG(192, false);
  const icon512SVG = createPWAIconSVG(512, true);

  // Сохраняем SVG файлы (они будут использоваться как PNG альтернативы)
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon-192-optimized.svg'), icon192SVG);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon-512-optimized.svg'), icon512SVG);

  console.log('✅ Созданы оптимизированные SVG иконки');
  console.log('   - icon-192-optimized.svg');
  console.log('   - icon-512-optimized.svg');
  
  // Показываем размеры
  const svg192Size = fs.statSync(path.join(__dirname, '..', 'public', 'icon-192-optimized.svg')).size;
  const svg512Size = fs.statSync(path.join(__dirname, '..', 'public', 'icon-512-optimized.svg')).size;
  
  console.log(`\n📊 Размеры оптимизированных файлов:`);
  console.log(`   - icon-192-optimized.svg: ${(svg192Size / 1024).toFixed(2)} KB`);
  console.log(`   - icon-512-optimized.svg: ${(svg512Size / 1024).toFixed(2)} KB`);
  
  const originalPng192 = fs.statSync(path.join(__dirname, '..', 'public', 'icon-192.png')).size;
  const originalPng512 = fs.statSync(path.join(__dirname, '..', 'public', 'icon-512.png')).size;
  
  console.log(`\n💾 Экономия места:`);
  console.log(`   - 192px: ${((originalPng192 - svg192Size) / 1024).toFixed(2)} KB экономии`);
  console.log(`   - 512px: ${((originalPng512 - svg512Size) / 1024).toFixed(2)} KB экономии`);
  console.log(`   - Общая экономия: ${((originalPng192 + originalPng512 - svg192Size - svg512Size) / 1024).toFixed(2)} KB`);
}

if (require.main === module) {
  createOptimizedPWAIcons();
}

module.exports = { createOptimizedPWAIcons };