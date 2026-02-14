/**
 * Unit тесты для конфигурации карты ПСБ
 * Проверяют наличие всех обязательных полей, формат ссылок и соблюдение требований
 */

import { describe, it, expect } from 'vitest';
import { PSB_CARD_DATA, getInternalCommission, validatePSBCardData } from '../config/psbCard';

describe('PSB Card Configuration', () => {
  describe('Required Fields', () => {
    it('should have all required identification fields', () => {
      expect(PSB_CARD_DATA.id).toBeDefined();
      expect(PSB_CARD_DATA.id).toBe('psb-debit-salary');
      
      expect(PSB_CARD_DATA.name).toBeDefined();
      expect(PSB_CARD_DATA.name).toContain('Зарплатные привилегии');
      
      expect(PSB_CARD_DATA.bankName).toBeDefined();
      expect(PSB_CARD_DATA.bankName).toBe('Банк ПСБ');
      
      expect(PSB_CARD_DATA.bankShortName).toBeDefined();
      expect(PSB_CARD_DATA.bankShortName).toBe('ПСБ');
    });

    it('should have complete cashback information', () => {
      expect(PSB_CARD_DATA.cashback).toBeDefined();
      expect(PSB_CARD_DATA.cashback.welcome).toBeDefined();
      expect(PSB_CARD_DATA.cashback.welcome).toContain('зарплату');
      
      expect(PSB_CARD_DATA.cashback.regular).toBeDefined();
      expect(PSB_CARD_DATA.cashback.regular).toContain('1%');
      
      expect(PSB_CARD_DATA.cashback.maxMonthly).toBeDefined();
      expect(PSB_CARD_DATA.cashback.maxMonthly).toBe(5000);
    });

    it('should have at least one feature', () => {
      expect(PSB_CARD_DATA.features).toBeDefined();
      expect(Array.isArray(PSB_CARD_DATA.features)).toBe(true);
      expect(PSB_CARD_DATA.features.length).toBeGreaterThan(0);
    });

    it('should have affiliate information', () => {
      expect(PSB_CARD_DATA.affiliate).toBeDefined();
      expect(PSB_CARD_DATA.affiliate.link).toBeDefined();
      expect(PSB_CARD_DATA.affiliate.erid).toBeDefined();
    });

    it('should have restrictions information', () => {
      expect(PSB_CARD_DATA.restrictions).toBeDefined();
      expect(PSB_CARD_DATA.restrictions.excludedRegions).toBeDefined();
      expect(Array.isArray(PSB_CARD_DATA.restrictions.excludedRegions)).toBe(true);
      expect(PSB_CARD_DATA.restrictions.targetAudience).toBeDefined();
    });

    it('should have banner URLs', () => {
      expect(PSB_CARD_DATA.banners).toBeDefined();
      expect(PSB_CARD_DATA.banners.compact).toBeDefined();
      expect(PSB_CARD_DATA.banners.full).toBeDefined();
      expect(PSB_CARD_DATA.banners.mobile).toBeDefined();
      expect(PSB_CARD_DATA.banners.desktop).toBeDefined();
    });
  });

  describe('Affiliate Link Format', () => {
    it('should have a valid HTTPS affiliate link', () => {
      expect(PSB_CARD_DATA.affiliate.link).toMatch(/^https:\/\//);
    });

    it('should have the correct affiliate link URL', () => {
      expect(PSB_CARD_DATA.affiliate.link).toBe('https://trk.ppdu.ru/click/4wXDM0Um?erid=2SDnjehD1C8');
    });

    it('should include erid parameter in the link', () => {
      expect(PSB_CARD_DATA.affiliate.link).toContain('erid=');
      expect(PSB_CARD_DATA.affiliate.link).toContain('2SDnjehD1C8');
    });
  });

  describe('ERID Compliance', () => {
    it('should have erid identifier', () => {
      expect(PSB_CARD_DATA.affiliate.erid).toBeDefined();
      expect(PSB_CARD_DATA.affiliate.erid).toBe('2SDnjehD1C8');
    });

    it('should have erid in the affiliate link', () => {
      const eridInLink = PSB_CARD_DATA.affiliate.link.includes(`erid=${PSB_CARD_DATA.affiliate.erid}`);
      expect(eridInLink).toBe(true);
    });
  });

  describe('Commission Data Privacy', () => {
    it('should NOT expose commission in public PSB_CARD_DATA', () => {
      // Проверяем что в публичном объекте нет поля commission
      const affiliateData = PSB_CARD_DATA.affiliate as any;
      expect(affiliateData.commission).toBeUndefined();
    });

    it('should provide commission only through internal function', () => {
      const commission = getInternalCommission();
      expect(commission).toBeDefined();
      expect(typeof commission).toBe('number');
      expect(commission).toBe(1633);
    });

    it('should not expose commission numbers in stringified data', () => {
      const jsonString = JSON.stringify(PSB_CARD_DATA);
      
      // Проверяем что комиссия не присутствует в JSON
      expect(jsonString).not.toContain('1633');
      expect(jsonString).not.toContain('1774');
      expect(jsonString).not.toContain('commission');
      expect(jsonString).not.toContain('комиссия');
    });
  });

  describe('Data Validation', () => {
    it('should pass validation for correct data', () => {
      expect(() => validatePSBCardData(PSB_CARD_DATA)).not.toThrow();
    });

    it('should throw error if id is missing', () => {
      const invalidData = { ...PSB_CARD_DATA, id: '' };
      expect(() => validatePSBCardData(invalidData)).toThrow('Missing required card identification fields');
    });

    it('should throw error if cashback info is missing', () => {
      const invalidData = { ...PSB_CARD_DATA, cashback: { welcome: '', regular: '', maxMonthly: 0 } };
      expect(() => validatePSBCardData(invalidData)).toThrow('Missing required cashback information');
    });

    it('should throw error if features array is empty', () => {
      const invalidData = { ...PSB_CARD_DATA, features: [] };
      expect(() => validatePSBCardData(invalidData)).toThrow('Card must have at least one feature');
    });

    it('should throw error if erid is missing', () => {
      const invalidData = { 
        ...PSB_CARD_DATA, 
        affiliate: { ...PSB_CARD_DATA.affiliate, erid: '' } 
      };
      expect(() => validatePSBCardData(invalidData)).toThrow('Missing required affiliate information or erid for compliance');
    });

    it('should throw error if affiliate link is not HTTPS', () => {
      const invalidData = { 
        ...PSB_CARD_DATA, 
        affiliate: { ...PSB_CARD_DATA.affiliate, link: 'http://example.com' } 
      };
      expect(() => validatePSBCardData(invalidData)).toThrow('Affiliate link must use HTTPS protocol');
    });

    it('should throw error if affiliate link does not include erid parameter', () => {
      const invalidData = { 
        ...PSB_CARD_DATA, 
        affiliate: { ...PSB_CARD_DATA.affiliate, link: 'https://example.com' } 
      };
      expect(() => validatePSBCardData(invalidData)).toThrow('Affiliate link must include erid parameter for compliance');
    });
  });

  describe('Features Content', () => {
    it('should include key features', () => {
      const featuresString = PSB_CARD_DATA.features.join(' ');
      
      expect(featuresString).toContain('Бесплатное снятие');
      expect(featuresString).toContain('надбавка');
    });

    it('should have at least 3 features', () => {
      expect(PSB_CARD_DATA.features.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Restrictions', () => {
    it('should list excluded regions', () => {
      expect(PSB_CARD_DATA.restrictions.excludedRegions).toContain('ДНР');
      expect(PSB_CARD_DATA.restrictions.excludedRegions).toContain('ЛНР');
      expect(PSB_CARD_DATA.restrictions.excludedRegions).toContain('Херсонская область');
      expect(PSB_CARD_DATA.restrictions.excludedRegions).toContain('Запорожская область');
    });

    it('should specify target audience', () => {
      expect(PSB_CARD_DATA.restrictions.targetAudience).toBeDefined();
      expect(PSB_CARD_DATA.restrictions.targetAudience.length).toBeGreaterThan(0);
    });
  });

  describe('Official Banners', () => {
    it('should have all required banner variants', () => {
      expect(PSB_CARD_DATA.banners.compact).toBe('/blog/Creative/_370x200.gif');
      expect(PSB_CARD_DATA.banners.full).toBe('/blog/Creative/_600x600.gif');
      expect(PSB_CARD_DATA.banners.mobile).toBe('/blog/Creative/_370x200.gif');
      expect(PSB_CARD_DATA.banners.desktop).toBe('/blog/Creative/_800x525.gif');
    });

    it('should have valid banner paths', () => {
      const banners = Object.values(PSB_CARD_DATA.banners);
      
      banners.forEach(banner => {
        expect(banner).toMatch(/^\/blog\/Creative\/_\d+x\d+\.gif$/);
      });
    });

    it('should use official partner creative assets', () => {
      // Проверяем что баннеры находятся в папке официальных креативов
      expect(PSB_CARD_DATA.banners.compact).toContain('/blog/Creative/');
      expect(PSB_CARD_DATA.banners.full).toContain('/blog/Creative/');
      expect(PSB_CARD_DATA.banners.mobile).toContain('/blog/Creative/');
      expect(PSB_CARD_DATA.banners.desktop).toContain('/blog/Creative/');
    });
  });
});
