import { ArrowRight, TrendingUp, Home, Calculator, Heart, Droplets, Car, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { HoverEffect } from "./ui/card-hover-effect";

const popularCalculators = [
  {
    id: "mortgage",
    name: "Калькулятор ипотеки",
    description: "Рассчитай ежемесячный платёж, переплату и график погашения",
    icon: Home,
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/mortgage",
    statsCount: "12 500",
  },
  {
    id: "salary",
    name: "Зарплата на руки",
    description: "НДФЛ 13%, пенсионные и страховые взносы",
    icon: TrendingUp,
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/salary",
    statsCount: "8 200",
  },
  {
    id: "court-fee",
    name: "Госпошлина в суд",
    description: "Расчёт госпошлины для судов общей юрисдикции и арбитража",
    icon: Scale,
    color: "text-legal",
    bgColor: "bg-legal/10",
    href: "/calculator/court-fee",
    statsCount: "2 100",
  },

  {
    id: "utilities",
    name: "Расчёт ЖКХ",
    description: "Сколько платить за воду, свет и отопление",
    icon: Droplets,
    color: "text-housing",
    bgColor: "bg-housing/10",
    href: "/calculator/utilities",
    statsCount: "4 300",
  },
  {
    id: "fuel",
    name: "Расход топлива",
    description: "Сколько стоит поездка на машине",
    icon: Car,
    color: "text-auto",
    bgColor: "bg-auto/10",
    href: "/calculator/fuel",
    statsCount: "3 900",
  },
  {
    id: "credit",
    name: "Кредитный калькулятор",
    description: "Потребительский кредит с досрочным погашением",
    icon: Calculator,
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/credit",
    statsCount: "6 100",
  },
];

const PopularCalculators = () => {
  const hoverItems = popularCalculators.map((calc) => ({
    title: calc.name,
    description: calc.description,
    link: calc.href,
    icon: calc.icon,
    color: calc.color,
    bgColor: calc.bgColor,
    extra: (
      <div className="flex items-center gap-1 mt-auto pt-4 text-xs font-medium text-muted-foreground">
        <TrendingUp className="w-3 h-3" />
        <span>{calc.statsCount}+ расчётов сегодня</span>
      </div>
    ),
  }));

  return (
    <section className="py-16 md:py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 uppercase tracking-tight">
              Популярные калькуляторы
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Самые востребованные расчёты прямо сейчас
            </p>
          </div>
          <Link to="/all">
            <Button variant="outline" className="gap-2 rounded-full px-6">
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
