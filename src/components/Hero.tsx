import { useState, useRef, useCallback } from "react";
import { Search, ArrowRight, Calculator } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { categories } from "@/lib/data";

function fuzzyMatch(name: string, query: string): boolean {
  return name.toLowerCase().includes(query.toLowerCase());
}

const Hero = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  return (
    <section className="pt-28 md:pt-36 pb-16 md:pb-20">
      <div className="container mx-auto px-4 text-center">
        {/* Заголовок */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
          Финансовые калькуляторы
          <br />
          <span className="text-primary">для жизни</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10">
          Точные расчёты по актуальным данным. Бесплатно, без регистрации.
        </p>

        {/* Поиск */}
        <div className="max-w-xl mx-auto relative mb-10">
          <div className={`relative transition-shadow duration-200 ${isFocused ? 'shadow-xl shadow-primary/10' : 'shadow-lg'}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Найти калькулятор... (ипотека, зарплата, ОСАГО)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onKeyDown={handleKeyDown}
              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-background text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
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
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Link to="/calculator/mortgage" className="px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
            Ипотека
          </Link>
          <Link to="/calculator/salary" className="px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
            Зарплата
          </Link>
          <Link to="/calculator/credit" className="px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
            Кредит
          </Link>
          <Link to="/calculator/deposit" className="px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
            Вклады
          </Link>
          <Link to="/calculator/court-fee" className="px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
            Госпошлина
          </Link>
        </div>

        {/* Социальное доказательство */}
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">28 калькуляторов</span> · Актуальные данные 2026 · Работает офлайн
        </p>
      </div>
    </section>
  );
};

export default Hero;
