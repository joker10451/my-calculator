# Design Document: PSB Card Integration

## Overview

Интеграция дебетовой карты "Твой Кешбэк" от банка ПСБ в существующую систему калькуляторов. Дизайн фокусируется на ненавязчивом отображении партнерского продукта с использованием существующих компонентов и паттернов.

**Ключевые принципы:**
- Естественная интеграция в существующий UI
- Переиспользование компонентов (ReferralButton, Card)
- Минимальные изменения в кодовой базе
- Прозрачность для пользователей (лейбл "Реклама")
- Внутренний трекинг без публичного отображения комиссий

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Calculator   │  │ Product List │  │ Blog Article │  │
│  │ Pages        │  │ Pages        │  │ Pages        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                   ┌────────▼────────┐                    │
│                   │  PSBCardWidget  │                    │
│                   └────────┬────────┘                    │
└────────────────────────────┼──────────────────────────────┘
                             │
                   ┌─────────▼─────────┐
                   │  Configuration    │
                   │  Layer            │
                   │ ┌───────────────┐ │
                   │ │ psbCard.ts    │ │
                   │ │ (card data)   │ │
                   │ └───────────────┘ │
                   │ ┌───────────────┐ │
                   │ │affiliateLinks │ │
                   │ │ (link config) │ │
                   │ └───────────────┘ │
                   └─────────┬─────────┘
                             │
                   ┌─────────▼─────────┐
                   │  Tracking Layer   │
                   │ ┌───────────────┐ │
                   │ │referralTracking│ │
                   │ │ (analytics)   │ │
                   │ └───────────────┘ │
                   └───────────────────┘
```


### Component Hierarchy

```
PSBCardWidget (новый компонент)
├── Card (существующий UI компонент)
│   ├── CardHeader
│   │   ├── Bank Logo
│   │   └── CardTitle: "Дебетовая карта «Твой Кешбэк»"
│   ├── CardContent
│   │   ├── Key Benefits List
│   │   │   ├── Cashback info
│   │   │   ├── Free service
│   │   │   └── Welcome bonus
│   │   └── Advertising Label (erid)
│   └── CardFooter
│       └── ReferralButton (существующий компонент)
```

## Components and Interfaces

### 1. PSB Card Data Configuration

**File:** `src/config/psbCard.ts`

Типизированная конфигурация с данными о карте ПСБ.

```typescript
export interface PSBCardData {
  id: string;
  name: string;
  bankName: string;
  bankShortName: string;
  
  // Основные преимущества
  cashback: {
    welcome: string; // "25% на все покупки 30 дней"
    regular: string; // "До 5% в 3 категориях + 1% на все"
    maxMonthly: number; // 3000
  };
  
  // Условия
  features: string[]; // ["Бесплатное обслуживание", "Бесплатная доставка", ...]
  
  // Партнерская информация
  affiliate: {
    link: string;
    erid: string;
    commission: number; // внутренняя информация, не отображается
  };
  
  // Ограничения (для соблюдения правил)
  restrictions: {
    excludedRegions: string[]; // ["ДНР", "ЛНР", ...]
    targetAudience: string; // "Новые клиенты банка"
  };
}
```


### 2. PSBCardWidget Component

**File:** `src/components/PSBCardWidget.tsx`

React компонент для отображения карты ПСБ.

```typescript
interface PSBCardWidgetProps {
  source: 'calculator' | 'comparison' | 'blog' | 'products';
  variant?: 'compact' | 'full';
  className?: string;
  showDetails?: boolean;
}

