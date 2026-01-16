import { defineConfig, devices } from '@playwright/test';

/**
 * Конфигурация Playwright для E2E тестирования блога
 * Поддержка кросс-браузерного и мобильного тестирования
 */
export default defineConfig({
  testDir: './e2e',
  
  // Максимальное время выполнения одного теста
  timeout: 30 * 1000,
  
  // Ожидание для expect
  expect: {
    timeout: 5000
  },
  
  // Запускать тесты последовательно в CI
  fullyParallel: !process.env.CI,
  
  // Не запускать тесты повторно при ошибке
  forbidOnly: !!process.env.CI,
  
  // Количество повторов при ошибке
  retries: process.env.CI ? 2 : 0,
  
  // Количество параллельных воркеров
  workers: process.env.CI ? 1 : undefined,
  
  // Репортеры
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Общие настройки для всех проектов
  use: {
    // Базовый URL приложения
    baseURL: 'http://localhost:5173',
    
    // Трейсинг при ошибках
    trace: 'on-first-retry',
    
    // Скриншоты при ошибках
    screenshot: 'only-on-failure',
    
    // Видео при ошибках
    video: 'retain-on-failure',
  },

  // Конфигурация проектов для разных браузеров и устройств
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge'
      },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Веб-сервер для разработки
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
