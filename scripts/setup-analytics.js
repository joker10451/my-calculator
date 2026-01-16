/**
 * Скрипт для настройки аналитики
 * Помогает настроить Google Analytics и Yandex Metrika
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE_FILE = path.join(__dirname, '..', '.env.example');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function setupAnalytics() {
  console.log('🔧 Настройка аналитики для Считай.RU');
  console.log('');
  console.log('Этот скрипт поможет настроить:');
  console.log('  - Google Analytics 4');
  console.log('  - Yandex Metrika');
  console.log('  - Sentry (опционально)');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Читаем существующий .env если есть
  let envContent = '';
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf8');
    console.log('✅ Найден существующий .env файл');
  } else {
    console.log('📝 Создается новый .env файл');
  }
  console.log('');

  // Google Analytics
  console.log('📊 Google Analytics 4');
  console.log('');
  console.log('Для получения Measurement ID:');
  console.log('1. Зайдите в Google Analytics (analytics.google.com)');
  console.log('2. Admin → Data Streams');
  console.log('3. Скопируйте Measurement ID (формат: G-XXXXXXXXXX)');
  console.log('');

  const gaId = await question('Введите Google Analytics Measurement ID (или Enter для пропуска): ');
  
  if (gaId && gaId.trim()) {
    if (gaId.startsWith('G-')) {
      envContent = updateEnvVariable(envContent, 'VITE_GA_MEASUREMENT_ID', gaId.trim());
      console.log('✅ Google Analytics ID сохранен');
    } else {
      console.log('⚠️  Неверный формат ID. Должен начинаться с G-');
    }
  } else {
    console.log('⏭️  Google Analytics пропущен');
  }
  console.log('');

  // Yandex Metrika
  console.log('📈 Yandex Metrika');
  console.log('');
  console.log('Для получения ID счетчика:');
  console.log('1. Зайдите в Yandex Metrika (metrika.yandex.ru)');
  console.log('2. Добавить счетчик');
  console.log('3. Скопируйте ID счетчика (формат: 12345678)');
  console.log('');

  const ymId = await question('Введите Yandex Metrika ID (или Enter для пропуска): ');
  
  if (ymId && ymId.trim()) {
    if (/^\d+$/.test(ymId.trim())) {
      envContent = updateEnvVariable(envContent, 'VITE_YANDEX_METRIKA_ID', ymId.trim());
      console.log('✅ Yandex Metrika ID сохранен');
    } else {
      console.log('⚠️  Неверный формат ID. Должен содержать только цифры');
    }
  } else {
    console.log('⏭️  Yandex Metrika пропущен');
  }
  console.log('');

  // Sentry
  console.log('🐛 Sentry (мониторинг ошибок)');
  console.log('');
  console.log('Для получения DSN:');
  console.log('1. Зайдите в Sentry (sentry.io)');
  console.log('2. Create Project → React');
  console.log('3. Скопируйте DSN');
  console.log('');

  const sentryDsn = await question('Введите Sentry DSN (или Enter для пропуска): ');
  
  if (sentryDsn && sentryDsn.trim()) {
    if (sentryDsn.includes('sentry.io')) {
      envContent = updateEnvVariable(envContent, 'VITE_SENTRY_DSN', sentryDsn.trim());
      console.log('✅ Sentry DSN сохранен');
    } else {
      console.log('⚠️  Неверный формат DSN');
    }
  } else {
    console.log('⏭️  Sentry пропущен');
  }
  console.log('');

  // Production URL
  console.log('🌐 Production URL');
  console.log('');
  
  const prodUrl = await question('Введите Production URL (по умолчанию: https://schitay-online.ru): ');
  
  const finalProdUrl = prodUrl.trim() || 'https://schitay-online.ru';
  envContent = updateEnvVariable(envContent, 'PRODUCTION_URL', finalProdUrl);
  console.log(`✅ Production URL: ${finalProdUrl}`);
  console.log('');

  // Сохраняем .env
  fs.writeFileSync(ENV_FILE, envContent, 'utf8');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✅ Настройка завершена!');
  console.log(`📁 Файл сохранен: ${ENV_FILE}`);
  console.log('');
  console.log('📋 Следующие шаги:');
  console.log('');
  console.log('1. Проверьте .env файл');
  console.log('2. Пересоберите проект: npm run build');
  console.log('3. Задеплойте на production');
  console.log('4. Проверьте работу аналитики в консоли браузера');
  console.log('');
  console.log('💡 Полезные ссылки:');
  console.log('   Google Analytics: https://analytics.google.com');
  console.log('   Yandex Metrika: https://metrika.yandex.ru');
  console.log('   Sentry: https://sentry.io');
  console.log('');

  // Создаем .env.example если его нет
  if (!fs.existsSync(ENV_EXAMPLE_FILE)) {
    const exampleContent = `# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Yandex Metrika
VITE_YANDEX_METRIKA_ID=12345678

# Sentry (опционально)
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Production URL
PRODUCTION_URL=https://schitay-online.ru
`;
    fs.writeFileSync(ENV_EXAMPLE_FILE, exampleContent, 'utf8');
    console.log('📝 Создан .env.example файл');
    console.log('');
  }

  rl.close();
}

function updateEnvVariable(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  
  if (regex.test(content)) {
    // Обновляем существующую переменную
    return content.replace(regex, `${key}=${value}`);
  } else {
    // Добавляем новую переменную
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
    return content + `${key}=${value}\n`;
  }
}

// Запускаем настройку
setupAnalytics().catch((error) => {
  console.error('❌ Ошибка:', error);
  rl.close();
  process.exit(1);
});
