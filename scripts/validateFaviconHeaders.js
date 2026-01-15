#!/usr/bin/env node

/**
 * CLI утилита для проверки HTTP заголовков favicon файлов
 * Использование: node scripts/validateFaviconHeaders.js [URL]
 */

import { validateAllFaviconHeaders, generateHeadersValidationReport, areAllFaviconHeadersValid } from '../src/lib/httpHeadersValidator.js';

async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:8080';
  
  console.log(`🔍 Проверка HTTP заголовков favicon файлов на ${baseUrl}...\n`);
  
  try {
    const results = await validateAllFaviconHeaders(baseUrl);
    const report = generateHeadersValidationReport(results);
    const allValid = areAllFaviconHeadersValid(results);
    
    console.log(report);
    
    if (allValid) {
      console.log('✅ Все favicon файлы настроены корректно!');
      process.exit(0);
    } else {
      console.log('❌ Обнаружены проблемы с настройкой favicon файлов.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке:', error.message);
    process.exit(1);
  }
}

main();