import { useTranslation } from "react-i18next";
import { ArrowRight, TrendingUp, Home, Calculator, Heart, Droplets, Car, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";
import { AuroraBackground } from "./ui/aurora-background";

const popularCalculators = [
  {
    id: "mortgage",
    icon: Home,
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/mortgage",
    statsCount: "12 500",
  },
  {
    id: "salary",
    icon: TrendingUp,
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/salary",
    statsCount: "8 200",
  },
  {
    id: "court-fee",
    icon: Scale,
    color: "text-legal",
    bgColor: "bg-legal/10",
    href: "/calculator/court-fee",
    statsCount: "2 100",
  },
  {
    id: "bmi",
    icon: Heart,
    color: "text-health",
    bgColor: "bg-health/10",
    href: "/calculator/bmi",
    statsCount: "5 700",
  },
  {
    id: "utilities",
    icon: Droplets,
    color: "text-housing",
    bgColor: "bg-housing/10",
    href: "/calculator/utilities",
    statsCount: "4 300",
  },
  {
    id: "fuel",
    icon: Car,
    color: "text-auto",
    bgColor: "bg-auto/10",
    href: "/calculator/fuel",
    statsCount: "3 900",
  },
  {
    id: "credit",
    icon: Calculator,
    color: "text-finance",
    bgColor: "bg-finance/10",
    href: "/calculator/credit",
    statsCount: "6 100",
  },
];

const PopularCalculators = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      <AuroraBackground className="py-16 md:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 uppercase">
                {t("common.popular_calculators.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("common.popular_calculators.subtitle")}
              </p>
            </div>
            <Link to="/all">
              <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-sm">
                {t("common.popular_calculators.all_button")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-x-6 md:gap-y-0">
            {popularCalculators.map((calc, index) => (
              <CardContainer key={calc.id} className="inter-var w-full">
                <CardBody className="bg-background/80 backdrop-blur-md relative group/card border-black/[0.1] dark:border-white/[0.2] w-full h-auto rounded-xl p-6 border shadow-sm hover:shadow-xl transition-all duration-300">
                  <Link to={calc.href} className="block h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <CardItem translateZ="50" className={`w-12 h-12 rounded-xl ${calc.bgColor} flex items-center justify-center`}>
                        <calc.icon className={`w-6 h-6 ${calc.color}`} />
                      </CardItem>
                      <div className="flex-1">
                        <CardItem
                          translateZ="60"
                          as="h3"
                          className="font-semibold text-lg group-hover/card:text-primary transition-colors"
                        >
                          {t(`common.popular_calculators.items.${calc.id}.name`)}
                        </CardItem>
                        <CardItem
                          translateZ="40"
                          as="p"
                          className="text-sm text-muted-foreground mt-1 line-clamp-2"
                        >
                          {t(`common.popular_calculators.items.${calc.id}.description`)}
                        </CardItem>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <CardItem
                        translateZ="30"
                        className="text-xs text-muted-foreground"
                      >
                        {calc.statsCount}+ {t("common.popular_calculators.stats_suffix")}
                      </CardItem>
                      <CardItem translateZ="50">
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover/card:text-primary group-hover/card:translate-x-1 transition-all" />
                      </CardItem>
                    </div>
                  </Link>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        </div>
      </AuroraBackground>
    </section>
  );
};

export default PopularCalculators;
