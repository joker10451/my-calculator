import CalculatorLayout from "@/components/CalculatorLayout";
import MortgageCalculator from "@/components/calculators/MortgageCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Home, Calculator, TrendingDown, Calendar, FileText, BarChart3 } from "lucide-react";

const MortgageCalculatorPage = () => {
  const seoData = {
    title: "Ипотечный калькулятор 2026",
    description: "Рассчитайте ипотеку онлайн бесплатно: ежемесячный платеж, переплата, график платежей. Актуальные ставки 2026 года. Учет досрочного погашения.",
    keywords: "ипотечный калькулятор, расчет ипотеки, калькулятор ипотеки онлайн, ипотека 2026, досрочное погашение ипотеки",
    canonical: "https://schitay-online.ru/calculator/mortgage"
  };

  const structuredData = generateCalculatorSchema(
    "Ипотечный калькулятор",
    "Бесплатный онлайн калькулятор для расчета ипотеки с учетом досрочного погашения",
    "https://schitay-online.ru/calculator/mortgage",
    "FinanceApplication"
  );

  const breadcrumbs = [
    { label: "Финансы", href: "/category/financial" },
    { label: "Ипотечный калькулятор" }
  ];

  const faqItems = [
    {
      question: "Как рассчитать ежемесячный платеж по ипотеке?",
      answer: "Ежемесячный платеж рассчитывается по формуле аннуитетного платежа: П = С × (i × (1 + i)^n) / ((1 + i)^n - 1), где С - сумма кредита, i - месячная процентная ставка, n - срок кредита в месяцах. Наш калькулятор автоматически производит этот расчет."
    },
    {
      question: "Что такое досрочное погашение ипотеки?",
      answer: "Досрочное погашение - это внесение дополнительных платежей сверх обязательного ежемесячного платежа. Это позволяет сократить срок кредита или уменьшить размер ежемесячного платежа, а также значительно снизить переплату по процентам."
    },
    {
      question: "Какая средняя ставка по ипотеке в 2026 году?",
      answer: "Средняя ставка по ипотеке в 2026 году варьируется от 8% до 16% в зависимости от банка, первоначального взноса и программы кредитования. Льготные программы (семейная ипотека, IT-ипотека) предлагают ставки от 6%."
    },
    {
      question: "Как уменьшить переплату по ипотеке?",
      answer: "Основные способы: 1) Увеличить первоначальный взнос, 2) Выбрать меньший срок кредита, 3) Делать досрочные погашения, 4) Рефинансировать кредит при снижении ставок, 5) Использовать льготные программы."
    },
    {
      question: "Можно ли использовать материнский капитал для ипотеки?",
      answer: "Да, материнский капитал можно использовать как первоначальный взнос или для досрочного погашения ипотеки. В 2026 году размер материнского капитала составляет 934 058 рублей на первого ребенка."
    }
  ];

  return (
    <>
      <SEO {...seoData} structuredData={structuredData} />
      
      <CalculatorLayout
        title="Ипотечный калькулятор"
        description="Рассчитайте ипотеку онлайн: ежемесячный платеж, переплата и график платежей."
      >
        <Breadcrumbs items={breadcrumbs} />
        
        <MortgageCalculator />
        
        <div className="mt-16">
          <FAQ items={faqItems} />
        </div>

        <div className="mt-12 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              О калькуляторе ипотеки
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Наш ипотечный калькулятор поможет вам рассчитать все параметры ипотечного кредита: 
              ежемесячный платеж, общую сумму выплат, переплату по процентам и построить 
              детальный график платежей. Калькулятор учитывает актуальные ставки 2026 года и 
              позволяет моделировать различные сценарии досрочного погашения.
            </p>
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              Возможности калькулятора
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="group p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500 text-white group-hover:scale-110 transition-transform">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет аннуитетных платежей с точностью до рубля
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет досрочного погашения (единовременного и регулярного)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Два режима досрочного погашения: сокращение срока или уменьшение платежа
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Детальный график платежей с разбивкой на проценты и основной долг
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Визуализация динамики остатка долга
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                    <Home className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Экспорт результатов в PDF для банка
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              Как пользоваться калькулятором
            </h3>
            <div className="space-y-4">
              {[
                "Введите стоимость недвижимости, которую планируете приобрести",
                "Укажите размер первоначального взноса (обычно от 10% до 30%)",
                "Выберите срок кредита (от 1 года до 30 лет)",
                "Укажите процентную ставку (уточните актуальную ставку в банке)",
                "При необходимости добавьте досрочные платежи для оптимизации переплаты",
                "Изучите результаты расчета и детальный график платежей"
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 pt-1 font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CalculatorLayout>
    </>
  );
};

export default MortgageCalculatorPage;
