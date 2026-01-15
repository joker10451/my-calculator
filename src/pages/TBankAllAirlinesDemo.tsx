/**
 * Демо-страница для отображения виджета дебетовой карты Т-Банк ALL Airlines
 */

import { TBankAllAirlinesWidget } from '@/components/TBankAllAirlinesWidget';
import { TBankAllAirlinesErrorBoundary } from '@/components/TBankAllAirlinesErrorBoundary';
import { TBANK_ALL_AIRLINES_CARD_DATA } from '@/config/tBankAllAirlinesCard';
import { Helmet } from 'react-helmet-async';
import { Plane, Shield, Gift } from 'lucide-react';

export default function TBankAllAirlinesDemo() {
  return (
    <>
      <Helmet>
        <title>Дебетовая карта ALL Airlines Т-Банк - Считай.RU</title>
        <meta 
          name="description" 
          content="Дебетовая карта для путешествий с милями. Авиабилеты в обмен на мили, страховка в подарок, бесплатное обслуживание 12 месяцев." 
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Дебетовая карта ALL Airlines</h1>
          <p className="text-muted-foreground">
            Карта для путешествий от Т-Банк с милями и страховкой
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Компактный вариант */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Компактный вариант</h2>
            <TBankAllAirlinesErrorBoundary>
              <TBankAllAirlinesWidget 
                source="blog" 
                variant="compact"
                showDetails={false}
                showPromoCode={false}
              />
            </TBankAllAirlinesErrorBoundary>
          </div>

          {/* Полный вариант */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Полный вариант</h2>
            <TBankAllAirlinesErrorBoundary>
              <TBankAllAirlinesWidget 
                source="blog" 
                variant="full"
                showDetails={true}
                showPromoCode={true}
              />
            </TBankAllAirlinesErrorBoundary>
          </div>
        </div>

        {/* Детальная информация */}
        <div className="space-y-6">
          {/* О карте */}
          <div className="p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5" />
              О карте ALL Airlines
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                {TBANK_ALL_AIRLINES_CARD_DATA.miles.description}. 
                Срок хранения миль — {TBANK_ALL_AIRLINES_CARD_DATA.miles.validity}, 
                что дает вам достаточно времени для накопления нужной суммы.
              </p>
              <p>
                {TBANK_ALL_AIRLINES_CARD_DATA.miles.conversion}. 
                Минимальная сумма для возврата — {TBANK_ALL_AIRLINES_CARD_DATA.miles.minRedemption.toLocaleString('ru-RU')} ₽.
              </p>
            </div>
          </div>

          {/* Бонусы */}
          <div className="p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Бонусы за покупки
            </h2>
            <div className="space-y-2 text-sm">
              <p>• {TBANK_ALL_AIRLINES_CARD_DATA.bonuses.hotels}</p>
              <p>• {TBANK_ALL_AIRLINES_CARD_DATA.bonuses.flights}</p>
              <p>• {TBANK_ALL_AIRLINES_CARD_DATA.bonuses.airlines}</p>
              <p>• {TBANK_ALL_AIRLINES_CARD_DATA.bonuses.everyday}</p>
              <p>• {TBANK_ALL_AIRLINES_CARD_DATA.bonuses.special}</p>
            </div>
          </div>

          {/* Страховка */}
          <div className="p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Страховой полис в подарок
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                <strong>Цена:</strong> {TBANK_ALL_AIRLINES_CARD_DATA.insurance.price}
              </p>
              <p>
                <strong>Медицинское покрытие:</strong> {TBANK_ALL_AIRLINES_CARD_DATA.insurance.medicalCoverage}
              </p>
              <p>
                <strong>Багаж:</strong> {TBANK_ALL_AIRLINES_CARD_DATA.insurance.baggageCoverage}
              </p>
              <p>
                <strong>Активный отдых:</strong> {TBANK_ALL_AIRLINES_CARD_DATA.insurance.activities.join(', ')}
              </p>
              <a 
                href={TBANK_ALL_AIRLINES_CARD_DATA.insurance.tariffLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Подробнее о тарифе
              </a>
            </div>
          </div>

          {/* Акция */}
          {TBANK_ALL_AIRLINES_CARD_DATA.promotion && (
            <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h2 className="text-xl font-semibold mb-4">
                🎉 Акция: {TBANK_ALL_AIRLINES_CARD_DATA.promotion.name}
              </h2>
              <div className="space-y-2 text-sm">
                <p>{TBANK_ALL_AIRLINES_CARD_DATA.promotion.description}</p>
                <p className="text-muted-foreground">
                  Действует до {TBANK_ALL_AIRLINES_CARD_DATA.promotion.validUntil}
                </p>
                {TBANK_ALL_AIRLINES_CARD_DATA.affiliate.promoCode && (
                  <div className="mt-4 p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Промокод</p>
                    <p className="text-lg font-bold text-primary font-mono">
                      {TBANK_ALL_AIRLINES_CARD_DATA.affiliate.promoCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Целевая аудитория */}
          <div className="p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Для кого эта карта</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Целевая аудитория:</strong> {TBANK_ALL_AIRLINES_CARD_DATA.targetAudience.description}
              </p>
              <p>
                <strong>Пол:</strong> {TBANK_ALL_AIRLINES_CARD_DATA.targetAudience.gender}
              </p>
              <p>
                <strong>Средний возраст:</strong> {TBANK_ALL_AIRLINES_CARD_DATA.targetAudience.averageAge} лет
              </p>
              <p>
                <strong>Возрастная группа:</strong> {TBANK_ALL_AIRLINES_CARD_DATA.targetAudience.ageGroup}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
