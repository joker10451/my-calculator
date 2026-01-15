import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const popularQueries = [
    "ипотека",
    "кредит",
    "зарплата на руки",
    "ЖКХ",
    "ИМТ",
  ];

  return (
    <section className="hero-gradient text-secondary-foreground py-16 md:py-24 lg:py-32">
      <div className="container mx-auto text-center">
        {/* Заголовок */}
        <h1 className="text-display-sm md:text-display text-balance mb-6 animate-fade-in">
          Посчитай деньги, здоровье
          <br />
          <span className="text-primary">и жизнь за 10 секунд</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Бесплатные онлайн-калькуляторы для России и СНГ. 
          Кредиты, налоги, ЖКХ, здоровье — всё точно и по закону.
        </p>

        {/* Поиск */}
        <form 
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto mb-8 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Найти калькулятор..."
              className="w-full h-16 md:h-18 pl-14 pr-6 text-lg rounded-2xl bg-card text-card-foreground border-2 border-transparent focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-elevated"
            />
          </div>
        </form>

        {/* Популярные запросы */}
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <span className="text-sm text-muted-foreground mr-2">Популярное:</span>
          {popularQueries.map((query) => (
            <button
              key={query}
              onClick={() => setSearchQuery(query)}
              className="px-4 py-2 text-sm font-medium bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-full transition-colors"
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
