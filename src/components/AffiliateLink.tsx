import { AnchorHTMLAttributes, MouseEvent, forwardRef } from 'react';
import { trackAffiliateClick } from '@/utils/affiliateTracking';

interface AffiliateLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  partnerName: string;
  productType: string;
}

export const AffiliateLink = forwardRef<HTMLAnchorElement, AffiliateLinkProps>(
  ({ partnerName, productType, children, onClick, ...props }, ref) => {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      trackAffiliateClick({
        partnerName,
        productType,
        linkUrl: props.href || '',
        source: 'website',
        pageUrl: window.location.href,
      });
      onClick?.(e);
    };

    return (
      <a ref={ref} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  }
);

AffiliateLink.displayName = 'AffiliateLink';
