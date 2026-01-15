# Design Document: Project Improvement Plan

## Overview

Данный документ описывает дизайн комплексного плана улучшения проекта Считай.RU. План структурирован по 10 основным направлениям, каждое из которых включает конкретные задачи с приоритетами, ожидаемыми результатами и метриками успеха.

Проект представляет собой React SPA с 20+ калькуляторами, построенное на современном стеке (React 18, TypeScript, Vite, Tailwind CSS). Текущее состояние: 164 теста (100% passing), 90.44% покрытие кода, хорошая SEO-оптимизация, но есть возможности для улучшения производительности, архитектуры и функциональности.

## Architecture

### Текущая архитектура

```
schitay-ru-calculators/
├── src/
│   ├── components/          # React компоненты
│   │   ├── calculators/     # Компоненты калькуляторов
│   │   ├── ui/              # UI компоненты (shadcn/ui)
│   │   └── admin/           # Админ панель
│   ├── pages/               # Страницы (роутинг)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Бизнес-логика
│   │   ├── validation/      # Валидация данных
│   │   ├── testing/         # Тестовая инфраструктура
│   │   ├── analytics/       # Аналитика
│   │   └── comparison/      # Система сравнения
│   ├── types/               # TypeScript типы
│   └── test/                # Тесты
├── public/                  # Статические файлы
└── .kiro/specs/            # Спецификации фич
```

### Целевая архитектура

План улучшения сохраняет текущую архитектуру, но добавляет:

1. **Слой абстракции для калькуляторов** - базовые классы/хуки для устранения дублирования
2. **Централизованное управление состоянием** - для сложных взаимодействий между калькуляторами
3. **Модульная система плагинов** - для легкого добавления новых калькуляторов
4. **Улучшенная система кэширования** - для оптимизации производительности
5. **Расширенная система мониторинга** - для отслеживания метрик в реальном времени

## Components and Interfaces

### 1. Анализ текущего состояния

#### Компоненты анализа

```typescript
interface ProjectAnalysis {
  architecture: ArchitectureAnalysis;
  codeQuality: CodeQualityMetrics;
  testCoverage: TestCoverageReport;
  performance: PerformanceMetrics;
  seo: SEOAnalysis;
  technicalDebt: TechnicalDebtReport;
}

interface ArchitectureAnalysis {
  componentCount: number;
  duplicatedCode: DuplicationReport[];
  dependencyGraph: DependencyNode[];
  circularDependencies: string[];
  unusedCode: string[];
}

interface CodeQualityMetrics {
  complexity: number;
  maintainabilityIndex: number;
  linesOfCode: number;
  commentRatio: number;
  typeScriptCoverage: number;
}

interface PerformanceMetrics {
  bundleSize: BundleSizeReport;
  lighthouseScore: LighthouseReport;
  loadTime: LoadTimeMetrics;
  renderTime: RenderTimeMetrics;
}
```

#### Инструменты анализа

- **Bundle Analyzer**: Анализ размера bundle файлов
- **ESLint + TypeScript**: Проверка качества кода
- **Vitest Coverage**: Анализ покрытия тестами
- **Lighthouse CI**: Анализ производительности
- **Dependency Cruiser**: Анализ зависимостей

### 2. Улучшение производительности

#### Стратегии оптимизации

```typescript
interface PerformanceOptimization {
  lazyLoading: LazyLoadingStrategy;
  codeSplitting: CodeSplittingStrategy;
  caching: CachingStrategy;
  bundleOptimization: BundleOptimizationStrategy;
}

interface LazyLoadingStrategy {
  components: string[];        // Компоненты для ленивой загрузки
  routes: string[];           // Маршруты для code splitting
  libraries: string[];        // Библиотеки для динамического импорта
  priority: 'high' | 'medium' | 'low';
}

interface BundleOptimizationStrategy {
  treeshaking: boolean;
  minification: boolean;
  compression: 'gzip' | 'brotli';
  vendorSplitting: boolean;
  chunkSizeLimit: number;
}
```

#### Целевые метрики

- **Bundle Size**: < 300KB (initial), < 1MB (total)
- **Lighthouse Score**: > 90 (все категории)
- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1.5s

### 3. Расширение тестового покрытия

#### Тестовая стратегия

