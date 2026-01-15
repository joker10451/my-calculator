import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TireSizeCalculator from "@/components/calculators/TireSizeCalculator";
import { Helmet } from "react-helmet-async";

const TireSizeCalculatorPage = () => {
  return (
    <>
      <Helmet>
        <title>Калькулятор размера шин — Сравнение размеров шин онлайн | Считай.RU</title>
        <meta 
          name="description" 
          content="🚗 Калькулятор размера шин онлайн. Сравните размеры шин, узнайте влияние на спидометр и расход топлива. Бесплатно и точно!" 
        />
        <meta name="keywords" content="калькулятор шин, размер шин, сравнение шин, спидометр, расход топлива, автомобильные шины" />
        <link rel="canonical" href="https://schitay-online.ru/calculator/tire-size" />
        
        <meta property="og:title" content="Калькулятор размера шин — Сравнение размеров шин" />
        <meta property="og:description" content="🚗 Сравните размеры автомобильных шин, узнайте влияние на спидометр и расход топлива. Бесплатный онлайн калькулятор." />
        <meta property="og:url" content="https://schitay-online.ru/calculator/tire-size" />
        
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Калькулятор размера шин",
          "description": "Онлайн калькулятор для сравнения размеров автомобильных шин и расчета влияния на спидометр",
          "url": "https://schitay-online.ru/calculator/tire-size",
          "applicationCategory": "AutomotiveApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "RUB"
          },
          "featureList": [
            "Сравнение размеров шин",
            "Расчет влияния на спидометр",
            "Оценка изменения расхода топлива",
            "Рекомендации по замене шин"
          ]
        })}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 md:py-12">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Калькулятор размера шин
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Сравните размеры автомобильных шин и узнайте, как замена повлияет на спидометр, расход топлива и управляемость
              </p>
            </div>
            <TireSizeCalculator />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TireSizeCalculatorPage;