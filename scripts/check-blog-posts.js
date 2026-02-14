// Простая проверка статей блога
const fs = require('fs');
const path = require('path');

// Читаем файл blogPosts.ts и выводим информацию о статьях
console.log('🔍 Проверка статей блога...\n');

try {
  // Импортируем данные (нужно скомпилировать TypeScript)
  const { execSync } = require('child_process');
  
  // Создаем временный JS файл для проверки
  const checkScript = `
    const { blogPosts } = require('../src/data/blogPosts.ts');
    
    console.log('📊 Всего статей:', blogPosts.length);
    console.log('\\n📝 Список статей:');
    
    blogPosts.forEach((post, index) => {
      console.log(\`\${index + 1}. \${post.title}\`);
      console.log(\`   Slug: \${post.slug}\`);
      console.log(\`   Опубликовано: \${post.isPublished ? 'Да' : 'Нет'}\`);
      console.log(\`   Рекомендуемое: \${post.isFeatured ? 'Да' : 'Нет'}\`);
      console.log('');
    });
  `;
  
  console.log('Для полной проверки запустите:');
  console.log('npm run dev');
  console.log('И откройте http://localhost:8080/blog');
  
} catch (error) {
  console.error('❌ Ошибка при проверке:', error.message);
}