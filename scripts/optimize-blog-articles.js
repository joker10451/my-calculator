/**
 * Скрипт для оптимизации существующих статей блога
 * Проверяет и улучшает SEO метаданные, structured data, изображения
 */

import { blogPosts } from '../src/data/blogPosts.ts';
import { validateArticle } from '../src/utils/blogOptimizer.ts';

console.log('🔍 Проверка статей блога...\n');

let totalArticles = 0;
let validArticles = 0;
let articlesWithWarnings = 0;
let articlesWithErrors = 0;

blogPosts.forEach((article, index) => {
  totalArticles++;
  const validation = validateArticle(article);
  
  if (validation.isValid && validation.warnings.length === 0) {
    validArticles++;
    console.log(`✅ ${index + 1}. "${article.title}" - OK`);
  } else if (validation.isValid && validation.warnings.length > 0) {
    articlesWithWarnings++;
    console.log(`⚠️  ${index + 1}. "${article.title}" - Warnings:`);
    validation.warnings.forEach(w => console.log(`   - ${w}`));
  } else {
    articlesWithErrors++;
    console.log(`❌ ${index + 1}. "${article.title}" - Errors:`);
    validation.errors.forEach(e => console.log(`   - ${e}`));
    if (validation.warnings.length > 0) {
      console.log(`   Warnings:`);
      validation.warnings.forEach(w => console.log(`   - ${w}`));
    }
  }
  console.log('');
});

console.log('\n📊 Статистика:');
console.log(`Всего статей: ${totalArticles}`);
console.log(`✅ Без проблем: ${validArticles}`);
console.log(`⚠️  С предупреждениями: ${articlesWithWarnings}`);
console.log(`❌ С ошибками: ${articlesWithErrors}`);

if (articlesWithErrors > 0) {
  console.log('\n⚠️  Найдены ошибки! Исправьте их перед публикацией.');
  process.exit(1);
} else if (articlesWithWarnings > 0) {
  console.log('\n✅ Все статьи валидны, но есть предупреждения.');
  process.exit(0);
} else {
  console.log('\n✅ Все статьи в отличном состоянии!');
  process.exit(0);
}
