/**
 * PampaduMortgageInsuranceWidget — виджет сравнения цен ипотечного страхования от Pampadu.
 *
 * Что делает:
 *  - Рендерит iframe с виджетом Pampadu (ipoteka.pampadu.ru).
 *  - Подгружает скрипт `ppdw.js` для авто-ресайза iframe.
 *  - Трекает показ и клик в Яндекс.Метрику.
 *  - Даёт прямую ссылку как fallback.
 *
 * Используется на странице /calculator/mortgage рядом с нашим калькулятором.
 */

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { PAMPADU_MORTGAGE } from '@/config/pampaduMortgage';
import { trackYandexGoal } from '@/hooks/useYandexMetrika';

/** Глобальный флаг — чтобы не подгружать `ppdw.js` дважды */
let ppdwMortgageScriptInjected = false;

export interface PampaduMortgageInsuranceWidgetProps {
  source?: string;
  title?: string | null;
  subtitle?: string;
  className?: string;
  height?: number;
}

export function PampaduMortgageInsuranceWidget({
  source = 'mortgage_insurance',
  title = 'Страхование ипотеки',
  subtitle = 'Узнайте цены ипотечного страхования в разных компаниях и выберите выгодный вариант, подходящий для вашего банка',
  className = '',
  height = PAMPADU_MORTGAGE.defaultHeight,
}: PampaduMortgageInsuranceWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (ppdwMortgageScriptInjected) return;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAMPADU_MORTGAGE.scriptUrl}"]`,
    );
    if (existing) {
      ppdwMortgageScriptInjected = true;
      return;
    }

    const script = document.createElement('script');
    script.src = PAMPADU_MORTGAGE.scriptUrl;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    ppdwMortgageScriptInjected = true;
  }, []);

  useEffect(() => {
    try {
      trackYandexGoal('pampadu_mortgage_insurance_view', {
        source,
        widgetId: PAMPADU_MORTGAGE.widgetId,
      });
    } catch (error) {
      console.error('Error tracking Pampadu mortgage insurance view:', error);
    }
  }, [source]);

  const handleDirectLinkClick = () => {
    try {
      trackYandexGoal('pampadu_mortgage_insurance_direct_click', {
        source,
        widgetId: PAMPADU_MORTGAGE.widgetId,
      });
    } catch (error) {
      console.error('Error tracking Pampadu mortgage insurance direct click:', error);
    }
  };

  return (
    <Card
      className={`overflow-hidden ${className}`}
      role="region"
      aria-labelledby="pampadu-mortgage-insurance-title"
    >
      {title !== null && (
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle
                id="pampadu-mortgage-insurance-title"
                className="text-lg sm:text-xl md:text-2xl"
              >
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="px-2 sm:px-4 pb-4 sm:pb-6">
        <div
          className="w-full rounded-lg overflow-hidden bg-background"
          style={{ minWidth: PAMPADU_MORTGAGE.minWidth }}
        >
          <iframe
            ref={iframeRef}
            id={PAMPADU_MORTGAGE.iframeId}
            src={PAMPADU_MORTGAGE.iframeSrc}
            title="Страхование ипотеки — Pampadu"
            scrolling="no"
            style={{
              width: '100%',
              border: 'none',
              height: `${height}px`,
              minWidth: PAMPADU_MORTGAGE.minWidth,
              overflow: 'hidden',
              display: 'block',
            }}
            loading="lazy"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Реклама • Pampadu
          </p>
          <a
            href={PAMPADU_MORTGAGE.directLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleDirectLinkClick}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline"
            aria-label="Открыть калькулятор страхования ипотеки в новой вкладке"
          >
            Открыть в новой вкладке
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default PampaduMortgageInsuranceWidget;
