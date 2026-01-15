/**
 * Компонент для отображения кредитной карты ВТБ
 * Партнерская интеграция с соблюдением требований рекламного законодательства
 */

import { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VTB_CREDIT_CARD_DATA } from '@/config/vtbCreditCard';
import type { BankProduct } from '@/types/bank';
import type { ReferralClickEvent } from '@/lib/analytics/referralTracking';
import { useReferralTracking } from '@/lib/analytics/referralTracking';
import { trackYandexGoal } from '@/hooks/useYandexMetrika';
import { CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';

/**
 * Пропсы компонента VTBCreditCardWidget
 */
export interface VTBCreditCardWidgetProps {
  /** Источник отображения карточки (для аналитики) */
  source: ReferralClickEvent['source'];
  
  /** Вариант отображения */
  variant?: 'compact' | 'full';
  
  /** Дополнительные CSS классы */
  className?: string;
  
  /** Показывать ли детальную информацию */
  showDetails?: boolean;
}

/**
 * Компонент карточки кредитной карты ВТБ
 * 
 * Отображает информацию о кредитной карте ВТБ с партнерской ссылкой.
 * Соблюдает требования рекламного законодательства (отображение erid, ПСК, дисклеймеров).
 * 
 * @example
 * ```tsx
 * <VTBCreditCardWidget source="calculator" variant="full" />
 * ```
 */
export function VTBCreditCardWidget({
  source,
  variant = 'full',
  className = '',
  showDetails = true
}: VTBCreditCardWidgetProps) {
  // Используем хук для трекинга
  const { trackClick } = useReferralTracking();
  
  // Отслеживание просмотра карточки при монтировании компонента
  useEffect(() => {
    try {
      trackYandexGoal('vtb_credit_card_view', {
        source,
        productId: VTB_CREDIT_CARD_DATA.id,
        variant
      });
    } catch (error) {
      console.error('Error tracking VTB credit card view:', error);
    }
  }, [source, variant]);
  
  // Создаем объект BankProduct для совместимости с системой трекинга
  const vtbCreditCardProduct: BankProduct = {
    id: VTB_CREDIT_CARD_DATA.id,
    bank_id: 'vtb',
    product_type: 'credit',
    name: VTB_CREDIT_CARD_DATA.name,
    description: `Кредитная карта с льготным периодом до ${VTB_CREDIT_CARD_DATA.gracePeriod.refinancing} дней`,
    
    interest_rate: 49.9,
    min_amount: 0,
    max_amount: VTB_CREDIT_CARD_DATA.creditLimit.max,
    
    fees: {
      monthly: VTB_CREDIT_CARD_DATA.fees.annual / 12,
      account_maintenance: 0
    },
    
    requirements: {
      min_age: 18,
      citizenship: ['RU']
    },
    
    features: {
      online_application: true,
      fast_approval: true,
      grace_period: VTB_CREDIT_CARD_DATA.gracePeriod.purchases,
      cashback: {
        regular: VTB_CREDIT_CARD_DATA.cashback.max,
        maxMonthly: VTB_CREDIT_CARD_DATA.cashback.maxMonthly
      }
    },
    
    available_regions: ['*'],
    is_active: true,
    is_featured: false,
    priority: 50,
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    
    bank: {
      id: 'vtb',
      name: VTB_CREDIT_CARD_DATA.bankName,
      short_name: VTB_CREDIT_CARD_DATA.bankShortName,
      is_partner: true,
      commission_rate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  // Определяем количество отображаемых преимуществ в зависимости от варианта
  const featuresToShow = variant === 'compact' 
    ? VTB_CREDIT_CARD_DATA.features.slice(0, 3) 
    : VTB_CREDIT_CARD_DATA.features;

  // Обработчик клика по кнопке
  const handleCardClick = () => {
    try {
      // Отслеживаем клик в Yandex Metrica
      trackYandexGoal('vtb_credit_card_click', {
        source,
        productId: VTB_CREDIT_CARD_DATA.id,
        bankId: 'vtb'
      });
      
      // Отслеживаем клик через систему трекинга
      trackClick(
        vtbCreditCardProduct,
        VTB_CREDIT_CARD_DATA.affiliate.link!,
        source
      );

      // Открываем партнерскую ссылку в новой вкладке
      const newWindow = window.open(
        VTB_CREDIT_CARD_DATA.affiliate.link,
        '_blank',
        'noopener,noreferrer'
      );

      // Проверяем, не заблокировал ли браузер всплывающее окно
      if (!newWindow) {
        console.warn('Popup blocked. Please allow popups for this site.');
      }
    } catch (error) {
      console.error('Error tracking VTB credit card click:', error);
      // Всё равно пытаемся открыть ссылку, даже если трекинг упал
      window.open(
        VTB_CREDIT_CARD_DATA.affiliate.link,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  // Обработчик нажатия клавиш для keyboard navigation
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
      aria-labelledby="vtb-credit-card-title"
      aria-describedby="vtb-credit-card-description"
    >
      <CardHeader className={variant === 'compact' ? 'pb-3 px-4 pt-4' : 'px-4 sm:px-6 pt-4 sm:pt-6'}>
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle 
              id="vtb-credit-card-title"
              className={
                variant === 'compact' 
                  ? 'text-base sm:text-lg' 
                  : 'text-lg sm:text-xl md:text-2xl'
              }
            >
              {VTB_CREDIT_CARD_DATA.name}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {VTB_CREDIT_CARD_DATA.bankName}
            </p>
          </div>
          
          {/* Логотип банка */}
          <div className="flex-shrink-0" aria-hidden="true">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-base sm:text-lg font-bold text-primary">
                {VTB_CREDIT_CARD_DATA.bankShortName}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={variant === 'compact' ? 'pb-3 px-4' : 'px-4 sm:px-6'}>
        {/* Основное предложение */}
        <div 
          id="vtb-credit-card-description"
          className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-primary/5 rounded-lg"
          role="note"
          aria-label="Основное предложение по кредитной карте"
        >
          <p className="text-xs sm:text-sm font-medium text-primary">
            До {VTB_CREDIT_CARD_DATA.gracePeriod.refinancing} дней без процентов
          </p>
          {showDetails && variant === 'full' && (
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
              {VTB_CREDIT_CARD_DATA.cashback.max} кешбэк рублями в выбранных категориях
            </p>
          )}
        </div>

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
          
          {variant === 'compact' && VTB_CREDIT_CARD_DATA.features.length > 3 && (
            <p className="text-xs text-muted-foreground pl-5 sm:pl-6" role="listitem">
              +{VTB_CREDIT_CARD_DATA.features.length - 3} преимуществ
            </p>
          )}
        </div>

        {/* Обязательный дисклеймер (занимает не менее 10% пространства) */}
        {variant === 'full' && showDetails && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-100">
                  {VTB_CREDIT_CARD_DATA.disclaimers.main}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {VTB_CREDIT_CARD_DATA.disclaimers.fullConditions}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  ПСК {VTB_CREDIT_CARD_DATA.rates.psk}
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
            aria-label={`Рекламная информация. Идентификатор рекламы: ${VTB_CREDIT_CARD_DATA.affiliate.erid}`}
          >
            Реклама • erid: {VTB_CREDIT_CARD_DATA.affiliate.erid}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2 px-4 sm:px-6 pb-4 sm:pb-6">
        <Button
          variant="default"
          size={variant === 'compact' ? 'sm' : 'default'}
          className="w-full text-sm sm:text-base"
          onClick={handleCardClick}
          onKeyDown={handleKeyDown}
          aria-label={`Оформить кредитную карту ${VTB_CREDIT_CARD_DATA.name} в банке ${VTB_CREDIT_CARD_DATA.bankName}. Откроется в новой вкладке`}
          aria-describedby="vtb-credit-card-description"
        >
          Оформить карту
          <ExternalLink className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
        </Button>
        
        {variant === 'full' && showDetails && (
          <p className="text-[10px] sm:text-xs text-center text-muted-foreground" role="note">
            Минимальный доход от {VTB_CREDIT_CARD_DATA.requirements.minIncome.toLocaleString('ru-RU')} ₽/мес
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
