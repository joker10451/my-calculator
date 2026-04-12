import { Calculator, Menu, X, Search, Scale, Heart } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { categories } from "@/lib/data";
import { useComparison } from "@/context/ComparisonContext";
import { useFavorites } from "@/hooks/useFavorites";

/** Trigram similarity score (0–1) */
function trigramScore(a: string, b: string): number {
  if (!a || !b) return 0;
  const getNgrams = (s: string) => {
    const padded = `  ${s}  `;
    const ngrams = new Set<string>();
    for (let i = 0; i < padded.length - 2; i++) ngrams.add(padded.slice(i, i + 3));
    return ngrams;
  };
  const aN = getNgrams(a);
  const bN = getNgrams(b);
  let intersection = 0;
  aN.forEach(ng => { if (bN.has(ng)) intersection++; });
  return (2 * intersection) / (aN.size + bN.size);
}

function fuzzyFilter(calculators: { name: string; description?: string; href: string }[], query: string) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return calculators
    .map(calc => {
      const nameScore = trigramScore(calc.name.toLowerCase(), q);
      const descScore = calc.description ? trigramScore(calc.description.toLowerCase(), q) * 0.5 : 0;
      const containsScore = calc.name.toLowerCase().includes(q) ? 0.4 : 0;
      const score = Math.max(nameScore, descScore, containsScore);
      return { ...calc, score };
    })
    .filter(c => c.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

const Header = () => {
  const { items } = useComparison();
  const { favorites } = useFavorites();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const allCalculators = categories.flatMap(cat =>
    cat.calculators.map(c => ({ ...c, description: c.description || '' }))
  );
  const filteredCalculators = fuzzyFilter(allCalculators, searchQuery);

  useEffect(() => {
    if (isSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchQuery]);

  const handleSearchSelect = useCallback((href: string) => {
    navigate(href);
    setIsSearchOpen(false);
    setSearchQuery("");
    setActiveIndex(-1);
  }, [navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!filteredCalculators.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filteredCalculators.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSearchSelect(filteredCalculators[activeIndex].href);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  }, [filteredCalculators, activeIndex, handleSearchSelect]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-slate-950/90 text-slate-100 backdrop-blur-xl">
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <Calculator className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden xs:inline uppercase text-slate-100">
              СЧИТАЙ.RU
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex w-56 xl:w-72 2xl:w-80 flex-none relative mx-3 xl:mx-5">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Поиск калькулятора..."
                className="w-full h-9 pl-10 pr-4 rounded-lg border border-slate-700 bg-slate-900/90 text-slate-100 placeholder:text-slate-500 transition-colors focus:ring-2 focus:ring-primary/30 outline-none text-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                onKeyDown={handleKeyDown}
                aria-autocomplete="list"
                aria-expanded={isSearchOpen && filteredCalculators.length > 0}
                role="combobox"
              />
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-2 max-h-80 overflow-y-auto animate-fade-in z-50" role="listbox">
                {filteredCalculators.length > 0 ? (
                  filteredCalculators.map((calc, idx) => (
                    <button
                      key={calc.href}
                      onClick={() => handleSearchSelect(calc.href)}
                      role="option"
                      aria-selected={idx === activeIndex}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 ${
                        idx === activeIndex ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'
                      }`}
                    >
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{calc.name}</span>
                      {calc.description && (
                        <span className="ml-auto text-xs text-slate-500 truncate max-w-[120px] hidden xl:block">
                          {calc.description}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2.5 text-sm text-slate-400">
                    Ничего не найдено
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {categories.slice(0, 4).map((cat, idx) => (
              <Link
                key={cat.name}
                to={cat.href}
                className={`px-2 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors hover:bg-slate-800 rounded-md whitespace-nowrap ${
                  idx === 3 ? 'hidden 2xl:inline-flex' : ''
                }`}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/blog"
              className="hidden xl:inline-flex px-2 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors hover:bg-slate-800 rounded-md"
            >
              Блог
            </Link>
            <Link
              to="/offers"
              className="px-2 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors hover:bg-slate-800 rounded-md"
            >
              Предложения
            </Link>
            <Link
              to="/jobs"
              className="px-2 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors hover:bg-slate-800 rounded-md"
            >
              Вакансии
            </Link>
            <Link to="/compare" className="relative p-2 text-slate-300 hover:text-primary transition-colors">
              <Scale className="w-4 h-4" />
              {items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            <Link to="/favorites" className="relative p-2 text-slate-300 hover:text-primary transition-colors">
              <Heart className="w-4 h-4" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <ThemeToggle />
          </nav>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1">
            <Link to="/compare" className="relative p-2 text-slate-300 hover:text-primary transition-colors">
              <Scale className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            <Link to="/favorites" className="relative p-2 text-slate-300 hover:text-primary transition-colors">
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <button
              className="p-2 text-slate-300 hover:text-white"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsMenuOpen(false);
              }}
            >
              <Search className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <button
              className="p-2 hover:bg-slate-800 rounded-md transition-colors text-slate-300 hover:text-white"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsSearchOpen(false);
              }}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-950 border-b border-slate-800 p-2 animate-fade-in shadow-lg z-40">
            <input
              ref={mobileInputRef}
              type="text"
              placeholder="Поиск калькулятора..."
              className="w-full h-9 px-3 rounded-md border border-slate-700 bg-slate-900 text-slate-100 outline-none mb-1 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                {filteredCalculators.length > 0 ? (
                  filteredCalculators.map((calc, idx) => (
                    <button
                      key={calc.href}
                      onClick={() => handleSearchSelect(calc.href)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm border-b border-slate-800 last:border-0 ${
                        idx === activeIndex ? 'bg-slate-700' : 'hover:bg-slate-800'
                      }`}
                    >
                      {calc.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-400">
                    Ничего не найдено
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="lg:hidden py-2 border-t border-slate-800 animate-fade-in bg-slate-950 absolute top-full left-0 right-0 shadow-lg z-40">
            <nav className="flex flex-col gap-0.5 px-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.href}
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                to="/blog"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Блог
              </Link>
              <Link
                to="/offers"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Предложения
              </Link>
              <Link
                to="/jobs"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Вакансии
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
