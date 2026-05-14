# Руководство по реферальной системе

## Обзор

Реферальная система позволяет отслеживать клики по партнерским ссылкам и потенциальный доход от рекомендаций банковских продуктов.

## Компоненты системы

### 1. Конфигурация партнерских ссылок

**Файл:** `src/config/affiliateLinks.ts`

Здесь хранятся все партнерские ссылки для банковских продуктов.

```typescript
export const AFFILIATE_LINKS: Record<string, AffiliateLink> = {
  'sberbank-mortgage': {
    url: 'https://www.sberbank.ru/ru/person/credits/home/buying_complete_house?utm_source=schitay&utm_medium=referral&utm_campaign=mortgage',
    bankId: 'sberbank',
    productType: 'mortgage',
    commission: 3000,
    description: 'Ипотека Сбербанк'
  },
  // Добавьте свои ссылки здесь
};
```

**Как добавить новую ссылку:**

1. Откройте `src/config/affiliateLinks.ts`
2. Добавьте новую запись в объект `AFFILIATE_LINKS`
3. Используйте формат ключа: `'bankId-productType'` или просто `'bankId'` для общей ссылки

### 2. Система трекинга

**Файл:** `src/lib/analytics/referralTracking.ts`

Автоматически отслеживает клики и сохраняет их в localStorage.

**Основные функции:**

- `ReferralTracker.trackClick()` - отслеживание клика
- `ReferralTracker.trackConversion()` - отслеживание конверсии
- `ReferralTracker.getClickStatistics()` - получение статистики
- `ReferralTracker.getPotentialRevenue()` - расчет потенциального дохода

**Интеграция с аналитикой:**

Система автоматически отправляет события в:
- Yandex Metrika (если настроена)
- Google Analytics (если настроена)

### 3. React компоненты

**Файл:** `src/components/ReferralButton.tsx`

#### ReferralButton

Основная кнопка для оформления продукта.

```tsx
import { ReferralButton } from '@/components/ReferralButton';

<ReferralButton
  product={mortgageProduct}
  source="calculator"
  variant="default"
  size="lg"
  showCommission={true}
/>
```

**Параметры:**

- `product` - объект продукта (BankProduct)
- `source` - источник клика: 'calculator' | 'comparison' | 'recommendation' | 'blog'
- `userId` - ID пользователя (опционально)
- `variant` - стиль кнопки: 'default' | 'outline' | 'secondary' | 'ghost'
- `size` - размер: 'default' | 'sm' | 'lg' | 'icon'
- `showIcon` - показывать иконку внешней ссылки
- `showCommission` - показывать процент комиссии
- `children` - кастомный текст кнопки

#### ReferralIconButton

Компактная кнопка с иконкой.

```tsx
<ReferralIconButton
  product={product}
  source="recommendation"
/>
```

#### ReferralLink

Текстовая ссылка с трекингом.

```tsx
<ReferralLink
  product={product}
  source="calculator"
>
  Подробнее на сайте банка
</ReferralLink>
```

## Примеры использования

### Пример 1: Интеграция в калькулятор ипотеки

```tsx
import { ReferralButton } from '@/components/ReferralButton';

function MortgageCalculator() {
  // ... расчеты ...

  const recommendedProduct: BankProduct = {
    id: 'sber-mortgage-family',
    bank_id: 'sberbank',
    product_type: 'mortgage',
    name: 'Семейная ипотека',
    interest_rate: 6.0,
    bank: {
      id: 'sberbank',
      name: 'Сбербанк',
      short_name: 'Сбербанк',
      is_partner: true,
      commission_rate: 0.5,
      website_url: 'https://www.sberbank.ru'
    }
  };

  return (
    <div>
      {/* Результаты расчета */}
      <div className="results">
        <p>Ежемесячный платеж: {monthlyPayment}</p>
        
        {/* Кнопка оформления */}
        <ReferralButton
          product={recommendedProduct}
          source="calculator"
          variant="default"
          size="lg"
          className="w-full mt-4"
        >
          Оформить в {recommendedProduct.bank?.short_name}
        </ReferralButton>
      </div>
    </div>
  );
}
```

### Пример 2: Список рекомендаций

```tsx
function RecommendationsList({ products }: { products: BankProduct[] }) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="card">
          <h3>{product.name}</h3>
          <p>Ставка: {product.interest_rate}%</p>
          
          <ReferralButton
            product={product}
            source="recommendation"
            variant="outline"
            showCommission={true}
          />
        </div>
      ))}
    </div>
  );
}
```