```typescript
interface TestingStrategy {
  unitTests: UnitTestStrategy;
  propertyTests: PropertyTestStrategy;
  integrationTests: IntegrationTestStrategy;
  e2eTests: E2ETestStrategy;
}

interface PropertyTestStrategy {
  calculator: string;
  properties: CalculatorProperty[];
  iterations: number;          // Минимум 100
  generators: DataGenerator[];
}

interface CalculatorProperty {
  id: string;
  name: string;
  description: string;
  validates: string[];         // Requirement IDs
  testFunction: (input: any) => boolean;
}
```

#### Приоритеты тестирования

1. **Критические калькуляторы** (ипотека, кредит, зарплата) - 95% покрытие
2. **Математические расчеты** - 100% property-based тесты
3. **Пользовательские сценарии** - E2E тесты для топ-5 путей
4. **Граничные случаи** - Unit тесты для всех edge cases

### 4. Улучшение архитектуры

#### Базовый калькулятор

```typescript
interface BaseCalculator<TInput, TOutput> {
  id: string;
  name: string;
  category: CalculatorCategory;
  
  // Валидация
  validate(input: TInput): ValidationResult;
  
  // Расчет
  calculate(input: TInput): TOutput;
  
  // Форматирование
  format(output: TOutput): FormattedResult;
  
  // История
  saveToHistory(input: TInput, output: TOutput): void;
  loadFromHistory(id: string): CalculationHistory;
  
  // Экспорт
  export(output: TOutput, format: ExportFormat): Blob;
  
  // Сравнение
  compare(results: TOutput[]): ComparisonResult;
}

abstract class AbstractCalculator<TInput, TOutput> 
  implements BaseCalculator<TInput, TOutput> {
  
  protected validator: ValidationEngine;
  protected formatter: ResultFormatter;
  protected history: HistoryManager;
  
  constructor(config: CalculatorConfig) {
    this.validator = ValidationEngine.getInstance();
    this.formatter = new ResultFormatter(config.formatRules);
    this.history = new HistoryManager(config.historySize);
  }
  
  abstract calculate(input: TInput): TOutput;
  
  // Общая реализация для всех калькуляторов
  validate(input: TInput): ValidationResult {
    return this.validator.validate(input, this.getValidationRules());
  }
  
  protected abstract getValidationRules(): ValidationRule[];
}
```

#### Паттерны устранения дублирования

1. **Композиция хуков**: `useCalculatorCommon` для общей логики
2. **Компоненты высшего порядка**: `CalculatorPageWrapper` для страниц
3. **Утилиты форматирования**: Единые функции `formatCurrency`, `formatPercent`
4. **Валидация**: Централизованный `ValidationEngine`

### 5. Улучшение UX

#### Единообразный интерфейс

```typescript
interface CalculatorUI {
  layout: CalculatorLayout;
  inputs: InputField[];
  results: ResultDisplay;
  actions: CalculatorActions;
  help: HelpSection;
}

interface CalculatorLayout {
  type: 'two-column' | 'single-column' | 'wizard';
  responsive: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface InputField {
  id: string;
  label: string;
  type: 'slider' | 'input' | 'select' | 'radio';
  validation: ValidationRule[];
  helpText?: string;
  tooltip?: string;
}
```

#### UX улучшения

1. **Единообразие**: Все калькуляторы используют одинаковые паттерны
2. **Обратная связь**: Валидация в реальном времени, понятные ошибки
3. **Подсказки**: Tooltips, примеры, FAQ для каждого поля
4. **Доступность**: ARIA labels, keyboard navigation, screen reader support
5. **Мобильная адаптация**: Touch-friendly controls, оптимизация для малых экранов

### 6. Расширение функциональности

#### Система сравнения

```typescript
interface ComparisonSystem {
  addToComparison(calculator: string, result: any): void;
  removeFromComparison(id: string): void;
  compare(): ComparisonResult;
  visualize(): ComparisonChart;
}

interface ComparisonResult {
  items: ComparisonItem[];
  bestOption: ComparisonItem;
  differences: Difference[];
  recommendations: Recommendation[];
}
```

#### Система рекомендаций

```typescript
interface RecommendationSystem {
  analyze(userProfile: UserProfile): Recommendation[];
  suggestCalculators(context: CalculationContext): Calculator[];
  suggestParameters(calculator: string, history: History[]): Parameters;
}

interface Recommendation {
  type: 'calculator' | 'parameter' | 'action';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: () => void;
}
```

