#!/usr/bin/env node

/**
 * Генерирует копии index.html для каждого маршрута
 * Это решает проблему 404 на GitHub Pages для SPA
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Список всех маршрутов из sitemap.xml
const routes = [
  '/all',
  '/calculator/mortgage',
  '/calculator/salary',
  '/calculator/credit',
  '/calculator/bmi',
  '/calculator/fuel',
  '/calculator/utilities',
  '/calculator/maternity-capital',
  '/calculator/calories',
  '/calculator/water',
  '/calculator/alimony',
  '/calculator/refinancing',
  '/calculator/deposit',
  '/calculator/currency',
  '/calculator/court-fee',
  '/calculator/tire-size',
  '/about',
  '/privacy',
  '/terms',
  '/contacts',
  '/legal',
  '/blog',
  '/category/financial',
  '/category/personal',
  '/category/transport',
  '/category/utilities',
  '/category/legal'
];

const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

console.log('🚀 Generating SPA fallback files for GitHub Pages...\n');

// Проверяем что dist существует
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist directory not found. Run build first.');
  process.exit(1);
}

// Проверяем что index.html существует
if (!fs.existsSync(indexPath)) {
  console.error('❌ Error: index.html not found in dist directory.');
  process.exit(1);
}

// Читаем содержимое index.html
const indexContent = fs.readFileSync(indexPath, 'utf8');

let successCount = 0;
let errorCount = 0;

// Создаем копии index.html для каждого маршрута
routes.forEach(route => {
  try {
    // Убираем начальный слеш и создаем путь к директории
    const routePath = route.slice(1);
    const targetDir = path.join(distDir, routePath);
    const targetFile = path.join(targetDir, 'index.html');
    
    // Создаем директорию если не существует
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Копируем index.html
    fs.writeFileSync(targetFile, indexContent);
    
    console.log(`✅ Created: ${route}/index.html`);
    successCount++;
  } catch (error) {
    console.error(`❌ Error creating ${route}/index.html:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Success: ${successCount} files`);
if (errorCount > 0) {
  console.log(`   ❌ Errors: ${errorCount} files`);
}
console.log(`\n✨ Done! Your SPA is now ready for GitHub Pages.`);
