import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Clock, Flame, X, Gift, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackYandexGoal } from "@/hooks/useYandexMetrika";
import { trackAffiliateClick } from "@/utils/affiliateTracking";

// Конфиг промо-полос. Можно расширить и подключить CMS/Supabase.
// Важно: endDate в ISO; баннер исчезает, когда дедлайн прошёл.
export interface PromoBanner {
  id: string;
  partnerName: string;
  productType: string;
  title: string;
  description: string;
  ctaText: string;
  href: string; // внутренний путь или внешняя affiliate-ссылка
  badge?: string; // "Топ", "Хит", "−30%"
  endDate: string; // ISO
  variant?: "default" | "urgent" | "success";
  bgClass?: string;
}

const PROMO_BANNERS: PromoBanner[] = [
  {
    id: "psb-cashback-jan",
    partnerName: "PSB",
    productType: "cashback_card",
    title: "Кешбэк 5% по карте PSB",
    description: "Только до конца января — повышенный кешбэк на всё при оформлении через Считай.RU",
    ctaText: "Получить карту",
    href: "/promocodes/psb",
    badge: "−30% на оформление",
    endDate: "2026-01-31T23:59:59+03:00",
    variant: "urgent",
    bgClass: "from-amber-500/15 via-orange-500/10 to-red-500/5",
  },
  {
    id: "joymoney-zaym",
    partnerName: "JoyMoney",
    productType: "microloan",
    title: "Первый займ 0% в JoyMoney",
    description: "Без процентов на первый займ до 10 000 ₽. Решение за 1 минуту",
    ctaText: "Забрать займ",
    href: "/joy-money",
    badge: "0%",
    endDate: "2026-02-15T23:59:59+03:00",
    variant: "default",
    bgClass: "from-emerald-500/15 via-green-500/10 to-teal-500/5",
  },
  {
    id: "osago-zetta",
    partnerName: "Zetta",
    productType: "osago",
    title: "ОСАГО от 4 200 ₽",
    description: "Сравни 14 страховых и оформи за 5 минут. Экономия до 35%",
    ctaText: "Сравнить тарифы",
    href: "/insurance/osgop-taxi",
    badge: "Хит",
    endDate: "2026-03-01T23:59:59+03:00",
    variant: "success",
    bgClass: "from-blue-500/15 via-indigo-500/10 to-purple-500/5",
  },
];

const STORAGE_KEY = "promo_banner_dismissed";

function useCountdown(endDateIso: string) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(endDateIso));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(endDateIso)), 1000);
    return () => clearInterval(id);
  }, [endDateIso]);

  return timeLeft;
}

function calcTimeLeft(endDateIso: string) {
  const diff = new Date(endDateIso).getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff / 3_600_000) % 24),
    m: Math.floor((diff / 60_000) % 60),
    s: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

interface PromoCountdownBannerProps {
  banner: PromoBanner;
  onDismiss: (id: string) => void;
}

function PromoCountdownBanner({ banner, onDismiss }: PromoCountdownBannerProps) {
  const t = useCountdown(banner.endDate);

  const handleClick = () => {
    trackYandexGoal("promo_banner_click", { banner_id: banner.id });
    trackAffiliateClick({
      partnerName: banner.partnerName,
      productType: banner.productType,
      linkUrl: banner.href,
      source: "homepage_promo_banner",
      pageUrl: window.location.pathname,
      placement: "hero",
      offerId: banner.id,
    });
  };

  if (t.expired) return null;

  const isUrgent = banner.variant === "urgent" || t.d < 3;
  const isSuccess = banner.variant === "success";

  return (
    <div
      className={`relative border-y border-border/60 bg-gradient-to-r ${banner.bgClass ?? "from-primary/10 to-blue-500/5"} backdrop-blur-sm`}
      role="region"
      aria-label={banner.title}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 py-3">
          {/* Иконка/бейдж */}
          <div
            className={`hidden sm:flex flex-shrink-0 w-10 h-10 rounded-xl items-center justify-center ${
              isUrgent
                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                : isSuccess
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isUrgent ? <Flame className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
          </div>

          {/* Контент */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-bold text-sm md:text-base text-foreground truncate">
                {banner.title}
              </span>
              {banner.badge && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                    isUrgent
                      ? "bg-red-500 text-white"
                      : isSuccess
                      ? "bg-blue-500 text-white"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {banner.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">
              {banner.description}
            </p>
          </div>

          {/* Таймер (компактный) */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-semibold text-foreground tabular-nums flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className={isUrgent ? "text-red-600 dark:text-red-400" : ""}>
              {t.d > 0 && `${t.d}д `}
              {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
            </span>
          </div>

          {/* CTA */}
          <Button
            asChild={false}
            size="sm"
            variant={isUrgent ? "default" : "outline"}
            onClick={handleClick}
            className="flex-shrink-0 gap-1 h-9"
          >
            <Link to={banner.href} className="flex items-center gap-1">
              {banner.ctaText}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>

          {/* Закрыть */}
          <button
            onClick={() => onDismiss(banner.id)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors flex-shrink-0"
            aria-label={`Закрыть баннер «${banner.title}»`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PromoCountdownBar() {
  // Показываем только первый не истёкший и не закрытый баннер.
  // localStorage: id закрытых баннеров (на сессию).
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const handleDismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore quota
      }
      return next;
    });
    trackYandexGoal("promo_banner_dismiss", { banner_id: id });
  }, []);

  // Находим первый не истёкший и не закрытый баннер
  const now = Date.now();
  const activeBanner = PROMO_BANNERS.find((b) => {
    if (dismissed.has(b.id)) return false;
    if (new Date(b.endDate).getTime() <= now) return false;
    return true;
  });

  if (!activeBanner) return null;

  return (
    <PromoCountdownBanner banner={activeBanner} onDismiss={handleDismiss} />
  );
}

export default PromoCountdownBar;
