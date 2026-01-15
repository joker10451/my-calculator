# Дизайн интеграции Яндекс Кешбэка

## Обзор

Система интеграции партнерской ссылки Яндекс Кешбэка в веб-приложение калькуляторов. Дизайн фокусируется на деликатном и полезном представлении кешбэка как инструмента экономии, органично вписанного в существующий пользовательский интерфейс.

## Архитектура

### Общая архитектура
```
React App (TypeScript)
├── Components/
│   ├── CashbackFooterSection (новый)
│   ├── CashbackTip (новый)
│   └── Footer (модификация)
├── Hooks/
│   └── useCashbackAnalytics (новый)
├── Utils/
│   └── cashbackUtils (новый)
└── Types/
    └── cashback.ts (новый)
```

### Интеграционные точки
1. **Footer.tsx** - добавление секции "Полезные сервисы"
2. **CalculatorLayout.tsx** - контекстные советы в результатах
3. **Калькуляторы** - интеграция CashbackTip компонента
4. **Аналитика** - отслеживание кликов через Яндекс.Метрику

## Компоненты и интерфейсы

### 1. CashbackFooterSection Component

**Назначение**: Отображение информации о кешбэке в футере сайта

**Интерфейс**:
```typescript
interface CashbackFooterSectionProps {
  className?: string;
}
```

**Функциональность**:
- Отображение иконки и описания Яндекс Кешбэка
- Обработка клика с аналитикой
- Адаптивный дизайн
- Соответствие общему стилю сайта

### 2. CashbackTip Component

**Назначение**: Контекстные советы по использованию кешбэка в калькуляторах

**Интерфейс**:
```typescript
interface CashbackTipProps {
  calculatorType: 'credit' | 'mortgage' | 'salary';
  amount?: number;
  className?: string;
}
```

**Функциональность**:
- Генерация контекстного совета на основе типа калькулятора
- Персонализация сообщения с учетом суммы расчета
- Отслеживание взаимодействий
- Возможность скрытия пользователем

### 3. useCashbackAnalytics Hook

**Назначение**: Централизованное управление аналитикой кешбэка

**Интерфейс**:
```typescript
interface CashbackAnalytics {
  trackClick: (source: CashbackSource, amount?: number) => void;
  trackView: (source: CashbackSource) => void;
}

type CashbackSource = 'footer' | 'credit' | 'mortgage' | 'salary';
```

### 4. Cashback Utils

**Назначение**: Утилиты для работы с кешбэком

**Функции**:
- `generateCashbackUrl(source: string, amount?: number): string`
- `getCashbackMessage(calculatorType: string, amount?: number): string`
- `shouldShowCashbackTip(calculatorType: string): boolean`

## Модели данных

### CashbackConfig
```typescript
interface CashbackConfig {
  partnerUrl: string;
  isEnabled: boolean;
  sources: {
    footer: CashbackSourceConfig;
    calculators: Record<string, CashbackSourceConfig>;
  };
}

interface CashbackSourceConfig {
  enabled: boolean;
  message: string;
  utmSource: string;
  displayConditions?: {
    minAmount?: number;
    maxAmount?: number;
  };
}
```

### CashbackEvent
```typescript
interface CashbackEvent {
  source: CashbackSource;
  action: 'view' | 'click';
  amount?: number;
  timestamp: Date;
  sessionId: string;
}
```

## Обработка ошибок

### Стратегия обработки ошибок
1. **Graceful Degradation**: При ошибках кешбэк элементы скрываются, не влияя на основную функциональность
2. **Логирование**: Все ошибки логируются для мониторинга
3. **Fallback**: Резервные варианты отображения при недоступности внешних ресурсов

### Типы ошибок
- Ошибки загрузки конфигурации кешбэка
- Ошибки отправки аналитических событий
- Ошибки генерации партнерских ссылок

## Стратегия тестирования

### Unit Tests
- Тестирование утилит генерации ссылок и сообщений
- Тестирование логики отображения компонентов
- Тестирование обработки ошибок

### Integration Tests  
- Тестирование интеграции с Яндекс.Метрикой
- Тестирование взаимодействия компонентов
- Тестирование адаптивности на разных устройствах

### Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

После анализа требований были выявлены следующие свойства корректности:

