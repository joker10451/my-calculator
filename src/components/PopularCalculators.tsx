import { ArrowRight, Home, Calculator, CheckCircle2, Droplets, Car, Scale, TrendingUp, Calendar, Receipt, Shield, PiggyBank, Wallet, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { HoverEffect } from "./ui/card-hover-effect";
import { getSeasonalPicks, SEASON_NAMES, getCurrentMonth, type PopularPick } from "@/lib/seasonalPicks";
import { trackYandexGoal } from "@/hooks/useYandexMetrika";

// Lazy prefetch imports для топ-6 маршрутов
const prefetchMap: Record<string, () => Promise<unknown>> = {
  mortgage: () => import('@/pages/MortgageCalculatorPage'),
  salary: () => import('@/pages/SalaryCalculatorPage'),
  'court-fee': () => import('@/pages/CourtFeeCalculatorPage'),
  utilities: () => import('@/pages/UtilitiesCalculatorPage'),
  fuel: () => import('@/pages/FuelCalculatorPage'),
  credit: () => import('@/pages/CreditCalculatorPage'),
  vacation: () => import('@/pages/VacationCalculatorPage'),
  'tax-deduction': () => import('@/pages/TaxDeductionCalculatorPage'),
  osago: () => import('@/pages/OSAGOCalculatorPage'),
  deposit: () => import('@/pages/DepositCalculatorPage'),
  budget: () => import('@/pages/BudgetCalculatorPage'),
  alimony: () => import('@/pages/AlimonyCalculatorPage'),
};

// Маппинг icon-string → компонент из lucide
const ICON_MAP: Record<string, typeof Home> = {
  Home,
  Calculator,
  TrendingUp,
  Scale,
  Droplets,
  Car,
  Calendar,
  Receipt,
  Shield,
  PiggyBank,
  Wallet,
  Users,
};

const PopularCalculators = () => {
  const picks: PopularPick[] = useMemo(() => {
    // Регион можно подтянуть из localStorage (regionDetection) или сети
    let region: string | undefined;
    try {
      region = localStorage.getItem("detected_region") ?? undefined;
    } catch {
      // ignore
    }
    return getSeasonalPicks({ region, count: 6 });
  }, []);

  const month = getCurrentMonth();
  const season = SEASON_NAMES[month] ?? "";

  const hoverItems = picks.map((calc) => ({
    title: calc.name,
    description: calc.description,
    link: calc.href,
    icon: ICON_MAP[calc.icon] ?? Calculator,
    color: calc.color,
    bgColor: calc.bgColor,
    onMouseEnter: () => {
      const prefetch = prefetchMap[calc.id];
      if (prefetch) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => prefetch(), { timeout: 2000 });
        } else {
          setTimeout(() => prefetch(), 100);
        }
      }
    },
    extra: (
      <div className="flex items-center gap-1 mt-auto pt-4 text-xs font-medium text-muted-foreground">
        <CheckCircle2 className="w-3 h-3 text-green-500" />
        <span>Актуально на 2026 год</span>
      </div>
    ),
  }));

  return (
    <section className="section-shell bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-foreground">
              Популярные сейчас
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Самые востребованные расчёты в {season.toLowerCase()}е 2026
            </p>
          </div>
          <Link
            to="/all"
            onClick={() => trackYandexGoal("popular_see_all_click")}
          >
            <Button variant="outline" className="gap-2 rounded-full px-6 min-h-[44px]">
              Все калькуляторы
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <HoverEffect items={hoverItems} />
      </div>
    </section>
  );
};

export default PopularCalculators;
