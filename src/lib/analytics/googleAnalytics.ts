/**
 * Google Analytics 4 Integration
 * Provides tracking for pageviews, events, conversions, and custom metrics
 */

// Google Analytics 4 Measurement ID
export const GA_MEASUREMENT_ID = 'G-K1W27063WG';

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/**
 * Initialize Google Analytics 4
 */
export const initGA = () => {
  if (typeof window === 'undefined') return;

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll send manually for SPA
  });

  console.log('Google Analytics 4 initialized');
};

/**
 * Track page view
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: title || document.title,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('GA4: Page view tracked', url);
    }
  }
};

/**
 * Track custom event
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('GA4: Event tracked', eventName, params);
    }
  }
};

/**
 * Track calculator usage
 */
export const trackCalculatorUsage = (
  calculatorType: string,
  action: 'view' | 'calculate' | 'export' | 'share'
) => {
  trackEvent('calculator_interaction', {
    calculator_type: calculatorType,
    action: action,
  });
};

/**
 * Track partner widget interaction
 */
export const trackPartnerClick = (
  partner: string,
  widgetType: string,
  calculatorType: string
) => {
  trackEvent('partner_click', {
    partner_name: partner,
    widget_type: widgetType,
    calculator_type: calculatorType,
  });
};

/**
 * Track conversion (partner application)
 */
export const trackConversion = (
  partner: string,
  productType: string,
  value?: number
) => {
  trackEvent('conversion', {
    partner_name: partner,
    product_type: productType,
    value: value,
    currency: 'RUB',
  });
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

/**
 * Track blog post view
 */
export const trackBlogView = (postId: string, postTitle: string, category: string) => {
  trackEvent('blog_view', {
    post_id: postId,
    post_title: postTitle,
    category: category,
  });
};

/**
 * Track user engagement time
 */
export const trackEngagement = (calculatorType: string, timeSpent: number) => {
  trackEvent('user_engagement', {
    calculator_type: calculatorType,
    engagement_time_msec: timeSpent,
  });
};

/**
 * Track error
 */
export const trackError = (errorMessage: string, errorLocation: string) => {
  trackEvent('error', {
    error_message: errorMessage,
    error_location: errorLocation,
  });
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, unknown>) => {
  if (typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', properties);
  }
};
