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

