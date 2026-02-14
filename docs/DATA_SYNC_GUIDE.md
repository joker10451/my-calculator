# Руководство по автоматической синхронизации данных

## Обзор

Система автоматической синхронизации данных обеспечивает актуальность информации о банковских продуктах путем интеграции с официальными API банков и другими источниками данных.

## Архитектура

### Компоненты системы

1. **DataSyncManager** - основной менеджер синхронизации
2. **DataSource** - источники данных (API банков, ЦБ РФ, партнерские API)
3. **BankApiConfig** - конфигурация для каждого банковского API
4. **Conflict Resolution** - система разрешения конфликтов данных

### Приоритеты источников данных

Система использует следующие приоритеты (от высшего к низшему):

1. **Официальные API банков** (приоритет 1) - наивысший приоритет
2. **API Центрального банка РФ** (приоритет 2)
3. **Партнерские API** (приоритет 3)
4. **Ручные обновления** (приоритет 4)
5. **Кэшированные данные** (приоритет 5) - низший приоритет

При конфликтах данных всегда используются данные из источника с более высоким приоритетом (Requirement 6.8).

## Настройка

### 1. Добавление API ключей

Создайте файл `.env.local` в корне проекта:

```env
# Сбербанк API
VITE_SBERBANK_API_KEY=your_sberbank_api_key

# ВТБ API
VITE_VTB_API_TOKEN=your_vtb_api_token

# Альфа-Банк API
VITE_ALFABANK_API_KEY=your_alfabank_api_key

# Тинькофф API
VITE_TINKOFF_API_TOKEN=your_tinkoff_api_token
```

### 2. Инициализация при старте приложения

В файле `src/main.tsx` добавьте инициализацию:

```typescript
import { initializeBankApis } from './lib/database/initBankApis';

// Инициализируем банковские API
initializeBankApis();
```

### 3. Настройка конфигурации банковского API

Пример конфигурации в `src/lib/database/bankApiExamples.ts`:

```typescript
export const customBankApiConfig: BankApiConfig = {
  bank_id: 'custom_bank',
  bank_name: 'Название банка',
  api_url: 'https://api.bank.ru/v1',
  api_type: BankApiType.REST,
  endpoints: {
    products: '/products',
    rates: '/rates'
  },
  auth: {
    type: 'api_key',
    key: process.env.VITE_CUSTOM_BANK_API_KEY || ''
  },
  mapping: {
    name: 'product_name',
    product_type: 'type',
    interest_rate: 'rate',
    min_amount: 'min_sum',
    max_amount: 'max_sum',
    // ... другие поля
  }
};
```

## Использование

### В React компонентах

```typescript
import { useDataSync } from '../hooks/useDataSync';

function MyComponent() {
  const { 
    isSyncing, 
    lastSync, 
    dataFreshness, 
    syncNow 
  } = useDataSync();

  return (
    <div>
      <p>Статус: {isSyncing ? 'Синхронизация...' : 'Готово'}</p>
      <p>Свежесть: {dataFreshness}</p>
      <p>Последняя синхронизация: {lastSync}</p>
      <button onClick={syncNow}>Синхронизировать</button>
    </div>
  );
}
```

### Автоматическая синхронизация

```typescript
import { useAutoSync } from '../hooks/useDataSync';

function MyComponent() {
  // Автоматически синхронизирует при устаревших данных
  const syncHook = useAutoSync(true);
  
  // Компонент автоматически обновится после синхронизации
}
```

### Программное управление

```typescript
import { dataSyncManager } from '../lib/database/dataSync';

// Запустить синхронизацию вручную
const results = await dataSyncManager.syncAll();

// Проверить свежесть данных
const freshness = await dataSyncManager.checkDataFreshness();

// Получить статус
const status = dataSyncManager.getSyncStatus();

// Добавить новый источник данных
dataSyncManager.addSource({
  id: 'custom_source',
  name: 'Мой источник',
  priority: DataSourcePriority.PARTNER_API,
  api_type: BankApiType.REST,
  url: 'https://api.example.com',
  is_active: true,
  sync_interval: 60,
  timeout: 10000
});
```

## Маппинг данных

Система поддерживает гибкий маппинг полей из внешних API на внутреннюю модель данных.

### Простой маппинг

```typescript
mapping: {
  name: 'product_name',           // Прямое соответствие
  interest_rate: 'rate'
}
```

### Вложенный маппинг

```typescript
mapping: {
  interest_rate: 'data.rate.value',  // Вложенные поля через точку
  min_amount: 'limits.amount.min'
}
```

### Маппинг объектов

```typescript
mapping: {
  fees: {
    application: 'fees.application_fee',
    monthly: 'fees.monthly_service'
  },
  requirements: {
    min_income: 'conditions.income.minimum',
    min_age: 'conditions.age.from'
  }
}
```

## Разрешение конфликтов

Система автоматически разрешает конфликты данных из разных источников:

### Стратегии разрешения

