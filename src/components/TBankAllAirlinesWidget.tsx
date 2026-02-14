/**
 * Компонент для отображения дебетовой карты Т-Банк ALL Airlines
 * Партнерская интеграция с соблюдением требований рекламного законодательства
 */

import { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TBANK_ALL_AIRLINES_CARD_DATA } from '@/config/tBankAllAirlinesCard';
import type { BankProduct } from '@/types/bank';
import type { ReferralClickEvent } from '@/lib/analytics/referralTracking';
import { useReferralTracking } from '@/lib/analytics/referralTracking';
import { trackYandexGoal } from '@/hooks/useYandexMetrika';
import { CheckCircle2, ExternalLink, Plane, Shield, Gift } from 'lucide-react';

/**
 * Пропсы компонента TBankAllAirlinesWidget
 */
export interface TBankAllAirlinesWidgetProps {
  /** Источник отображения карточки (для аналитики) */
  source: ReferralClickEvent['source'];
  
  /** Вариант отображения */
  variant?: 'compact' | 'full';
  
  /** Дополнительные CSS классы */
  className?: string;
  
  /** Показывать ли детальную информацию */
  showDetails?: boolean;
  
  /** Показывать ли промокод */
  showPromoCode?: boolean;
}

/**
 * Компонент карточки дебетовой карты Т-Банк ALL Airlines
 * 
 * Отображает информацию о карте для путешествий с милями.
 * Соблюдает требования рекламного законодательства (отображение erid).
 * 
 * @example
 * ```tsx
 * <TBankAllAirlinesWidget source="calculator" variant="full" showPromoCode={true} />
 * ```
 */
