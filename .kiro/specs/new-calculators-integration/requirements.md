# Requirements Document: Integration of New Calculators

## Introduction

This specification defines the requirements for integrating 7 newly created calculators into the existing calculator platform ecosystem. The integration includes SEO optimization, UX enhancements, monetization through partner widgets, cross-linking, and content creation.

## Glossary

- **Calculator**: A web-based tool for performing specific calculations
- **SEO**: Search Engine Optimization - techniques to improve search engine visibility
- **UX**: User Experience - features that improve user interaction
- **Widget**: A partner integration component displaying offers
- **Cross-linking**: Internal links between related calculators
- **FAQ**: Frequently Asked Questions section
- **Breadcrumbs**: Navigation path showing page hierarchy

## New Calculators List

1. OSAGO Calculator (`/calculator/osago`)
2. Vacation Pay Calculator (`/calculator/vacation`)
3. Sick Leave Calculator (`/calculator/sick-leave`)
4. Self-Employed Tax Calculator (`/calculator/self-employed`)
5. Pension Calculator (`/calculator/pension`)
6. KASKO Calculator (`/calculator/kasko`)
7. Investment Returns Calculator (`/calculator/investment`)

---

## Requirement 1: SEO Optimization

**User Story:** As a site owner, I want all new calculators to be SEO-optimized, so that they rank well in search engines and attract organic traffic.

### Acceptance Criteria

1. WHEN a new calculator page loads, THE System SHALL display proper meta tags (title, description, keywords, og:tags)
2. WHEN a user views a calculator page, THE System SHALL display breadcrumb navigation with Schema.org markup
3. WHEN a user scrolls to the bottom of a calculator page, THE System SHALL display an FAQ section with at least 5 questions
4. WHEN a user views a calculator page, THE System SHALL display descriptive text content of at least 300 words
5. THE System SHALL include Schema.org structured data for Calculator, FAQPage, and BreadcrumbList
6. THE System SHALL generate unique meta descriptions for each calculator (150-160 characters)
7. THE System SHALL use H1 tags for main titles and H2/H3 for sections

---

## Requirement 2: UX Enhancement Features

**User Story:** As a user, I want to save my calculations, export results, and share them with others, so that I can reference them later and collaborate.

### Acceptance Criteria

1. WHEN a user completes a calculation, THE System SHALL save it to calculation history in localStorage
2. WHEN a user views calculation history, THE System SHALL display up to 50 most recent calculations
3. WHEN a user clicks "Export", THE System SHALL offer Excel, CSV, and JSON format options
4. WHEN a user clicks "Print", THE System SHALL open a print-friendly version of results
5. WHEN a user clicks "Share", THE System SHALL generate a unique URL with calculation parameters encoded
6. WHEN a user clicks "Add to Favorites", THE System SHALL save the calculator to favorites list
7. WHEN a user loads a shared URL, THE System SHALL restore all calculation parameters
8. THE System SHALL display action buttons (Export, Print, Share, Favorite) on all calculator pages
9. THE System SHALL show calculation history in a sidebar panel
10. THE System SHALL allow users to load previous calculations from history

---

## Requirement 3: Partner Widget Integration

**User Story:** As a site owner, I want to display relevant partner offers on calculator pages, so that I can monetize the traffic while providing value to users.

### Acceptance Criteria

1. WHEN a user views OSAGO calculator, THE System SHALL display insurance company widgets
2. WHEN a user views KASKO calculator, THE System SHALL display insurance company widgets
3. WHEN a user views Vacation/Sick Leave calculators, THE System SHALL display bank card widgets (VTB, T-Bank)
4. WHEN a user views Self-Employed calculator, THE System SHALL display business card widgets
5. WHEN a user views Pension calculator, THE System SHALL display savings program widgets
6. WHEN a user views Investment calculator, THE System SHALL display broker/IIS widgets
7. THE System SHALL display widgets below calculation results
8. THE System SHALL include proper erid and advertising disclaimers on all widgets
9. THE System SHALL use error boundaries to prevent widget failures from breaking calculators
10. THE System SHALL track widget impressions and clicks (if analytics available)

---

## Requirement 4: Cross-Linking System

**User Story:** As a user, I want to discover related calculators, so that I can perform complementary calculations without searching.

### Acceptance Criteria

1. WHEN a user views any calculator, THE System SHALL display a "Related Calculators" section
2. WHEN a user views OSAGO calculator, THE System SHALL suggest KASKO and Fuel calculators
3. WHEN a user views KASKO calculator, THE System SHALL suggest OSAGO and Fuel calculators
4. WHEN a user views Vacation calculator, THE System SHALL suggest Sick Leave and Salary calculators
5. WHEN a user views Sick Leave calculator, THE System SHALL suggest Vacation and Salary calculators
6. WHEN a user views Self-Employed calculator, THE System SHALL suggest Pension and Salary calculators
7. WHEN a user views Pension calculator, THE System SHALL suggest Self-Employed and Salary calculators
8. WHEN a user views Investment calculator, THE System SHALL suggest Deposit and Refinancing calculators
9. THE System SHALL display 3-4 related calculators with icons and descriptions
10. THE System SHALL place related calculators section at the bottom of the page

---

## Requirement 5: Content Creation (Blog Articles)

**User Story:** As a site owner, I want to create informative blog articles about calculator topics, so that I can attract organic traffic and establish authority.

### Acceptance Criteria

