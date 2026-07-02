import { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Copy, Check, Clock, Tag, Search, Filter, Sparkles,
  Gift, Percent, TrendingUp, ChevronRight, Banknote, X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  PROMOCODES, getActivePromos, sortPromos, getPromoCategories, CATEGORY_LABELS,
  type PromoCode, type PromoCategory, type DiscountType,
} from "@/data/promocodes";
import { trackYandexGoal } from "@/hooks/useYandexMetrika";
import { trackAffiliateClick } from "@/utils/affiliateTracking";

const DISCOUNT_ICONS: Record<DiscountType, typeof Percent> = {
  percent: Percent,
  fixed: Banknote,
  cashback: TrendingUp,
  gift: Gift,
  freebie: Sparkles,
};

const DISCOUNT_COLORS: Record<DiscountType, string> = {
  percent: "from-rose-500 to-pink-600",
  fixed: "from-amber-500 to-orange-600",
  cashback: "from-emerald-500 to-teal-600",
  gift: "from-violet-500 to-purple-600",
  freebie: "from-blue-500 to-indigo-600",
};

function timeLeft(endDateIso: string): string {
  const diff = new Date(endDateIso).getTime() - Date.now();
  if (diff <= 0) return "истекла";
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff / 3_600_000) % 24);
  if (d > 0) return `осталось ${d} дн ${h} ч`;
  const m = Math.floor((diff / 60_000) % 60);
  return `осталось ${h} ч ${m} мин`;
}

interface PromoCardProps {
  promo: PromoCode;
  onCopy: (id: string) => void;
  copiedId: string | null;
}

function PromoCard({ promo, onCopy, copiedId }: PromoCardProps) {
  const Icon = DISCOUNT_ICONS[promo.discount.type] ?? Tag;
  const colorClass = DISCOUNT_COLORS[promo.discount.type] ?? "from-primary to-blue-600";
  const [time, setTime] = useState(() => timeLeft(promo.endDate));

  useEffect(() => {
    const id = setInterval(() => setTime(timeLeft(promo.endDate)), 60_000);
    return () => clearInterval(id);
  }, [promo.endDate]);

  const handleActivate = () => {
    trackYandexGoal("promo_activate_click", { promo_id: promo.id });
    trackAffiliateClick({
      partnerName: promo.partnerId,
      productType: promo.productType,
      linkUrl: promo.affiliateUrl,
      source: "promocodes_page",
      pageUrl: window.location.pathname,
      placement: "promocodes_grid",
      offerId: promo.id,
    });
  };

  const handleCopy = () => {
    if (promo.code) {
      onCopy(promo.id);
    }
  };

  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      {/* Discount badge — top right */}
      <div className={`absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r ${colorClass} text-white text-xs font-bold shadow-md`}>
        <Icon className="w-3.5 h-3.5" />
        {promo.discount.value}
      </div>

      {/* Header: partner */}
      <div className="flex items-center gap-3 p-5 pb-3 border-b border-border/50">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground flex-shrink-0">
          {promo.partner.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground">{CATEGORY_LABELS[promo.category]}</div>
          <div className="text-sm font-bold text-foreground truncate">{promo.partner}</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-base font-bold text-foreground mb-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {promo.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
          {promo.description}
        </p>

        {/* Timer */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>{time}</span>
        </div>

        {/* Conditions */}
        {promo.conditions && promo.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {promo.conditions.map((c) => (
              <span
                key={c}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: code + activate */}
      <div className="p-4 border-t border-border bg-muted/30 flex items-center gap-2">
        {promo.code ? (
          <>
            <button
              onClick={handleCopy}
              className="flex-1 min-w-0 inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 text-foreground font-mono text-sm font-bold tracking-wider hover:border-primary/60 hover:bg-primary/10 transition-colors"
              aria-label={`Скопировать код ${promo.code}`}
            >
              {copiedId === promo.id ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="truncate">{promo.code}</span>
                </>
              )}
            </button>
          </>
        ) : (
          <div className="flex-1 text-xs text-muted-foreground italic">
            Акция применяется автоматически
          </div>
        )}
        <Button
          asChild={false}
          size="sm"
          onClick={handleActivate}
          className="gap-1 flex-shrink-0"
        >
          <Link to={promo.affiliateUrl} className="flex items-center gap-1">
            Активировать
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export default function PromocodesPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<PromoCategory | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => getPromoCategories(PROMOCODES), []);

  const filtered = useMemo(() => {
    let list = sortPromos(getActivePromos(PROMOCODES));
    if (activeCat !== "all") {
      list = list.filter((p) => p.category === activeCat);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.partner.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, activeCat]);

  const featured = useMemo(() => {
    return sortPromos(getActivePromos(PROMOCODES))
      .filter((p) => p.isFeatured)
      .slice(0, 3);
  }, []);

  const handleCopy = useCallback((id: string) => {
    const promo = PROMOCODES.find((p) => p.id === id);
    if (!promo?.code) return;
    navigator.clipboard.writeText(promo.code).then(() => {
      setCopiedId(id);
      trackYandexGoal("promo_code_copied", { promo_id: id });
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const totalActive = getActivePromos(PROMOCODES).length;

  return (
    <>
      <SEO
        title="Промокоды и акции — Считай.RU"
        description={`Каталог из ${totalActive} актуальных промокодов банков, магазинов и сервисов. Скидки, кешбэк, подарки — экономия до 50%.`}
        keywords="промокоды, акции, скидки, кешбэк, купоны, банки, магазины"
        canonical="https://schitay-online.ru/promocodes"
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main id="main-content" className="flex-1 pt-24 md:pt-28">
          {/* Hero */}
          <section className="container mx-auto px-4 text-center max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Обновлено сегодня
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              Промокоды и акции
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                со скидкой до 50%
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {totalActive} актуальных предложений от банков, магазинов и сервисов. Все коды — проверены вручную.
            </p>
          </section>

          {/* Featured (топ-3) */}
          {featured.length > 0 && (
            <section className="container mx-auto px-4 mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Топ предложения
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featured.map((p) => (
                  <PromoCard
                    key={p.id}
                    promo={p}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Filters */}
          <section className="container mx-auto px-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Поиск по магазину, акции или тегу…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11"
                  aria-label="Поиск промокодов"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Очистить поиск"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <button
                onClick={() => setActiveCat("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCat === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Все ({totalActive})
              </button>
              {categories.map((c) => {
                const count = getActivePromos(PROMOCODES).filter((p) => p.category === c).length;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeCat === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {CATEGORY_LABELS[c]} ({count})
                  </button>
                );
              })}
            </div>
          </section>

          {/* Grid */}
          <section className="container mx-auto px-4 pb-12">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-2">Ничего не найдено</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setActiveCat("all");
                  }}
                >
                  Сбросить фильтры
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => (
                  <PromoCard
                    key={p.id}
                    promo={p}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Disclaimer */}
          <section className="container mx-auto px-4 pb-12">
            <div className="text-xs text-muted-foreground p-4 rounded-xl bg-muted/30 border border-border/50 max-w-3xl mx-auto">
              <strong>Дисклеймер:</strong> промокоды предоставлены партнёрами. Условия применения и размер скидки могут отличаться. Переходя по ссылке «Активировать», вы соглашаетесь с{" "}
              <Link to="/terms" className="text-primary hover:underline">условиями использования сервиса</Link>.
              Некоторые ссылки являются партнёрскими — мы можем получать вознаграждение.
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
