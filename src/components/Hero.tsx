import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BackgroundBeamsWithCollision } from "./ui/background-beams-with-collision";
import { FlipWords } from "./ui/flip-words";

const Hero = () => {
  const { t } = useTranslation();

  const words = [
    t('common.home.hero.words.mortgage'),
    t('common.home.hero.words.credit'),
    t('common.home.hero.words.taxes'),
    t('common.home.hero.words.deposit'),
    t('common.home.hero.words.salary'),
    t('common.home.hero.words.utilities'),
    t('common.home.hero.words.bmi'),
  ];

  const features = [
    t('common.home.hero.features.accurate'),
    t('common.home.hero.features.free'),
    t('common.home.hero.features.no_reg'),
  ];

  return (
    <div className="relative w-full">
      <BackgroundBeamsWithCollision className="h-auto py-20 md:py-32">
        <div className="container relative z-20 px-4 mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium border rounded-full bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
            <Calculator className="w-4 h-4" />
            <span>{t('common.home.hero.badge')}</span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            <span className="block mb-2 text-foreground dark:text-neutral-100">
              {t('common.home.hero.title_start')}
            </span>
            <div className="h-[1.2em] flex items-center justify-center overflow-visible">
              <FlipWords words={words} className="text-primary font-black" />
            </div>
          </h1>

          <p className="max-w-2xl mx-auto mb-10 text-lg md:text-xl text-muted-foreground">
            {t('common.home.hero.description')}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 mb-12 sm:flex-row">
            <Link to="/#categories">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full group">
                {t('common.home.hero.cta_primary')}
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/blog">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full backdrop-blur-sm bg-background/30 dark:bg-neutral-800/30">
                {t('common.home.hero.cta_secondary')}
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
