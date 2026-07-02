import { Link } from "react-router-dom";
import { ArrowRight, Tag, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActivePromos, sortPromos, CATEGORY_LABELS, type PromoCode } from "@/data/promocodes";
import { trackYandexGoal } from "@/hooks/useYandexMetrika";

interface PromosPreviewProps {
  count?: number;
}

function timeLeft(endDateIso: string): string {
  const diff = new Date(endDateIso).getTime() - Date.now();
  if (diff <= 0) return "истекла";
  const d = Math.floor(diff / 86_400_000);
  if (d > 30) return `до ${new Date(endDateIso).toLocaleDateString("ru-RU")}`;
  if (d > 0) return `${d} дн`;
  const h = Math.floor((diff / 3_600_000) % 24);
  return `${h} ч`;
}

function PromoMiniCard({ promo }: { promo: PromoCode }) {
  const handleClick = () => {
    trackYandexGoal("homepage_promo_card_click", { promo_id: promo.id });
  };

  return (
    <Link
      to="/promocodes"
      onClick={handleClick}
      className="group flex flex-col p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all min-h-[160px]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-xs font-bold text-primary uppercase tracking-wide truncate">
          {CATEGORY_LABELS[promo.category]}
        </div>
        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
          <Clock className="w-3 h-3" />
          {timeLeft(promo.endDate)}
        </div>
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
        {promo.title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
        {promo.description}
      </p>
      <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
        <Tag className="w-3.5 h-3.5" />
        {promo.discount.value}
        {promo.code && (
          <span className="ml-2 font-mono text-muted-foreground">
            {promo.code}
          </span>
        )}
      </div>
    </Link>
  );
}

export function PromosPreview({ count = 4 }: PromosPreviewProps) {
  const promos = sortPromos(getActivePromos()).slice(0, count);

  if (promos.length === 0) return null;

  return (
    <section className="section-shell bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Только актуальные акции
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
              Промокоды и скидки
            </h2>
            <p className="text-lg text-muted-foreground">
              Сэкономьте до 50% в банках, магазинах и сервисах
            </p>
          </div>
          <Link
            to="/promocodes"
            onClick={() => trackYandexGoal("homepage_promos_see_all")}
          >
            <Button variant="outline" className="gap-2 rounded-full px-6 min-h-[44px]">
              Все промокоды
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {promos.map((p) => (
            <PromoMiniCard key={p.id} promo={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PromosPreview;