1. THE System SHALL have a blog article "How to Calculate OSAGO in 2026"
2. THE System SHALL have a blog article "Vacation Pay: What You Need to Know"
3. THE System SHALL have a blog article "Taxes for Self-Employed: Complete Guide"
4. THE System SHALL have a blog article "How to Increase Your Future Pension"
5. THE System SHALL have a blog article "KASKO or OSAGO: What to Choose"
6. THE System SHALL have a blog article "Investing for Beginners"
7. THE System SHALL have a blog article "Sick Leave Benefits: Calculation Rules"
8. WHEN a user views a calculator, THE System SHALL display a link to related blog article
9. WHEN a user views a blog article, THE System SHALL display a link to related calculator
10. THE System SHALL include internal links between related articles and calculators

---

## Requirement 6: Analytics and Tracking

**User Story:** As a site owner, I want to track calculator usage and user behavior, so that I can optimize the platform and measure success.

### Acceptance Criteria

1. WHEN a user completes a calculation, THE System SHALL send an event to Yandex Metrika
2. WHEN a user exports results, THE System SHALL track the export format used
3. WHEN a user shares a calculation, THE System SHALL track share events
4. WHEN a user clicks a partner widget, THE System SHALL track the click event
5. THE System SHALL track which calculators are most popular
6. THE System SHALL track average time spent on each calculator
7. THE System SHALL track calculation completion rate
8. THE System SHALL track error rates and failed calculations

---

## Requirement 7: Mobile Optimization

**User Story:** As a mobile user, I want all calculator features to work smoothly on my device, so that I can perform calculations on the go.

### Acceptance Criteria

1. WHEN a user views any calculator on mobile, THE System SHALL display a responsive layout
2. WHEN a user interacts with sliders on mobile, THE System SHALL provide smooth touch controls
3. WHEN a user views calculation history on mobile, THE System SHALL display a mobile-friendly sidebar
4. WHEN a user exports results on mobile, THE System SHALL handle file downloads properly
5. WHEN a user shares on mobile, THE System SHALL use native share API when available
6. THE System SHALL ensure all buttons are touch-friendly (minimum 44x44px)
7. THE System SHALL optimize widget display for mobile screens

---

## Requirement 8: Performance Optimization

**User Story:** As a user, I want calculators to load and respond quickly, so that I can get results without delays.

### Acceptance Criteria

1. WHEN a user navigates to a calculator, THE System SHALL load the page in under 2 seconds
2. WHEN a user changes input values, THE System SHALL recalculate results in under 100ms
3. THE System SHALL lazy-load partner widgets to avoid blocking main content
4. THE System SHALL use code splitting for calculator components
5. THE System SHALL cache calculation history efficiently
6. THE System SHALL optimize images and icons for web delivery
7. THE System SHALL minimize bundle size for calculator pages

---

## Requirement 9: Accessibility Compliance

**User Story:** As a user with disabilities, I want to use calculators with assistive technologies, so that I can access all features.

### Acceptance Criteria

1. WHEN a user navigates with keyboard, THE System SHALL provide visible focus indicators
2. WHEN a user uses screen reader, THE System SHALL provide proper ARIA labels
3. THE System SHALL ensure all interactive elements are keyboard accessible
4. THE System SHALL provide alt text for all images and icons
5. THE System SHALL maintain sufficient color contrast (WCAG AA)
6. THE System SHALL support screen reader announcements for calculation results
7. THE System SHALL provide skip links for navigation

---

## Requirement 10: Error Handling and Validation

**User Story:** As a user, I want clear feedback when I enter invalid data, so that I can correct mistakes and get accurate results.

### Acceptance Criteria

1. WHEN a user enters invalid input, THE System SHALL display a clear error message
2. WHEN a user enters values outside valid ranges, THE System SHALL show range limits
3. WHEN a calculation fails, THE System SHALL display a user-friendly error message
4. WHEN a widget fails to load, THE System SHALL not break the calculator functionality
5. THE System SHALL validate all numeric inputs before calculation
6. THE System SHALL prevent form submission with invalid data
7. THE System SHALL provide helpful hints for correct input format

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
- Requirement 1: SEO Optimization (all 7 calculators)
- Requirement 10: Error Handling and Validation

### Phase 2: User Experience (Week 2)
- Requirement 2: UX Enhancement Features
- Requirement 7: Mobile Optimization

### Phase 3: Monetization (Week 3)
- Requirement 3: Partner Widget Integration
- Requirement 4: Cross-Linking System

### Phase 4: Content & Analytics (Week 4)
- Requirement 5: Content Creation (Blog Articles)
- Requirement 6: Analytics and Tracking

### Phase 5: Polish (Week 5)
- Requirement 8: Performance Optimization
- Requirement 9: Accessibility Compliance

---

## Success Metrics

1. **SEO**: All 7 calculators indexed by search engines within 2 weeks
2. **Traffic**: 30% increase in organic traffic to calculator pages
3. **Engagement**: Average time on page > 2 minutes
4. **Conversion**: 5% click-through rate on partner widgets
5. **Retention**: 20% of users return to use calculators again
6. **Performance**: Page load time < 2 seconds
7. **Accessibility**: WCAG AA compliance score > 90%

---

## Technical Constraints

1. Must maintain existing calculator functionality
2. Must not break existing SEO for old calculators
3. Must support all modern browsers (Chrome, Firefox, Safari, Edge)
4. Must work on mobile devices (iOS, Android)
5. Must comply with Russian advertising law (erid display)
6. Must maintain current build time (< 10 seconds)
7. Must keep bundle size under 3MB

---

## Dependencies

1. Existing SEO components (SEO.tsx, Breadcrumbs.tsx, FAQ.tsx)
2. Existing UX hooks (useCalculatorHistory, useFavorites)
3. Existing utility functions (exportUtils.ts)
4. Partner widget configurations (VTB, T-Bank, PSB)
5. Yandex Metrika integration
6. React Router for navigation
7. Tailwind CSS for styling

---

**Document Version:** 1.0  
**Created:** 2026-01-14  
**Author:** Kiro AI Assistant
