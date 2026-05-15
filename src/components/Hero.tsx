import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FlipWords } from "./ui/flip-words";

const Hero = () => {
  const words = ["Ипотеку", "Кредит", "Налоги", "Вклады", "Зарплату", "ЖКХ"];

  return (
    <section className="pt-24 md:pt-32 lg:pt-36 pb-12 md:pb-16">
      <div className="container mx-auto px-4 text-center">
        {/* Заголовок */}
        <h1 className="mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl">
          <span className="text-foreground">Посчитайте</span>
          <br />
          <span className="inline-block h-[1.2em]">
            <FlipWords words={words} className="text-primary" />
          </span>
        </h1>

        {/* Подзаголовок */}
        <p className="max-w-xl mx-auto mb-10 text-lg text-muted-foreground md:text-xl">
          Бесплатные калькуляторы для жизни в России. Точно, быстро, без регистрации.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link to="/#categories">
            <Button size="lg" className="h-13 px-8 text-base rounded-xl group shadow-lg shadow-primary/20">
              Выбрать калькулятор
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/my-finances">
            <Button size="lg" variant="outline" className="h-13 px-8 text-base rounded-xl">
              Мои финансы
            </Button>
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Актуальные данные 2026</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>28+ калькуляторов</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Работает офлайн</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
