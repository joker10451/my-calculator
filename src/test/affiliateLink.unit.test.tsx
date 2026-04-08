import { describe, expect, test, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { AffiliateLink } from '@/components/AffiliateLink';

describe('AffiliateLink', () => {
  test('adds UTM parameters when missing', async () => {
    const gtag = vi.fn();
    const ym = vi.fn();
    (window as any).gtag = gtag;
    (window as any).ym = ym;

    const { getByText } = render(
      <HelmetProvider>
        <AffiliateLink
          href="https://example.com/path?erid=abc"
          partnerName="vtb"
          productType="credit"
          offerId="vtb-credit-card"
          placement="result_block"
        >
          Click
        </AffiliateLink>
      </HelmetProvider>
    );

    const link = getByText('Click') as HTMLAnchorElement;
    expect(link.href).toContain('erid=abc');
    expect(link.href).toContain('utm_source=schitay-online');
    expect(link.href).toContain('utm_medium=affiliate');
    expect(link.href).toContain('utm_campaign=credit');
    expect(link.href).toContain('utm_content=vtb-credit-card');
    expect(link.href).toContain('utm_term=result_block');

    fireEvent.click(link);

    // Минимальная гарантия: событие клика записалось и содержит нормализованный URL
    await new Promise((r) => setTimeout(r, 0));
    const stored = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]') as Array<{ linkUrl: string }>;
    expect(stored.length).toBeGreaterThan(0);
    expect(stored[stored.length - 1].linkUrl).toContain('utm_source=schitay-online');
  });
});