export function PSBCardWidget({
  source,
  variant = 'full',
  className,
  showDetails = true
}: PSBCardWidgetProps): JSX.Element
```

**Варианты отображения:**
- `compact`: Минимальная карточка с основными преимуществами
- `full`: Полная карточка со всеми деталями

**Поведение:**
- Использует существующий `Card` компонент для стилизации
- Использует `ReferralButton` для трекинга кликов
- Отображает маленький лейбл "Реклама • erid: ..."
- Адаптивный дизайн (mobile-first)

### 3. Integration with Affiliate Links

**File:** `src/config/affiliateLinks.ts` (обновление)

Добавление карты ПСБ в существующую конфигурацию:

```typescript
export const AFFILIATE_LINKS: Record<string, AffiliateLink> = {
  // ... существующие ссылки
  
  'psb-debit-cashback': {
    url: 'https://trk.ppdu.ru/click/4wXDM0Um?erid=2SDnjehD1C8',
    bankId: 'psb',
    productType: 'debit', // новый тип продукта
    commission: 1633, // внутренняя информация
    description: 'Дебетовая карта "Твой Кешбэк" ПСБ'
  }
};
```

**Примечание:** Добавляется новый тип продукта `'debit'` в `ProductType`.


### 4. Analytics Integration

**File:** `src/lib/analytics/referralTracking.ts` (использование существующего)

Использование существующей системы трекинга без изменений:

```typescript
// В PSBCardWidget
const { trackClick } = useReferralTracking();

