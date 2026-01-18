import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BackgroundBeamsWithCollision } from "./ui/background-beams-with-collision";
import { FlipWords } from "./ui/flip-words";

const Hero = () => {
  const words = ["Ипотеку", "Кредит", "Налоги", "Вклады", "Зарплату", "ЖКХ", "ИМТ"];

  const features = ["Точные алгоритмы", "Всегда бесплатно", "Без регистрации"];

  return (
    <div className="relative w-full">
      <BackgroundBeamsWithCollision className="h-auto py-20 md:py-32">
        <div className="container relative z-20 px-4 mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium border rounded-full bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
            <Calculator className="w-4 h-4" />
            <span>Универсальный помощник</span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            <span className="block mb-2 text-foreground dark:text-neutral-100">
              Посчитайте
            </span>
            <div className="h-[1.2em] flex items-center justify-center overflow-visible">
              <FlipWords words={words} className="text-primary font-black" />
            </div>
          </h1>

          <p className="max-w-2xl mx-auto mb-10 text-lg md:text-xl text-muted-foreground">
            Бесплатные онлайн-калькуляторы для России и СНГ. Кредиты, налоги, ЖКХ, здоровье — всё точно и по закону.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 mb-12 sm:flex-row">
            <Link to="/#categories">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full group">
                Выбрать калькулятор
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/blog">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full backdrop-blur-sm bg-background/30 dark:bg-neutral-800/30">
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
      </BackgroundBeamsWithCollision>
    </div>
  );
};

export default Hero;
