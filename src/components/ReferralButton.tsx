/**
 * Компонент кнопки с партнерской ссылкой
 * Автоматически отслеживает клики и открывает ссылку
 */

import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { getAffiliateLink } from '@/config/affiliateLinks';
import { useReferralTracking } from '@/lib/analytics/referralTracking';
import type { BankProduct } from '@/types/bank';
import type { ReferralClickEvent } from '@/lib/analytics/referralTracking';

interface ReferralButtonProps {
  product: BankProduct;
  source: ReferralClickEvent['source'];
  userId?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  showCommission?: boolean;
}

export function ReferralButton({
  product,
  source,
  userId,
  variant = 'default',
  size = 'default',
  className,
  children,
  showIcon = true,
  showCommission = false
}: ReferralButtonProps) {
  const { trackClick } = useReferralTracking();

  // Получаем партнерскую ссылку
  const referralLink = getAffiliateLink(
    product.bank_id,
    product.product_type,
    product.id
  ) || product.bank?.website_url || '#';

  const handleClick = () => {
    // Отслеживаем клик
    trackClick(product, referralLink, source, userId);

    // Открываем ссылку в новой вкладке
    window.open(referralLink, '_blank', 'noopener,noreferrer');
  };

  // Проверяем, является ли банк партнером
  const isPartner = product.bank?.is_partner;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={!referralLink || referralLink === '#'}
    >
      {children || (
        <>
          Оформить в {product.bank?.short_name || product.bank?.name}
          {showIcon && <ExternalLink className="ml-2 h-4 w-4" />}
        </>
      )}
      {showCommission && isPartner && product.bank?.commission_rate && (
        <span className="ml-2 text-xs opacity-70">
          <TrendingUp className="inline h-3 w-3 mr-1" />
          {product.bank.commission_rate}%
        </span>
      )}
    </Button>
  );
}

/**
 * Компактная версия кнопки (только иконка)
 */
export function ReferralIconButton({
  product,
  source,
  userId,
  className
}: Omit<ReferralButtonProps, 'children' | 'showIcon' | 'variant' | 'size'>) {
  return (
    <ReferralButton
      product={product}
      source={source}
      userId={userId}
      variant="ghost"
      size="icon"
      className={className}
      showIcon={false}
    >
      <ExternalLink className="h-4 w-4" />
    </ReferralButton>
  );
}

/**
 * Текстовая ссылка с трекингом
 */
export function ReferralLink({
  product,
  source,
  userId,
  className,
  children
}: Omit<ReferralButtonProps, 'variant' | 'size' | 'showIcon'>) {
  const { trackClick } = useReferralTracking();

  const referralLink = getAffiliateLink(
    product.bank_id,
    product.product_type,
    product.id
  ) || product.bank?.website_url || '#';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackClick(product, referralLink, source, userId);
    window.open(referralLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <a
      href={referralLink}
      onClick={handleClick}
      className={`text-primary hover:underline inline-flex items-center gap-1 ${className || ''}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children || `Перейти на сайт ${product.bank?.name}`}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
