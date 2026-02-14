#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Проверка соответствия SEO требованиям
function validateSEOCompliance() {
  console.log('🔍 Проверка соответствия SEO требованиям для поисковых систем:\n');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  // Проверка 1: Наличие favicon.ico в корне
  const faviconExists = fs.existsSync(path.join(__dirname, '..', 'public', 'favicon.ico'));
  if (faviconExists) {
    results.passed++;
    results.details.push('✅ favicon.ico присутствует в корне сайта');
  } else {
    results.failed++;
    results.details.push('❌ favicon.ico отсутствует в корне сайта');
  }

  // Проверка 2: Размер favicon.ico (должен быть разумным для быстрой загрузки)
  if (faviconExists) {
    const faviconSize = fs.statSync(path.join(__dirname, '..', 'public', 'favicon.ico')).size;
    if (faviconSize < 5120) { // < 5KB
      results.passed++;
      results.details.push(`✅ favicon.ico имеет оптимальный размер (${(faviconSize / 1024).toFixed(2)} KB)`);
    } else {
      results.warnings++;
      results.details.push(`⚠️ favicon.ico довольно большой (${(faviconSize / 1024).toFixed(2)} KB), рекомендуется < 5KB`);
    }
  }

  // Проверка 3: HTML структура favicon ссылок
  const indexPath = path.join(__dirname, '..', 'index.html');
  if (fs.existsSync(indexPath)) {
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // Проверяем наличие основных favicon ссылок
    const hasIconLink = htmlContent.includes('rel="icon"');
    const hasAppleTouchIcon = htmlContent.includes('rel="apple-touch-icon"');
    const hasManifest = htmlContent.includes('rel="manifest"');
    
    if (hasIconLink) {
      results.passed++;
      results.details.push('✅ HTML содержит ссылку на favicon (rel="icon")');
    } else {
      results.failed++;
      results.details.push('❌ HTML не содержит ссылку на favicon');
    }

    if (hasAppleTouchIcon) {
      results.passed++;
      results.details.push('✅ HTML содержит Apple Touch Icon');
    } else {
      results.warnings++;
      results.details.push('⚠️ HTML не содержит Apple Touch Icon');
    }

    if (hasManifest) {
      results.passed++;
      results.details.push('✅ HTML содержит ссылку на Web App Manifest');
    } else {
      results.warnings++;
      results.details.push('⚠️ HTML не содержит ссылку на Web App Manifest');
    }

    // Проверяем порядок favicon ссылок (ICO должен быть перед SVG для fallback)
    const iconMatches = [...htmlContent.matchAll(/rel="icon"[^>]*>/g)];
    if (iconMatches.length >= 2) {
      const firstIcon = iconMatches[0][0];
      const secondIcon = iconMatches[1][0];
      
      if (firstIcon.includes('.ico') && secondIcon.includes('.svg')) {
        results.passed++;
        results.details.push('✅ Правильный порядок favicon ссылок (ICO перед SVG)');
      } else {
        results.warnings++;
        results.details.push('⚠️ Рекомендуется размещать ICO ссылку перед SVG для лучшей совместимости');
      }
    }
  }

  // Проверка 4: HTTP заголовки
  const headersPath = path.join(__dirname, '..', 'public', '_headers');
  if (fs.existsSync(headersPath)) {
    const headersContent = fs.readFileSync(headersPath, 'utf8');
    
    const hasFaviconHeaders = headersContent.includes('/favicon.ico');
    const hasCacheControl = headersContent.includes('Cache-Control');
    const hasMimeTypes = headersContent.includes('Content-Type: image/x-icon');
    
    if (hasFaviconHeaders) {
      results.passed++;
      results.details.push('✅ HTTP заголовки настроены для favicon файлов');
    } else {
      results.failed++;
      results.details.push('❌ HTTP заголовки не настроены для favicon файлов');
    }

    if (hasCacheControl) {
      results.passed++;
      results.details.push('✅ Настроено кэширование для favicon файлов');
    } else {
      results.warnings++;
      results.details.push('⚠️ Кэширование не настроено для favicon файлов');
    }

    if (hasMimeTypes) {
      results.passed++;
      results.details.push('✅ Корректные MIME типы для favicon файлов');
    } else {
      results.warnings++;
      results.details.push('⚠️ MIME типы не настроены для favicon файлов');
    }
  }

  // Проверка 5: robots.txt (не должен блокировать favicon)
  const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    
    if (robotsContent.includes('Disallow: /favicon.ico') || robotsContent.includes('Disallow: /*.ico')) {
      results.failed++;
      results.details.push('❌ robots.txt блокирует доступ к favicon файлам');
    } else {
      results.passed++;
      results.details.push('✅ robots.txt не блокирует доступ к favicon файлам');
    }
  } else {
    results.warnings++;
    results.details.push('⚠️ robots.txt отсутствует');
  }

  // Проверка 6: Manifest.json валидность
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      if (manifest.icons && manifest.icons.length > 0) {
        results.passed++;
        results.details.push(`✅ Web App Manifest содержит ${manifest.icons.length} иконок`);
        
        // Проверяем наличие файлов иконок
        let missingIcons = 0;
        manifest.icons.forEach(icon => {
          const iconPath = path.join(__dirname, '..', 'public', icon.src.replace('/', ''));
          if (!fs.existsSync(iconPath)) {
            missingIcons++;
          }
        });
        
        if (missingIcons === 0) {
          results.passed++;
          results.details.push('✅ Все иконки из манифеста присутствуют на диске');
        } else {
          results.failed++;
          results.details.push(`❌ ${missingIcons} иконок из манифеста отсутствуют на диске`);
        }
      } else {
        results.warnings++;
        results.details.push('⚠️ Web App Manifest не содержит иконок');
      }
    } catch (error) {
      results.failed++;
      results.details.push('❌ Web App Manifest содержит некорректный JSON');
    }
  }

  // Вывод результатов
  console.log('📋 Результаты проверки:\n');
  results.details.forEach(detail => console.log(detail));
  
  console.log('\n' + '─'.repeat(50));
  console.log(`📊 Итоговая статистика:`);
  console.log(`   ✅ Пройдено: ${results.passed}`);
  console.log(`   ⚠️ Предупреждения: ${results.warnings}`);
  console.log(`   ❌ Ошибки: ${results.failed}`);
  
  const totalChecks = results.passed + results.warnings + results.failed;
  const successRate = ((results.passed / totalChecks) * 100).toFixed(1);
  console.log(`   📈 Процент успеха: ${successRate}%`);

  // Рекомендации для поисковых систем
  console.log('\n🎯 Рекомендации для поисковых систем:');
  
  if (results.failed === 0) {
    console.log('✅ Отлично! Favicon система полностью готова для поисковых систем');
  } else {
    console.log('⚠️ Есть критические проблемы, которые нужно исправить');
  }
  
  if (results.warnings > 0) {
    console.log('💡 Есть возможности для улучшения SEO оптимизации');
  }

  console.log('\n🔗 Проверьте favicon в инструментах:');
  console.log('   - Яндекс.Вебмастер: https://webmaster.yandex.ru/');
  console.log('   - Google Search Console: https://search.google.com/search-console');
  console.log('   - Favicon Checker: https://realfavicongenerator.net/favicon_checker');

  return results;
}

if (require.main === module) {
  validateSEOCompliance();
}

module.exports = { validateSEOCompliance };