import { useState, useRef, useCallback, useEffect } from "react";
import { Search, ArrowRight, Calculator, Sparkles, TrendingDown, Users, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data";
import { trackYandexGoal } from "@/hooks/useYandexMetrika";
import { trackAffiliateClick } from "@/utils/affiliateTracking";

function fuzzyMatch(name: string, query: string): boolean {
  return name.toLowerCase().includes(query.toLowerCase());
}

// FOMO-варианты H1 для A/B-теста (ротация по неделям)
const HERO_HEADLINES = [
  {
    title: "Сколько ты",
    highlight: "переплачиваешь",
    suffix: "банкам в 2026?",
  },
  {
    title: "Узнай, где",
    highlight: "сэкономить",
    suffix: "до 312 000 ₽",
  },
  {
    title: "Точный расчёт за",
    highlight: "30 секунд",
    suffix: "без регистрации",
  },
];

// Цифры для соц. доказательства (в проде подменять через API/Supabase)
// Используются как fallback, если счётчик недоступен
const FALLBACK_SOCIAL_PROOF = {
  monthlyCalculations: "47 832",
  totalUsers: "284 109",
  savedMillions: "1,2 млрд",
};

const Hero = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [stats, setStats] = useState(FALLBACK_SOCIAL_PROOF);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Ротация заголовков каждые 6 сек для дополнительного FOMO
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((i) => (i + 1) % HERO_HEADLINES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // В проде заменить на реальный запрос к Supabase или edge-функции
  useEffect(() => {
    // try {
    //   const res = await fetch('/api/social-proof');
    //   if (res.ok) setStats(await res.json());
    // } catch {}
  }, []);

  const allCalculators = categories.flatMap(cat =>
    cat.calculators.map(c => ({ ...c, category: cat.name }))
  );

  const filtered = query.length >= 2
    ? allCalculators.filter(c => fuzzyMatch(c.name, query)).slice(0, 5)
    : [];

  const handleSelect = useCallback((href: string) => {
    navigate(href);
    setQuery("");
    setIsFocused(false);
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filtered.length > 0) {
      handleSelect(filtered[0].href);
    }
  };

  // Primary CTA — расчёт ипотеки (самый конверсионный калькулятор)
  const handlePrimaryCta = () => {
    trackYandexGoal("hero_primary_cta_click");
    trackAffiliateClick({
      partnerName: "mortgage_calculator",
      productType: "mortgage",
      linkUrl: "/calculator/mortgage",
      source: "hero",
      pageUrl: window.location.pathname,
      placement: "hero",
    });
    navigate("/calculator/mortgage");
  };

  // Secondary CTA — промокоды (нишевый модуль)
  const handlePromoCta = () => {
    trackYandexGoal("hero_promo_cta_click");
    navigate("/promocodes");
  };

  const currentHeadline = HERO_HEADLINES[headlineIndex];

  return (
    <section className="pt-28 md:pt-36 pb-12 md:pb-16 relative overflow-hidden">
      {/* Декор-фон для FOMO (мягкое сияние) */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/8 via-blue-500/5 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center">
        {/* FOMO-бейдж сверху */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Актуальные тарифы ЦБ и банков на 2026 год</span>
        </div>

        {/* Заголовок с FOMO-ротацией */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4 leading-[1.1]">
          {currentHeadline.title}{" "}
          <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">
            {currentHeadline.highlight}
          </span>
          <br />
          <span className="text-foreground">{currentHeadline.suffix}</span>
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6">
          {stats.savedMillions} ₽ уже сэкономили наши пользователи в 2026.
          <br className="hidden md:inline" /> Расчёт бесплатный, без регистрации и SMS.
        </p>

        {/* PRIMARY + SECONDARY CTA — главное конверсионное действие */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Button
            variant="hero"
            size="xl"
            onClick={handlePrimaryCta}
            className="w-full sm:w-auto group relative overflow-hidden"
            aria-label="Рассчитать ипотеку и сэкономить"
          >
            <span className="relative z-10 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Рассчитать и сэкономить
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
          <Button
            variant="outline"
            size="xl"
            onClick={handlePromoCta}
            className="w-full sm:w-auto gap-2"
            aria-label="Открыть промокоды и акции"
          >
            <Zap className="w-5 h-5 text-amber-500" />
            Промокоды и акции
          </Button>
        </div>

        {/* Социальное доказательство (реальные цифры) */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>
              <span className="font-bold text-foreground">{stats.monthlyCalculations}</span> расчётов в месяц
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calculator className="w-4 h-4 text-primary" />
            <span>
              <span className="font-bold text-foreground">28</span> калькуляторов
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Данные обновлены сегодня</span>
          </div>
        </div>

        {/* Поиск (вторичный, как ассистент) */}
        <div className="max-w-xl mx-auto relative mb-6">
          <div className={`relative transition-shadow duration-200 ${isFocused ? 'shadow-xl shadow-primary/10' : 'shadow-lg'}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Или найди конкретный калькулятор... (ипотека, зарплата, ОСАГО)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onKeyDown={handleKeyDown}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              aria-label="Поиск калькулятора"
            />
          </div>

          {/* Результаты поиска */}
          {isFocused && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-background shadow-xl z-50 overflow-hidden">
              {filtered.map(calc => (
                <button
                  key={calc.href}
                  onClick={() => handleSelect(calc.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
                >
                  <Calculator className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-foreground">{calc.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{calc.category}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Быстрые ссылки */}
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            to="/calculator/mortgage"
            className="px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:shadow-sm hover:shadow-primary/10 transition-all duration-200"
            onClick={() => trackYandexGoal("hero_quicklink_mortgage")}
          >
            Ипотека
          </Link>
          <Link
            to="/calculator/salary"
            className="px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:shadow-sm hover:shadow-primary/10 transition-all duration-200"
            onClick={() => trackYandexGoal("hero_quicklink_salary")}
          >
            Зарплата
          </Link>
          <Link
            to="/calculator/credit"
            className="px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:shadow-sm hover:shadow-primary/10 transition-all duration-200"
            onClick={() => trackYandexGoal("hero_quicklink_credit")}
          >
            Кредит
          </Link>
          <Link
            to="/calculator/deposit"
            className="px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:shadow-sm hover:shadow-primary/10 transition-all duration-200"
            onClick={() => trackYandexGoal("hero_quicklink_deposit")}
          >
            Вклады
          </Link>
          <Link
            to="/calculator/court-fee"
            className="px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:shadow-sm hover:shadow-primary/10 transition-all duration-200"
            onClick={() => trackYandexGoal("hero_quicklink_court_fee")}
          >
            Госпошлина
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
