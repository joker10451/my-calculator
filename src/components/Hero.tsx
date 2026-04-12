import { useState, useMemo } from "react";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FlipWords } from "./ui/flip-words";
import { motion } from "framer-motion";

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
}

function calcMonthlyPayment(price: number, downPayment: number, termYears: number, ratePercent: number): number {
  const loan = price - downPayment;
  if (loan <= 0 || termYears <= 0 || ratePercent <= 0) return 0;
  const r = ratePercent / 100 / 12;
  const n = termYears * 12;
  return (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const Hero = () => {
  const words = ["Ипотеку", "Кредит", "Налоги", "Вклады", "Зарплату", "ЖКХ", "ИМТ"];
  const features = ["Точные алгоритмы", "Всегда бесплатно", "Без регистрации"];

  const [price, setPrice] = useState(6000000);
  const [downPayment, setDownPayment] = useState(1200000);
  const [termYears, setTermYears] = useState(20);
  const RATE = 16;

  const monthly = useMemo(
    () => calcMonthlyPayment(price, downPayment, termYears, RATE),
    [price, downPayment, termYears]
  );

  return (
    <section className="section-shell pt-20 md:pt-24 lg:pt-28">
      <div className="max-w-6xl mx-auto rounded-3xl border border-border bg-card p-6 md:p-10 text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 md:mb-6 text-sm font-medium border rounded-full bg-muted border-border text-primary">
          <Calculator className="w-4 h-4" />
          <span>Универсальный помощник</span>
        </div>

        <h1 className="mb-4 md:mb-6 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
          <span className="block mb-2 text-foreground">
            Посчитайте
          </span>
          <div className="h-[1.2em] flex items-center justify-center overflow-visible">
            <FlipWords words={words} className="text-primary font-black" />
          </div>
        </h1>

        <p className="max-w-2xl mx-auto mb-6 md:mb-8 text-lg md:text-xl text-muted-foreground">
          Бесплатные онлайн-калькуляторы для России и СНГ. Кредиты, налоги, ЖКХ, здоровье — всё точно и по закону.
        </p>

        {/* Мини-ипотечный калькулятор */}
        <div className="max-w-2xl mx-auto mb-8 rounded-2xl border border-border bg-background/60 p-5 text-left glass-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Быстрый расчёт ипотеки</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Стоимость, ₽</label>
              <input
                type="number"
                value={price}
                min={500000}
                max={50000000}
                step={100000}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Взнос, ₽</label>
              <input
                type="number"
                value={downPayment}
                min={0}
                max={price}
                step={100000}
                onChange={e => setDownPayment(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Срок, лет</label>
              <input
                type="number"
                value={termYears}
                min={1}
                max={30}
                step={1}
                onChange={e => setTermYears(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Ежемесячный платёж (ставка {RATE}%)</p>
              <motion.p
                key={Math.round(monthly)}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-2xl font-black text-primary"
              >
                {monthly > 0 ? formatRub(monthly) : '—'}
              </motion.p>
            </div>
            <Link to="/calculator/mortgage/">
              <Button size="sm" className="rounded-xl gap-1.5">
                Подробнее
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 mb-8 md:mb-10 sm:flex-row">
          <Link to="/#categories">
            <Button size="lg" className="h-12 px-8 text-lg rounded-xl group">
              Выбрать калькулятор
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/blog">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-xl">
              Читать статьи
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
