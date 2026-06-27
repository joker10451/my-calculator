import { useEffect, useRef } from 'react';
import { SEO } from '@/components/SEO';
import { PAMPADU_GIFTS } from '@/config/pampaduGifts';
import { SITE_URL } from '@/shared/constants';

let ppdwGiftsScriptInjected = false;

export default function GiftsPage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (ppdwGiftsScriptInjected) return;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAMPADU_GIFTS.scriptUrl}"]`,
    );
    if (existing) {
      ppdwGiftsScriptInjected = true;
      return;
    }

    const script = document.createElement('script');
    script.src = PAMPADU_GIFTS.scriptUrl;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    ppdwGiftsScriptInjected = true;
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <SEO
        title="Витрина подарков — подарочные сертификаты и наборы | Считай.RU"
        description="Выберите подарок: подарочные сертификаты, наборы и скидки от партнёров. Удобный подбор и оформление онлайн."
        canonical={`${SITE_URL}/gifts/`}
        keywords="подарки, подарочные сертификаты, наборы, скидки, акции"
      />

      <div className="container mx-auto px-4 pt-24 pb-14">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight">
              Витрина подарков
            </h1>
            <p className="text-slate-300 mt-2">
              Подарочные сертификаты, наборы и скидки от наших партнёров
            </p>
          </div>

          <div
            className="surface-card rounded-3xl overflow-hidden"
            style={{ minWidth: PAMPADU_GIFTS.minWidth }}
          >
            <iframe
              ref={iframeRef}
              id={PAMPADU_GIFTS.iframeId}
              src={PAMPADU_GIFTS.iframeSrc}
              title="Витрина подарков — Pampadu"
              scrolling="no"
              style={{
                width: '100%',
                border: 'none',
                height: `${PAMPADU_GIFTS.defaultHeight}px`,
                minWidth: PAMPADU_GIFTS.minWidth,
                overflow: 'hidden',
                display: 'block',
              }}
              loading="lazy"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-2">
            <p className="text-[10px] sm:text-xs text-slate-500">
              Реклама • Pampadu
            </p>
            <a
              href={PAMPADU_GIFTS.directLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline"
            >
              Открыть витрину в новой вкладке →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
