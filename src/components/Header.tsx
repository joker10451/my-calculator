import { Calculator, Menu, X, Search, Scale } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { categories } from "@/lib/data";
import { useComparison } from "@/context/ComparisonContext";

const Header = () => {
  const { items } = useComparison();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const allCalculators = categories.flatMap(cat => cat.calculators);
  const filteredCalculators = allCalculators.filter(calc =>
    calc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSelect = (href: string) => {
    navigate(href);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-14 md:h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <Calculator className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <span className="text-base md:text-xl font-bold tracking-tight hidden xs:inline">
              СЧИТАЙ<span className="text-primary">.RU</span>
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md relative mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск калькулятора..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border bg-muted/50 focus:bg-background transition-colors focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              />
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg p-2 max-h-80 overflow-y-auto animate-fade-in z-50">
                {filteredCalculators.length > 0 ? (
                  filteredCalculators.map(calc => (
                    <button
                      key={calc.name}
                      onClick={() => handleSearchSelect(calc.href)}
                      className="w-full text-left px-4 py-2 hover:bg-muted rounded-lg text-sm flex items-center gap-2"
                    >
                      <Search className="w-3 h-3 text-muted-foreground" />
                      {calc.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    Ничего не найдено
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.name}
                to={cat.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/blog"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              Блог
            </Link>
            <Link to="/compare" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <Scale className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            <ThemeToggle />
          </nav>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1">
            <Link to="/compare" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <Scale className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            <button
              className="p-2"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsMenuOpen(false);
              }}
            >
              <Search className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors"
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
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b p-4 animate-fade-in shadow-lg z-40">
            <input
              ref={inputRef}
              type="text"
              placeholder="Поиск калькулятора..."
              className="w-full h-12 px-4 rounded-lg border bg-muted focus:bg-background outline-none mb-2 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                {filteredCalculators.length > 0 ? (
                  filteredCalculators.map(calc => (
                    <button
                      key={calc.name}
                      onClick={() => handleSearchSelect(calc.href)}
                      className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg text-sm border-b border-border/50 last:border-0"
                    >
                      {calc.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    Ничего не найдено
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in bg-background absolute top-full left-0 right-0 shadow-lg z-40">
            <nav className="flex flex-col gap-1 px-4">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.href}
                  className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                to="/blog"
                className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Блог
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