const handleCardClick = () => {
  trackClick(
    psbCardProduct, // BankProduct объект
    affiliateLink,
    source, // 'calculator' | 'comparison' | 'blog' | 'products'
    userId
  );
};
```

**События для Yandex Metrica:**
- `psb_card_view` - просмотр карточки
- `psb_card_click` - клик по кнопке оформления

## Data Models

### PSB Card as BankProduct

Карта ПСБ представляется как объект `BankProduct` для совместимости с существующей системой:

```typescript
const psbCardProduct: BankProduct = {
  id: 'psb-debit-cashback',
  bank_id: 'psb',
  product_type: 'debit', // расширение типа
  name: 'Дебетовая карта «Твой Кешбэк»',
  description: 'Кешбэк до 5% в выбранных категориях',
  
  interest_rate: 0, // не применимо для дебетовых карт
  min_amount: 0,
  max_amount: 0,
  
  fees: {
    monthly: 0, // бесплатное обслуживание
    account_maintenance: 0
  },
  
  requirements: {
    min_age: 18,
    citizenship: ['RU'],
    regions: [] // все регионы кроме исключенных
  },
  
  features: {
    online_application: true,
    fast_approval: true,
    cashback: true // кастомное поле
  },
  
  available_regions: ['*'], // все кроме ДНР, ЛНР, Херсон, Запорожье
  is_active: true,
  is_featured: false, // не выделяем специально
  priority: 50, // средний приоритет
  
  bank: {
    id: 'psb',
    name: 'Банк ПСБ',
    short_name: 'ПСБ',
    is_partner: true,
    commission_rate: 0 // не отображаем
  }
};
```


### Type Extensions

**File:** `src/types/bank.ts` (обновление)

Расширение типа `ProductType`:

```typescript
export type ProductType = 'mortgage' | 'deposit' | 'credit' | 'insurance' | 'debit';
```

Добавление опциональных полей в `ProductFeatures`:

```typescript
export interface ProductFeatures {
  // ... существующие поля
  cashback?: boolean | {
    welcome?: string;
    regular?: string;
    maxMonthly?: number;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

**1.1 THE System SHALL store PSB_Card data in a typed configuration file**
Thoughts: This is about code organization and type safety. We can verify that the configuration file exists, exports the correct type, and contains all required fields. This is testable through type checking and runtime validation.
Testable: yes - example

**1.2 WHEN Card_Data is accessed, THE System SHALL provide type-safe access to all card properties**
Thoughts: This is about TypeScript type safety. We can test that accessing properties doesn't result in type errors and that all expected properties are present.
Testable: yes - property

**1.3 THE Card_Data SHALL include cashback rates, benefits, conditions, and restrictions**
Thoughts: This is about data completeness. We can verify that all required fields are present and non-empty.
Testable: yes - example

**1.4 THE Card_Data SHALL include affiliate link and internal commission tracking**
Thoughts: This is about specific fields existing in the configuration. We can check that these fields are present and have valid values.
Testable: yes - example

**1.5 THE Card_Data SHALL include erid identifier for advertising compliance**
Thoughts: This is a specific requirement that the erid field exists and matches the expected format.
Testable: yes - example


**2.1 WHEN a User views the card display, THE Display_Component SHALL integrate naturally into page layout**
Thoughts: This is about visual design and CSS, which is difficult to test automatically. We can test that the component renders without layout errors, but "naturally" is subjective.
Testable: no

**2.2 WHEN a User views the card display, THE Display_Component SHALL show key benefits without excessive promotional language**
Thoughts: This is about content quality and tone, which is subjective and not automatically testable.
Testable: no

**2.3 WHEN a User views the card display, THE Display_Component SHALL provide a subtle call-to-action**
Thoughts: This is about UI design subtlety, which is subjective. We can test that a CTA button exists, but "subtle" is not measurable.
Testable: yes - example (button exists)

**2.4 THE Display_Component SHALL display small advertising compliance label with erid**
Thoughts: This is testable - we can verify that the component renders a label containing the erid text.
Testable: yes - example

**2.5 THE Display_Component SHALL NOT show commission amounts or partner revenue information**
Thoughts: This is testable - we can verify that the rendered output does not contain commission-related text or numbers.
Testable: yes - property

**2.6 THE Display_Component SHALL NOT use aggressive marketing tactics**
Thoughts: "Aggressive" is subjective, but we can test for specific things like popups, overlays, auto-play elements.
Testable: yes - example

**2.7 THE Display_Component SHALL match the overall design aesthetic of the site**
Thoughts: This is subjective and about visual consistency, not automatically testable.
Testable: no

**3.1 WHEN a User clicks the card button, THE System SHALL open Affiliate_Link in a new tab**
Thoughts: This is testable - we can simulate a click and verify that window.open was called with the correct URL and target.
Testable: yes - example

**3.2 WHEN a User clicks the card button, THE Tracking_System SHALL record the click event**
Thoughts: This is testable - we can verify that the tracking function is called with the correct parameters.
Testable: yes - example


**3.3 WHEN recording a click, THE Tracking_System SHALL capture timestamp, source page, and user session**
Thoughts: This is testable - we can verify that the tracking event includes all required fields.
Testable: yes - example

**3.4 THE Affiliate_Link SHALL include the erid parameter for compliance**
Thoughts: This is testable - we can verify that the URL contains the erid parameter.
Testable: yes - example

**3.5 THE System SHALL prevent multiple click recordings within the same session for the same card**
Thoughts: This is about deduplication logic. We can test that clicking multiple times in the same session only records one event.
Testable: yes - example

**4.1 THE System SHALL add PSB_Card to the existing AFFILIATE_LINKS configuration**
Thoughts: This is about configuration structure. We can verify that the PSB card entry exists in the configuration object.
Testable: yes - example

**4.2 WHEN using ReferralButton component, THE System SHALL support PSB_Card as a product**
Thoughts: This is about component compatibility. We can test that ReferralButton renders correctly with PSB card data.
Testable: yes - example

**4.3 THE System SHALL reuse existing referralTracking hooks for PSB_Card clicks**
Thoughts: This is about code reuse. We can verify that the same tracking hook is used.
Testable: yes - example

**4.4 THE PSB_Card configuration SHALL follow the same AffiliateLink interface**
Thoughts: This is about type conformance. TypeScript will enforce this at compile time.
Testable: yes - example (type checking)

**4.5 THE System SHALL allow PSB_Card to be displayed alongside other bank products**
Thoughts: This is about rendering multiple products. We can test that PSB card renders in a list with other products.
Testable: yes - example


**5.1 WHEN a User views PSB_Card display, THE Analytics_Module SHALL send a view event**
Thoughts: This is testable - we can verify that the analytics function is called when the component mounts.
Testable: yes - example

**5.2 WHEN a User clicks PSB_Card button, THE Analytics_Module SHALL send a click event**
Thoughts: This is testable - we can verify that the analytics function is called on button click.
Testable: yes - example

**5.3 THE Analytics_Module SHALL send events to Yandex Metrica with appropriate goals**
Thoughts: This is testable - we can verify that the Yandex Metrica API is called with the correct goal names.
Testable: yes - example

**5.4 THE System SHALL track conversion rate (clicks / views) for PSB_Card**
Thoughts: This is about calculation logic. We can test that the conversion rate is calculated correctly from stored events.
Testable: yes - property

**5.5 THE Analytics_Module SHALL include source context in events**
Thoughts: This is testable - we can verify that events include the source field.
Testable: yes - example

**5.6 THE System SHALL store commission data internally for revenue tracking**
Thoughts: This is testable - we can verify that commission data is stored but not rendered in the UI.
Testable: yes - example

**6.1 THE System SHALL NOT create applications that mimic the bank's application**
Thoughts: This is a business rule about what we build, not a testable property of the code.
Testable: no

**6.2 THE System SHALL display the erid identifier for advertising compliance**
Thoughts: This is testable - we can verify that the erid is rendered in the component.
Testable: yes - example

**6.3 THE System SHALL use only the provided Affiliate_Link without modifications**
Thoughts: This is testable - we can verify that the link used matches the configured link exactly.
Testable: yes - example


**6.4 THE System SHALL clearly indicate that the link is a partner/advertising link**
Thoughts: This is testable - we can verify that the component renders an advertising label.
Testable: yes - example

**6.5 THE System SHALL NOT guarantee conversion payment for restricted regions**
Thoughts: This is a business rule about payment guarantees, not a testable system property.
Testable: no

**7.1 WHEN a User views PSB_Card on mobile, THE Display_Component SHALL adapt layout for small screens**
Thoughts: This is testable - we can test responsive behavior at different viewport sizes.
Testable: yes - example

**7.2 WHEN a User views PSB_Card on desktop, THE Display_Component SHALL show full information**
Thoughts: This is testable - we can verify that all information is rendered at desktop sizes.
Testable: yes - example

**7.3 THE Display_Component SHALL be keyboard accessible for navigation**
Thoughts: This is testable - we can verify that the component can be navigated with keyboard (tab, enter).
Testable: yes - example

**7.4 THE Display_Component SHALL have sufficient color contrast for readability**
Thoughts: This is testable - we can use automated accessibility tools to check contrast ratios.
Testable: yes - example

**7.5 THE Display_Component SHALL support screen readers with appropriate ARIA labels**
Thoughts: This is testable - we can verify that appropriate ARIA attributes are present.
Testable: yes - example

**8.1 THE System SHALL display PSB_Card only in contextually relevant sections**
Thoughts: This is about placement logic. We can test that the component only renders in specific page types.
Testable: yes - example


**8.2 WHERE a calculator shows bank products, THE System SHALL include PSB_Card as one option among others**
Thoughts: This is testable - we can verify that PSB card appears in product lists alongside other products.
Testable: yes - example

**8.3 WHEN displaying PSB_Card in a list, THE System SHALL NOT give it unfair visual prominence**
Thoughts: "Unfair prominence" is subjective, but we can test that it doesn't have special styling or positioning.
Testable: yes - example

**8.4 THE System SHALL display PSB_Card with small "Реклама" label**
Thoughts: This is testable - we can verify that the label is rendered.
Testable: yes - example

**8.5 THE System SHALL NOT use intrusive placement methods**
Thoughts: This is testable - we can verify that the component doesn't use popups, sticky positioning, or auto-expanding behavior.
Testable: yes - example

### Property Reflection

After reviewing all testable criteria, most are specific examples rather than universal properties. The main properties that apply across multiple inputs are:

1. **Configuration type safety** (1.2) - applies to all property accesses
2. **Commission data hiding** (2.5) - applies to all rendered output
3. **Conversion rate calculation** (5.4) - applies to all event data

The rest are specific examples that should be tested with unit tests rather than property-based tests.

### Correctness Properties

Property 1: Type-safe configuration access
*For any* property access on PSBCardData, the TypeScript compiler should enforce type safety and prevent accessing undefined properties
**Validates: Requirements 1.2**

Property 2: Commission data is never rendered
*For any* rendered output of PSBCardWidget, the output should not contain commission amounts or revenue information
**Validates: Requirements 2.5, 5.6**

Property 3: Conversion rate calculation accuracy
*For any* set of view and click events, the calculated conversion rate should equal (clicks / views) * 100, handling edge cases like zero views
**Validates: Requirements 5.4**


## Error Handling

### Configuration Errors

**Missing or Invalid Data:**
- If PSB card configuration is missing required fields, throw error at build time (TypeScript)
- If affiliate link is malformed, log warning and disable card display
- If erid is missing, throw error (compliance requirement)

**Runtime Errors:**
```typescript
try {
  const cardData = getPSBCardData();
  validateCardData(cardData); // throws if invalid
} catch (error) {
  console.error('PSB card configuration error:', error);
  // Don't render component if data is invalid
  return null;
}
```

### Tracking Errors

**Analytics Failures:**
- If Yandex Metrica is not loaded, log warning but don't block UI
- If localStorage is unavailable, use in-memory storage as fallback
- If tracking fails, log error but allow user to proceed with click

```typescript
try {
  trackClick(product, link, source);
} catch (error) {
  console.error('Tracking error:', error);
  // Still open the link for user
  window.open(link, '_blank');
}
```

### User Interaction Errors

**Link Opening Failures:**
- If popup blocker prevents opening link, show message to user
- If link is invalid, log error and show fallback message
- Always provide fallback to manual link copy

```typescript
const handleClick = () => {
  const newWindow = window.open(link, '_blank');
  if (!newWindow) {
    // Popup blocked
    showNotification('Пожалуйста, разрешите всплывающие окна');
  }
};
```


## Testing Strategy

### Dual Testing Approach

This feature will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** verify:
- Specific examples and edge cases
- Component rendering with different props
- User interactions (clicks, keyboard navigation)
- Analytics event firing
- Error handling scenarios

**Property-Based Tests** verify:
- Universal properties that hold across all inputs
- Type safety guarantees
- Data validation rules
- Calculation correctness

### Unit Testing

**Framework:** Vitest + React Testing Library (existing setup)

**Test Coverage:**

1. **Configuration Tests** (`psbCard.test.ts`)
   - PSB card data has all required fields
   - Affiliate link is properly formatted
   - erid identifier is present
   - Commission data is stored but not exposed in public API

2. **Component Tests** (`PSBCardWidget.test.tsx`)
   - Renders correctly with default props
   - Shows all key benefits
   - Displays advertising label with erid
   - Does not show commission information
   - Renders CTA button
   - Handles click events
   - Responsive behavior (mobile/desktop)
   - Keyboard accessibility
   - Screen reader support (ARIA labels)

3. **Integration Tests** (`psbIntegration.test.ts`)
   - PSB card appears in affiliate links configuration
   - ReferralButton works with PSB card product
   - Tracking system records clicks correctly
   - Analytics events are sent to Yandex Metrica
   - Conversion rate calculation is accurate

4. **Accessibility Tests** (`psbAccessibility.test.ts`)
   - Color contrast meets WCAG AA standards
   - Keyboard navigation works
   - Screen reader announces content correctly
   - Focus management is proper


### Property-Based Testing

**Framework:** fast-check (TypeScript property-based testing library)

**Configuration:** Minimum 100 iterations per property test

**Property Tests:**

1. **Property 1: Type-safe configuration access**
   - Generate random property names
   - Verify TypeScript prevents accessing undefined properties
   - Verify all valid properties return expected types
   - **Tag:** Feature: psb-card-integration, Property 1: Type-safe configuration access

2. **Property 2: Commission data is never rendered**
   - Generate random PSBCardWidget props
   - Render component with various configurations
   - Verify rendered HTML never contains commission numbers (1633, 1774)
   - Verify rendered HTML never contains words like "комиссия", "выплата"
   - **Tag:** Feature: psb-card-integration, Property 2: Commission data is never rendered

3. **Property 3: Conversion rate calculation accuracy**
   - Generate random arrays of view and click events
   - Calculate conversion rate using system function
   - Verify result equals (clicks / views) * 100
   - Verify handles edge case of zero views (returns 0)
   - Verify handles edge case of more clicks than views (caps at 100%)
   - **Tag:** Feature: psb-card-integration, Property 3: Conversion rate calculation accuracy

### Test Organization

```
tests/
├── unit/
│   ├── config/
│   │   └── psbCard.test.ts
│   ├── components/
│   │   └── PSBCardWidget.test.tsx
│   └── integration/
│       └── psbIntegration.test.ts
└── property/
    ├── psbConfigProperties.test.ts
    ├── psbRenderingProperties.test.ts
    └── psbAnalyticsProperties.test.ts
```

### Testing Best Practices

- Write tests before implementation (TDD approach)
- Test user behavior, not implementation details
- Use meaningful test descriptions
- Mock external dependencies (Yandex Metrica, window.open)
- Test both happy path and error scenarios
- Ensure tests are deterministic and fast
- Run property tests with sufficient iterations (100+)

