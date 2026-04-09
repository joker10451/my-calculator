import { ExternalLink } from 'lucide-react';
import { forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import { AffiliateLink } from '@/components/AffiliateLink';

export interface AffiliateCTAProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  partnerName: string;
  productType: string;
  offerId?: string;
  placement?: 'result_block' | 'sidebar' | 'hero' | 'footer' | 'blog_inline' | 'widget' | 'unknown';
  erid?: string;
  label?: string;
  variant?: 'primary' | 'secondary';
  showAdLabel?: boolean;
  showPartnerDisclosure?: boolean;
}

export const AffiliateCTA = forwardRef<HTMLAnchorElement, AffiliateCTAProps>(function AffiliateCTA(
  {
    href,
    partnerName,
    productType,
    offerId,
    placement = 'unknown',
    erid,
    label = 'Перейти',
    variant = 'primary',
    showAdLabel = true,
    showPartnerDisclosure = true,
    className,
    ...rest
  },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  const styles =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
      : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 active:scale-[0.98]';

  return (
    <div className={className}>
      <AffiliateLink
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        partnerName={partnerName}
        productType={productType}
        offerId={offerId}
        placement={placement}
        className={`${base} ${styles} px-5 py-3 w-full`}
        {...rest}
      >
        {label}
        <ExternalLink className="w-4 h-4" aria-hidden="true" />
      </AffiliateLink>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        {showPartnerDisclosure && <span>Партнёрская ссылка</span>}
        {showAdLabel && erid && <span>Реклама • erid: {erid}</span>}
      </div>
    </div>
  );
});

