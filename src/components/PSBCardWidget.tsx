/**
 * Компонент для отображения дебетовой карты "Зарплатные привилегии" от банка ПСБ
 * Партнерская интеграция с соблюдением требований рекламного законодательства
 */

import { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PSB_CARD_DATA } from '@/config/psbCard';
import type { BankProduct } from '@/types/bank';
import type { ReferralClickEvent } from '@/lib/analytics/referralTracking';
import { useReferralTracking } from '@/lib/analytics/referralTracking';
import { trackYandexGoal } from '@/hooks/useYandexMetrika';
import { CheckCircle2, ExternalLink } from 'lucide-react';

/**
 * Пропсы компонента PSBCardWidget
 */
export interface PSBCardWidgetProps {
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
 * Компонент карточки дебетовой карты ПСБ
 * 
 * Отображает информацию о карте "Зарплатные привилегии" с партнерской ссылкой.
 * Соблюдает требования рекламного законодательства (отображение erid).
 * 
 * @example
 * ```tsx
 * <PSBCardWidget source="calculator" variant="full" />
 * ```
 */
export function PSBCardWidget({
  source,
  variant = 'full',
  className = '',
  showDetails = true
}: PSBCardWidgetProps) {
  // Используем хук для трекинга
  const { trackClick } = useReferralTracking();
  
  // Отслеживание просмотра карточки при монтировании компонента
  useEffect(() => {
    try {
      trackYandexGoal('psb_card_view', {
        source,
        productId: PSB_CARD_DATA.id,
        variant
      });
    } catch (error) {
      console.error('Error tracking PSB card view:', error);
    }
  }, [source, variant]);
  
  // Создаем объект BankProduct для совместимости с системой трекинга
  const psbCardProduct: BankProduct = {
    id: PSB_CARD_DATA.id,
    bank_id: 'psb',
    product_type: 'debit',
    name: PSB_CARD_DATA.name,
    description: PSB_CARD_DATA.cashback.welcome,
    
    interest_rate: 0, // не применимо для дебетовых карт
    min_amount: 0,
    max_amount: 0,
    
    fees: {
      monthly: 0, // бесплатное обслуживание
      account_maintenance: 0
    },
    
    requirements: {
      min_age: 18,
      citizenship: ['RU']
    },
    
    features: {
      online_application: true,
      fast_approval: true,
      cashback: {
        welcome: PSB_CARD_DATA.cashback.welcome,
        regular: PSB_CARD_DATA.cashback.regular,
        maxMonthly: PSB_CARD_DATA.cashback.maxMonthly
      }
    },
    
    available_regions: ['*'],
    is_active: true,
    is_featured: false,
    priority: 50,
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    
    bank: {
      id: 'psb',
      name: PSB_CARD_DATA.bankName,
      short_name: PSB_CARD_DATA.bankShortName,
      is_partner: true,
      commission_rate: 0, // не отображаем
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  // Определяем количество отображаемых преимуществ в зависимости от варианта
  const featuresToShow = variant === 'compact' 
    ? PSB_CARD_DATA.features.slice(0, 3) 
    : PSB_CARD_DATA.features;

  // Обработчик клика по кнопке
  const handleCardClick = () => {
    try {
      // Отслеживаем клик в Yandex Metrica
      trackYandexGoal('psb_card_click', {
        source,
        productId: PSB_CARD_DATA.id,
        bankId: 'psb'
      });
      
      // Отслеживаем клик через систему трекинга
      trackClick(
        psbCardProduct,
        PSB_CARD_DATA.affiliate.link,
        source
      );

      // Открываем партнерскую ссылку в новой вкладке
      const newWindow = window.open(
        PSB_CARD_DATA.affiliate.link,
        '_blank',
        'noopener,noreferrer'
      );

      // Проверяем, не заблокировал ли браузер всплывающее окно
      if (!newWindow) {
        console.warn('Popup blocked. Please allow popups for this site.');
      }
    } catch (error) {
      console.error('Error tracking PSB card click:', error);
      // Всё равно пытаемся открыть ссылку, даже если трекинг упал
      window.open(
        PSB_CARD_DATA.affiliate.link,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  // Обработчик нажатия клавиш для keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Enter или Space активируют кнопку
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Card 
      className={`overflow-hidden ${className}`}
      role="region"
      aria-labelledby="psb-card-title"
      aria-describedby="psb-card-description"
    >
      <CardHeader className={variant === 'compact' ? 'pb-3 px-4 pt-4' : 'px-4 sm:px-6 pt-4 sm:pt-6'}>
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle 
              id="psb-card-title"
              className={
                variant === 'compact' 
                  ? 'text-base sm:text-lg' 
                  : 'text-lg sm:text-xl md:text-2xl'
              }
            >
              {PSB_CARD_DATA.name}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {PSB_CARD_DATA.bankName}
            </p>
          </div>
          
          {/* Логотип банка */}
          <div className="flex-shrink-0" aria-hidden="true">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-base sm:text-lg font-bold text-primary">
                {PSB_CARD_DATA.bankShortName}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={variant === 'compact' ? 'pb-3 px-4' : 'px-4 sm:px-6'}>
        {/* Основное предложение */}
        <div 
          id="psb-card-description"
          className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-primary/5 rounded-lg"
          role="note"
          aria-label="Основное предложение по кешбэку"
        >
          <p className="text-xs sm:text-sm font-medium text-primary">
            {PSB_CARD_DATA.cashback.welcome}
          </p>
          {showDetails && variant === 'full' && (
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
              {PSB_CARD_DATA.cashback.regular}
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
          
          {variant === 'compact' && PSB_CARD_DATA.features.length > 3 && (
            <p className="text-xs text-muted-foreground pl-5 sm:pl-6" role="listitem">
              +{PSB_CARD_DATA.features.length - 3} преимуществ
            </p>
          )}
        </div>

        {/* Рекламный лейбл с erid */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t">
          <p 
            className="text-[10px] sm:text-xs text-muted-foreground"
            role="contentinfo"
            aria-label={`Рекламная информация. Идентификатор рекламы: ${PSB_CARD_DATA.affiliate.erid}`}
          >
            Реклама • erid: {PSB_CARD_DATA.affiliate.erid}
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
          aria-label={`Оформить дебетовую карту ${PSB_CARD_DATA.name} в банке ${PSB_CARD_DATA.bankName}. Откроется в новой вкладке`}
          aria-describedby="psb-card-description"
        >
          Оформить карту
          <ExternalLink className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
        </Button>
        
        {variant === 'full' && showDetails && (
          <p className="text-[10px] sm:text-xs text-center text-muted-foreground" role="note">
            Для клиентов с зарплатным проектом
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
