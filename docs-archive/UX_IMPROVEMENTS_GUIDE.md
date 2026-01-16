# Руководство по UX улучшениям

**Дата:** 14 января 2026  
**Статус:** ✅ Реализовано

## ✅ Реализованные улучшения

### 1. История расчетов (localStorage) ✅

**Хук:** `src/hooks/useCalculatorHistory.ts`

**Возможности:**
- Автоматическое сохранение всех расчетов в localStorage
- Хранение до 50 последних расчетов
- Фильтрация по типу калькулятора
- Загрузка предыдущих расчетов
- Удаление отдельных записей
- Очистка всей истории или истории конкретного калькулятора

**Использование:**
```tsx
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';

function MyCalculator() {
  const { addCalculation, getHistoryByType } = useCalculatorHistory();
  
  const handleCalculate = (inputs, results) => {
    // Сохраняем расчет
    addCalculation(
      'mortgage',           // тип калькулятора
      'Ипотечный калькулятор', // название
      inputs,               // входные данные
      results               // результаты
    );
  };
  
  // Получаем историю для этого калькулятора
  const history = getHistoryByType('mortgage');
}
```

**Компонент:** `src/components/CalculatorHistory.tsx`
- Боковая панель с историей
- Кнопка в виде иконки часов
- Загрузка предыдущих расчетов
- Удаление записей

### 2. Избранные калькуляторы ✅

**Хук:** `src/hooks/useFavorites.ts`

**Возможности:**
- Добавление/удаление калькуляторов в избранное
- Сохранение в localStorage
- Проверка статуса избранного
- Очистка всего избранного

**Использование:**
```tsx
import { useFavorites } from '@/hooks/useFavorites';

function MyCalculator() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite('mortgage');
  
  return (
    <button onClick={() => toggleFavorite('mortgage')}>
      {favorite ? '❤️ В избранном' : '🤍 Добавить в избранное'}
    </button>
  );
}
```

### 3. Темная/светлая тема ✅

**Компонент:** `src/components/ThemeToggle.tsx`

**Возможности:**
- Светлая тема
- Темная тема
- Системная тема (автоматически)
- Сохранение выбора в localStorage
- Плавные переходы

**Интеграция:**
- ✅ ThemeProvider добавлен в App.tsx
- ✅ ThemeToggle добавлен в Header
- ✅ Поддержка темной темы во всех компонентах

**Использование в компонентах:**
```tsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      Текущая тема: {theme}
      <button onClick={() => setTheme('dark')}>Темная</button>
    </div>
  );
}
```

### 4. Экспорт результатов ✅

**Утилиты:** `src/utils/exportUtils.ts`

**Форматы экспорта:**
- ✅ Excel (.xls)
- ✅ CSV
- ✅ JSON

**Функции:**
```tsx
import { exportToCSV, exportToExcel, exportToJSON } from '@/utils/exportUtils';

// Экспорт в CSV
exportToCSV(data, 'mortgage_results');

// Экспорт в Excel
exportToExcel(data, 'mortgage_results', 'Ипотека');

// Экспорт в JSON
exportToJSON(data, 'mortgage_results');
```

**Особенности:**
- Автоматическое экранирование спецсимволов
- BOM для корректного отображения кириллицы в Excel
- Поддержка сложных структур данных

### 5. Печать результатов ✅

**Функция:** `printElement(elementId, title)`

**Использование:**
```tsx
import { printElement } from '@/utils/exportUtils';

// Печать элемента с id="results"
printElement('results', 'Результаты расчета ипотеки');
```

**Особенности:**
- Копирование всех стилей
- Оптимизация для печати
- Автоматическое открытие диалога печати

### 6. Поделиться результатом (уникальная ссылка) ✅

**Функции:**
```tsx
import { 
  generateShareableLink, 
  parseShareableLink,
  copyToClipboard 
} from '@/utils/exportUtils';

// Создание ссылки
const shareUrl = generateShareableLink('mortgage', {
  price: 5000000,
  downPayment: 1000000,
  rate: 12,
  term: 20
});

// Копирование в буфер обмена
await copyToClipboard(shareUrl);

// Парсинг параметров из ссылки
const params = parseShareableLink();
if (params) {
  // Загружаем параметры в калькулятор
  setInputs(params);
}
```

**Особенности:**
- Base64 кодирование параметров
- Компактные URL
- Автоматическое копирование в буфер обмена
- Fallback для старых браузеров

### 7. Универсальный компонент действий ✅

**Компонент:** `src/components/CalculatorActions.tsx`

Объединяет все действия в одном компоненте:
- Избранное (сердечко)
- Печать
- Расшаривание
- Экспорт (выпадающее меню)

**Использование:**
```tsx
import { CalculatorActions } from '@/components/CalculatorActions';

function MyCalculator() {
  const [results, setResults] = useState([]);
  
  return (
    <div>
      <CalculatorActions
        calculatorId="mortgage"
        calculatorName="Ипотечный калькулятор"
        data={results}
        printElementId="results"
        shareParams={{
          price: 5000000,
          rate: 12,
          term: 20
        }}
      />
      
      <div id="results">
        {/* Результаты расчета */}
      </div>
    </div>
  );
}
```

## 📋 Интеграция в существующие калькуляторы

### Пример: Ипотечный калькулятор