export function TBankAllAirlinesWidget({
  source,
  variant = 'full',
  className = '',
  showDetails = true,
  showPromoCode = true
}: TBankAllAirlinesWidgetProps) {
  // Используем хук для трекинга
  const { trackClick } = useReferralTracking();
  
  // Отслеживание просмотра карточки при монтировании компонента
  useEffect(() => {
    try {
      trackYandexGoal('tbank_all_airlines_view', {
        source,
        productId: TBANK_ALL_AIRLINES_CARD_DATA.id,
        variant
      });
    } catch (error) {
      console.error('Error tracking T-Bank ALL Airlines card view:', error);
    }
  }, [source, variant]);
  
  // Создаем объект BankProduct для совместимости с системой трекинга
  const tBankCardProduct: BankProduct = {
    id: TBANK_ALL_AIRLINES_CARD_DATA.id,
    bank_id: 'tbank',
    product_type: 'debit',
    name: TBANK_ALL_AIRLINES_CARD_DATA.name,
    description: TBANK_ALL_AIRLINES_CARD_DATA.miles.description,
    
    interest_rate: 0,
    min_amount: 0,
    max_amount: 0,
    
    fees: {
      monthly: 0,
      account_maintenance: 0
    },
    
    requirements: {
      min_age: 18,
      citizenship: ['RU']
    },
    
    features: {
      online_application: true,
      fast_approval: true,
      miles: {
        description: TBANK_ALL_AIRLINES_CARD_DATA.miles.description,
        validity: TBANK_ALL_AIRLINES_CARD_DATA.miles.validity
      }
    },
    
    available_regions: ['*'],
    is_active: true,
    is_featured: false,
    priority: 50,
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    
    bank: {
      id: 'tbank',
      name: TBANK_ALL_AIRLINES_CARD_DATA.bankName,
      short_name: TBANK_ALL_AIRLINES_CARD_DATA.bankShortName,
      is_partner: true,
      commission_rate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  // Определяем количество отображаемых преимуществ
  const featuresToShow = variant === 'compact' 
    ? TBANK_ALL_AIRLINES_CARD_DATA.features.slice(0, 3) 
    : TBANK_ALL_AIRLINES_CARD_DATA.features;

  // Обработчик клика по кнопке
  const handleCardClick = () => {
    try {
      // Отслеживаем клик в Yandex Metrica
      trackYandexGoal('tbank_all_airlines_click', {
        source,
        productId: TBANK_ALL_AIRLINES_CARD_DATA.id,
        bankId: 'tbank',
        promoCode: TBANK_ALL_AIRLINES_CARD_DATA.affiliate.promoCode
      });
      
      // Отслеживаем клик через систему трекинга
      trackClick(
        tBankCardProduct,
        TBANK_ALL_AIRLINES_CARD_DATA.affiliate.link!,
        source
      );

      // Открываем партнерскую ссылку в новой вкладке
      const newWindow = window.open(
        TBANK_ALL_AIRLINES_CARD_DATA.affiliate.link,
        '_blank',
        'noopener,noreferrer'
      );

      if (!newWindow) {
        console.warn('Popup blocked. Please allow popups for this site.');
      }
    } catch (error) {
      console.error('Error tracking T-Bank ALL Airlines card click:', error);
      window.open(
        TBANK_ALL_AIRLINES_CARD_DATA.affiliate.link,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  // Обработчик нажатия клавиш
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Card 
      className={`overflow-hidden ${className}`}
      role="region"
      aria-labelledby="tbank-all-airlines-title"
      aria-describedby="tbank-all-airlines-description"
    >
      <CardHeader className={variant === 'compact' ? 'pb-3 px-4 pt-4' : 'px-4 sm:px-6 pt-4 sm:pt-6'}>
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle 
                id="tbank-all-airlines-title"
                className={
                  variant === 'compact' 
                    ? 'text-base sm:text-lg' 
                    : 'text-lg sm:text-xl md:text-2xl'
                }
              >
                {TBANK_ALL_AIRLINES_CARD_DATA.name}
              </CardTitle>
              {TBANK_ALL_AIRLINES_CARD_DATA.promotion && (
                <Badge variant="secondary" className="text-xs">
                  <Gift className="w-3 h-3 mr-1" />
                  Акция
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {TBANK_ALL_AIRLINES_CARD_DATA.bankShortName}
            </p>
          </div>
          
          {/* Логотип банка */}
          <div className="flex-shrink-0" aria-hidden="true">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={variant === 'compact' ? 'pb-3 px-4' : 'px-4 sm:px-6'}>
        {/* Основное предложение */}
        <div 
          id="tbank-all-airlines-description"
          className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900"
          role="note"
        >
          <p className="text-xs sm:text-sm font-medium text-yellow-900 dark:text-yellow-100">
            {TBANK_ALL_AIRLINES_CARD_DATA.miles.description}
          </p>
          {showDetails && variant === 'full' && (
            <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1 hidden sm:block">
              {TBANK_ALL_AIRLINES_CARD_DATA.miles.conversion} • Срок хранения: {TBANK_ALL_AIRLINES_CARD_DATA.miles.validity}
            </p>
          )}
        </div>

        {/* Промокод */}
        {showPromoCode && TBANK_ALL_AIRLINES_CARD_DATA.affiliate.promoCode && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Промокод</p>
                <p className="text-sm sm:text-base font-bold text-primary font-mono">
                  {TBANK_ALL_AIRLINES_CARD_DATA.affiliate.promoCode}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {TBANK_ALL_AIRLINES_CARD_DATA.promotion?.duration}
              </Badge>
            </div>
          </div>
        )}

        {/* Ключевые преимущества */}
        <div 
          className="space-y-1.5 sm:space-y-2"
          role="list"
          aria-label="Ключевые преимущества карты"
        >
          {featuresToShow.map((feature, index) => (
            <div key={index} className="flex items-start gap-2" role="listitem">
              <CheckCircle2 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" 
                aria-hidden="true"
              />
              <span className="text-xs sm:text-sm text-foreground leading-relaxed">{feature}</span>
            </div>
          ))}
          
          {variant === 'compact' && TBANK_ALL_AIRLINES_CARD_DATA.features.length > 3 && (
            <p className="text-xs text-muted-foreground pl-5 sm:pl-6" role="listitem">
              +{TBANK_ALL_AIRLINES_CARD_DATA.features.length - 3} преимуществ
            </p>
          )}
        </div>

        {/* Страховка */}
        {variant === 'full' && showDetails && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">
                  Страховка в подарок
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                  {TBANK_ALL_AIRLINES_CARD_DATA.insurance.medicalCoverage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Рекламный лейбл с erid */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t">
          <p 
            className="text-[10px] sm:text-xs text-muted-foreground"
            role="contentinfo"
            aria-label={`Рекламная информация. Идентификатор рекламы: ${TBANK_ALL_AIRLINES_CARD_DATA.affiliate.erid}`}
          >
            Реклама • erid: {TBANK_ALL_AIRLINES_CARD_DATA.affiliate.erid}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2 px-4 sm:px-6 pb-4 sm:pb-6">
        <Button
          variant="default"
          size={variant === 'compact' ? 'sm' : 'default'}
          className="w-full text-sm sm:text-base bg-yellow-600 hover:bg-yellow-700"
          onClick={handleCardClick}
          onKeyDown={handleKeyDown}
          aria-label={`Оформить дебетовую карту ${TBANK_ALL_AIRLINES_CARD_DATA.name} в ${TBANK_ALL_AIRLINES_CARD_DATA.bankShortName}. Откроется в новой вкладке`}
          aria-describedby="tbank-all-airlines-description"
        >
          Оформить карту
          <ExternalLink className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
        </Button>
        
        {variant === 'full' && showDetails && TBANK_ALL_AIRLINES_CARD_DATA.promotion && (
          <p className="text-[10px] sm:text-xs text-center text-muted-foreground" role="note">
            {TBANK_ALL_AIRLINES_CARD_DATA.promotion.description}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
