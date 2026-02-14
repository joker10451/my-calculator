# AGENTS.md - Coding Guidelines for Schitay.ru Calculators

## Build Commands

```bash
# Development
npm run dev              # Start Vite dev server

# Build
npm run build           # Production build with sitemap
npm run build:dev       # Development build

# Linting
npm run lint            # Run ESLint on all files

# Testing
npm run test            # Run all tests (Vitest --run)
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI

# Run a single test file
npx vitest run src/test/filename.test.ts
npx vitest run --reporter=verbose src/test/filename.test.ts

# Run tests matching a pattern
npx vitest run --testPathPattern="courtFee"
npx vitest run --testNamePattern="should validate"
```

## E2E Testing (Playwright)

```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui           # Run E2E tests with UI
npm run test:e2e:chrome       # Run in Chromium only
npm run test:e2e:firefox      # Run in Firefox
npm run test:e2e:safari       # Run in WebKit
npm run test:e2e:edge         # Run in Edge
npm run test:e2e:mobile       # Run in mobile browsers
npm run test:e2e:report       # Show HTML report
```

## Code Style Guidelines

### TypeScript

- **Strict mode enabled**: All strict TypeScript options are on
- **No implicit any**: Explicit types required
- **No unused locals/parameters**: Clean up unused code
- **Path aliases**: Use `@/` prefix for imports (e.g., `import { foo } from '@/utils/bar'`)
- **Type imports**: Use `import type { Foo }` for type-only imports

### Imports

```typescript
// 1. External dependencies first
import { useState } from 'react';
import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

// 2. Internal absolute imports with @/
import { calculateFee } from '@/lib/feeCalculation';
import type { ValidationResult } from '@/types/validation';

// 3. Internal relative imports (same directory only)
import { helper } from './helper';
```

### Naming Conventions

- **Components**: PascalCase (e.g., `FeeCalculator.tsx`)
- **Utilities**: camelCase (e.g., `contentValidator.ts`)
- **Types/Interfaces**: PascalCase (e.g., `ValidationResult`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Test files**:
  - Unit tests: `*.unit.test.ts`
  - Property-based tests: `*.property.test.ts`
  - Integration tests: `*.integration.test.ts`
- **Variables/functions**: camelCase

### Test Patterns

```typescript
// Unit test example
describe('ComponentName', () => {
  test('should do something specific', () => {
    expect(actual).toBe(expected);
  });
});

// Property-based test example (fast-check)
describe('Property Tests', () => {
  test('property description', () => {
    fc.assert(
      fc.property(fc.integer(), (value) => {
        expect(valid(value)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
```

### Error Handling

```typescript
// Custom error types
interface CalculationError extends Error {
  type: 'division_by_zero' | 'overflow' | 'invalid_input';
  context?: Record<string, unknown>;
  recoverable: boolean;
}

// Validation results
interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
  code?: string;
}
```

### Comments

- Use JSDoc for public functions
- Include feature tags: `// Feature: calculator-testing-validation`
- Comments in Russian for business logic (project convention)
- Inline comments for complex logic only

### React Components

```typescript
// Function components with typed props
interface CalculatorProps {
  initialValue: number;
  onCalculate: (result: number) => void;
}

export function Calculator({ initialValue, onCalculate }: CalculatorProps) {
  // Component logic
}
```

### Styling (Tailwind)

- Use Tailwind utility classes
- Custom theme values in `tailwind.config.ts`
- Typography classes: `text-heading-xl`, `text-body-lg`, etc.
- Color classes follow design system: `text-text-primary`, `bg-accent-success`

### File Organization

```
src/
├── components/          # React components
├── pages/              # Page components
├── lib/                # Core logic (calculations)
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── services/           # API/external services
├── data/               # Static data
├── test/               # Test files
│   ├── __mocks__/     # Test mocks
│   └── setup.ts       # Test configuration
└── config/            # Configuration files
```

### Testing Rules

- Unit tests: Focus on single functions/units
- Property tests: Use fast-check for property-based testing
- Coverage requirements:
  - Global: 80% for all metrics
  - Critical modules (`feeCalculationEngine.ts`, `exemptionManager.ts`): 90%
- Mock external APIs (Supabase, etc.)
- Test timeout: 10 seconds default

### ESLint Rules

- TypeScript recommended rules enabled
- React Hooks rules enforced
- Unused vars allowed in test files
- Explicit `any` allowed only in test files
- React Refresh plugin enabled

## Running the Project

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Additional Scripts

```bash
# Generate feeds/sitemaps
npm run generate:feeds
npm run generate:sitemap

# Audits
npm run audit:performance
npm run audit:accessibility
npm run audit:bundle
npm run audit:all

# Optimization
npm run optimize:images
npm run optimize:bundle
```

## Notes

- This is a Russian financial calculators project (Считай.RU)
- Uses Vitest with happy-dom environment (not jsdom)
- Supports PWA with vite-plugin-pwa
- Uses Zod for validation, React Hook Form for forms
- Supabase for backend, i18next for internationalization
