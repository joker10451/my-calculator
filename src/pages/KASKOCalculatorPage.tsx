import CalculatorLayout from "@/components/CalculatorLayout";
import KASKOCalculator from "@/components/calculators/KASKOCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Shield, Car, DollarSign, FileText, BarChart3, Calendar } from "lucide-react";

const KASKOCalculatorPage = () => {
  const seoData = {
    title: "Калькулятор КАСКО 2026 - Расчет стоимости страхования автомобиля онлайн",
    description: "Рассчитайте стоимость КАСКО для вашего автомобиля: полное и частичное покрытие, франшиза, рассрочка. Сравните тарифы, выберите оптимальный вариант страхования.",
    keywords: "калькулятор КАСКО, стоимость КАСКО 2026, страхование автомобиля, КАСКО онлайн, расчет КАСКО, франшиза КАСКО",
    canonical: "https://schitay-online.ru/calculator/kasko"
  };

  const structuredData = generateCalculatorSchema(
    "Калькулятор КАСКО",
    "Бесплатный онлайн калькулятор для расчета стоимости добровольного страхования автомобиля",
    "https://schitay-online.ru/calculator/kasko",
    "FinanceApplication"
  );

  const breadcrumbs = [
    { label: "Авто", href: "/category/auto" },
    { label: "Калькулятор КАСКО" }
  ];

  const faqItems = [
    {
      question: "Что такое КАСКО и что оно покрывает?",
      answer: "КАСКО - это добровольное страхование автомобиля от ущерба, хищения и угона. Полное КАСКО покрывает: ДТП, падение предметов, стихийные бедствия, пожар, противоправные действия третьих лиц, угон. Частичное КАСКО может покрывать только отдельные риски. В отличие от ОСАГО, КАСКО защищает ваш автомобиль, а не ответственность."
    },
    {
      question: "Как рассчитывается стоимость КАСКО?",
      answer: "Стоимость КАСКО зависит от: стоимости автомобиля (базовый тариф 5-12%), возраста и марки авто, региона, возраста и стажа водителя, наличия франшизы, способа выплаты (агрегатная/неагрегатная сумма), рассрочки платежа. Новые дорогие автомобили стоят дороже. Франшиза снижает стоимость на 10-40%."
    },
    {
      question: "Что такое франшиза в КАСКО?",
      answer: "Франшиза - это часть ущерба, которую вы оплачиваете сами. Например, при франшизе 15 000₽ и ущербе 50 000₽ страховая выплатит 35 000₽. Франшиза снижает стоимость полиса на 10-40%. Выгодна опытным водителям, которые редко попадают в мелкие ДТП. Бывает условная (не применяется при ущербе выше франшизы) и безусловная (всегда вычитается)."
    },
    {
      question: "В чем разница между полным и частичным КАСКО?",
      answer: "Полное КАСКО покрывает все риски: ущерб, хищение, угон, стихийные бедствия. Частичное КАСКО покрывает только выбранные риски, например, только ущерб без угона. Полное КАСКО дороже (7-12% от стоимости авто), частичное дешевле (3-7%). Выбор зависит от возраста авто, условий хранения, региона."
    },
    {
      question: "Можно ли оплатить КАСКО в рассрочку?",
      answer: "Да, большинство страховых компаний предлагают рассрочку на 3-12 месяцев. При рассрочке общая стоимость увеличивается на 5-15% (комиссия за рассрочку). Первый взнос обычно 30-50% от стоимости. При досрочном расторжении полиса возврат средств рассчитывается пропорционально. Рассрочка удобна при покупке дорогого полиса."
    }
  ];

  return (
    <>
      <SEO {...seoData} structuredData={structuredData} />
      
      <CalculatorLayout
        title="Калькулятор КАСКО"
        description="Рассчитайте стоимость добровольного страхования автомобиля"
      >
        <Breadcrumbs items={breadcrumbs} />
        
        <KASKOCalculator />
        
        <div className="mt-16">
          <FAQ items={faqItems} />
        </div>

        <div className="mt-12 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              О калькуляторе КАСКО
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Наш калькулятор КАСКО поможет вам рассчитать примерную стоимость добровольного страхования 
              автомобиля. Калькулятор учитывает стоимость автомобиля, тип покрытия (полное или частичное), 
              наличие франшизы и возможность оплаты в рассрочку. Вы сможете сравнить разные варианты 
              и выбрать оптимальный для вас.
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
                    <Shield className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет стоимости полного и частичного КАСКО
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                    <Car className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет стоимости автомобиля
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет с франшизой и без
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет рассрочки платежа
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Сравнение разных вариантов страхования
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Актуальные тарифы 2026 года
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              Как пользоваться калькулятором КАСКО
            </h3>
            <div className="space-y-4">
              {[
                "Укажите стоимость вашего автомобиля",
                "Выберите тип покрытия (полное или частичное КАСКО)",
                "Укажите размер франшизы (если планируете)",
                "Выберите количество месяцев рассрочки (если нужна)",
                "Изучите результат: стоимость полиса, ежемесячный платеж, экономия от франшизы"
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
          <h2>Что такое КАСКО</h2>
          
          <h3>Определение и назначение</h3>
          <p>
            КАСКО (от итальянского "casco" - корпус, кузов) - это добровольное страхование 
            транспортного средства от ущерба, хищения и угона. В отличие от обязательного ОСАГО, 
            которое страхует вашу ответственность перед другими участниками дорожного движения, 
            КАСКО защищает ваш собственный автомобиль.
          </p>

          <h3>Что покрывает КАСКО</h3>
          <p>
            Полис КАСКО может покрывать следующие риски:
          </p>
          <ul>
            <li><strong>Ущерб:</strong> повреждения в результате ДТП, столкновения, опрокидывания</li>
            <li><strong>Хищение:</strong> кража автомобиля или его частей</li>
            <li><strong>Угон:</strong> неправомерное завладение автомобилем</li>
            <li><strong>Стихийные бедствия:</strong> ураган, наводнение, град, землетрясение</li>
            <li><strong>Пожар:</strong> возгорание, взрыв</li>
            <li><strong>Падение предметов:</strong> деревья, сосульки, камни</li>
            <li><strong>Противоправные действия:</strong> вандализм, поджог</li>
            <li><strong>Повреждение животными:</strong> столкновение с животными</li>
          </ul>

          <h2>Виды КАСКО</h2>
          
          <h3>Полное КАСКО</h3>
          <p>
            Полное КАСКО покрывает все возможные риски: ущерб, хищение, угон. Это максимальная 
            защита вашего автомобиля. Стоимость полного КАСКО составляет 7-12% от стоимости 
            автомобиля в год.
          </p>
          <p>
            <strong>Преимущества:</strong> полная защита, спокойствие, выгодно для новых и дорогих авто.
          </p>
          <p>
            <strong>Недостатки:</strong> высокая стоимость.
          </p>

          <h3>Частичное КАСКО</h3>
          <p>
            Частичное КАСКО покрывает только выбранные риски, чаще всего только ущерб без угона 
            и хищения. Стоимость частичного КАСКО составляет 3-7% от стоимости автомобиля.
          </p>
          <p>
            <strong>Преимущества:</strong> дешевле полного КАСКО, можно выбрать нужные риски.
          </p>
          <p>
            <strong>Недостатки:</strong> не покрывает все риски, не защищает от угона.
          </p>

          <h2>Франшиза в КАСКО</h2>
          
          <h3>Что такое франшиза</h3>
          <p>
            Франшиза - это часть ущерба, которую страхователь оплачивает самостоятельно. 
            Франшиза может быть фиксированной (например, 15 000₽) или процентной (например, 1% от стоимости авто).
          </p>

          <h3>Виды франшизы</h3>
          <ul>
            <li><strong>Безусловная:</strong> всегда вычитается из суммы выплаты</li>
            <li><strong>Условная:</strong> не применяется, если ущерб превышает размер франшизы</li>
            <li><strong>Динамическая:</strong> увеличивается с каждым страховым случаем</li>
            <li><strong>Временная:</strong> действует только в определенное время (например, ночью)</li>
          </ul>

          <h3>Как франшиза влияет на стоимость</h3>
          <p>
            Франшиза снижает стоимость полиса КАСКО:
          </p>
          <ul>
            <li>Франшиза 10 000₽ - скидка 10-15%</li>
            <li>Франшиза 20 000₽ - скидка 20-25%</li>
            <li>Франшиза 50 000₽ - скидка 30-40%</li>
          </ul>

          <h3>Когда выгодна франшиза</h3>
          <p>
            Франшиза выгодна, если:
          </p>
          <ul>
            <li>Вы опытный водитель с большим стажем</li>
            <li>Редко попадаете в мелкие ДТП</li>
            <li>Готовы оплачивать мелкий ремонт сами</li>
            <li>Хотите снизить стоимость полиса</li>
            <li>Автомобиль хранится в безопасном месте</li>
          </ul>

          <h2>Факторы, влияющие на стоимость КАСКО</h2>
          
          <h3>Характеристики автомобиля</h3>
          <ul>
            <li><strong>Стоимость:</strong> чем дороже авто, тем дороже страховка</li>
            <li><strong>Возраст:</strong> новые авто дороже, старше 10 лет - дешевле или отказ</li>
            <li><strong>Марка и модель:</strong> угоняемые модели дороже</li>
            <li><strong>Мощность:</strong> мощные авто дороже</li>
            <li><strong>Противоугонная система:</strong> наличие снижает стоимость на 5-10%</li>
          </ul>

          <h3>Характеристики водителя</h3>
          <ul>
            <li><strong>Возраст:</strong> водители до 22 и после 65 лет - дороже</li>
            <li><strong>Стаж:</strong> стаж менее 3 лет - дороже на 30-50%</li>
            <li><strong>Безаварийность:</strong> КБМ влияет на стоимость</li>
            <li><strong>Количество водителей:</strong> ограниченный список дешевле</li>
          </ul>

          <h3>Условия страхования</h3>
          <ul>
            <li><strong>Регион:</strong> Москва и СПб дороже регионов</li>
            <li><strong>Место хранения:</strong> гараж дешевле, чем двор</li>
            <li><strong>Срок:</strong> годовой полис дешевле краткосрочного</li>
            <li><strong>Способ выплаты:</strong> агрегатная сумма дешевле</li>
          </ul>

          <h2>Рассрочка платежа по КАСКО</h2>
          
          <h3>Как работает рассрочка</h3>
          <p>
            Многие страховые компании предлагают оплату КАСКО в рассрочку на 3, 6, 9 или 12 месяцев. 
            При рассрочке вы платите первый взнос (обычно 30-50% от стоимости), а остальную сумму 
            делите на равные ежемесячные платежи.
          </p>

          <h3>Стоимость рассрочки</h3>
          <p>
            За рассрочку страховые компании берут комиссию:
          </p>
          <ul>
            <li>3 месяца - комиссия 5-7%</li>
            <li>6 месяцев - комиссия 8-10%</li>
            <li>12 месяцев - комиссия 12-15%</li>
          </ul>

          <h3>Условия рассрочки</h3>
          <ul>
            <li>Первый взнос 30-50% от стоимости полиса</li>
            <li>Ежемесячные платежи равными частями</li>
            <li>При просрочке платежа полис может быть приостановлен</li>
            <li>При досрочном расторжении возврат пропорционально</li>
          </ul>

          <h2>Как выбрать КАСКО</h2>
          
          <h3>Определите свои потребности</h3>
          <ul>
            <li>Нужна ли защита от угона (для угоняемых моделей - да)</li>
            <li>Готовы ли платить за мелкий ремонт сами (франшиза)</li>
            <li>Какой бюджет на страхование</li>
            <li>Нужна ли рассрочка</li>
          </ul>

          <h3>Сравните предложения</h3>
          <ul>
            <li>Запросите расчеты в 3-5 страховых компаниях</li>
            <li>Сравните покрытие и исключения</li>
            <li>Изучите отзывы о выплатах</li>
            <li>Проверьте рейтинг надежности компании</li>
          </ul>

          <h3>Обратите внимание на условия</h3>
          <ul>
            <li>Что входит в страховое покрытие</li>
            <li>Какие есть исключения</li>
            <li>Порядок действий при страховом случае</li>
            <li>Сроки выплат</li>
            <li>Способ возмещения (ремонт или деньги)</li>
          </ul>

          <p className="text-sm text-muted-foreground mt-8">
            <strong>Обратите внимание:</strong> Расчет калькулятора является ориентировочным. 
            Точная стоимость КАСКО зависит от многих факторов и рассчитывается индивидуально 
            страховой компанией. Для получения точного расчета обратитесь в страховую компанию 
            или к страховому брокеру.
          </p>
          </div>
        </div>
      </CalculatorLayout>
    </>
  );
};

export default KASKOCalculatorPage;
