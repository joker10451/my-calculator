import { trackEvent } from '@/lib/analytics/googleAnalytics';
import { trackYandexGoal } from '@/hooks/useYandexMetrika';

export type UxEventName =
  | 'scroll_depth'
  | 'filter_used'
  | 'faq_toggle'
  | 'empty_state_seen'
  | 'ab_variant_assigned'
  | 'trust_block_view';

export interface UxEventPayload {
  page: string;
  section?: string;
  value?: number | string;
  extra?: Record<string, unknown>;
}

const STORAGE_KEY = 'ux_events';
const MAX_EVENTS = 500;

export function trackUxEvent(name: UxEventName, payload: UxEventPayload): void {
  const event = {
    name,
    payload,
    ts: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const events = raw ? (JSON.parse(raw) as Array<typeof event>) : [];
    events.push(event);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // ignore storage issues
  }

  try {
    trackYandexGoal(`ux_${name}`, payload);
  } catch {
    // ignore analytics runtime errors
  }

  try {
    trackEvent(`ux_${name}`, payload);
  } catch {
    // ignore analytics runtime errors
  }
}

export function getUxBaselineSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const events = raw ? (JSON.parse(raw) as Array<{ name: UxEventName; payload: UxEventPayload; ts: string }>) : [];

    const byName = events.reduce<Record<string, number>>((acc, e) => {
      acc[e.name] = (acc[e.name] || 0) + 1;
      return acc;
    }, {});

    return {
      capturedAt: new Date().toISOString(),
      totalUxEvents: events.length,
      byName,
    };
  } catch {
    return {
      capturedAt: new Date().toISOString(),
      totalUxEvents: 0,
      byName: {},
    };
  }
}

export function getUxEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? (JSON.parse(raw) as Array<{ name: UxEventName; payload: UxEventPayload; ts: string }>)
      : [];
  } catch {
    return [];
  }
}

export function getAbAssignments() {
  try {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith('ab_cta_'))
      .reduce<Record<string, string>>((acc, key) => {
        const value = localStorage.getItem(key);
        if (value) {
          acc[key.replace('ab_cta_', '')] = value;
        }
        return acc;
      }, {});
  } catch {
    return {};
  }
}

export function getAbCtrReport() {
  try {
    const uxEvents = getUxEvents();
    const clicksRaw = localStorage.getItem('referral_clicks');
    const clicks = clicksRaw ? (JSON.parse(clicksRaw) as Array<{ abVariant?: 'a' | 'b'; offerId?: string }>) : [];

    const impressionEvents = uxEvents.filter(
      (event) => event.name === 'ab_variant_assigned' && event.payload.section === 'offers_block_impression'
    );

    const impressionsByVariant: Record<'a' | 'b', number> = { a: 0, b: 0 };
    const clicksByVariant: Record<'a' | 'b', number> = { a: 0, b: 0 };

    impressionEvents.forEach((event) => {
      const value = String(event.payload.value || '');
      const variant = value.endsWith(':b') ? 'b' : 'a';
      impressionsByVariant[variant] += 1;
    });

    clicks.forEach((click) => {
      if (click.abVariant === 'a' || click.abVariant === 'b') {
        clicksByVariant[click.abVariant] += 1;
      }
    });

    const ctrA = impressionsByVariant.a > 0 ? (clicksByVariant.a / impressionsByVariant.a) * 100 : 0;
    const ctrB = impressionsByVariant.b > 0 ? (clicksByVariant.b / impressionsByVariant.b) * 100 : 0;

    return {
      a: { impressions: impressionsByVariant.a, clicks: clicksByVariant.a, ctr: ctrA },
      b: { impressions: impressionsByVariant.b, clicks: clicksByVariant.b, ctr: ctrB },
      winner: ctrA === ctrB ? 'draw' : ctrA > ctrB ? 'a' : 'b',
    };
  } catch {
    return {
      a: { impressions: 0, clicks: 0, ctr: 0 },
      b: { impressions: 0, clicks: 0, ctr: 0 },
      winner: 'draw' as const,
    };
  }
}

