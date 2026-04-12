import { Link } from "react-router-dom";
import { categories } from "@/lib/data";
import { Search, Calculator, ArrowRight, Home, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useState } from "react";

const POPULAR = [
  { name: 'Ипотечный калькулятор', href: '/calculator/mortgage', tag: 'Хит' },
  { name: 'Зарплата на руки', href: '/calculator/salary', tag: 'Хит' },
  { name: 'Кредитный калькулятор', href: '/calculator/credit', tag: '' },
  { name: 'Госпошлина в суд', href: '/calculator/court-fee', tag: '' },
  { name: 'Калькулятор ЖКХ', href: '/calculator/utilities', tag: '' },
  { name: 'Расход топлива', href: '/calculator/fuel', tag: '' },
  { name: 'Калькулятор ИМТ', href: '/calculator/bmi', tag: '' },
  { name: 'Отпускные', href: '/calculator/vacation', tag: '' },
];

const NotFound = () => {
  const [query, setQuery] = useState('');

  const filtered = query.length > 0
    ? POPULAR.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : POPULAR;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <SEO title="404 — Страница не найдена" description="Запрашиваемая страница не существует" noindex />
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full text-sm font-bold mb-8">
            <span>404</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-4 tracking-tight">
            Такої страницы не существует
          </h1>
          <p className="text-lg text-slate-400 max-w-lg mx-auto mb-10">
            Может, опечатка? Или она переехала. Пока ищешь — попробуй калькулятор, он точно работает.
          </p>

          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Найти калькулятор..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              На главную
            </Link>
            <Link
              to="/all"
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-700 text-slate-200 font-bold rounded-xl hover:border-primary hover:text-primary transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Все калькуляторы
            </Link>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-slate-200">Популярные калькуляторы</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filtered.map(calc => (
                <Link
                  key={calc.href}
                  to={calc.href}
                  className="group surface-card surface-card-hover p-4 flex items-center gap-3 text-left"
                >
                  <Calculator className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-primary transition-colors truncate">
                    {calc.name}
                  </span>
                  {calc.tag && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      {calc.tag}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-12">
            <h2 className="text-xl font-bold text-slate-200 mb-6">Категории</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.slice(0, 3).map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.href}
                  className="surface-card surface-card-hover p-5 text-left"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${cat.color}`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-200 mb-1">{cat.name}</h3>
                  <p className="text-xs text-slate-500">{cat.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
