/**
 * A/B Testing System for Partner Widgets
 * Allows testing different widget variations to optimize conversions
 */

import { trackEvent } from './googleAnalytics';
import { trackYandexGoal } from '@/hooks/useYandexMetrika';

export interface ABTest {
  id: string;
  name: string;
  variants: ABVariant[];
  startDate: Date;
  endDate?: Date;
  active: boolean;
}

export interface ABVariant {
  id: string;
  name: string;
  weight: number; // 0-100, percentage of traffic
  config: Record<string, any>;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  conversionRate: number;
}

// Active A/B tests
const activeTests: Map<string, ABTest> = new Map();

// User variant assignments (stored in localStorage)
const userVariants: Map<string, string> = new Map();

/**
 * Register an A/B test
 */
export const registerABTest = (test: ABTest) => {
  activeTests.set(test.id, test);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('A/B test registered:', test.name);
  }
};

/**
 * Get variant for user
 * Uses consistent hashing to ensure same user always gets same variant
 */
export const getVariant = (testId: string, userId?: string): ABVariant | null => {
  const test = activeTests.get(testId);
  if (!test || !test.active) return null;

  // Check if user already has assigned variant
  const storageKey = `ab_${testId}`;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const variant = test.variants.find(v => v.id === stored);
      if (variant) return variant;
    }
  } catch (e) {
    // localStorage not available
  }

  // Assign new variant based on weights
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const variant of test.variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      // Store assignment
      try {
        localStorage.setItem(storageKey, variant.id);
      } catch (e) {
        // localStorage not available
      }
      
      // Track assignment
      trackVariantAssignment(testId, variant.id);
      
      return variant;
    }
  }

  // Fallback to first variant
  return test.variants[0] || null;
};

/**
 * Track variant assignment
 */
const trackVariantAssignment = (testId: string, variantId: string) => {
  trackEvent('ab_test_assignment', {
    test_id: testId,
    variant_id: variantId,
  });

  trackYandexGoal('ab_test_assignment', {
    test: testId,
    variant: variantId,
  });
};

/**
 * Track impression
 */
export const trackImpression = (testId: string, variantId: string) => {
  trackEvent('ab_test_impression', {
    test_id: testId,
    variant_id: variantId,
  });

  // Store in localStorage for analytics
  incrementMetric(testId, variantId, 'impressions');
};

/**
 * Track click
 */
export const trackClick = (testId: string, variantId: string) => {
  trackEvent('ab_test_click', {
    test_id: testId,
    variant_id: variantId,
  });

  trackYandexGoal('ab_test_click', {
    test: testId,
    variant: variantId,
  });

  incrementMetric(testId, variantId, 'clicks');
};

/**
 * Track conversion
 */
export const trackConversion = (testId: string, variantId: string) => {
  trackEvent('ab_test_conversion', {
    test_id: testId,
    variant_id: variantId,
  });

  trackYandexGoal('ab_test_conversion', {
    test: testId,
    variant: variantId,
  });

  incrementMetric(testId, variantId, 'conversions');
};

/**
 * Increment metric in localStorage
 */
const incrementMetric = (
  testId: string,
  variantId: string,
  metric: 'impressions' | 'clicks' | 'conversions'
) => {
  try {
    const key = `ab_metrics_${testId}_${variantId}`;
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { impressions: 0, clicks: 0, conversions: 0 };
    data[metric]++;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // localStorage not available
  }
};

/**
 * Get test results
 */
export const getTestResults = (testId: string): ABTestResult[] => {
  const test = activeTests.get(testId);
  if (!test) return [];

  return test.variants.map(variant => {
    try {
      const key = `ab_metrics_${testId}_${variant.id}`;
      const stored = localStorage.getItem(key);
      const data = stored ? JSON.parse(stored) : { impressions: 0, clicks: 0, conversions: 0 };

      const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      const conversionRate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;

      return {
        testId,
        variantId: variant.id,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
        ctr,
        conversionRate,
      };
    } catch (e) {
      return {
        testId,
        variantId: variant.id,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        conversionRate: 0,
      };
    }
  });
};

/**
 * Get all test results
 */
export const getAllTestResults = (): Record<string, ABTestResult[]> => {
  const results: Record<string, ABTestResult[]> = {};
  
  activeTests.forEach((test, testId) => {
    results[testId] = getTestResults(testId);
  });

  return results;
};

/**
 * Calculate statistical significance (Chi-square test)
 */
export const calculateSignificance = (
  variant1: ABTestResult,
  variant2: ABTestResult
): { significant: boolean; pValue: number } => {
  // Simple chi-square test for conversion rates
  const n1 = variant1.clicks;
  const n2 = variant2.clicks;
  const x1 = variant1.conversions;
  const x2 = variant2.conversions;

  if (n1 === 0 || n2 === 0) {
    return { significant: false, pValue: 1 };
  }

  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const pPool = (x1 + x2) / (n1 + n2);

  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
  const z = Math.abs(p1 - p2) / se;

  // Approximate p-value from z-score
  const pValue = 2 * (1 - normalCDF(z));

  return {
    significant: pValue < 0.05,
    pValue,
  };
};

/**
 * Normal cumulative distribution function (approximation)
 */
const normalCDF = (x: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
};

/**
 * Export test data
 */
export const exportTestData = () => {
  return {
    tests: Array.from(activeTests.values()),
    results: getAllTestResults(),
    exportedAt: new Date().toISOString(),
  };
};