**Property 1: Cashback component content validation**
*For any* cashback component render, the component should contain both an icon element and descriptive text about Yandex Cashback
**Validates: Requirements 1.2**

**Property 2: Cashback link navigation**
*For any* cashback block click event, the system should trigger navigation to the partner link in a new tab
**Validates: Requirements 1.3**

**Property 3: Contextual advice display by calculator type**
*For any* calculator result display, when the calculator type is credit, mortgage, or salary, the system should show the appropriate contextual cashback advice
**Validates: Requirements 2.1, 2.2, 2.3**

**Property 4: Contextual advice contains partner link**
*For any* displayed contextual advice component, it should contain a clickable link to the partner URL
**Validates: Requirements 2.4**

**Property 5: Analytics event tracking**
*For any* cashback link click, the system should send an analytics event to Yandex.Metrica with the correct source identifier
**Validates: Requirements 3.1**

**Property 6: Analytics source differentiation**
*For any* cashback click event, the analytics source parameter should correctly identify the origin as one of: "cashback_footer", "cashback_credit", "cashback_mortgage", or "cashback_salary"
**Validates: Requirements 3.2**

**Property 7: UTM parameter generation**
*For any* cashback link generation, the resulting URL should contain appropriate UTM parameters for traffic source tracking
**Validates: Requirements 3.3**

**Property 8: Responsive design compliance**
*For any* viewport size, cashback components should render appropriately without layout breaks or content overflow
**Validates: Requirements 4.1, 4.2**

**Property 9: Accessibility compliance**
*For any* cashback interactive element, it should have proper ARIA labels and be keyboard accessible
**Validates: Requirements 4.4**

**Property 10: Legal compliance labeling**
*For any* cashback component, it should contain visible text indicating "Реклама" or "Партнерская ссылка"
**Validates: Requirements 5.1**

**Property 11: Partner link attributes**
*For any* partner link element, it should have the rel attribute set to "sponsored nofollow"
**Validates: Requirements 5.3**

### Property-Based Tests
- Each property will be implemented using Vitest with @fast-check/vitest for property-based testing
- Minimum 100 iterations per property test
- Tests will be tagged with feature name and property number for traceability

## Производительность

### Оптимизации
1. **Lazy Loading**: Компоненты кешбэка загружаются по требованию
2. **Мемоизация**: Кэширование результатов генерации сообщений
3. **Debouncing**: Ограничение частоты аналитических событий
4. **Bundle Splitting**: Код кешбэка в отдельном чанке

### Метрики производительности
- Время загрузки компонентов кешбэка < 50мс
- Размер дополнительного бандла < 5KB
- Влияние на Core Web Vitals < 1%

## Безопасность

### Меры безопасности
1. **Валидация URL**: Проверка партнерских ссылок перед переходом
2. **CSP Headers**: Настройка Content Security Policy для внешних ссылок
3. **XSS Protection**: Санитизация пользовательского ввода
4. **HTTPS Only**: Все партнерские ссылки только по HTTPS

### Приватность
- Минимизация передаваемых данных в аналитику
- Соблюдение GDPR при обработке пользовательских данных
- Возможность отключения отслеживания

## Доступность (A11y)

### Требования доступности
1. **ARIA Labels**: Все интерактивные элементы имеют описательные метки
2. **Keyboard Navigation**: Полная поддержка навигации с клавиатуры
3. **Screen Readers**: Совместимость с программами чтения экрана
4. **Color Contrast**: Соответствие WCAG 2.1 AA стандартам

### Реализация
- `aria-label` для кнопок кешбэка
- `role="complementary"` для информационных блоков
- Поддержка `prefers-reduced-motion`
- Альтернативный текст для иконок

## Интернационализация

### Поддержка языков
- Русский (основной)
- Возможность расширения на другие языки СНГ

### Локализация сообщений
```typescript
const cashbackMessages = {
  ru: {
    footer: "Экономьте на покупках с Яндекс Кешбэком",
    credit: "Совет: используйте кешбэк для досрочного погашения кредита",
    mortgage: "Накапливайте на досрочные платежи с помощью кешбэка",
    salary: "Увеличьте доходы с кешбэком с покупок"
  }
};
```