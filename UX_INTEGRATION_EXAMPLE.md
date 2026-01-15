# Пример интеграции UX улучшений

## Быстрая интеграция в калькулятор

### Шаг 1: Импорты

Добавьте в начало файла калькулятора:

```tsx
import { CalculatorActions } from '@/components/CalculatorActions';
import { CalculatorHistory } from '@/components/CalculatorHistory';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';
import { parseShareableLink } from '@/utils/exportUtils';
import { useEffect } from 'react';
```

### Шаг 2: Хук истории

Добавьте в компонент:

```tsx
const { addCalculation } = useCalculatorHistory();
```

### Шаг 3: Загрузка из расшаренной ссылки

Добавьте useEffect:

```tsx
useEffect(() => {
  const sharedParams = parseShareableLink();
  if (sharedParams) {
    // Загружаем параметры
    if (sharedParams.price) setPrice(sharedParams.price);
    if (sharedParams.initialPayment) setInitialPayment(sharedParams.initialPayment);
    if (sharedParams.term) setTerm(sharedParams.term);
    if (sharedParams.rate) setRate(sharedParams.rate);
  }
}, []);
```

### Шаг 4: Сохранение в историю

После расчета добавьте:

```tsx
// После вычисления результатов
addCalculation(
  'mortgage',  // ID калькулятора
  'Ипотечный калькулятор',  // Название
  {
    price,
    initialPayment,
    term,
    rate
  },  // Входные данные
  {
    monthlyPayment: calculations.monthlyPayment,
    totalPaid: calculations.totalPaid,
    totalInterest: calculations.totalInterest
  }  // Результаты
);
```

### Шаг 5: Панель действий

Добавьте перед формой калькулятора:

```tsx
<div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-bold">Ипотечный калькулятор</h2>
  <div className="flex gap-2">
    <CalculatorHistory
      calculatorType="mortgage"
      onLoadCalculation={(item) => {
        setPrice(item.inputs.price);
        setInitialPayment(item.inputs.initialPayment);
        setTerm(item.inputs.term);
        setRate(item.inputs.rate);
      }}
    />
    <CalculatorActions
      calculatorId="mortgage"
      calculatorName="Ипотечный калькулятор"
      data={schedule}  // Данные для экспорта
      printElementId="mortgage-results"  // ID элемента для печати
      shareParams={{
        price,
        initialPayment,
        term,
        rate
      }}
    />
  </div>
</div>
```

### Шаг 6: ID для печати

Оберните результаты в div с ID:

```tsx
<div id="mortgage-results">
  {/* Все результаты калькулятора */}
  <div className="results-summary">
    {/* ... */}
  </div>
  <div className="results-chart">
    {/* ... */}
  </div>
  <div className="results-table">
    {/* ... */}
  </div>
</div>
```

## Полный пример для MortgageCalculator

