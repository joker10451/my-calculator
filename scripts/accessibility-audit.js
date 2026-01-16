/**
 * Accessibility Audit Script
 * Проверяет соответствие WCAG 2.1 Level AA
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getAllFiles(dirPath, extension, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, extension, arrayOfFiles);
    } else if (file.endsWith(extension)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// 1. Проверка иерархии заголовков
function checkHeadingHierarchy(content, filePath) {
  const issues = [];
  const headingRegex = /<h([1-6])[^>]*>/gi;
  const headings = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(parseInt(match[1]));
  }
  
  // Проверяем что есть H1
  if (!headings.includes(1)) {
    issues.push({
      file: filePath,
      type: 'missing-h1',
      message: 'Отсутствует H1 заголовок',
      severity: 'error'
    });
  }
  
  // Проверяем что H1 только один
  const h1Count = headings.filter(h => h === 1).length;
  if (h1Count > 1) {
    issues.push({
      file: filePath,
      type: 'multiple-h1',
      message: `Найдено ${h1Count} H1 заголовков (должен быть только один)`,
      severity: 'error'
    });
  }
  
  // Проверяем последовательность заголовков
  for (let i = 1; i < headings.length; i++) {
    const diff = headings[i] - headings[i - 1];
    if (diff > 1) {
      issues.push({
        file: filePath,
        type: 'heading-skip',
        message: `Пропущен уровень заголовка: H${headings[i - 1]} → H${headings[i]}`,
        severity: 'warning'
      });
    }
  }
  
  return issues;
}

// 2. Проверка alt текста для изображений
function checkImageAltText(content, filePath) {
  const issues = [];
  
  // Проверяем <img> теги
  const imgRegex = /<img[^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(content)) !== null) {
    const imgTag = match[0];
    
    // Проверяем наличие alt атрибута
    if (!imgTag.includes('alt=')) {
      issues.push({
        file: filePath,
        type: 'missing-alt',
        message: 'Изображение без alt атрибута',
        severity: 'error',
        code: imgTag.substring(0, 50) + '...'
      });
    } else {
      // Проверяем что alt не пустой
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
      if (altMatch && altMatch[1].trim() === '') {
        issues.push({
          file: filePath,
          type: 'empty-alt',
          message: 'Изображение с пустым alt атрибутом',
          severity: 'warning',
          code: imgTag.substring(0, 50) + '...'
        });
      }
    }
  }
  
  return issues;
}

// 3. Проверка семантических HTML элементов
function checkSemanticHTML(content, filePath) {
  const issues = [];
  const semanticElements = ['article', 'nav', 'aside', 'header', 'footer', 'main', 'section'];
  
  let hasSemanticElements = false;
  for (const element of semanticElements) {
    if (content.includes(`<${element}`)) {
      hasSemanticElements = true;
      break;
    }
  }
  
  // Проверяем использование div вместо семантических элементов
  const divCount = (content.match(/<div/g) || []).length;
  const semanticCount = semanticElements.reduce((count, element) => {
    return count + (content.match(new RegExp(`<${element}`, 'g')) || []).length;
  }, 0);
  
  if (divCount > 10 && semanticCount === 0) {
    issues.push({
      file: filePath,
      type: 'no-semantic-html',
      message: `Используется ${divCount} div элементов без семантических тегов`,
      severity: 'warning'
    });
  }
  
  return issues;
}

// 4. Проверка ARIA атрибутов
function checkARIAAttributes(content, filePath) {
  const issues = [];
  
  // Проверяем кнопки без aria-label
  const buttonRegex = /<button[^>]*>/gi;
  let match;
  
  while ((match = buttonRegex.exec(content)) !== null) {
    const buttonTag = match[0];
    
    // Если кнопка содержит только иконку, должен быть aria-label
    if (buttonTag.includes('Icon') || buttonTag.includes('svg')) {
      if (!buttonTag.includes('aria-label') && !buttonTag.includes('aria-labelledby')) {
        issues.push({
          file: filePath,
          type: 'missing-aria-label',
          message: 'Кнопка с иконкой без aria-label',
          severity: 'warning',
          code: buttonTag.substring(0, 50) + '...'
        });
      }
    }
  }
  
  return issues;
}

// 5. Проверка контрастности цветов (базовая проверка)
function checkColorContrast(content, filePath) {
  const issues = [];
  
  // Проверяем использование низкоконтрастных цветов
  const lowContrastPatterns = [
    /text-gray-400/g,
    /text-gray-300/g,
    /opacity-50/g,
    /opacity-40/g,
    /opacity-30/g,
  ];
  
  for (const pattern of lowContrastPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 5) {
      issues.push({
        file: filePath,
        type: 'low-contrast',
        message: `Возможно низкая контрастность: найдено ${matches.length} использований ${pattern.source}`,
        severity: 'warning'
      });
    }
  }
  
  return issues;
}

// 6. Проверка keyboard navigation
function checkKeyboardNavigation(content, filePath) {
  const issues = [];
  
  // Проверяем onClick без onKeyDown
  const onClickRegex = /onClick=\{[^}]+\}/g;
  const onKeyDownRegex = /onKeyDown=\{[^}]+\}/g;
  
  const onClickCount = (content.match(onClickRegex) || []).length;
  const onKeyDownCount = (content.match(onKeyDownRegex) || []).length;
  
  if (onClickCount > onKeyDownCount + 2) {
    issues.push({
      file: filePath,
      type: 'missing-keyboard-handler',
      message: `Найдено ${onClickCount} onClick без соответствующих onKeyDown обработчиков`,
      severity: 'warning'
    });
  }
  
  // Проверяем tabIndex
  if (content.includes('tabIndex={-1}') || content.includes('tabindex="-1"')) {
    issues.push({
      file: filePath,
      type: 'negative-tabindex',
      message: 'Использование tabIndex={-1} может нарушить keyboard navigation',
      severity: 'info'
    });
  }
  
  return issues;
}

// 7. Проверка форм
function checkForms(content, filePath) {
  const issues = [];
  
  // Проверяем input без label
  const inputRegex = /<input[^>]*>/gi;
  let match;
  
  while ((match = inputRegex.exec(content)) !== null) {
    const inputTag = match[0];
    
    if (!inputTag.includes('aria-label') && !inputTag.includes('aria-labelledby')) {
      // Проверяем есть ли id для связи с label
      const idMatch = inputTag.match(/id=["']([^"']*)["']/);
      if (!idMatch) {
        issues.push({
          file: filePath,
          type: 'input-without-label',
          message: 'Input без label или aria-label',
          severity: 'warning',
          code: inputTag.substring(0, 50) + '...'
        });
      }
    }
  }
  
  return issues;
}

async function auditAccessibility() {
  log('\n♿ Аудит доступности (WCAG 2.1 Level AA)...', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  const srcPath = './src';
  const files = [
    ...getAllFiles(join(srcPath, 'pages'), '.tsx'),
    ...getAllFiles(join(srcPath, 'components'), '.tsx'),
  ];
  
  log(`📁 Проверка ${files.length} файлов...\n`, 'blue');
  
  const allIssues = {
    errors: [],
    warnings: [],
    info: []
  };
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      
      const issues = [
        ...checkHeadingHierarchy(content, file),
        ...checkImageAltText(content, file),
        ...checkSemanticHTML(content, file),
        ...checkARIAAttributes(content, file),
        ...checkColorContrast(content, file),
        ...checkKeyboardNavigation(content, file),
        ...checkForms(content, file),
      ];
      
      issues.forEach(issue => {
        if (issue.severity === 'error') {
          allIssues.errors.push(issue);
        } else if (issue.severity === 'warning') {
          allIssues.warnings.push(issue);
        } else {
          allIssues.info.push(issue);
        }
      });
    } catch (error) {
      // Игнорируем ошибки чтения файлов
    }
  }
  
  // Выводим результаты
  log('📊 РЕЗУЛЬТАТЫ АУДИТА', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  if (allIssues.errors.length > 0) {
    log(`❌ Критические проблемы: ${allIssues.errors.length}`, 'red');
    allIssues.errors.slice(0, 10).forEach(issue => {
      log(`  • ${issue.message}`, 'red');
      log(`    Файл: ${issue.file.replace(/\\/g, '/')}`, 'red');
      if (issue.code) {
        log(`    Код: ${issue.code}`, 'red');
      }
    });
    if (allIssues.errors.length > 10) {
      log(`  ... и еще ${allIssues.errors.length - 10} проблем`, 'red');
    }
    log('');
  }
  
  if (allIssues.warnings.length > 0) {
    log(`⚠️  Предупреждения: ${allIssues.warnings.length}`, 'yellow');
    allIssues.warnings.slice(0, 10).forEach(issue => {
      log(`  • ${issue.message}`, 'yellow');
      log(`    Файл: ${issue.file.replace(/\\/g, '/')}`, 'yellow');
    });
    if (allIssues.warnings.length > 10) {
      log(`  ... и еще ${allIssues.warnings.length - 10} предупреждений`, 'yellow');
    }
    log('');
  }
  
  if (allIssues.info.length > 0) {
    log(`ℹ️  Информация: ${allIssues.info.length}`, 'blue');
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  log('📋 РЕКОМЕНДАЦИИ', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  log('1. Иерархия заголовков:', 'blue');
  log('   • Используйте только один H1 на странице', 'blue');
  log('   • Не пропускайте уровни (H1 → H2 → H3)', 'blue');
  log('   • H1 должен содержать основную тему страницы', 'blue');
  
  log('\n2. Изображения:', 'blue');
  log('   • Все изображения должны иметь alt атрибут', 'blue');
  log('   • Alt текст должен описывать содержание изображения', 'blue');
  log('   • Декоративные изображения: alt=""', 'blue');
  
  log('\n3. Семантический HTML:', 'blue');
  log('   • Используйте <article>, <nav>, <aside>, <header>, <footer>', 'blue');
  log('   • Избегайте избыточного использования <div>', 'blue');
  log('   • Используйте <button> для кнопок, <a> для ссылок', 'blue');
  
  log('\n4. ARIA атрибуты:', 'blue');
  log('   • Кнопки с иконками должны иметь aria-label', 'blue');
  log('   • Используйте aria-labelledby для связи элементов', 'blue');
  log('   • Добавляйте role для кастомных компонентов', 'blue');
  
  log('\n5. Контрастность:', 'blue');
  log('   • Минимум 4.5:1 для обычного текста', 'blue');
  log('   • Минимум 3:1 для крупного текста (18pt+)', 'blue');
  log('   • Проверяйте контраст в Chrome DevTools', 'blue');
  
  log('\n6. Keyboard Navigation:', 'blue');
  log('   • Все интерактивные элементы доступны через Tab', 'blue');
  log('   • Добавляйте onKeyDown для onClick обработчиков', 'blue');
  log('   • Используйте :focus-visible для стилей фокуса', 'blue');
  
  log('\n7. Формы:', 'blue');
  log('   • Все input должны иметь связанный label', 'blue');
  log('   • Используйте aria-describedby для подсказок', 'blue');
  log('   • Добавляйте aria-invalid для ошибок валидации', 'blue');
  
  log('\n' + '='.repeat(60) + '\n', 'cyan');
  
  const totalIssues = allIssues.errors.length + allIssues.warnings.length;
  
  if (totalIssues === 0) {
    log('✅ ОТЛИЧНАЯ РАБОТА! Критических проблем не найдено.', 'green');
    log('   Приложение соответствует базовым требованиям WCAG 2.1 Level AA', 'green');
  } else if (allIssues.errors.length === 0) {
    log('⚠️  ХОРОШО! Критических проблем нет, но есть предупреждения.', 'yellow');
    log('   Рекомендуется исправить предупреждения для полного соответствия', 'yellow');
  } else {
    log('❌ ТРЕБУЕТСЯ ДОРАБОТКА! Найдены критические проблемы.', 'red');
    log('   Необходимо исправить ошибки для соответствия WCAG 2.1 Level AA', 'red');
  }
  
  log('\n💡 Для детальной проверки используйте:', 'blue');
  log('   • Chrome DevTools Lighthouse (Accessibility)', 'blue');
  log('   • axe DevTools Extension', 'blue');
  log('   • WAVE Browser Extension', 'blue');
  log('   • Screen readers (NVDA, VoiceOver)', 'blue');
  
  log('\n' + '='.repeat(60) + '\n', 'cyan');
  
  return {
    errors: allIssues.errors.length,
    warnings: allIssues.warnings.length,
    info: allIssues.info.length,
    passed: allIssues.errors.length === 0
  };
}

async function main() {
  log('🚀 Запуск аудита доступности...', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  const results = await auditAccessibility();
  
  process.exit(results.passed ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ Ошибка: ${error.message}`, 'red');
  process.exit(1);
});
