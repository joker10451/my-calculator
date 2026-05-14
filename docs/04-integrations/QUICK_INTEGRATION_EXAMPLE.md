# Быстрая интеграция реферальной кнопки в калькулятор

## Пример: Добавление кнопки в MortgageCalculator

### Шаг 1: Импортируйте компонент

В начале файла `src/components/calculators/MortgageCalculator.tsx` добавьте импорт:

```tsx
import { ReferralButton } from "@/components/ReferralButton";
import type { BankProduct } from "@/types/bank";
```

### Шаг 2: Создайте данные продукта

Добавьте внутри компонента (после расчетов):

```tsx
const MortgageCalculator = () => {
  // ... существующий код ...
  
  const calculations = useMemo(() => {
    // ... расчеты ...
  }, [price, initialPayment, isInitialPercent, term, rate, withMatCapital, paymentType, extraPayments]);

  // ДОБАВЬТЕ ЭТО:
  // Рекомендуемый продукт (в будущем можно получать из MatchingAlgorithm)
  const recommendedProduct: BankProduct = {
    id: 'sber-mortgage-family',
    bank_id: 'sberbank',
    product_type: 'mortgage',
    name: 'Семейная ипотека',
    interest_rate: rate, // используем текущую ставку из калькулятора
    bank: {
      id: 'sberbank',
      name: 'Сбербанк',
      short_name: 'Сбербанк',
      is_partner: true,
      commission_rate: 0.5,
      website_url: 'https://www.sberbank.ru',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  // ... остальной код ...
```

### Шаг 3: Добавьте кнопку в результаты

Найдите секцию с кнопками (около строки 450-460) и добавьте кнопку оформления:

```tsx
<div className="space-y-3 pt-6 border-t border-primary/10">
  {/* ДОБАВЬТЕ ЭТУ КНОПКУ ПЕРВОЙ: */}
  <ReferralButton
    product={recommendedProduct}
    source="calculator"
    variant="default"
    size="lg"
    className="w-full gap-2 py-6 text-lg"
    showIcon={true}
  >
    Оформить ипотеку в {recommendedProduct.bank?.short_name}
  </ReferralButton>

  {/* Существующие кнопки: */}
  <Button className="w-full gap-2 py-6 text-lg" variant="hero" onClick={handleDownload}>
    <Download className="w-6 h-6" />
    Скачать отчет
  </Button>
  <div className="grid grid-cols-2 gap-2">
    <Button variant="outline" className="gap-2" onClick={handleShare}>
      <Share2 className="w-4 h-4" />
      Поделиться
    </Button>
    <Button variant="secondary" className="gap-2" onClick={handleCompare}>
      <Scale className="w-4 h-4" />
      К сравнению
    </Button>
  </div>
</div>
```

### Готово! 🎉

Теперь в калькуляторе ипотеки появится кнопка "Оформить ипотеку в Сбербанк", которая:
- Автоматически отслеживает клики
- Открывает партнерскую ссылку в новой вкладке
- Отправляет события в Yandex Metrika
- Сохраняет статистику в localStorage

## Аналогично для других калькуляторов

### DepositCalculator

```tsx
const depositProduct: BankProduct = {
  id: 'sber-deposit-save',
  bank_id: 'sberbank',
  product_type: 'deposit',
  name: 'Сохраняй',
  interest_rate: rate,
  bank: {
    id: 'sberbank',
    name: 'Сбербанк',
    short_name: 'Сбербанк',
    is_partner: true,
    commission_rate: 0.1,
    website_url: 'https://www.sberbank.ru',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

// В результатах:
<ReferralButton
  product={depositProduct}
  source="calculator"
  variant="default"
  size="lg"
  className="w-full"
>
  Открыть вклад в {depositProduct.bank?.short_name}
</ReferralButton>
```

### CreditCalculator

```tsx
const creditProduct: BankProduct = {
  id: 'sber-credit-consumer',
  bank_id: 'sberbank',
  product_type: 'credit',
  name: 'Потребительский кредит',
  interest_rate: rate,
  bank: {
    id: 'sberbank',
    name: 'Сбербанк',
    short_name: 'Сбербанк',
    is_partner: true,
    commission_rate: 0.3,
    website_url: 'https://www.sberbank.ru',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

// В результатах:
<ReferralButton
  product={creditProduct}
  source="calculator"
  variant="default"
  size="lg"
  className="w-full"
>
  Оформить кредит в {creditProduct.bank?.short_name}
</ReferralButton>
```

## Варианты кнопок

### Вариант 1: Основная кнопка (рекомендуется)
```tsx
<ReferralButton
  product={product}
  source="calculator"
  variant="default"
  size="lg"
  className="w-full"
/>
```

### Вариант 2: С отображением комиссии
```tsx
<ReferralButton
  product={product}
  source="calculator"
  variant="default"
  size="lg"
  showCommission={true}
/>
```

### Вариант 3: Компактная кнопка
```tsx
<ReferralButton
  product={product}
  source="calculator"
  variant="outline"
  size="sm"
/>
```

### Вариант 4: Только иконка
```tsx
import { ReferralIconButton } from "@/components/ReferralButton";

<ReferralIconButton
  product={product}
  source="calculator"
/>
```

### Вариант 5: Текстовая ссылка
```tsx
import { ReferralLink } from "@/components/ReferralButton";

<ReferralLink
  product={product}
  source="calculator"
>
  Подробнее на сайте банка
</ReferralLink>
```

## Проверка работы

1. Откройте калькулятор в браузере
2. Нажмите на кнопку оформления
3. Откройте DevTools → Console - должно быть сообщение "Referral click tracked"
4. Откройте DevTools → Application → Local Storage - должны появиться записи в `referral_clicks`
5. Используйте `ReferralDashboard` для просмотра статистики

## Следующие шаги

1. **Замените тестовые ссылки** на реальные в `src/config/affiliateLinks.ts`
2. **Добавьте больше банков** - создайте продукты для разных банков
3. **Интегрируйте с MatchingAlgorithm** - используйте реальные рекомендации вместо статичных данных
4. **Создайте страницу администратора** для просмотра статистики

## Полная документация

Смотрите:
- `docs/REFERRAL_SYSTEM_GUIDE.md` - полное руководство
- `REFERRAL_INTEGRATION_STATUS.md` - статус интеграции
- `src/components/examples/ReferralButtonExample.tsx` - примеры использования
