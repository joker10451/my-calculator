# Быстрый старт: Виджет кредитной карты ВТБ

## ✅ Что уже сделано

1. ✅ Создана конфигурация продукта (`src/config/vtbCreditCard.ts`)
2. ✅ Добавлена партнерская ссылка с erid (`src/config/affiliateLinks.ts`)
3. ✅ Создан виджет (`src/components/VTBCreditCardWidget.tsx`)
4. ✅ Создан Error Boundary (`src/components/VTBCreditCardErrorBoundary.tsx`)
5. ✅ Создана демо-страница (`src/pages/VTBCreditCardDemo.tsx`)
6. ✅ Проект успешно собирается

## 🚀 Как использовать

### Вариант 1: На странице калькулятора

Откройте любой калькулятор (например, `src/pages/CreditCalculatorPage.tsx`) и добавьте:

```tsx
import { VTBCreditCardWidget } from '@/components/VTBCreditCardWidget';
import { VTBCreditCardErrorBoundary } from '@/components/VTBCreditCardErrorBoundary';

// В JSX, например, после результатов калькулятора:
<div className="mt-8">
  <h3 className="text-xl font-semibold mb-4">Рекомендуем</h3>
  <VTBCreditCardErrorBoundary>
    <VTBCreditCardWidget 
      source="credit_calculator" 
      variant="full"
      showDetails={true}
    />
  </VTBCreditCardErrorBoundary>
</div>
```

### Вариант 2: В боковой панели

```tsx
<aside className="space-y-4">
  <VTBCreditCardErrorBoundary>
    <VTBCreditCardWidget 
      source="sidebar" 
      variant="compact"
      showDetails={false}
    />
  </VTBCreditCardErrorBoundary>
</aside>
```

### Вариант 3: В блоге

```tsx
<div className="my-8">
  <VTBCreditCardErrorBoundary>
    <VTBCreditCardWidget 
      source="blog" 
      variant="full"
    />
  </VTBCreditCardErrorBoundary>
</div>
```

## 📊 Параметры

- **`source`** - источник для аналитики (обязательный)
- **`variant`** - `'compact'` или `'full'`
- **`showDetails`** - `true` или `false`
- **`className`** - дополнительные CSS классы

## 🎯 Целевое действие

**Выдача карты + POS-транзакция**

## 📈 Аналитика

События автоматически отслеживаются в Yandex Metrica:
- `vtb_credit_card_view` - просмотр виджета
- `vtb_credit_card_click` - клик по кнопке

## 🔗 Партнерская ссылка

```
https://trk.ppdu.ru/click/q3zhF1ow?erid=2SDnjeGCc2T
```

erid: `2SDnjeGCc2T`

## ✅ Соответствие требованиям

- ✅ Обязательные дисклеймеры (10%+ пространства)
- ✅ ПСК указывается при упоминании ставки
- ✅ erid отображается в каждом виджете
- ✅ Ссылка на полные условия

## 🧪 Тестирование

1. Запустите: `npm run dev`
2. Откройте: `http://localhost:5173/vtb-credit-card-demo`
3. Проверьте оба варианта виджета
4. Кликните на кнопку - откроется партнерская ссылка

## 📝 Следующие шаги

1. Добавьте виджет на страницы калькуляторов
2. Добавьте в блог-посты о кредитах
3. Настройте A/B тестирование позиций
4. Мониторьте конверсию в Yandex Metrica

---

**Готово к использованию!** 🎉
