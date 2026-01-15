import CalculatorLayout from "@/components/CalculatorLayout";
import PensionCalculator from "@/components/calculators/PensionCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Users, Calculator, TrendingUp, Calendar, DollarSign, BarChart3 } from "lucide-react";

const PensionCalculatorPage = () => {
  const seoData = {
    title: "Калькулятор пенсии 2026 - Расчет страховой пенсии по старости онлайн",
    description: "Рассчитайте размер будущей пенсии: страховая пенсия, пенсионные баллы, стаж. Учет зарплаты, индексации, фиксированной выплаты. Прогноз пенсии онлайн.",
    keywords: "калькулятор пенсии, расчет пенсии 2026, пенсионные баллы, страховая пенсия, пенсия по старости, расчет пенсии онлайн",
    canonical: "https://schitay-online.ru/calculator/pension"
  };

  const structuredData = generateCalculatorSchema(
    "Калькулятор пенсии",
    "Бесплатный онлайн калькулятор для расчета размера будущей страховой пенсии по старости",
    "https://schitay-online.ru/calculator/pension",
    "FinanceApplication"
  );

  const breadcrumbs = [
    { label: "Зарплата и налоги", href: "/category/salary" },
    { label: "Калькулятор пенсии" }
  ];

  const faqItems = [
    {
      question: "Как рассчитывается страховая пенсия в 2026 году?",
      answer: "Страховая пенсия = Пенсионные баллы × Стоимость балла + Фиксированная выплата. В 2026 году стоимость балла - 133.05₽, фиксированная выплата - 8 134₽. Количество баллов зависит от зарплаты и стажа. Максимум 10 баллов в год. Для назначения пенсии нужно минимум 15 лет стажа и 30 баллов."
    },
    {
      question: "Что такое пенсионные баллы и как они начисляются?",
      answer: "Пенсионные баллы (ИПК) - это показатель, который зависит от суммы уплаченных страховых взносов. Чем выше зарплата, тем больше баллов. Формула: Баллы = (Ваша зарплата / Максимальная зарплата для взносов) × 10. Максимум 10 баллов в год. За каждый год стажа начисляются баллы, которые суммируются к выходу на пенсию."
    },
    {
      question: "Какие условия для выхода на пенсию в 2026 году?",
      answer: "Для выхода на страховую пенсию по старости в 2026 году нужно: возраст 61.5 лет для женщин и 66.5 лет для мужчин (повышается постепенно до 60 и 65 лет), минимум 15 лет страхового стажа, минимум 30 пенсионных баллов. Есть льготные условия для некоторых категорий граждан."
    },
    {
      question: "Как увеличить размер будущей пенсии?",
      answer: "Способы увеличить пенсию: работать официально с белой зарплатой (больше взносов = больше баллов), увеличивать зарплату, продолжать работать после достижения пенсионного возраста (премиальные коэффициенты), делать добровольные взносы в ПФР, участвовать в программе софинансирования пенсии, формировать накопительную пенсию."
    },
    {
      question: "Индексируется ли пенсия работающих пенсионеров?",
      answer: "Нет, страховые пенсии работающих пенсионеров не индексируются с 2016 года. Индексация возобновляется после увольнения с 1-го числа месяца, следующего за месяцем увольнения. При этом учитываются все пропущенные индексации. Фиксированная выплата и стоимость балла для работающих пенсионеров остаются на уровне года выхода на пенсию."
    }
  ];

  return (
    <>
      <SEO {...seoData} structuredData={structuredData} />
      
      <CalculatorLayout
        title="Калькулятор пенсии"
        description="Рассчитайте размер будущей страховой пенсии по старости"
      >
        <Breadcrumbs items={breadcrumbs} />
        
        <PensionCalculator />
        
        <div className="mt-16">
          <FAQ items={faqItems} />
        </div>

        <div className="mt-12 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              О калькуляторе пенсии
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Наш калькулятор пенсии поможет вам рассчитать примерный размер будущей страховой пенсии 
              по старости. Калькулятор учитывает вашу текущую зарплату, стаж работы, количество 
              пенсионных баллов и актуальные значения стоимости балла и фиксированной выплаты на 2026 год.
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
                    Расчет количества пенсионных баллов (ИПК)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет текущей зарплаты и стажа работы
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Актуальные значения 2026 года (стоимость балла, фиксированная выплата)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет страховой пенсии по формуле ПФР
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Прогноз размера пенсии на момент выхода
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет максимальных ограничений по баллам
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              Как пользоваться калькулятором пенсии
            </h3>
            <div className="space-y-4">
              {[
                "Укажите вашу текущую ежемесячную зарплату (до вычета НДФЛ)",
                "Введите количество лет трудового стажа",
                "Укажите ваш текущий возраст",
                "Изучите результат: количество баллов, размер пенсии, прогноз на момент выхода"
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
          <h3>Формула расчета страховой пенсии</h3>
          <p>
            Страховая пенсия по старости рассчитывается по формуле:
          </p>
          <p>
            <strong>Пенсия = ИПК × СПК + ФВ</strong>
          </p>
          <p>Где:</p>
          <ul>
            <li><strong>ИПК</strong> - индивидуальный пенсионный коэффициент (сумма всех пенсионных баллов)</li>
            <li><strong>СПК</strong> - стоимость одного пенсионного балла (133.05₽ в 2026 году)</li>
            <li><strong>ФВ</strong> - фиксированная выплата (8 134₽ в 2026 году)</li>
          </ul>

          <h3>Как начисляются пенсионные баллы</h3>
          <p>
            Количество пенсионных баллов за год рассчитывается по формуле:
          </p>
          <p>
            <strong>Баллы = (Ваша зарплата × 12 × 16%) / (Предельная база × 16%) × 10</strong>
          </p>
          <p>
            Где 16% - тариф страховых взносов на пенсионное страхование. Предельная база для 
            начисления взносов в 2026 году - 2 225 000₽. Максимум можно заработать 10 баллов в год.
          </p>

          <h3>Условия назначения страховой пенсии</h3>
          <p>
            Для получения страховой пенсии по старости в 2026 году необходимо:
          </p>
          <ul>
            <li><strong>Возраст:</strong> 61.5 лет для женщин, 66.5 лет для мужчин (переходный период)</li>
            <li><strong>Стаж:</strong> минимум 15 лет страхового стажа</li>
            <li><strong>Баллы:</strong> минимум 30 пенсионных баллов</li>
          </ul>
          <p>
            С 2028 года пенсионный возраст окончательно установится на уровне 60 лет для женщин 
            и 65 лет для мужчин.
          </p>

          <h3>Что входит в страховой стаж</h3>
          <p>
            В страховой стаж для пенсии включаются:
          </p>
          <ul>
            <li>Периоды работы по трудовому договору</li>
            <li>Периоды предпринимательской деятельности (ИП, самозанятые с добровольными взносами)</li>
            <li>Служба в армии (1.8 балла за год)</li>
            <li>Уход за ребенком до 1.5 лет (1.8 балла за первого, 3.6 за второго, 5.4 за третьего)</li>
            <li>Уход за инвалидом 1 группы или пожилым человеком старше 80 лет (1.8 балла за год)</li>
            <li>Периоды получения пособия по безработице</li>
          </ul>

          <h3>Индексация пенсий</h3>
          <p>
            Страховые пенсии индексируются ежегодно:
          </p>
          <ul>
            <li><strong>Неработающие пенсионеры:</strong> индексация с 1 января каждого года</li>
            <li><strong>Работающие пенсионеры:</strong> индексация не проводится (заморожена с 2016 года)</li>
            <li><strong>После увольнения:</strong> индексация возобновляется с учетом всех пропущенных повышений</li>
          </ul>
          <p>
            В 2026 году планируется индексация на уровень инфляции + дополнительное повышение.
          </p>

          <h3>Фиксированная выплата</h3>
          <p>
            Фиксированная выплата - это базовая часть пенсии, которая устанавливается государством 
            и не зависит от заработка. В 2026 году размер фиксированной выплаты составляет 8 134₽.
          </p>
          <p>
            Повышенная фиксированная выплата положена:
          </p>
          <ul>
            <li>Гражданам старше 80 лет (в 2 раза больше)</li>
            <li>Инвалидам 1 группы (в 2 раза больше)</li>
            <li>Гражданам с иждивенцами (+ 1/3 за каждого, максимум 3)</li>
            <li>Жителям Крайнего Севера (с районным коэффициентом)</li>
            <li>Работникам сельского хозяйства со стажем 30 лет (+ 25%)</li>
          </ul>

          <h3>Как увеличить размер пенсии</h3>
          <p>
            Способы повысить будущую пенсию:
          </p>
          <ul>
            <li><strong>Официальное трудоустройство:</strong> работайте с белой зарплатой</li>
            <li><strong>Увеличение зарплаты:</strong> чем выше доход, тем больше баллов</li>
            <li><strong>Продление стажа:</strong> работайте дольше, накапливайте баллы</li>
            <li><strong>Отсрочка выхода на пенсию:</strong> за каждый год отсрочки - премиальные коэффициенты</li>
            <li><strong>Добровольные взносы:</strong> можно докупить стаж и баллы</li>
            <li><strong>Программа софинансирования:</strong> государство удваивает ваши взносы (до 12 000₽/год)</li>
          </ul>

          <h3>Премиальные коэффициенты</h3>
          <p>
            Если вы продолжите работать после достижения пенсионного возраста и не будете 
            обращаться за пенсией, размер пенсии увеличится:
          </p>
          <ul>
            <li>Через 1 год - на 7%</li>
            <li>Через 3 года - на 24%</li>
            <li>Через 5 лет - на 45%</li>
            <li>Через 10 лет - на 111%</li>
          </ul>

          <h3>Минимальная и максимальная пенсия</h3>
          <p>
            <strong>Минимальная пенсия:</strong> если пенсия ниже прожиточного минимума пенсионера 
            в регионе, назначается социальная доплата до уровня ПМП.
          </p>
          <p>
            <strong>Максимальная пенсия:</strong> теоретически не ограничена, но зависит от 
            максимального количества баллов. При максимальной зарплате и стаже 40 лет можно 
            накопить около 400 баллов, что даст пенсию около 61 000₽.
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            <strong>Обратите внимание:</strong> Расчет калькулятора является прогнозным и 
            ориентировочным. Точный размер пенсии зависит от многих факторов и может быть 
            рассчитан только Пенсионным фондом на основании вашей полной трудовой истории. 
            Стоимость балла и фиксированная выплата ежегодно индексируются.
          </p>
          </div>
        </div>
      </CalculatorLayout>
    </>
  );
};

export default PensionCalculatorPage;