#### Визуализация данных

```typescript
interface DataVisualization {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartData;
  options: ChartOptions;
  interactive: boolean;
}

// Примеры визуализаций:
// - График платежей по ипотеке
// - Диаграмма структуры зарплаты
// - Сравнение кредитных предложений
```

### 7. Улучшение SEO

#### SEO стратегия

```typescript
interface SEOStrategy {
  metaTags: MetaTagsOptimization;
  structuredData: StructuredDataSchema;
  content: ContentOptimization;
  performance: PerformanceOptimization;
  linking: InternalLinkingStrategy;
}

interface StructuredDataSchema {
  type: 'Calculator' | 'FAQPage' | 'HowTo' | 'BreadcrumbList';
  data: SchemaOrgData;
}

interface ContentOptimization {
  title: string;              // Оптимизированный заголовок
  description: string;        // Мета-описание 150-160 символов
  keywords: string[];         // Целевые ключевые слова
  headings: HeadingStructure; // H1-H6 структура
  content: string;            // Уникальный контент 500+ слов
}
```

#### SEO чеклист

1. **Мета-теги**: Уникальные title/description для каждой страницы
2. **Структурированные данные**: Schema.org для всех калькуляторов
3. **Контент**: Минимум 500 слов уникального текста на странице
4. **Производительность**: Core Web Vitals в зеленой зоне
5. **Мобильность**: Mobile-first индексация
6. **Sitemap**: Актуальный XML sitemap со всеми страницами

### 8. Мониторинг и аналитика

#### Система мониторинга

```typescript
interface MonitoringSystem {
  analytics: AnalyticsTracker;
  errors: ErrorTracker;
  performance: PerformanceMonitor;
  userBehavior: BehaviorAnalyzer;
}

interface AnalyticsTracker {
  trackPageView(page: string): void;
  trackEvent(category: string, action: string, label?: string): void;
  trackCalculation(calculator: string, inputs: any): void;
  trackConversion(goal: string): void;
}

interface ErrorTracker {
  captureError(error: Error, context: ErrorContext): void;
  captureMessage(message: string, level: 'info' | 'warning' | 'error'): void;
  setUserContext(user: UserContext): void;
}
```

#### Ключевые метрики

1. **Использование**: Количество расчетов по каждому калькулятору
2. **Конверсии**: Клики по партнерским ссылкам, экспорт результатов
3. **Ошибки**: Частота и типы ошибок
4. **Производительность**: Время загрузки, время расчета
5. **Поведение**: Bounce rate, время на сайте, глубина просмотра

### 9. Документация

#### Структура документации

```typescript
interface Documentation {
  readme: ReadmeDocument;
  architecture: ArchitectureDocument;
  apiDocs: APIDocumentation;
  guides: DeveloperGuides;
  changelog: ChangeLog;
}

interface DeveloperGuides {
  gettingStarted: Guide;
  addingCalculator: Guide;
  testing: Guide;
  deployment: Guide;
  codeStyle: Guide;
}
```

#### Документация включает

1. **README**: Быстрый старт, установка, основные команды
2. **Архитектура**: Структура проекта, паттерны, принципы
3. **API**: Документация всех публичных интерфейсов
4. **Руководства**: Пошаговые инструкции для типовых задач
5. **Changelog**: История изменений с версионированием

### 10. Безопасность

#### Стратегия безопасности

```typescript
interface SecurityStrategy {
  inputValidation: ValidationStrategy;
  xssProtection: XSSProtectionStrategy;
  errorHandling: ErrorHandlingStrategy;
  rateLimiting: RateLimitingStrategy;
  logging: SecurityLogging;
}

interface ValidationStrategy {
  sanitizeInput(input: string): string;
  validateType(value: any, expectedType: string): boolean;
  validateRange(value: number, min: number, max: number): boolean;
  validateFormat(value: string, pattern: RegExp): boolean;
}
```

#### Меры безопасности

1. **Валидация**: Все пользовательские вводы проверяются и санитизируются
2. **XSS защита**: DOMPurify для очистки HTML, CSP headers
3. **Error handling**: Graceful degradation, fallback механизмы
4. **Rate limiting**: Защита от злоупотреблений API
5. **Логирование**: Запись критических событий для аудита

