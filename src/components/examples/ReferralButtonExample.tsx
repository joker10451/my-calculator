/**
 * Пример использования компонентов реферальных кнопок
 * Показывает различные варианты интеграции в калькуляторы
 */

import { ReferralButton, ReferralIconButton, ReferralLink } from '@/components/ReferralButton';
import type { BankProduct } from '@/types/bank';

/**
 * Пример 1: Базовое использование в результатах калькулятора
 */
export function MortgageResultWithReferral() {
  // Пример данных продукта (в реальном приложении получаем из API или MatchingAlgorithm)
  const mortgageProduct: BankProduct = {
    id: 'sber-mortgage-family',
    bank_id: 'sberbank',
    product_type: 'mortgage',
    name: 'Семейная ипотека',
    interest_rate: 6.0,
    bank: {
      id: 'sberbank',
      name: 'Сбербанк',
      short_name: 'Сбербанк',
      is_partner: true,
      commission_rate: 0.5, // 0.5% комиссия
      website_url: 'https://www.sberbank.ru',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-xl font-bold">Рекомендуемый продукт</h3>
      
      <div className="space-y-2">
        <p className="text-lg font-semibold">{mortgageProduct.name}</p>
        <p className="text-sm text-muted-foreground">
          Ставка: {mortgageProduct.interest_rate}% годовых
        </p>
      </div>

      {/* Основная кнопка оформления */}
      <ReferralButton
        product={mortgageProduct}
        source="calculator"
        variant="default"
        size="lg"
        className="w-full"
      />

      {/* Альтернативный вариант с кастомным текстом */}
      <ReferralButton
        product={mortgageProduct}
        source="calculator"
        variant="outline"
        showCommission={true}
      >
        Узнать подробности
      </ReferralButton>
    </div>
  );
}

/**
 * Пример 2: Список рекомендаций с кнопками
 */
export function ProductRecommendationsList() {
  const recommendations: BankProduct[] = [
    {
      id: 'vtb-mortgage-standard',
      bank_id: 'vtb',
      product_type: 'mortgage',
      name: 'Стандартная ипотека',
      interest_rate: 7.5,
      bank: {
        id: 'vtb',
        name: 'ВТБ',
        short_name: 'ВТБ',
        is_partner: true,
        commission_rate: 0.4,
        website_url: 'https://www.vtb.ru',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: 'alfa-mortgage-express',
      bank_id: 'alfabank',
      product_type: 'mortgage',
      name: 'Экспресс-ипотека',
      interest_rate: 8.0,
      bank: {
        id: 'alfabank',
        name: 'Альфа-Банк',
        short_name: 'Альфа-Банк',
        is_partner: false,
        website_url: 'https://www.alfabank.ru',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Топ предложений</h3>
      
      {recommendations.map((product) => (
        <div key={product.id} className="glass-card p-4 flex items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {product.bank?.name} • {product.interest_rate}%
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* Компактная кнопка */}
            <ReferralButton
              product={product}
              source="recommendation"
              variant="outline"
              size="sm"
            >
              Оформить
            </ReferralButton>
            
            {/* Иконка для быстрого перехода */}
            <ReferralIconButton
              product={product}
              source="recommendation"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Пример 3: Текстовая ссылка в описании
 */
export function ProductDescriptionWithLink() {
  const depositProduct: BankProduct = {
    id: 'sber-deposit-save',
    bank_id: 'sberbank',
    product_type: 'deposit',
    name: 'Сохраняй',
    interest_rate: 15.0,
    bank: {
      id: 'sberbank',
      name: 'Сбербанк',
      short_name: 'Сбербанк',
      is_partner: true,
      commission_rate: 0.1,
      website_url: 'https://www.sberbank.ru',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-bold">{depositProduct.name}</h3>
      
      <p className="text-sm text-muted-foreground">
        Вклад с высокой процентной ставкой до {depositProduct.interest_rate}% годовых.
        Минимальная сумма от 1 000 ₽.{' '}
        <ReferralLink
          product={depositProduct}
          source="calculator"
          className="font-medium"
        >
          Подробнее на сайте банка
        </ReferralLink>
      </p>
    </div>
  );
}

/**
 * Пример 4: Интеграция с результатами MatchingAlgorithm
 */
export function OptimalSolutionWithReferral() {
  // В реальном приложении получаем из MatchingAlgorithm.findOptimalProducts()
  const optimalSolution = {
    primary: {
      product: {
        id: 'sber-mortgage-family',
        bank_id: 'sberbank',
        product_type: 'mortgage',
        name: 'Семейная ипотека',
        interest_rate: 6.0,
        bank: {
          id: 'sberbank',
          name: 'Сбербанк',
          short_name: 'Сбербанк',
          is_partner: true,
          commission_rate: 0.5,
          website_url: 'https://www.sberbank.ru',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      } as BankProduct,
      score: 95,
      matchReasons: ['Низкая ставка', 'Быстрое одобрение', 'Партнерский банк']
    },
    alternatives: [
      {
        product: {
          id: 'vtb-mortgage-standard',
          bank_id: 'vtb',
          product_type: 'mortgage',
          name: 'Стандартная ипотека',
          interest_rate: 7.5,
          bank: {
            id: 'vtb',
            name: 'ВТБ',
            short_name: 'ВТБ',
            is_partner: true,
            commission_rate: 0.4,
            website_url: 'https://www.vtb.ru',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        } as BankProduct,
        score: 88
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Основная рекомендация */}
      <div className="glass-card p-6 space-y-4 border-2 border-primary">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Лучшее предложение</h3>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
            {optimalSolution.primary.score} баллов
          </span>
        </div>
        
        <div>
          <p className="text-lg font-semibold">{optimalSolution.primary.product.name}</p>
          <p className="text-sm text-muted-foreground">
            {optimalSolution.primary.product.bank?.name} • {optimalSolution.primary.product.interest_rate}%
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {optimalSolution.primary.matchReasons.map((reason, i) => (
            <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
              {reason}
            </span>
          ))}
        </div>

        <ReferralButton
          product={optimalSolution.primary.product}
          source="recommendation"
          variant="default"
          size="lg"
          className="w-full"
          showCommission={true}
        />
      </div>

      {/* Альтернативы */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground">Альтернативные варианты</h4>
        {optimalSolution.alternatives.map((alt) => (
          <div key={alt.product.id} className="glass-card p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">{alt.product.name}</p>
              <p className="text-xs text-muted-foreground">
                {alt.product.bank?.name} • {alt.product.interest_rate}%
              </p>
            </div>
            <ReferralButton
              product={alt.product}
              source="recommendation"
              variant="outline"
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
