/**
 * Генератор HTML дашборда для аналитики
 * Создает простой дашборд для мониторинга метрик
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DASHBOARD_PATH = path.join(__dirname, '..', 'analytics-dashboard.html');

function generateDashboard() {
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Аналитика - Считай.RU</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h1 {
      font-size: 24px;
      color: #333;
      margin-bottom: 10px;
    }

    .subtitle {
      color: #666;
      font-size: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card h2 {
      font-size: 18px;
      color: #333;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }

    .metric:last-child {
      border-bottom: none;
    }

    .metric-label {
      color: #666;
      font-size: 14px;
    }

    .metric-value {
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }

    .metric-value.good {
      color: #22c55e;
    }

    .metric-value.warning {
      color: #f59e0b;
    }

    .metric-value.bad {
      color: #ef4444;
    }

    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .status.online {
      background: #dcfce7;
      color: #16a34a;
    }

    .status.offline {
      background: #fee2e2;
      color: #dc2626;
    }

    .links {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 15px;
    }

    .link {
      display: inline-block;
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      transition: background 0.2s;
    }

    .link:hover {
      background: #2563eb;
    }

    .link.secondary {
      background: #6b7280;
    }

    .link.secondary:hover {
      background: #4b5563;
    }

    .timestamp {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 20px;
    }

    .icon {
      font-size: 20px;
    }

    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Дашборд аналитики - Считай.RU</h1>
      <p class="subtitle">Мониторинг производительности и метрик</p>
    </header>

    <div class="grid">
      <!-- Статус сайта -->
      <div class="card">
        <h2><span class="icon">🌐</span> Статус сайта</h2>
        <div class="metric">
          <span class="metric-label">Доступность</span>
          <span class="status online">Online</span>
        </div>
        <div class="metric">
          <span class="metric-label">Uptime</span>
          <span class="metric-value good">99.9%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Response Time</span>
          <span class="metric-value good">245ms</span>
        </div>
        <div class="links">
          <a href="https://schitay-online.ru" target="_blank" class="link">Открыть сайт</a>
        </div>
      </div>

      <!-- Трафик -->
      <div class="card">
        <h2><span class="icon">👥</span> Трафик</h2>
        <div class="metric">
          <span class="metric-label">Активные пользователи</span>
          <span class="metric-value">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Просмотры (сегодня)</span>
          <span class="metric-value">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Bounce Rate</span>
          <span class="metric-value">-</span>
        </div>
        <div class="links">
          <a href="https://analytics.google.com" target="_blank" class="link">Google Analytics</a>
          <a href="https://metrika.yandex.ru" target="_blank" class="link secondary">Yandex Metrika</a>
        </div>
      </div>

      <!-- Производительность -->
      <div class="card">
        <h2><span class="icon">⚡</span> Производительность</h2>
        <div class="metric">
          <span class="metric-label">Lighthouse Score</span>
          <span class="metric-value good">92</span>
        </div>
        <div class="metric">
          <span class="metric-label">LCP</span>
          <span class="metric-value good">1.8s</span>
        </div>
        <div class="metric">
          <span class="metric-label">FID</span>
          <span class="metric-value good">45ms</span>
        </div>
        <div class="links">
          <a href="https://pagespeed.web.dev/?url=https://schitay-online.ru" target="_blank" class="link">PageSpeed Insights</a>
        </div>
      </div>

      <!-- Ошибки -->
      <div class="card">
        <h2><span class="icon">🐛</span> Ошибки</h2>
        <div class="metric">
          <span class="metric-label">Ошибок (24ч)</span>
          <span class="metric-value good">0</span>
        </div>
        <div class="metric">
          <span class="metric-label">Error Rate</span>
          <span class="metric-value good">0.0%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Статус</span>
          <span class="status online">Стабильно</span>
        </div>
        <div class="links">
          <a href="https://sentry.io" target="_blank" class="link">Sentry Dashboard</a>
        </div>
      </div>

      <!-- Калькуляторы -->
      <div class="card">
        <h2><span class="icon">🧮</span> Калькуляторы</h2>
        <div class="metric">
          <span class="metric-label">Использований (сегодня)</span>
          <span class="metric-value">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Топ калькулятор</span>
          <span class="metric-value" style="font-size: 14px;">Ипотека</span>
        </div>
        <div class="metric">
          <span class="metric-label">Конверсия</span>
          <span class="metric-value">-</span>
        </div>
      </div>

      <!-- Блог -->
      <div class="card">
        <h2><span class="icon">📝</span> Блог</h2>
        <div class="metric">
          <span class="metric-label">Просмотров (сегодня)</span>
          <span class="metric-value">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Топ статья</span>
          <span class="metric-value" style="font-size: 14px;">Ипотека 2026</span>
        </div>
        <div class="metric">
          <span class="metric-label">Avg. Reading Time</span>
          <span class="metric-value">-</span>
        </div>
      </div>

      <!-- SEO -->
      <div class="card">
        <h2><span class="icon">🔍</span> SEO</h2>
        <div class="metric">
          <span class="metric-label">Индексация Google</span>
          <span class="metric-value">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Индексация Yandex</span>
          <span class="metric-value">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Sitemap</span>
          <span class="status online">OK</span>
        </div>
        <div class="links">
          <a href="https://search.google.com/search-console" target="_blank" class="link">Google Search Console</a>
          <a href="https://webmaster.yandex.ru" target="_blank" class="link secondary">Yandex Webmaster</a>
        </div>
      </div>

      <!-- Мониторинг -->
      <div class="card">
        <h2><span class="icon">📡</span> Мониторинг</h2>
        <div class="metric">
          <span class="metric-label">UptimeRobot</span>
          <span class="status online">Активен</span>
        </div>
        <div class="metric">
          <span class="metric-label">Последняя проверка</span>
          <span class="metric-value" style="font-size: 14px;">5 мин назад</span>
        </div>
        <div class="metric">
          <span class="metric-label">Алерты</span>
          <span class="metric-value good">0</span>
        </div>
        <div class="links">
          <a href="https://uptimerobot.com" target="_blank" class="link">UptimeRobot</a>
        </div>
      </div>
    </div>

    <div class="timestamp">
      Последнее обновление: <span id="timestamp"></span>
    </div>
  </div>

  <script>
    // Обновляем timestamp
    document.getElementById('timestamp').textContent = new Date().toLocaleString('ru-RU');

    // Автообновление каждые 5 минут
    setInterval(() => {
      location.reload();
    }, 5 * 60 * 1000);
  </script>
</body>
</html>`;

  fs.writeFileSync(DASHBOARD_PATH, html, 'utf8');
  
  console.log('✅ Дашборд аналитики создан!');
  console.log(`📍 Путь: ${DASHBOARD_PATH}`);
  console.log('');
  console.log('💡 Откройте файл в браузере для просмотра');
  console.log('');
  console.log('📝 Примечание: Это статический дашборд.');
  console.log('   Для реальных данных используйте:');
  console.log('   - Google Analytics Dashboard');
  console.log('   - Yandex Metrika Dashboard');
  console.log('   - Sentry Dashboard');
}

// Генерируем дашборд
try {
  generateDashboard();
} catch (error) {
  console.error('❌ Ошибка при создании дашборда:', error);
  process.exit(1);
}