## Data Models

### Модель калькулятора

```typescript
interface Calculator {
  id: string;
  name: string;
  category: CalculatorCategory;
  description: string;
  icon: string;
  route: string;
  priority: number;
  tags: string[];
  metadata: CalculatorMetadata;
}

interface CalculatorMetadata {
  seo: SEOMetadata;
  analytics: AnalyticsMetadata;
  features: FeatureFlags;
}
```

### Модель результата расчета

```typescript
interface CalculationResult<T> {
  id: string;
  calculatorId: string;
  timestamp: Date;
  inputs: Record<string, any>;
  outputs: T;
  formatted: FormattedResult;
  metadata: ResultMetadata;
}

interface FormattedResult {
  mainResult: {
    label: string;
    value: string;
    unit?: string;
  };
  details: ResultDetail[];
  charts?: ChartData[];
  recommendations?: Recommendation[];
}
```

### Модель истории

```typescript
interface CalculationHistory {
  id: string;
  userId?: string;
  calculations: CalculationResult<any>[];
  maxSize: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Стратегия обработки ошибок

1. **Валидация на входе**: Предотвращение некорректных данных
2. **Try-catch блоки**: Перехват ошибок выполнения
3. **Error boundaries**: React error boundaries для UI ошибок
4. **Fallback UI**: Запасные варианты при ошибках
5. **Логирование**: Запись всех ошибок для анализа
6. **Уведомления**: Понятные сообщения пользователю

### Типы ошибок

```typescript
enum ErrorType {
  VALIDATION_ERROR = 'validation_error',
  CALCULATION_ERROR = 'calculation_error',
  NETWORK_ERROR = 'network_error',
  STORAGE_ERROR = 'storage_error',
  UNKNOWN_ERROR = 'unknown_error'
}

