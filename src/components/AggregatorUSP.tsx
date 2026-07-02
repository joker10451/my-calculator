import { Link } from "react-router-dom";
import { Banknote, ArrowRight, CheckCircle2, Shield, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackYandexGoal } from "@/hooks/useYandexMetrika";
import { trackAffiliateClick } from "@/utils/affiliateTracking";

interface AggregatorUSPProps {
  /** Реальное кол-во банков, источник — Supabase или data/banks.ts */
  banksCount?: number;
  /** Средняя экономия пользователя, ₽ */
  avgSavings?: number;
  /** Кол-во продуктов (кредит, ипотека, карта, вклад...) */
  productsCount?: number;
}

const USP_FEATURES = [
  {
    icon: Shield,
    title: "Только проверенные банки",
    description: "Все банки с лицензией ЦБ РФ",
  },
  {
    icon: Clock,
    title: "Решение за 2 минуты",
    description: "Без визита в офис и поручителей",
  },
  {
    icon: Award,
    title: "Лучшие условия",
    description: "Партнёрские ставки ниже рынка",
  },
];

export function AggregatorUSP({
  banksCount = 14,
  avgSavings = 187000,
  productsCount = 6,
}: AggregatorUSPProps) {
  const handleClick = (target: string) => {
    trackYandexGoal("aggregator_usp_click", { target });
    trackAffiliateClick({
      partnerName: "aggregator",
      productType: "bank_comparison",
      linkUrl: target,
      source: "homepage_usp",
      pageUrl: window.location.pathname,
      placement: "hero",
    });
  };

  // Форматирование суммы с пробелами
  const formatNumber = (n: number) => n.toLocaleString("ru-RU");

  return (
    <section className="section-shell bg-gradient-to-br from-primary/5 via-blue-500/5 to-indigo-500/5 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Левая колонка — заголовок + цифры */}
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Banknote className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">
                Агрегатор банков
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-4 leading-tight">
              {banksCount} банков на одном сайте.
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Экономия до {formatNumber(avgSavings)} ₽.
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg">
              Сравните условия по ипотеке, кредиту, вкладам и картам без визита в отделения.
              Покажем, где переплата ниже, и поможем оформить онлайн.
            </p>

            {/* Цифры */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div>
                <div className="text-2xl md:text-3xl font-black text-foreground tabular-nums">
                  {banksCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">банков</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-foreground tabular-nums">
                  {productsCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">продуктов</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatNumber(avgSavings)} ₽
                </div>
                <div className="text-xs text-muted-foreground mt-1">средняя экономия</div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild={false}
                size="lg"
                onClick={() => handleClick("/compare")}
                className="group gap-2"
              >
                <Link to="/compare" className="flex items-center gap-2">
                  Сравнить банки
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/banks-rating" onClick={() => handleClick("/banks-rating")}>
                  Рейтинг банков 2026
                </Link>
              </Button>
            </div>
          </div>

          {/* Правая колонка — features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {USP_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card/80 backdrop-blur-sm"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-foreground mb-1">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{feat.description}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AggregatorUSP;
