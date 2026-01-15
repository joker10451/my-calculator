import CalculatorLayout from "@/components/CalculatorLayout";
import CourtFeeCalculator from "@/components/calculators/CourtFeeCalculator";
import { Helmet } from "react-helmet-async";

const CourtFeeCalculatorPage = () => {
  const title = "Калькулятор госпошлины в суд";
  const description = "Рассчитайте размер государственной пошлины для подачи иска в суды общей юрисдикции и арбитражные суды РФ. Актуальные тарифы 2026 года согласно НК РФ.";
  const keywords = "госпошлина, суд, калькулятор, арбитражный суд, суды общей юрисдикции, НК РФ, государственная пошлина, иск, льготы";
  const canonicalUrl = "https://schitay-online.ru/calculator/court-fee";

  return (
    <>
      <Helmet>
        {/* Enhanced meta tags for court fee calculator */}
        <meta name="keywords" content={keywords} />
        <meta name="author" content="Считай.RU" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Additional Open Graph tags */}
        <meta property="og:site_name" content="Считай.RU" />
        <meta property="og:locale" content="ru_RU" />
        
        {/* Enhanced structured data for court fee calculator */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": title,
            "description": description,
            "url": canonicalUrl,
            "applicationCategory": "LegalApplication",
            "operatingSystem": "All",
            "browserRequirements": "Requires JavaScript",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "RUB"
            },
            "featureList": [
              "Расчет госпошлины для судов общей юрисдикции",
              "Расчет госпошлины для арбитражных судов",
              "Применение льгот согласно НК РФ",
              "Детальный расчет с формулами",
              "Ссылки на статьи НК РФ"
            ],
            "applicationSubCategory": "Court Fee Calculator",
            "keywords": keywords,
            "inLanguage": "ru",
            "creator": {
              "@type": "Organization",
              "name": "Считай.RU",
              "url": "https://schitay-online.ru"
            },
            "about": {
              "@type": "Thing",
              "name": "Государственная пошлина в суд",
              "description": "Расчет размера государственной пошлины при подаче исков в российские суды"
            }
          })}
        </script>

        {/* FAQ structured data for court fee calculations */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Как рассчитывается госпошлина в суды общей юрисдикции?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Госпошлина в суды общей юрисдикции рассчитывается согласно статье 333.19 НК РФ. Для исков до 20 000 рублей ставка составляет 4% от цены иска, но не менее 400 рублей. Для больших сумм применяется прогрессивная шкала."
                }
              },
              {
                "@type": "Question", 
                "name": "Какие льготы по госпошлине существуют?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Льготы по госпошлине предусмотрены статьями 333.36 и 333.37 НК РФ. Инвалиды I-II группы, ветераны боевых действий, потребители по искам о защите прав потребителей и другие категории граждан могут быть освобождены от уплаты госпошлины или получить скидку."
                }
              },
              {
                "@type": "Question",
                "name": "В чем разница между госпошлиной в арбитражных судах и судах общей юрисдикции?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Арбитражные суды рассматривают экономические споры, их тарифы выше. Минимальная госпошлина в арбитражном суде составляет 2000 рублей против 400 рублей в судах общей юрисдикции. Максимальная сумма также различается: 200 000 рублей для арбитража против 60 000 рублей для общей юрисдикции."
                }
              }
            ]
          })}
        </script>

        {/* BreadcrumbList structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Главная",
                "item": "https://schitay-online.ru"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Калькуляторы",
                "item": "https://schitay-online.ru/calculators"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Калькулятор госпошлины в суд",
                "item": canonicalUrl
              }
            ]
          })}
        </script>
      </Helmet>

      <CalculatorLayout
        title={title}
        description={description}
      >
        <CourtFeeCalculator />
      </CalculatorLayout>
    </>
  );
};

export default CourtFeeCalculatorPage;