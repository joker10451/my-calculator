import { AnchorHTMLAttributes, MouseEvent, forwardRef } from 'react';
import { trackAffiliateClick } from '@/utils/affiliateTracking';

interface AffiliateLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  partnerName: string;
  productType: string;
  offerId?: string;
  placement?: 'result_block' | 'sidebar' | 'hero' | 'footer' | 'blog_inline' | 'widget' | 'unknown';
  /**
   * Добавляет/нормализует UTM на ссылке для партнёрских переходов.
   * По умолчанию включено.
   */
  addUtm?: boolean;
}

export const AffiliateLink = forwardRef<HTMLAnchorElement, AffiliateLinkProps>(
  ({ partnerName, productType, offerId, placement = 'unknown', addUtm = true, children, onClick, ...props }, ref) => {
    const href = props.href || '';

    const trackedHref = (() => {
      if (!addUtm) return href;
      if (typeof window === 'undefined') return href;
      if (!href) return href;

      try {
        const url = new URL(href, window.location.origin);

        // Не трогаем UTM, если они уже есть (чтобы не ломать партнёрские кабинеты)
        const hasAnyUtm =
          url.searchParams.has('utm_source') ||
          url.searchParams.has('utm_medium') ||
          url.searchParams.has('utm_campaign') ||
          url.searchParams.has('utm_content') ||
          url.searchParams.has('utm_term');

        if (!hasAnyUtm) {
          url.searchParams.set('utm_source', 'schitay-online');
          url.searchParams.set('utm_medium', 'affiliate');
          url.searchParams.set('utm_campaign', productType);
          url.searchParams.set('utm_content', offerId || partnerName);
          url.searchParams.set('utm_term', placement);
        }

        return url.toString();
      } catch {
        return href;
      }
    })();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      trackAffiliateClick({
        partnerName,
        productType,
        linkUrl: trackedHref,
        source: 'website',
        pageUrl: window.location.href,
        offerId,
        placement,
      });
      onClick?.(e);
    };

    return (
      <a ref={ref} onClick={handleClick} {...props} href={trackedHref}>
        {children}
      </a>
    );
  }
);

AffiliateLink.displayName = 'AffiliateLink';