```tsx
import { useState, useMemo, useEffect } from "react";
import { CalculatorActions } from '@/components/CalculatorActions';
import { CalculatorHistory } from '@/components/CalculatorHistory';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';
import { parseShareableLink } from '@/utils/exportUtils';
// ... остальные импорты

const MortgageCalculator = () => {
  const { addCalculation } = useCalculatorHistory();
  const [price, setPrice] = useState(5000000);
  const [initialPayment, setInitialPayment] = useState(1000000);
  const [term, setTerm] = useState(20);
  const [rate, setRate] = useState(18);
  
  // Загрузка из расшаренной ссылки
  useEffect(() => {
    const sharedParams = parseShareableLink();
    if (sharedParams) {
      if (sharedParams.price) setPrice(sharedParams.price);
      if (sharedParams.initialPayment) setInitialPayment(sharedParams.initialPayment);
      if (sharedParams.term) setTerm(sharedParams.term);
      if (sharedParams.rate) setRate(sharedParams.rate);
    }
  }, []);
  
  const calculations = useMemo(() => {
    // ... расчеты
    const result = {
      monthlyPayment: 50000,
      totalPaid: 12000000,
      totalInterest: 7000000,
      schedule: []
    };
    
    // Сохраняем в историю после расчета
    addCalculation(
      'mortgage',
      'Ипотечный калькулятор',
      { price, initialPayment, term, rate },
      {
        monthlyPayment: result.monthlyPayment,
        totalPaid: result.totalPaid,
        totalInterest: result.totalInterest
      }
    );
    
    return result;
  }, [price, initialPayment, term, rate, addCalculation]);
  
  const handleLoadFromHistory = (item) => {
    setPrice(item.inputs.price);
    setInitialPayment(item.inputs.initialPayment);
    setTerm(item.inputs.term);
    setRate(item.inputs.rate);
  };
  
  return (
    <div className="space-y-6">
      {/* Панель действий */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ипотечный калькулятор</h2>
        <div className="flex gap-2">
          <CalculatorHistory
            calculatorType="mortgage"
            onLoadCalculation={handleLoadFromHistory}
          />
          <CalculatorActions
            calculatorId="mortgage"
            calculatorName="Ипотечный калькулятор"
            data={calculations.schedule}
            printElementId="mortgage-results"
            shareParams={{ price, initialPayment, term, rate }}
          />
        </div>
      </div>
      
      {/* Форма ввода */}
      <div className="space-y-4">
        {/* ... поля ввода */}
      </div>
      
      {/* Результаты */}
      <div id="mortgage-results">
        <div className="grid gap-4">
          {/* ... результаты */}
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
```

## Минимальная интеграция (только избранное)

Если нужно только добавить избранное:

```tsx
import { CalculatorActions } from '@/components/CalculatorActions';

// В компоненте:
<CalculatorActions
  calculatorId="mortgage"
  calculatorName="Ипотечный калькулятор"
/>
```

## Только экспорт

```tsx
import { CalculatorActions } from '@/components/CalculatorActions';

<CalculatorActions
  calculatorId="mortgage"
  calculatorName="Ипотечный калькулятор"
  data={schedule}  // Массив объектов для экспорта
/>
```

## Только расшаривание

```tsx
import { CalculatorActions } from '@/components/CalculatorActions';

<CalculatorActions
  calculatorId="mortgage"
  calculatorName="Ипотечный калькулятор"
  shareParams={{ price, rate, term }}
/>
```

## Формат данных для экспорта

Данные должны быть массивом объектов:

```tsx
const schedule = [
  {
    'Месяц': 1,
    'Платеж': '50 000 ₽',
    'Основной долг': '30 000 ₽',
    'Проценты': '20 000 ₽',
    'Остаток': '4 970 000 ₽'
  },
  {
    'Месяц': 2,
    'Платеж': '50 000 ₽',
    'Основной долг': '30 500 ₽',
    'Проценты': '19 500 ₽',
    'Остаток': '4 939 500 ₽'
  },
  // ...
];
```

## Проверка работы

1. **История:**
   - Сделайте расчет
   - Нажмите на иконку часов
   - Проверьте, что расчет сохранился
   - Загрузите предыдущий расчет

2. **Избранное:**
   - Нажмите на сердечко
   - Обновите страницу
   - Проверьте, что статус сохранился

3. **Экспорт:**
   - Нажмите на иконку загрузки
   - Выберите формат (Excel/CSV/JSON)
   - Проверьте скачанный файл

4. **Печать:**
   - Нажмите на иконку принтера
   - Проверьте предпросмотр печати

5. **Расшаривание:**
   - Нажмите на иконку "Поделиться"
   - Проверьте, что ссылка скопирована
   - Откройте ссылку в новой вкладке
   - Проверьте, что параметры загрузились

6. **Тема:**
   - Нажмите на иконку солнца/луны в header
   - Переключите тему
   - Обновите страницу
   - Проверьте, что тема сохранилась

---

**Готово!** Теперь калькулятор имеет все UX улучшения.
