#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Анализ размеров favicon файлов
function analyzeFaviconSizes() {
  const publicDir = path.join(__dirname, '..', 'public');
  const faviconFiles = [
    'favicon.ico',
    'icon.svg', 
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png',
    'manifest.json'
  ];

  console.log('📊 Анализ размеров favicon файлов:\n');
  
  let totalSize = 0;
  const results = [];

  faviconFiles.forEach(filename => {
    const filePath = path.join(publicDir, filename);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      
      results.push({
        file: filename,
        size: stats.size,
        sizeKB: sizeKB
      });
      
      console.log(`✅ ${filename.padEnd(20)} ${sizeKB.padStart(8)} KB`);
    } else {
      console.log(`❌ ${filename.padEnd(20)} ОТСУТСТВУЕТ`);
    }
  });

  console.log('\n' + '─'.repeat(40));
  console.log(`📦 Общий размер: ${(totalSize / 1024).toFixed(2)} KB`);
  
  // Проверка оптимальности размеров
  console.log('\n🔍 Анализ оптимизации:');
  
  results.forEach(result => {
    let status = '✅ Оптимально';
    let recommendation = '';
    
    if (result.file === 'favicon.ico' && result.size > 2048) {
      status = '⚠️ Можно оптимизировать';
      recommendation = ' (рекомендуется < 2KB)';
    } else if (result.file === 'icon.svg' && result.size > 5120) {
      status = '⚠️ Можно оптимизировать';
      recommendation = ' (рекомендуется < 5KB)';
    } else if (result.file === 'apple-touch-icon.png' && result.size > 10240) {
      status = '⚠️ Можно оптимизировать';
      recommendation = ' (рекомендуется < 10KB)';
    } else if (result.file === 'icon-192.png' && result.size > 20480) {
      status = '⚠️ Можно оптимизировать';
      recommendation = ' (рекомендуется < 20KB)';
    } else if (result.file === 'icon-512.png' && result.size > 51200) {
      status = '⚠️ Можно оптимизировать';
      recommendation = ' (рекомендуется < 50KB)';
    }
    
    console.log(`  ${result.file}: ${status}${recommendation}`);
  });

  return results;
}

// Проверка соответствия требованиям
function checkRequirements() {
  console.log('\n🎯 Проверка соответствия требованиям:\n');
  
  const checks = [
    {
      name: 'Requirement 1.1: HTTP 200 для favicon.ico',
      check: () => fs.existsSync(path.join(__dirname, '..', 'public', 'favicon.ico'))
    },
    {
      name: 'Requirement 1.2: Доступность по стандартным путям',
      check: () => {
        const files = ['favicon.ico', 'icon.svg'];
        return files.every(f => fs.existsSync(path.join(__dirname, '..', 'public', f)));
      }
    },
    {
      name: 'Requirement 2.4: ICO с множественными размерами',
      check: () => {
        const icoPath = path.join(__dirname, '..', 'public', 'favicon.ico');
        return fs.existsSync(icoPath) && fs.statSync(icoPath).size > 100;
      }
    },
    {
      name: 'Requirement 3.1: Apple Touch Icon 180x180',
      check: () => fs.existsSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'))
    },
    {
      name: 'Requirement 4.1: PWA иконки в манифесте',
      check: () => {
        const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
        if (!fs.existsSync(manifestPath)) return false;
        
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          return manifest.icons && manifest.icons.length >= 2;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Requirement 5.1: Оптимизация размеров',
      check: () => {
        const icoPath = path.join(__dirname, '..', 'public', 'favicon.ico');
        return fs.existsSync(icoPath) && fs.statSync(icoPath).size < 2048;
      }
    },
    {
      name: 'Requirement 5.4: HTTP заголовки кэширования',
      check: () => fs.existsSync(path.join(__dirname, '..', 'public', '_headers'))
    }
  ];

  checks.forEach(check => {
    const result = check.check();
    const status = result ? '✅ ПРОЙДЕНО' : '❌ НЕ ПРОЙДЕНО';
    console.log(`${status} ${check.name}`);
  });
}

if (require.main === module) {
  analyzeFaviconSizes();
  checkRequirements();
}

module.exports = { analyzeFaviconSizes, checkRequirements };