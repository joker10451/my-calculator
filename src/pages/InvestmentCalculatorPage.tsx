import CalculatorLayout from "@/components/CalculatorLayout";
import InvestmentCalculator from "@/components/calculators/InvestmentCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { TrendingUp, PiggyBank, LineChart, BarChart3, DollarSign, Calendar } from "lucide-react";

const InvestmentCalculatorPage = () => {
  const seoData = {
    title: "Калькулятор доходности инвестиций 2026 - Расчет прибыли от вложений онлайн",
    description: "Рассчитайте доходность инвестиций с учетом сложного процента, регулярных пополнений и инфляции. Прогноз прибыли, график роста капитала. Планируйте инвестиции онлайн.",
    keywords: "калькулятор инвестиций, доходность инвестиций, сложный процент, расчет прибыли, инвестиционный калькулятор 2026, пассивный доход",
    canonical: "https://schitay-online.ru/calculator/investment"
  };

  const structuredData = generateCalculatorSchema(
    "Калькулятор доходности инвестиций",
    "Бесплатный онлайн калькулятор для расчета будущей стоимости инвестиций с учетом регулярных пополнений",
    "https://schitay-online.ru/calculator/investment",
    "FinanceApplication"
  );

  const breadcrumbs = [
    { label: "Финансы", href: "/category/finance" },
    { label: "Калькулятор инвестиций" }
  ];

  const faqItems = [
    {
      question: "Как рассчитывается доходность инвестиций?",
      answer: "Доходность инвестиций рассчитывается по формуле сложного процента: Будущая стоимость = Начальная сумма × (1 + Ставка)^Срок + Регулярные пополнения × ((1 + Ставка)^Срок - 1) / Ставка. Сложный процент означает, что проценты начисляются не только на начальную сумму, но и на накопленные проценты. Это создает эффект снежного кома."
    },
    {
      question: "Что такое сложный процент и почему он важен?",
      answer: "Сложный процент - это начисление процентов на проценты. Например, при 10% годовых: 1-й год +10%, 2-й год +10% от увеличенной суммы. За 10 лет 100 000₽ превратятся в 259 374₽ (не 200 000₽). Чем дольше срок инвестирования, тем сильнее эффект. Альберт Эйнштейн называл сложный процент восьмым чудом света."
    },
    {
      question: "Какая реальная доходность инвестиций с учетом инфляции?",
      answer: "Реальная доходность = Номинальная доходность - Инфляция. Например, при доходности 12% и инфляции 4% реальная доходность 8%. Это показывает реальный рост покупательной способности. Важно учитывать инфляцию при долгосрочном планировании. Инвестиции должны обгонять инфляцию, иначе деньги обесцениваются."
    },
    {
      question: "Как регулярные пополнения влияют на доходность?",
      answer: "Регулярные пополнения значительно увеличивают итоговую сумму. Например, 100 000₽ под 10% годовых за 10 лет = 259 374₽. Но если добавлять по 10 000₽ ежемесячно, итог = 2 172 053₽. Регулярные инвестиции используют усреднение стоимости и снижают риски. Даже небольшие ежемесячные взносы дают большой эффект на длинной дистанции."
    },
    {
      question: "Какую доходность можно ожидать от разных инструментов?",
      answer: "Примерная годовая доходность: банковские вклады 5-8%, облигации 8-12%, акции 10-15%, недвижимость 8-12%, криптовалюты 15-50% (высокий риск). Чем выше доходность, тем выше риск. Диверсификация снижает риски. Для долгосрочных инвестиций (10+ лет) акции показывают лучшие результаты. Важно учитывать налоги и комиссии."
    }
  ];

  return (
    <>
      <SEO {...seoData} structuredData={structuredData} />
      
      <CalculatorLayout
        title="Калькулятор доходности инвестиций"
        description="Рассчитайте будущую стоимость инвестиций с учетом регулярных пополнений"
      >
        <Breadcrumbs items={breadcrumbs} />
        
        <InvestmentCalculator />
        
        <div className="mt-16">
          <FAQ items={faqItems} />
        </div>

        <div className="mt-12 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              О калькуляторе доходности инвестиций
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Наш калькулятор инвестиций поможет вам рассчитать будущую стоимость ваших вложений 
              с учетом сложного процента, регулярных пополнений и инфляции. Калькулятор показывает, 
              как ваш капитал будет расти со временем, какую прибыль вы получите и какова будет 
              реальная доходность с учетом инфляции.
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
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет будущей стоимости инвестиций
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет сложного процента (капитализация)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет с регулярными ежемесячными пополнениями
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет инфляции для расчета реальной доходности
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет общей прибыли от инвестиций
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Визуализация роста капитала и сравнение доходности
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              Как пользоваться калькулятором инвестиций
            </h3>
            <div className="space-y-4">
              {[
                "Укажите начальную сумму инвестиций",
                "Введите ожидаемую годовую доходность (в процентах)",
                "Укажите срок инвестирования (в годах)",
                "Введите сумму ежемесячного пополнения (если планируете)",
                "Укажите ожидаемую инфляцию для расчета реальной доходности",
                "Изучите результат: будущая стоимость, прибыль, реальная доходность"
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
          <h2>Сложный процент</h2>
          
          <h3>Что такое сложный процент</h3>
          <p>
            Сложный процент (капитализация) - это начисление процентов не только на первоначальную 
            сумму вложений, но и на накопленные проценты. Это создает эффект "снежного кома", 
            когда ваш капитал растет все быстрее с течением времени.
          </p>

          <h3>Формула сложного процента</h3>
          <p>
            <strong>FV = PV × (1 + r)^n</strong>
          </p>
          <p>Где:</p>
          <ul>
            <li><strong>FV</strong> - будущая стоимость (Future Value)</li>
            <li><strong>PV</strong> - текущая стоимость (Present Value)</li>
            <li><strong>r</strong> - годовая процентная ставка</li>
            <li><strong>n</strong> - количество лет</li>
          </ul>

          <h3>Пример сложного процента</h3>
          <p>
            Вложили 100 000₽ под 10% годовых на 10 лет:
          </p>
          <ul>
            <li>Простой процент: 100 000 + (10 000 × 10) = 200 000₽</li>
            <li>Сложный процент: 100 000 × (1.1)^10 = 259 374₽</li>
            <li>Разница: 59 374₽ (почти 30% больше!)</li>
          </ul>

          <h3>Правило 72</h3>
          <p>
            Быстрый способ узнать, за сколько лет удвоится ваш капитал: разделите 72 на годовую 
            процентную ставку. Например, при 10% годовых: 72 / 10 = 7.2 года.
          </p>

          <h2>Регулярные инвестиции</h2>
          
          <h3>Формула с регулярными пополнениями</h3>
          <p>
            При регулярных ежемесячных пополнениях используется формула аннуитета:
          </p>
          <p>
            <strong>FV = PV × (1 + r)^n + PMT × ((1 + r)^n - 1) / r</strong>
          </p>
          <p>Где:</p>
          <ul>
            <li><strong>PMT</strong> - ежемесячный платеж</li>
            <li><strong>r</strong> - месячная процентная ставка (годовая / 12)</li>
            <li><strong>n</strong> - количество месяцев</li>
          </ul>

          <h3>Преимущества регулярных инвестиций</h3>
          <ul>
            <li><strong>Усреднение стоимости:</strong> покупаете активы по разным ценам</li>
            <li><strong>Дисциплина:</strong> автоматические инвестиции формируют привычку</li>
            <li><strong>Снижение рисков:</strong> не нужно угадывать момент входа</li>
            <li><strong>Доступность:</strong> можно начать с небольших сумм</li>
            <li><strong>Эффект масштаба:</strong> даже малые суммы дают большой результат</li>
          </ul>

          <h3>Пример регулярных инвестиций</h3>
          <p>
            Начальная сумма 100 000₽, ежемесячное пополнение 10 000₽, доходность 10% годовых, срок 10 лет:
          </p>
          <ul>
            <li>Вложено всего: 100 000 + (10 000 × 120) = 1 300 000₽</li>
            <li>Итоговая сумма: 2 172 053₽</li>
            <li>Прибыль: 872 053₽ (67% от вложенного!)</li>
          </ul>

          <h2>Инфляция и реальная доходность</h2>
          
          <h3>Что такое инфляция</h3>
          <p>
            Инфляция - это обесценивание денег, снижение их покупательной способности. 
            Если инфляция 4% в год, то через год на 100₽ можно купить товаров на 96₽ 
            в сегодняшних ценах.
          </p>

          <h3>Реальная vs номинальная доходность</h3>
          <ul>
            <li><strong>Номинальная доходность:</strong> доходность без учета инфляции</li>
            <li><strong>Реальная доходность:</strong> доходность с учетом инфляции</li>
          </ul>
          <p>
            <strong>Реальная доходность = Номинальная доходность - Инфляция</strong>
          </p>

          <h3>Пример влияния инфляции</h3>
          <p>
            Вложили 1 000 000₽ под 12% годовых на 10 лет при инфляции 4%:
          </p>
          <ul>
            <li>Номинальная стоимость через 10 лет: 3 105 848₽</li>
            <li>Реальная стоимость (в сегодняшних ценах): 2 096 103₽</li>
            <li>Реальная доходность: 8% годовых (12% - 4%)</li>
          </ul>

          <h2>Инвестиционные инструменты</h2>
          
          <h3>Банковские вклады</h3>
          <ul>
            <li><strong>Доходность:</strong> 5-8% годовых</li>
            <li><strong>Риск:</strong> минимальный (страхование АСВ до 1.4 млн₽)</li>
            <li><strong>Ликвидность:</strong> высокая</li>
            <li><strong>Подходит для:</strong> краткосрочных целей, резервного фонда</li>
          </ul>

          <h3>Облигации</h3>
          <ul>
            <li><strong>Доходность:</strong> 8-12% годовых</li>
            <li><strong>Риск:</strong> низкий-средний (зависит от эмитента)</li>
            <li><strong>Ликвидность:</strong> высокая (можно продать на бирже)</li>
            <li><strong>Подходит для:</strong> консервативных инвесторов, диверсификации</li>
          </ul>

          <h3>Акции</h3>
          <ul>
            <li><strong>Доходность:</strong> 10-15% годовых (исторически)</li>
            <li><strong>Риск:</strong> средний-высокий (волатильность)</li>
            <li><strong>Ликвидность:</strong> высокая</li>
            <li><strong>Подходит для:</strong> долгосрочных инвестиций (10+ лет)</li>
          </ul>

          <h3>Недвижимость</h3>
          <ul>
            <li><strong>Доходность:</strong> 8-12% годовых (аренда + рост стоимости)</li>
            <li><strong>Риск:</strong> средний</li>
            <li><strong>Ликвидность:</strong> низкая (долго продавать)</li>
            <li><strong>Подходит для:</strong> долгосрочных инвестиций, диверсификации</li>
          </ul>

          <h3>Фонды (ETF, ПИФы)</h3>
          <ul>
            <li><strong>Доходность:</strong> 8-15% годовых (зависит от стратегии)</li>
            <li><strong>Риск:</strong> средний (диверсификация снижает риски)</li>
            <li><strong>Ликвидность:</strong> высокая</li>
            <li><strong>Подходит для:</strong> начинающих инвесторов, пассивного инвестирования</li>
          </ul>

          <h2>Стратегии инвестирования</h2>
          
          <h3>Диверсификация</h3>
          <p>
            Не храните все яйца в одной корзине. Распределите капитал между разными активами:
          </p>
          <ul>
            <li>40% - облигации (стабильность)</li>
            <li>40% - акции (рост)</li>
            <li>10% - недвижимость (защита от инфляции)</li>
            <li>10% - наличные (ликвидность)</li>
          </ul>

          <h3>Долгосрочное инвестирование</h3>
          <p>
            Чем дольше срок инвестирования, тем сильнее работает сложный процент и тем меньше 
            влияние краткосрочных колебаний рынка. Оптимальный срок для акций - 10+ лет.
          </p>

          <h3>Регулярное пополнение</h3>
          <p>
            Инвестируйте регулярно (ежемесячно), а не пытайтесь угадать лучший момент. 
            Это снижает риски и формирует дисциплину.
          </p>

          <h3>Реинвестирование прибыли</h3>
          <p>
            Не тратьте полученные дивиденды и проценты, а реинвестируйте их. Это усиливает 
            эффект сложного процента.
          </p>

          <h2>Налоги на инвестиции</h2>
          
          <h3>НДФЛ с инвестиций</h3>
          <ul>
            <li><strong>Дивиденды:</strong> 13% (15% с суммы свыше 5 млн₽)</li>
            <li><strong>Купоны по облигациям:</strong> 13%</li>
            <li><strong>Продажа ценных бумаг:</strong> 13% с прибыли</li>
            <li><strong>Вклады:</strong> 13% с процентов свыше 1 млн₽ × ключевая ставка</li>
          </ul>

          <h3>Налоговые льготы</h3>
          <ul>
            <li><strong>ИИС типа А:</strong> вычет до 52 000₽ в год (13% от 400 000₽)</li>
            <li><strong>ИИС типа Б:</strong> освобождение от налога на прибыль</li>
            <li><strong>Долгосрочное владение:</strong> освобождение от налога при владении акциями 3+ года</li>
            <li><strong>Льгота по вкладам:</strong> не облагается сумма до 1 млн₽ × ключевая ставка</li>
          </ul>

          <h2>Риски инвестирования</h2>
          
          <h3>Основные риски</h3>
          <ul>
            <li><strong>Рыночный риск:</strong> падение стоимости активов</li>
            <li><strong>Инфляционный риск:</strong> обесценивание денег</li>
            <li><strong>Валютный риск:</strong> изменение курсов валют</li>
            <li><strong>Риск ликвидности:</strong> невозможность быстро продать актив</li>
            <li><strong>Кредитный риск:</strong> дефолт эмитента облигаций</li>
          </ul>

          <h3>Как снизить риски</h3>
          <ul>
            <li>Диверсифицируйте портфель</li>
            <li>Инвестируйте на долгий срок</li>
            <li>Не вкладывайте последние деньги</li>
            <li>Изучайте активы перед покупкой</li>
            <li>Используйте стоп-лоссы</li>
            <li>Регулярно ребалансируйте портфель</li>
          </ul>

          <p className="text-sm text-muted-foreground mt-8">
            <strong>Обратите внимание:</strong> Расчет калькулятора является прогнозным. 
            Реальная доходность инвестиций может отличаться от ожидаемой. Прошлые результаты 
            не гарантируют будущей доходности. Инвестиции связаны с рисками, включая возможную 
            потерю капитала. Проконсультируйтесь с финансовым консультантом перед принятием 
            инвестиционных решений.
          </p>
          </div>
        </div>
      </CalculatorLayout>
    </>
  );
};

export default InvestmentCalculatorPage;