### Пример 3: Интеграция с MatchingAlgorithm

```tsx
import { MatchingAlgorithm } from '@/lib/comparison/MatchingAlgorithm';
import { ReferralButton } from '@/components/ReferralButton';

function OptimalSolution() {
  const algorithm = new MatchingAlgorithm(products, banks);
  const result = algorithm.findOptimalProducts(requirements);

  return (
    <div>
      <h2>Лучшее предложение</h2>
      <div className="card">
        <h3>{result.primary.product.name}</h3>
        <p>Оценка: {result.primary.score} баллов</p>
        
        <ReferralButton
          product={result.primary.product}
          source="recommendation"
          variant="default"
          size="lg"
          className="w-full"
        />
      </div>

      <h3>Альтернативы</h3>
      {result.alternatives.map((alt) => (
        <div key={alt.product.id} className="card">
          <h4>{alt.product.name}</h4>
          <ReferralButton
            product={alt.product}
            source="recommendation"
            variant="outline"
          />
        </div>
      ))}
    </div>
  );
}
```

## Панель администратора

**Файл:** `src/components/admin/ReferralDashboard.tsx`

Панель для просмотра статистики кликов и потенциального дохода.

**Использование:**

```tsx
import { ReferralDashboard } from '@/components/admin/ReferralDashboard';

function AdminPage() {
  return <ReferralDashboard />;
}
```

**Возможности:**

- Просмотр общего количества кликов
- Расчет потенциального дохода
- Графики по банкам и типам продуктов
- Источники трафика
- История последних кликов
- Очистка старых событий (>90 дней)

## Хранение данных

Все события сохраняются в localStorage браузера:

- `referral_clicks` - клики по ссылкам
- `referral_conversions` - конверсии (оформления)

**Ограничения:**

- Хранятся последние 1000 кликов
- Автоматическая очистка событий старше 90 дней

## Интеграция с аналитикой

### Yandex Metrika

События автоматически отправляются в Yandex Metrika:

```javascript
ym(COUNTER_ID, 'reachGoal', 'referral_click', {
  productId: 'sber-mortgage-family',
  bankId: 'sberbank',
  productType: 'mortgage',
  source: 'calculator'
});
```

### Google Analytics

```javascript
gtag('event', 'referral_click', {
  productId: 'sber-mortgage-family',
  bankId: 'sberbank',
  productType: 'mortgage',
  source: 'calculator'
});
```

## Серверная интеграция (опционально)

Для сохранения событий на сервере раскомментируйте код в `referralTracking.ts`:

```typescript
private static sendToAnalytics(eventName: string, data: any): void {
  // Отправка на сервер
  fetch('/api/analytics/referral', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: eventName, data })
  });
}
```

Создайте API endpoint `/api/analytics/referral` для обработки событий.

## Типы данных

### BankProduct

```typescript
interface BankProduct {
  id: string;
  bank_id: string;
  product_type: string;
  name: string;
  interest_rate: number;
  bank?: {
    id: string;
    name: string;
    short_name: string;
    is_partner: boolean;
    commission_rate?: number;
    website_url?: string;
  };
}
```

### ReferralClickEvent

```typescript
interface ReferralClickEvent {
  productId: string;
  bankId: string;
  productType: string;
  referralLink: string;
  userId?: string;
  source: 'calculator' | 'comparison' | 'recommendation' | 'blog';
  timestamp: Date;
}
```

## Следующие шаги

1. **Добавьте реальные партнерские ссылки** в `src/config/affiliateLinks.ts`
2. **Интегрируйте кнопки в калькуляторы** (MortgageCalculator, DepositCalculator, CreditCalculator)
3. **Настройте аналитику** (Yandex Metrika, Google Analytics)
4. **Создайте страницу администратора** для просмотра статистики
5. **Опционально: создайте серверный API** для сохранения событий в базу данных

## Примеры файлов

Полные примеры использования смотрите в:
- `src/components/examples/ReferralButtonExample.tsx` - различные варианты интеграции
- `src/components/admin/ReferralDashboard.tsx` - панель администратора

## Поддержка

При возникновении вопросов обращайтесь к документации или проверьте примеры использования в папке `src/components/examples/`.
