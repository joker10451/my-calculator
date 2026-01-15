import CalculatorLayout from "@/components/CalculatorLayout";
import SelfEmployedCalculator from "@/components/calculators/SelfEmployedCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Briefcase, Calculator, TrendingDown, FileText, BarChart3, DollarSign } from "lucide-react";

const SelfEmployedCalculatorPage = () => {
  const seoData = {
    title: "Калькулятор налогов для самозанятых и ИП 2026 - НПД, УСН, Патент",
    description: "Сравните налоговую нагрузку для самозанятых (НПД 4-6%), ИП на УСН (6%) и патенте. Рассчитайте налоги онлайн, выберите оптимальную систему налогообложения.",
    keywords: "калькулятор самозанятых, налог на профессиональный доход, НПД, УСН, патент, налоги ИП 2026, самозанятый калькулятор",
    canonical: "https://schitay-online.ru/calculator/self-employed"
  };

  const structuredData = generateCalculatorSchema(
    "Калькулятор налогов для самозанятых и ИП",
    "Бесплатный онлайн калькулятор для сравнения налоговых режимов: НПД, УСН, Патент",
    "https://schitay-online.ru/calculator/self-employed",
    "FinanceApplication"
  );

  const breadcrumbs = [
    { label: "Зарплата и налоги", href: "/category/salary" },
    { label: "Калькулятор налогов для самозанятых" }
  ];

  const faqItems = [
    {
      question: "Чем отличается самозанятый от ИП?",
      answer: "Самозанятый (НПД) - это специальный налоговый режим с упрощенной отчетностью и низкими ставками (4% с физлиц, 6% с юрлиц). ИП - это статус предпринимателя, который может работать на разных налоговых режимах (УСН, патент, ОСНО). Самозанятый не платит страховые взносы и не может нанимать сотрудников, ИП платит взносы и может иметь работников."
    },
    {
      question: "Какие ставки налога для самозанятых в 2026 году?",
      answer: "Для самозанятых (НПД) действуют две ставки: 4% при работе с физическими лицами и 6% при работе с юридическими лицами и ИП. Эти ставки фиксированные и не меняются в зависимости от суммы дохода. Максимальный годовой доход для самозанятых - 2.4 млн рублей."
    },
    {
      question: "Что выгоднее - самозанятый или ИП на УСН?",
      answer: "Зависит от вашей ситуации. Самозанятый выгоден при небольших доходах (до 200 тыс/мес), работе с физлицами, отсутствии сотрудников. ИП на УСН 6% выгоден при больших доходах, наличии сотрудников, необходимости пенсионного стажа. ИП может уменьшить налог на страховые взносы, самозанятый взносы не платит."
    },
    {
      question: "Как работает патент для ИП?",
      answer: "Патент - это фиксированная стоимость на год, которая не зависит от реального дохода. Стоимость патента = Потенциальный доход × 6%. Патент выгоден при высоких доходах в разрешенных видах деятельности. Можно купить патент на 1-12 месяцев. Не нужно сдавать декларации, но нужно вести книгу учета доходов."
    },
    {
      question: "Нужно ли платить страховые взносы?",
      answer: "Самозанятые (НПД) не платят страховые взносы, но могут платить добровольно для пенсионного стажа. ИП на УСН и патенте обязаны платить фиксированные взносы: в 2026 году - 49 500₽ в год + 1% с дохода свыше 300 000₽. Эти взносы можно вычесть из налога УСН 6% (до 100% для ИП без сотрудников)."
    }
  ];

  return (
    <>
      <SEO {...seoData} structuredData={structuredData} />
      
      <CalculatorLayout
        title="Калькулятор налогов для ИП и самозанятых"
        description="Рассчитайте налоги по разным системам налогообложения: НПД, УСН, Патент"
      >
        <Breadcrumbs items={breadcrumbs} />
        
        <SelfEmployedCalculator />
        
        <div className="mt-16">
          <FAQ items={faqItems} />
        </div>

        <div className="mt-12 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              О калькуляторе налогов для самозанятых и ИП
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Наш калькулятор поможет вам сравнить три популярных налоговых режима для индивидуальной 
              предпринимательской деятельности: самозанятость (НПД), упрощенная система налогообложения 
              (УСН 6%) и патентная система. Калькулятор учитывает все особенности каждого режима, включая 
              страховые взносы, налоговые вычеты и ограничения.
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
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Сравнение трех налоговых режимов одновременно
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет налога для самозанятых (НПД) с разными ставками
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет УСН 6% с учетом страховых взносов
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет стоимости патента на год
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет фиксированных страховых взносов ИП
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Сравнение итоговой налоговой нагрузки
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
                "Введите ваш ежемесячный доход от деятельности",
                "Для самозанятых выберите тип клиентов (физлица или юрлица)",
                "Для патента укажите потенциальный годовой доход по вашему виду деятельности",
                "Изучите результаты по каждому режиму: налог, взносы, итого к уплате",
                "Сравните итоговую налоговую нагрузку и выберите оптимальный вариант"
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

          {/* Additional Content */}
          <div className="mt-12 prose prose-slate max-w-none dark:prose-invert">
          <h2>Самозанятость (НПД)</h2>
          
          <h3>Что такое налог на профессиональный доход</h3>
          <p>
            НПД (налог на профессиональный доход) - это специальный налоговый режим для самозанятых граждан. 
            Он действует с 2019 года и доступен во всех регионах России. Самозанятые работают без регистрации 
            ИП, ведут учет через приложение "Мой налог" и платят минимальные налоги.
          </p>

          <h3>Ставки НПД в 2026 году</h3>
          <ul>
            <li><strong>4%</strong> - при получении дохода от физических лиц</li>
            <li><strong>6%</strong> - при получении дохода от юридических лиц и ИП</li>
          </ul>

          <h3>Преимущества самозанятости</h3>
          <ul>
            <li>Низкие налоговые ставки (4-6%)</li>
            <li>Не нужно платить страховые взносы</li>
            <li>Простая регистрация через приложение</li>
            <li>Автоматический расчет налога</li>
            <li>Не нужно сдавать декларации</li>
            <li>Налоговый вычет 10 000₽ (уменьшает ставку до 3% и 4%)</li>
          </ul>

          <h3>Ограничения НПД</h3>
          <ul>
            <li>Максимальный годовой доход - 2.4 млн рублей</li>
            <li>Нельзя нанимать сотрудников</li>
            <li>Нельзя совмещать с другими налоговыми режимами</li>
            <li>Не формируется пенсионный стаж (можно платить взносы добровольно)</li>
            <li>Ограничения по видам деятельности</li>
          </ul>

          <h2>ИП на УСН 6%</h2>
          
          <h3>Что такое УСН Доходы</h3>
          <p>
            УСН (упрощенная система налогообложения) "Доходы" - это налоговый режим, при котором 
            налог составляет 6% от всех доходов. ИП на УСН обязаны платить страховые взносы, 
            но могут уменьшить налог на сумму уплаченных взносов.
          </p>

          <h3>Страховые взносы ИП в 2026 году</h3>
          <ul>
            <li><strong>Фиксированные взносы:</strong> 49 500₽ в год (можно платить поквартально)</li>
            <li><strong>Дополнительные взносы:</strong> 1% с дохода свыше 300 000₽ в год</li>
            <li><strong>Максимум взносов:</strong> 277 571₽ в год</li>
          </ul>

          <h3>Налоговый вычет на УСН</h3>
          <p>
            ИП на УСН 6% может уменьшить налог на сумму уплаченных страховых взносов:
          </p>
          <ul>
            <li><strong>ИП без сотрудников:</strong> вычет до 100% налога</li>
            <li><strong>ИП с сотрудниками:</strong> вычет до 50% налога</li>
          </ul>

          <h3>Преимущества УСН 6%</h3>
          <ul>
            <li>Можно нанимать сотрудников</li>
            <li>Формируется пенсионный стаж</li>
            <li>Нет ограничения по годовому доходу (до 265.8 млн₽)</li>
            <li>Можно уменьшить налог на взносы</li>
            <li>Подходит для большинства видов деятельности</li>
          </ul>

          <h2>Патентная система налогообложения</h2>
          
          <h3>Как работает патент</h3>
          <p>
            Патент - это право заниматься определенным видом деятельности в течение 1-12 месяцев. 
            Стоимость патента фиксированная и не зависит от реального дохода. Патент рассчитывается 
            как 6% от потенциально возможного годового дохода, который устанавливают региональные власти.
          </p>

          <h3>Формула расчета патента</h3>
          <p>
            Стоимость патента = Потенциальный годовой доход × 6% × (Количество месяцев / 12)
          </p>

          <h3>Преимущества патента</h3>
          <ul>
            <li>Фиксированная стоимость независимо от реального дохода</li>
            <li>Выгодно при высоких доходах</li>
            <li>Не нужно сдавать декларации</li>
            <li>Можно совмещать с УСН для разных видов деятельности</li>
            <li>Можно купить несколько патентов</li>
          </ul>

          <h3>Ограничения патента</h3>
          <ul>
            <li>Доступен только для определенных видов деятельности</li>
            <li>Максимальный годовой доход - 60 млн рублей</li>
            <li>Не более 15 сотрудников</li>
            <li>Нужно платить страховые взносы отдельно</li>
            <li>Нельзя уменьшить стоимость патента на взносы</li>
          </ul>

          <h2>Как выбрать налоговый режим</h2>
          
          <h3>Выбирайте самозанятость (НПД), если:</h3>
          <ul>
            <li>Ваш доход менее 200 000₽ в месяц</li>
            <li>Вы работаете в основном с физическими лицами</li>
            <li>Вам не нужны сотрудники</li>
            <li>Вы хотите минимум бюрократии</li>
            <li>Пенсионный стаж не критичен</li>
          </ul>

          <h3>Выбирайте ИП на УСН 6%, если:</h3>
          <ul>
            <li>Вам нужны сотрудники</li>
            <li>Доход превышает 2.4 млн в год</li>
            <li>Важен пенсионный стаж</li>
            <li>Вы хотите уменьшать налог на взносы</li>
            <li>Нужна возможность масштабирования бизнеса</li>
          </ul>

          <h3>Выбирайте патент, если:</h3>
          <ul>
            <li>Ваш вид деятельности подходит под патент</li>
            <li>Реальный доход значительно выше потенциального</li>
            <li>Вы готовы платить фиксированную сумму</li>
            <li>Не хотите сдавать декларации</li>
          </ul>

          <p className="text-sm text-muted-foreground mt-8">
            <strong>Обратите внимание:</strong> Расчет калькулятора является ориентировочным. 
            Выбор налогового режима зависит от многих факторов: вида деятельности, региона, 
            наличия сотрудников, планов развития бизнеса. Рекомендуем проконсультироваться 
            с бухгалтером или налоговым консультантом.
          </p>
          </div>
        </div>
      </CalculatorLayout>
    </>
  );
};

export default SelfEmployedCalculatorPage;
