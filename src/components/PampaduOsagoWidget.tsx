/**
 * PampaduOsagoWidget — встраиваемый виджет расчёта ОСАГО от партнёрки Pampadu.
 *
 * Что делает:
 *  - Рендерит iframe с виджетом Pampadu (b2c.pampadu.ru).
 *  - Один раз на страницу подгружает скрипт `ppdw.js`, который умеет
 *    авто-ресайзить iframe под фактическую высоту контента.
 *  - Трекает показ и клик-фоллбэк в Яндекс.Метрику (как остальные партнёрки).
 *  - Даёт «прямую ссылку» — для пользователей, у которых iframe заблокирован.
 *
 * Используется на странице /calculator/osago рядом с собственным расчётом
 * (наш калькулятор — оценка, виджет Pampadu — фактическое оформление полиса).
 */

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { PAMPADU_OSAGO } from '@/config/pampaduOsago';
import { trackYandexGoal } from '@/hooks/useYandexMetrika';

/** Глобальный флаг — чтобы не подгружать `ppdw.js` дважды */
let ppdwScriptInjected = false;

export interface PampaduOsagoWidgetProps {
  /** Источник отображения (для аналитики) */
  source?: string;
  /** Заголовок над виджетом. Можно скрыть, передав `null`. */
  title?: string | null;
  /** Подпись под заголовком */
  subtitle?: string;
  /** Дополнительные CSS-классы для внешней карточки */
  className?: string;
  /** Высота iframe в px (по умолчанию из конфига) */
  height?: number;
}

export function PampaduOsagoWidget({
  source = 'osago_calculator',
  title = 'Калькулятор ОСАГО',
  subtitle = 'Простой способ выгодно купить полис',
  className = '',
  height = PAMPADU_OSAGO.defaultHeight,
}: PampaduOsagoWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Подгружаем ppdw.js один раз — он сам найдёт iframe по id="ppdwi"
  useEffect(() => {
    if (ppdwScriptInjected) return;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAMPADU_OSAGO.scriptUrl}"]`,
    );
    if (existing) {
      ppdwScriptInjected = true;
      return;
    }

    const script = document.createElement('script');
    script.src = PAMPADU_OSAGO.scriptUrl;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    ppdwScriptInjected = true;
  }, []);

  // Трекаем показ виджета в Метрику
  useEffect(() => {
    try {
      trackYandexGoal('pampadu_osago_view', {
        source,
        widgetId: PAMPADU_OSAGO.widgetId,
      });
    } catch (error) {
      console.error('Error tracking Pampadu OSAGO view:', error);
    }
  }, [source]);

  const handleDirectLinkClick = () => {
    try {
      trackYandexGoal('pampadu_osago_direct_click', {
        source,
        widgetId: PAMPADU_OSAGO.widgetId,
      });
    } catch (error) {
      console.error('Error tracking Pampadu OSAGO direct click:', error);
    }
  };

  return (
    <Card
      className={`overflow-hidden ${className}`}
      role="region"
      aria-labelledby="pampadu-osago-title"
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
                id="pampadu-osago-title"
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
        {/*
          Контейнер с фиксированной высотой — пока ppdw.js не отресайзит iframe.
          minWidth: 320 — требование Pampadu для корректного отображения.
        */}
        <div
          className="w-full rounded-lg overflow-hidden bg-background"
          style={{ minWidth: PAMPADU_OSAGO.minWidth }}
        >
          <iframe
            ref={iframeRef}
            id="ppdwi"
            src={PAMPADU_OSAGO.iframeSrc}
            title="Калькулятор ОСАГО Pampadu"
            scrolling="no"
            style={{
              width: '100%',
              border: 'none',
              height: `${height}px`,
              minWidth: PAMPADU_OSAGO.minWidth,
              overflow: 'hidden',
              display: 'block',
            }}
            loading="lazy"
          />
        </div>

        {/* Прямая ссылка — fallback и одновременно «отправить клиенту» */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Реклама • Pampadu
          </p>
          <a
            href={PAMPADU_OSAGO.directLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleDirectLinkClick}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline"
            aria-label="Открыть калькулятор ОСАГО в новой вкладке"
          >
            Открыть в новой вкладке
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default PampaduOsagoWidget;
