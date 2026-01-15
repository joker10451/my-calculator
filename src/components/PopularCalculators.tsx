import { ArrowRight, TrendingUp, Home, Calculator, Heart, Droplets, Car, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const popularCalculators = [
  {
    id: "mortgage",
    name: "Калькулятор ипотеки",
    description: "Рассчитай ежемесячный платёж, переплату и график погашения",
    icon: Home,
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/mortgage",
    stats: "12 500+ расчётов сегодня",
  },
  {
    id: "salary",
    name: "Зарплата на руки",
    description: "НДФЛ 13%, пенсионные и страховые взносы",
    icon: TrendingUp,
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/salary",
    stats: "8 200+ расчётов сегодня",
  },
  {
    id: "court-fee",
    name: "Госпошлина в суд",
    description: "Расчёт госпошлины для судов общей юрисдикции и арбитража",
    icon: Scale,
    color: "text-legal",
    bgColor: "bg-legal/10",
    href: "/calculator/court-fee",
    stats: "2 100+ расчётов сегодня",
  },
  {
    id: "bmi",
    name: "Индекс массы тела",
    description: "ИМТ по формуле ВОЗ с рекомендациями",
    icon: Heart,
    color: "text-health",
    bgColor: "bg-health/10",
    href: "/calculator/bmi",
    stats: "5 700+ расчётов сегодня",
  },
  {
    id: "utilities",
    name: "Расчёт ЖКХ",
    description: "Сколько платить за воду, свет и отопление",
    icon: Droplets,
    color: "text-housing",
    bgColor: "bg-housing/10",
    href: "/calculator/utilities",
    stats: "4 300+ расчётов сегодня",
  },
  {
    id: "fuel",
    name: "Расход топлива",
    description: "Сколько стоит поездка на машине",
    icon: Car,
    color: "text-auto",
    bgColor: "bg-auto/10",
    href: "/calculator/fuel",
    stats: "3 900+ расчётов сегодня",
  },
  {
    id: "credit",
    name: "Кредитный калькулятор",
    description: "Потребительский кредит с досрочным погашением",
    icon: Calculator,
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/credit",
    stats: "6 100+ расчётов сегодня",
  },
];

const PopularCalculators = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Популярные калькуляторы
            </h2>
            <p className="text-lg text-muted-foreground">
              Самые востребованные расчёты прямо сейчас
            </p>
          </div>
          <Link to="/all">
            <Button variant="outline" className="gap-2">
              Все калькуляторы
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {popularCalculators.map((calc, index) => (
            <Link
              key={calc.id}
              to={calc.href}
              className="group glass-card p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${calc.bgColor} flex items-center justify-center`}>
                  <calc.icon className={`w-6 h-6 ${calc.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {calc.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {calc.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {calc.stats}
                </span>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCalculators;
