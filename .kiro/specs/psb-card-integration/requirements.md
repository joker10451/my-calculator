# Requirements Document

## Introduction

Интеграция партнерской программы банка ПСБ для дебетовой карты "Твой Кешбэк" на сайт калькуляторов. Система должна отображать информацию о карте, отслеживать переходы по партнерской ссылке и собирать аналитику для оптимизации конверсии.

## Glossary

- **System**: Веб-приложение калькуляторов с интеграцией партнерских программ
- **PSB_Card**: Дебетовая карта "Твой Кешбэк" от банка ПСБ
- **Affiliate_Link**: Партнерская ссылка `https://trk.ppdu.ru/click/4wXDM0Um?erid=2SDnjehD1C8`
- **Card_Data**: Структурированная информация о карте (кешбэк, условия, преимущества)
- **Tracking_System**: Система отслеживания кликов и конверсий по партнерской ссылке
- **Display_Component**: UI компонент для отображения информации о карте
- **Analytics_Module**: Модуль сбора и отправки аналитических данных
- **User**: Посетитель сайта, потенциальный клиент банка
- **Conversion**: Целевое действие - активация карты с транзакциями от 1000₽ в течение 3 месяцев
- **Partner_Commission**: Внутренняя информация о выплате (не отображается пользователям)

## Requirements

### Requirement 1: Структурирование данных о карте ПСБ

**User Story:** Как разработчик, я хочу хранить данные о карте ПСБ в структурированном виде, чтобы легко использовать их в разных частях приложения.

#### Acceptance Criteria

1. THE System SHALL store PSB_Card data in a typed configuration file
2. WHEN Card_Data is accessed, THE System SHALL provide type-safe access to all card properties
3. THE Card_Data SHALL include cashback rates, benefits, conditions, and restrictions
4. THE Card_Data SHALL include affiliate link and internal commission tracking (not displayed to users)
5. THE Card_Data SHALL include erid identifier for advertising compliance

### Requirement 2: Ненавязчивое отображение информации о карте

**User Story:** Как пользователь, я хочу видеть полезную информацию о карте ПСБ естественным образом, чтобы это не выглядело как агрессивная реклама.

#### Acceptance Criteria

1. WHEN a User views the card display, THE Display_Component SHALL integrate naturally into page layout
2. WHEN a User views the card display, THE Display_Component SHALL show key benefits without excessive promotional language
3. WHEN a User views the card display, THE Display_Component SHALL provide a subtle call-to-action
4. THE Display_Component SHALL display small advertising compliance label with erid
5. THE Display_Component SHALL NOT show commission amounts or partner revenue information
6. THE Display_Component SHALL NOT use aggressive marketing tactics (popups, overlays, auto-play)
7. THE Display_Component SHALL match the overall design aesthetic of the site

### Requirement 3: Партнерская ссылка и отслеживание

**User Story:** Как владелец сайта, я хочу отслеживать клики по партнерской ссылке, чтобы анализировать эффективность интеграции.

#### Acceptance Criteria

1. WHEN a User clicks the card button, THE System SHALL open Affiliate_Link in a new tab
2. WHEN a User clicks the card button, THE Tracking_System SHALL record the click event
3. WHEN recording a click, THE Tracking_System SHALL capture timestamp, source page, and user session
4. THE Affiliate_Link SHALL include the erid parameter for compliance
5. THE System SHALL prevent multiple click recordings within the same session for the same card

### Requirement 4: Интеграция с существующей системой

**User Story:** Как разработчик, я хочу интегрировать карту ПСБ в существующую систему партнерских ссылок, чтобы использовать единый подход.

#### Acceptance Criteria

1. THE System SHALL add PSB_Card to the existing AFFILIATE_LINKS configuration
2. WHEN using ReferralButton component, THE System SHALL support PSB_Card as a product
3. THE System SHALL reuse existing referralTracking hooks for PSB_Card clicks
4. THE PSB_Card configuration SHALL follow the same AffiliateLink interface as other products
5. THE System SHALL allow PSB_Card to be displayed alongside other bank products

### Requirement 5: Аналитика и метрики

**User Story:** Как владелец сайта, я хочу собирать аналитику по карте ПСБ, чтобы оценивать эффективность партнерства.

#### Acceptance Criteria

1. WHEN a User views PSB_Card display, THE Analytics_Module SHALL send a view event
2. WHEN a User clicks PSB_Card button, THE Analytics_Module SHALL send a click event
3. THE Analytics_Module SHALL send events to Yandex Metrica with appropriate goals
4. THE System SHALL track conversion rate (clicks / views) for PSB_Card
5. THE Analytics_Module SHALL include source context (which page/calculator) in events
6. THE System SHALL store commission data internally for revenue tracking (not displayed to users)

### Requirement 6: Соответствие требованиям партнерской программы

**User Story:** Как владелец сайта, я хочу соблюдать правила партнерской программы ПСБ, чтобы избежать штрафов и отключения.

#### Acceptance Criteria

1. THE System SHALL NOT create applications that mimic the bank's application
2. THE System SHALL display the erid identifier for advertising compliance
3. THE System SHALL use only the provided Affiliate_Link without modifications
4. THE System SHALL clearly indicate that the link is a partner/advertising link
5. THE System SHALL NOT guarantee conversion payment for restricted regions (DNR, LNR, Kherson, Zaporizhzhia)

### Requirement 7: Адаптивность и доступность

**User Story:** Как пользователь, я хочу видеть информацию о карте на любом устройстве, чтобы оформить её удобным способом.

#### Acceptance Criteria

1. WHEN a User views PSB_Card on mobile, THE Display_Component SHALL adapt layout for small screens
2. WHEN a User views PSB_Card on desktop, THE Display_Component SHALL show full information
3. THE Display_Component SHALL be keyboard accessible for navigation
4. THE Display_Component SHALL have sufficient color contrast for readability
5. THE Display_Component SHALL support screen readers with appropriate ARIA labels

### Requirement 8: Естественное размещение на сайте

**User Story:** Как владелец сайта, я хочу разместить карту ПСБ в подходящих местах естественным образом, чтобы это было полезно пользователям и не выглядело навязчиво.

#### Acceptance Criteria

1. THE System SHALL display PSB_Card only in contextually relevant sections (cards, cashback calculators)
2. WHERE a calculator shows bank products, THE System SHALL include PSB_Card as one option among others
3. WHEN displaying PSB_Card in a list, THE System SHALL NOT give it unfair visual prominence over other products
4. THE System SHALL display PSB_Card with small "Реклама" label for transparency
5. THE System SHALL NOT use intrusive placement methods (popups, sticky banners, auto-expanding sections)
