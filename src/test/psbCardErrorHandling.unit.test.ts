/**
 * Unit тесты для обработки ошибок в PSB Card Integration
 * Validates: Requirements 1.5, 3.1
 */

import { describe, it, expect } from 'vitest';
import { validatePSBCardData } from '@/config/psbCard';
import type { PSBCardData } from '@/config/psbCard';

describe('PSB Card Error Handling', () => {
  describe('Configuration Validation', () => {
    it('должен выбросить ошибку при отсутствии id', () => {
      const invalidData = {
        name: 'Test Card',
        bankName: 'Test Bank',
        bankShortName: 'TB',
        cashback: {
          welcome: 'Test',
          regular: 'Test',
          maxMonthly: 1000
        },
        features: ['Feature 1'],
        affiliate: {
          link: 'https://example.com?erid=test',
          erid: 'test'
        },
        banners: {
          compact: '/test.gif',
          full: '/test.gif',
          mobile: '/test.gif',
          desktop: '/test.gif'
        },
        restrictions: {
          excludedRegions: [],
          targetAudience: 'Test'
        }
      } as PSBCardData;

      expect(() => validatePSBCardData(invalidData)).toThrow('Missing required card identification fields');
    });

    it('должен выбросить ошибку при отсутствии erid', () => {
      const invalidData = {
        id: 'test-card',
        name: 'Test Card',
        bankName: 'Test Bank',
        bankShortName: 'TB',
        cashback: {
          welcome: 'Test',
          regular: 'Test',
          maxMonthly: 1000
        },
        features: ['Feature 1'],
        affiliate: {
          link: 'https://example.com',
          erid: ''
        },
        banners: {
          compact: '/test.gif',
          full: '/test.gif',
          mobile: '/test.gif',
          desktop: '/test.gif'
        },
        restrictions: {
          excludedRegions: [],
          targetAudience: 'Test'
        }
      } as PSBCardData;

      expect(() => validatePSBCardData(invalidData)).toThrow('Missing required affiliate information or erid for compliance');
    });

    it('должен выбросить ошибку если ссылка не содержит erid параметр', () => {
      const invalidData = {
        id: 'test-card',
        name: 'Test Card',
        bankName: 'Test Bank',
        bankShortName: 'TB',
        cashback: {
          welcome: 'Test',
          regular: 'Test',
          maxMonthly: 1000
        },
        features: ['Feature 1'],
        affiliate: {
          link: 'https://example.com',
          erid: 'test123'
        },
        banners: {
          compact: '/test.gif',
          full: '/test.gif',
          mobile: '/test.gif',
          desktop: '/test.gif'
        },
        restrictions: {
          excludedRegions: [],
          targetAudience: 'Test'
        }
      } as PSBCardData;

      expect(() => validatePSBCardData(invalidData)).toThrow('Affiliate link must include erid parameter for compliance');
    });

    it('должен выбросить ошибку если ссылка не использует HTTPS', () => {
      const invalidData = {
        id: 'test-card',
        name: 'Test Card',
        bankName: 'Test Bank',
        bankShortName: 'TB',
        cashback: {
          welcome: 'Test',
          regular: 'Test',
          maxMonthly: 1000
        },
        features: ['Feature 1'],
        affiliate: {
          link: 'http://example.com?erid=test',
          erid: 'test'
        },
        banners: {
          compact: '/test.gif',
          full: '/test.gif',
          mobile: '/test.gif',
          desktop: '/test.gif'
        },
        restrictions: {
          excludedRegions: [],
          targetAudience: 'Test'
        }
      } as PSBCardData;

      expect(() => validatePSBCardData(invalidData)).toThrow('Affiliate link must use HTTPS protocol');
    });

    it('должен выбросить ошибку при отсутствии features', () => {
      const invalidData = {
        id: 'test-card',
        name: 'Test Card',
        bankName: 'Test Bank',
        bankShortName: 'TB',
        cashback: {
          welcome: 'Test',
          regular: 'Test',
          maxMonthly: 1000
        },
        features: [],
        affiliate: {
          link: 'https://example.com?erid=test',
          erid: 'test'
        },
        banners: {
          compact: '/test.gif',
          full: '/test.gif',
          mobile: '/test.gif',
          desktop: '/test.gif'
        },
        restrictions: {
          excludedRegions: [],
          targetAudience: 'Test'
        }
      } as PSBCardData;

      expect(() => validatePSBCardData(invalidData)).toThrow('Card must have at least one feature');
    });

    it('должен пройти валидацию с корректными данными', () => {
      const validData: PSBCardData = {
        id: 'test-card',
        name: 'Test Card',
        bankName: 'Test Bank',
        bankShortName: 'TB',
        cashback: {
          welcome: 'Test welcome',
          regular: 'Test regular',
          maxMonthly: 1000
        },
        features: ['Feature 1', 'Feature 2'],
        affiliate: {
          link: 'https://example.com?erid=test123',
          erid: 'test123'
        },
        banners: {
          compact: '/test.gif',
          full: '/test.gif',
          mobile: '/test.gif',
          desktop: '/test.gif'
        },
        restrictions: {
          excludedRegions: [],
          targetAudience: 'Test audience'
        }
      };

      expect(() => validatePSBCardData(validData)).not.toThrow();
      expect(validatePSBCardData(validData)).toBe(true);
    });
  });
});