```tsx
import { useState, useEffect } from 'react';
import { CalculatorActions } from '@/components/CalculatorActions';
import { CalculatorHistory } from '@/components/CalculatorHistory';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';
import { parseShareableLink } from '@/utils/exportUtils';

function MortgageCalculator() {
  const [inputs, setInputs] = useState({
    price: 5000000,
    downPayment: 1000000,
    rate: 12,
    term: 20
  });
  
  const [results, setResults] = useState([]);
  const { addCalculation } = useCalculatorHistory();
  
  // Загрузка параметров из расшаренной ссылки
  useEffect(() => {
    const sharedParams = parseShareableLink();
    if (sharedParams) {
      setInputs(sharedParams);
    }
  }, []);
  
  const handleCalculate = () => {
    // Расчет...
    const calculatedResults = calculateMortgage(inputs);
    setResults(calculatedResults);
    
    // Сохранение в историю
    addCalculation(
      'mortgage',
      'Ипотечный калькулятор',
      inputs,
      { monthlyPayment: calculatedResults.monthlyPayment }
    );
  };
  
  const handleLoadFromHistory = (item) => {
    setInputs(item.inputs);
    setResults(item.results);
  };
  
  return (
    <div>
      {/* Панель действий */}
      <div className="flex justify-between items-center mb-4">
        <h2>Ипотечный калькулятор</h2>
        <div className="flex gap-2">
          <CalculatorHistory
            calculatorType="mortgage"
            onLoadCalculation={handleLoadFromHistory}
          />
          <CalculatorActions
            calculatorId="mortgage"
            calculatorName="Ипотечный калькулятор"
            data={results}
            printElementId="mortgage-results"
            shareParams={inputs}
          />
        </div>
      </div>
      
      {/* Форма ввода */}
      <div>
        {/* ... */}
      </div>
      
      {/* Результаты */}
      <div id="mortgage-results">
        {/* ... */}
      </div>
    </div>
  );
}
```

## 🎨 Стилизация темной темы

Все компоненты используют CSS переменные для поддержки тем:

```css
/* Светлая тема */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}

/* Темная тема */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... */
}
```

## 📊 Структура данных

### История расчетов
```typescript
interface CalculationHistoryItem {
  id: string;                    // Уникальный ID
  calculatorType: string;        // Тип калькулятора
  calculatorName: string;        // Название
  timestamp: number;             // Время расчета
  inputs: Record<string, any>;   // Входные данные
  results: Record<string, any>;  // Результаты
}
```

### Избранное
```typescript
// Массив ID калькуляторов
string[]  // ['mortgage', 'salary', 'credit']
```

## 🔧 Настройка

### Максимальное количество записей в истории
```typescript
// src/hooks/useCalculatorHistory.ts
const MAX_HISTORY_ITEMS = 50;  // Изменить здесь
```

### Ключи localStorage
```typescript
// История
const HISTORY_KEY = 'calculator_history';

// Избранное
const FAVORITES_KEY = 'favorite_calculators';

// Тема
// Управляется next-themes автоматически
```

## 🚀 Следующие шаги

### Приоритет 1: Интеграция в калькуляторы
1. Добавить CalculatorActions во все калькуляторы
2. Добавить CalculatorHistory в топ-6 калькуляторов
3. Реализовать загрузку из расшаренных ссылок

### Приоритет 2: Улучшения
1. Добавить страницу "Избранное" с быстрым доступом
2. Добавить фильтры и сортировку в истории
3. Добавить экспорт истории
4. Добавить статистику использования

### Приоритет 3: Дополнительные функции
1. Синхронизация между устройствами (через аккаунт)
2. Сравнение расчетов из истории
3. Заметки к расчетам
4. Теги и категории для истории

## ✅ Проверка

```bash
# Проверка TypeScript
npm run lint

# Сборка
npm run build

# Тесты
npm run test
```

## 📝 Примеры использования

### Пример 1: Простой калькулятор с историей
```tsx
import { CalculatorHistory } from '@/components/CalculatorHistory';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';

function SimpleCalculator() {
  const { addCalculation } = useCalculatorHistory();
  
  const calculate = (a, b) => {
    const result = a + b;
    addCalculation('simple', 'Простой калькулятор', { a, b }, { result });
    return result;
  };
  
  return (
    <div>
      <CalculatorHistory calculatorType="simple" />
      {/* ... */}
    </div>
  );
}
```

### Пример 2: Калькулятор с экспортом
```tsx
import { CalculatorActions } from '@/components/CalculatorActions';

function ExportableCalculator() {
  const [data, setData] = useState([
    { month: 1, payment: 50000, principal: 30000, interest: 20000 },
    { month: 2, payment: 50000, principal: 30500, interest: 19500 },
  ]);
  
  return (
    <div>
      <CalculatorActions
        calculatorId="exportable"
        calculatorName="Калькулятор с экспортом"
        data={data}
        printElementId="results"
      />
      <div id="results">
        <table>
          {/* Таблица с данными */}
        </table>
      </div>
    </div>
  );
}
```

### Пример 3: Калькулятор с расшариванием
```tsx
import { useEffect } from 'react';
import { parseShareableLink } from '@/utils/exportUtils';
import { CalculatorActions } from '@/components/CalculatorActions';

function ShareableCalculator() {
  const [params, setParams] = useState({ value: 100 });
  
  useEffect(() => {
    const shared = parseShareableLink();
    if (shared) setParams(shared);
  }, []);
  
  return (
    <div>
      <CalculatorActions
        calculatorId="shareable"
        calculatorName="Калькулятор"
        shareParams={params}
      />
      {/* ... */}
    </div>
  );
}
```

---

**Итог:** Все UX улучшения реализованы и готовы к интеграции в калькуляторы. Осталось добавить компоненты в существующие калькуляторы.