1. **По приоритету** (по умолчанию) - используются данные из источника с наивысшим приоритетом
2. **По времени** - используются самые свежие данные
3. **Ручное** - требует вмешательства администратора

### Пример конфликта

Если процентная ставка по продукту различается в разных источниках:

- Официальный API банка: 12.5%
- Партнерский API: 12.8%
- Ручное обновление: 12.0%

Система выберет **12.5%** из официального API банка (наивысший приоритет).

## Мониторинг

### Компонент статуса синхронизации

Добавьте в админ-панель:

```typescript
import { DataSyncStatus } from '../components/admin/DataSyncStatus';

function AdminPanel() {
  return (
    <div>
      <DataSyncStatus />
      {/* Другие компоненты */}
    </div>
  );
}
```

### Проверка доступности API

```typescript
import { testBankApis } from '../lib/database/initBankApis';

const results = await testBankApis();
console.log(`Доступно: ${results.available}/${results.total}`);
console.log('Результаты:', results.results);
```

## Свежесть данных

Система отслеживает свежесть данных:

- **fresh** (свежие) - обновлены менее 12 часов назад
- **stale** (устаревающие) - обновлены 12-24 часа назад
- **outdated** (устаревшие) - обновлены более 24 часов назад

## Автоматическое поведение

### При загрузке страницы

1. Проверяется свежесть данных
2. Если данные устарели - запускается синхронизация
3. Запускается автоматическая синхронизация по расписанию

### При возвращении на вкладку

1. Проверяется свежесть данных
2. Если данные устарели или устаревают - запускается синхронизация

### Периодическая синхронизация

- Проверка каждую минуту
- Синхронизация источников по их индивидуальному расписанию
- Официальные API банков: каждые 2 часа
- API ЦБ РФ: каждый час
- Партнерские API: каждые 30 минут

## Обработка ошибок

### Таймауты

Каждый источник имеет настраиваемый таймаут (по умолчанию 10-15 секунд).

### Повторные попытки

При ошибке синхронизация продолжается для других источников.

### Логирование

Все ошибки логируются и доступны через `syncStatus.errors`.

## Производительность

### Оптимизация

- Синхронизация выполняется только для активных источников
- Используется проверка изменений перед обновлением
- Деактивация продуктов, отсутствующих в API
- Кэширование статуса в localStorage

### Ограничения

- Максимум 1 синхронизация одновременно
- Таймауты для предотвращения зависания
- Rate limiting для API (настраивается в конфигурации)

## Безопасность

### API ключи

- Хранятся в переменных окружения
- Не попадают в клиентский код (используйте `VITE_` префикс)
- Передаются через заголовки запросов

### CORS

Для обхода CORS можно использовать:

1. Прокси-сервер (рекомендуется для production)
2. CORS Anywhere (только для разработки)
3. Настройка CORS на стороне API банка

## Требования

Реализация соответствует следующим требованиям из спецификации:

- **Requirement 6.5**: Автоматическая синхронизация при наличии API доступа
- **Requirement 6.8**: Приоритизация официальных источников банков при конфликтах

## Примеры использования

### Пример 1: Добавление нового банка

```typescript
import { dataSyncManager } from './lib/database/dataSync';

const newBankConfig: BankApiConfig = {
  bank_id: 'new_bank',
  bank_name: 'Новый Банк',
  api_url: 'https://api.newbank.ru',
  api_type: BankApiType.REST,
  endpoints: { products: '/products' },
  auth: { type: 'api_key', key: 'your_key' },
  mapping: { /* ... */ }
};

dataSyncManager.addBankApi(newBankConfig);
```

### Пример 2: Мониторинг синхронизации

```typescript
import { getDataSourcesStats } from './lib/database/initBankApis';

const stats = getDataSourcesStats();
console.log('Активных источников:', stats.active_sources);
console.log('Последняя синхронизация:', stats.last_sync);
```

### Пример 3: Ручная синхронизация конкретного банка

```typescript
// Получаем источник для конкретного банка
const source = dataSyncManager.getSources()
  .find(s => s.id === 'bank_api_sberbank');

if (source && dataSyncManager.shouldSync(source)) {
  await dataSyncManager.syncAll();
}
```

## Troubleshooting

### Синхронизация не запускается

1. Проверьте наличие API ключей в `.env.local`
2. Убедитесь, что источники активны
3. Проверьте консоль на ошибки

### Данные не обновляются

1. Проверьте маппинг полей в конфигурации
2. Убедитесь, что API возвращает корректные данные
3. Проверьте логи ошибок в `syncStatus.errors`

### Конфликты данных

1. Проверьте приоритеты источников
2. Убедитесь, что официальные API настроены правильно
3. При необходимости используйте ручное разрешение конфликтов

## Дальнейшее развитие

Планируемые улучшения:

- [ ] Webhook поддержка для мгновенных обновлений
- [ ] Дифференциальная синхронизация (только изменения)
- [ ] Расширенная аналитика синхронизации
- [ ] UI для управления конфликтами
- [ ] Поддержка GraphQL API
- [ ] Batch операции для оптимизации
