/**
 * Скрипт для обновления ссылок на изображения в blogPosts
 * Заменяет .jpg на .svg там где SVG файлы существуют
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../src/data');
const blogImagesDir = path.join(__dirname, '../public/blog');

// Получить все файлы blogPosts*.ts
const blogPostFiles = fs.readdirSync(dataDir)
  .filter(file => file.startsWith('blogPosts') && file.endsWith('.ts'))
  .map(file => path.join(dataDir, file));

// Также добавляем blogArticlesGenerated*.ts
const generatedFiles = fs.readdirSync(dataDir)
  .filter(file => file.startsWith('blogArticlesGenerated') && file.endsWith('.ts'))
  .map(file => path.join(dataDir, file));

const allFiles = [...blogPostFiles, ...generatedFiles];

console.log('📁 Файлов для обработки:', allFiles.length);
console.log('📋 Файлы:', allFiles.map(f => path.basename(f)).join(', '));

// Получить список всех SVG файлов
const svgFiles = fs.readdirSync(blogImagesDir)
  .filter(file => file.endsWith('.svg'))
  .map(file => file.replace('.svg', ''));

console.log('📁 Найдено SVG файлов:', svgFiles.length);
console.log('📋 SVG файлы:', svgFiles.join(', '));
console.log('');

// Обрабатываем каждый файл
let totalReplacements = 0;

allFiles.forEach(filePath => {
  const fileName = path.basename(filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;
  
  // Для каждого SVG файла заменяем .jpg на .svg
  svgFiles.forEach(baseName => {
    const jpgPattern = new RegExp(`/blog/${baseName}\\.jpg`, 'g');
    const svgReplacement = `/blog/${baseName}.svg`;
    
    const matches = content.match(jpgPattern);
    if (matches) {
      content = content.replace(jpgPattern, svgReplacement);
      fileReplacements += matches.length;
      console.log(`  ✓ ${fileName}: ${baseName}.jpg → ${baseName}.svg (${matches.length} раз)`);
    }
  });
  
  // Сохраняем обновленный файл если были изменения
  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalReplacements += fileReplacements;
  }
});

if (totalReplacements > 0) {
  console.log(`\n✅ Успешно обновлено ${totalReplacements} ссылок на изображения в ${allFiles.length} файлах`);
} else {
  console.log('\n⚠️  Не найдено ссылок для замены');
}