interface AppError {
  type: ErrorType;
  message: string;
  code: string;
  context: ErrorContext;
  recoverable: boolean;
  userMessage: string;
}
```

## Correctness Properties

*Свойство корректности (property) - это характеристика или поведение, которое должно выполняться для всех валидных выполнений системы. По сути, это формальное утверждение о том, что система должна делать. Свойства служат мостом между человеко-читаемыми спецификациями и машинно-проверяемыми гарантиями корректности.*

### Property 1: State persistence across navigation

*For any* calculator page with user input data, when a user navigates away and then returns to the same calculator, the input state should be restored exactly as it was before navigation.

**Validates: Requirements 5.3**

### Property 2: Comparison system consistency

*For any* two or more calculation results from the same or different calculators, the comparison system should produce a structured comparison result that includes all input items, identifies differences, and provides consistent recommendations.

**Validates: Requirements 6.1**

### Property 3: Calculation history round-trip

*For any* calculation result, if it is saved to history, then retrieving it from history should produce an equivalent calculation result with the same inputs, outputs, and metadata.

**Validates: Requirements 6.3**

### Property 4: Export format validity

*For any* calculation result and any supported export format (PDF, Excel, JSON, CSV), exporting the result should produce a valid file in the specified format that can be parsed by standard tools for that format.

**Validates: Requirements 6.4**

### Property 5: SEO metadata completeness

*For any* calculator page, the page should have complete SEO metadata including: unique title tag, meta description (150-160 chars), valid Schema.org structured data for Calculator type, and Open Graph tags.

**Validates: Requirements 7.1, 7.3**

### Property 6: Internal linking connectivity

*For any* calculator page, the page should contain at least 3 internal links to other related calculators, ensuring the entire calculator network is interconnected.

**Validates: Requirements 7.6**

### Property 7: Event tracking completeness

*For any* user interaction (calculator usage, conversion action, or error occurrence), the appropriate analytics event should be tracked with complete context data including calculator ID, action type, timestamp, and relevant metadata.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 8: Input validation coverage

*For any* user input field across all calculators, the system should validate the input according to its type and constraints, rejecting invalid inputs with clear error messages and accepting valid inputs for processing.

**Validates: Requirements 10.1**

### Property 9: XSS protection sanitization

*For any* user-provided string input that could contain HTML or JavaScript, the system should sanitize the input to remove or escape potentially dangerous content before rendering or storing it.

**Validates: Requirements 10.2**

### Property 10: Graceful error handling with logging

*For any* error that occurs during calculation or system operation, the application should continue functioning (not crash), display a user-friendly error message, and log the error with full context to the error tracking system.

**Validates: Requirements 10.3, 10.5**

### Property 11: Fallback mechanism activation

*For any* critical function that has a fallback mechanism, when the primary function fails, the system should automatically activate the fallback and continue operation without user intervention.

**Validates: Requirements 10.4**

### Property 12: Rate limiting enforcement

*For any* API endpoint or resource-intensive operation, when the number of requests from a single source exceeds the configured threshold within the time window, subsequent requests should be rejected with appropriate HTTP 429 status until the rate limit resets.

**Validates: Requirements 10.6**

## Testing Strategy

### Двойной подход к тестированию

Проект использует комбинацию unit-тестов и property-based тестов:

- **Unit тесты**: Проверяют конкретные примеры и граничные случаи
- **Property тесты**: Проверяют универсальные свойства на множестве входных данных
- Оба типа тестов дополняют друг друга и необходимы для комплексного покрытия

### Баланс unit и property тестов

- **Unit тесты** полезны для конкретных примеров и граничных случаев
- Избегайте написания слишком большого количества unit тестов - property-based тесты покрывают множество входных данных
- **Unit тесты** должны фокусироваться на:
  - Конкретных примерах, демонстрирующих корректное поведение
  - Точках интеграции между компонентами
  - Граничных случаях и условиях ошибок
- **Property тесты** должны фокусироваться на:
  - Универсальных свойствах, которые выполняются для всех входных данных
  - Комплексном покрытии входных данных через рандомизацию

### Конфигурация property-based тестов

- **Библиотека**: fast-check
- **Минимум итераций**: 100 на тест
- **Теги**: Каждый тест ссылается на property из дизайна
- **Формат тега**: `Feature: project-improvement-plan, Property {number}: {property_text}`

```typescript
// Пример property теста
it('Feature: project-improvement-plan, Property 3: Calculation history round-trip', () => {
  fc.assert(
    fc.property(
      fc.record({
        calculatorId: fc.constantFrom('mortgage', 'credit', 'salary'),
        inputs: fc.record({
          amount: fc.integer({ min: 10000, max: 10000000 }),
          rate: fc.float({ min: 0.1, max: 50, noNaN: true }),
          term: fc.integer({ min: 1, max: 360 })
        })
      }),
      (data) => {
        // Calculate result
        const result = calculateResult(data.calculatorId, data.inputs);
        
        // Save to history
        const historyId = saveToHistory(result);
        
        // Retrieve from history
        const retrieved = loadFromHistory(historyId);
        
        // Verify round-trip
        return (
          retrieved.calculatorId === result.calculatorId &&
          JSON.stringify(retrieved.inputs) === JSON.stringify(result.inputs) &&
          Math.abs(retrieved.outputs.total - result.outputs.total) < 0.01
        );
      }
    ),
    { numRuns: 100 }
  );
});

// Пример unit теста для конкретного граничного случая
it('should handle zero interest rate correctly', () => {
  const result = calculateMortgage({
    amount: 1000000,
    rate: 0,
    term: 120
  });
  
  expect(result.monthlyPayment).toBe(1000000 / 120);
  expect(result.totalInterest).toBe(0);
});
```

### Приоритеты тестирования

1. **Критические калькуляторы** (ипотека, кредит, зарплата):
   - 95% unit test coverage
   - Property tests для всех математических расчетов
   - Integration tests для пользовательских сценариев

2. **Системные функции** (история, экспорт, сравнение):
   - Property tests для всех 12 correctness properties
   - Unit tests для граничных случаев
   - Integration tests для взаимодействия компонентов

3. **SEO и аналитика**:
   - Property tests для metadata completeness
   - Unit tests для конкретных форматов данных
   - E2E tests для проверки tracking events

4. **Безопасность**:
   - Property tests для валидации и санитизации
   - Unit tests для известных векторов атак
   - Integration tests для error handling

### Стратегия выполнения тестов

- **Pre-commit**: Быстрые unit тесты (< 30 секунд)
- **CI Pipeline**: Все unit и property тесты (< 2 минуты)
- **Nightly**: E2E тесты и performance тесты
- **Release**: Полный набор тестов включая security scanning

