/**
 * Conversion Tracking System
 * Tracks conversions for each partner and provides analytics
 */

import { trackConversion as trackGAConversion } from './googleAnalytics';
import { trackYandexGoal } from '@/hooks/useYandexMetrika';

export interface ConversionEvent {
  partner: 'tinkoff' | 'vtb' | 'alfabank' | 'sberbank' | 'raiffeisen' | 'other';
  productType: 'mortgage' | 'credit' | 'deposit' | 'insurance' | 'investment' | 'other';
  calculatorType: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface ConversionMetrics {
  partner: string;
  totalConversions: number;
  conversionRate: number;
  averageValue: number;
  totalValue: number;
  byProduct: Record<string, number>;
  byCalculator: Record<string, number>;
}

// In-memory storage for conversions (in production, send to backend)
const conversions: ConversionEvent[] = [];
const clicks: Record<string, number> = {};

/**
 * Track partner widget click
 */
export const trackPartnerClick = (
  partner: ConversionEvent['partner'],
  calculatorType: string,
  widgetType: string
) => {
  const key = `${partner}_${calculatorType}`;
  clicks[key] = (clicks[key] || 0) + 1;

  // Track in analytics
  trackYandexGoal('partner_click', {
    partner,
    calculator: calculatorType,
    widget: widgetType,
  });

  // Store in localStorage for persistence
  try {
    const stored = localStorage.getItem('partner_clicks');
    const data = stored ? JSON.parse(stored) : {};
    data[key] = clicks[key];
    localStorage.setItem('partner_clicks', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to store click data', e);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Partner click tracked:', { partner, calculatorType, widgetType });
  }
};

/**
 * Track conversion
 */
export const trackConversion = (event: Omit<ConversionEvent, 'timestamp'>) => {
  const conversionEvent: ConversionEvent = {
    ...event,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  conversions.push(conversionEvent);

  // Track in Google Analytics
  trackGAConversion(event.partner, event.productType, event.value);

  // Track in Yandex Metrika
  trackYandexGoal('conversion', {
    partner: event.partner,
    product: event.productType,
    calculator: event.calculatorType,
    value: event.value,
  });

  // Store in localStorage
  try {
    const stored = localStorage.getItem('conversions');
    const data = stored ? JSON.parse(stored) : [];
    data.push(conversionEvent);
    // Keep only last 100 conversions
    if (data.length > 100) {
      data.shift();
    }
    localStorage.setItem('conversions', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to store conversion data', e);
  }

  // Send to backend (if available)
  sendConversionToBackend(conversionEvent);

  if (process.env.NODE_ENV === 'development') {
    console.log('Conversion tracked:', conversionEvent);
  }
};

/**
 * Get conversion metrics for a partner
 */
export const getPartnerMetrics = (partner: string): ConversionMetrics => {
  const partnerConversions = conversions.filter(c => c.partner === partner);
  const partnerClicks = Object.entries(clicks)
    .filter(([key]) => key.startsWith(partner))
    .reduce((sum, [, count]) => sum + count, 0);

  const totalConversions = partnerConversions.length;
  const conversionRate = partnerClicks > 0 ? (totalConversions / partnerClicks) * 100 : 0;
  const totalValue = partnerConversions.reduce((sum, c) => sum + (c.value || 0), 0);
  const averageValue = totalConversions > 0 ? totalValue / totalConversions : 0;

  const byProduct: Record<string, number> = {};
  const byCalculator: Record<string, number> = {};

  partnerConversions.forEach(c => {
    byProduct[c.productType] = (byProduct[c.productType] || 0) + 1;
    byCalculator[c.calculatorType] = (byCalculator[c.calculatorType] || 0) + 1;
  });

  return {
    partner,
    totalConversions,
    conversionRate,
    averageValue,
    totalValue,
    byProduct,
    byCalculator,
  };
};

/**
 * Get all conversion metrics
 */
export const getAllMetrics = (): ConversionMetrics[] => {
  const partners = Array.from(new Set(conversions.map(c => c.partner)));
  return partners.map(partner => getPartnerMetrics(partner));
};

/**
 * Get session ID (create if doesn't exist)
 */
const getSessionId = (): string => {
  try {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  } catch (e) {
    return `session_${Date.now()}`;
  }
};

/**
 * Send conversion to backend
 */
const sendConversionToBackend = async (event: ConversionEvent) => {
  try {
    // TODO: Replace with actual backend endpoint
    const endpoint = '/api/conversions';
    
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (e) {
    // Silently fail - analytics should not break the app
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to send conversion to backend', e);
    }
  }
};

/**
 * Load stored data on initialization
 */
export const initConversionTracking = () => {
  try {
    // Load clicks
    const storedClicks = localStorage.getItem('partner_clicks');
    if (storedClicks) {
      const data = JSON.parse(storedClicks);
      Object.assign(clicks, data);
    }

    // Load conversions
    const storedConversions = localStorage.getItem('conversions');
    if (storedConversions) {
      const data = JSON.parse(storedConversions);
      conversions.push(...data);
    }
  } catch (e) {
    console.error('Failed to load stored analytics data', e);
  }
};

/**
 * Export data for analysis
 */
export const exportConversionData = () => {
  return {
    conversions: conversions,
    clicks: clicks,
    metrics: getAllMetrics(),
    exportedAt: new Date().toISOString(),
  };
};
