import CalculatorLayout from "@/components/CalculatorLayout";
import VacationCalculator from "@/components/calculators/VacationCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Palmtree, Calculator, Calendar, DollarSign, FileText, BarChart3 } from "lucide-react";

const VacationCalculatorPage = () => {
  const seoData = {
    title: "Калькулятор отпускных 2026 - Расчет отпускных онлайн",
    description: "Рассчитайте отпускные по ТК РФ: средний дневной заработок, сумма отпускных, НДФЛ. Учет премий, исключаемых дней. Точный расчет за 1 минуту.",
    keywords: "калькулятор отпускных, расчет отпускных, отпускные 2026, средний заработок, отпускные онлайн, расчет отпуска",
    canonical: "https://schitay-online.ru/calculator/vacation"
  };

  const structuredData = generateCalculatorSchema(
    "Калькулятор отпускных",
    "Бесплатный онлайн калькулятор для расчета отпускных по Трудовому кодексу РФ",
    "https://schitay-online.ru/calculator/vacation",
    "FinanceApplication"
  );

  const breadcrumbs = [
    { label: "Зарплата и налоги", href: "/category/salary" },
    { label: "Калькулятор отпускных" }
  ];

  const faqItems = [
    {
      question: "Как рассчитываются отпускные в 2026 году?",
      answer: "Отпускные рассчитываются по формуле: Средний дневной заработок × Количество дней отпуска. Средний дневной заработок = (Зарплата за 12 месяцев + Премии) / (29.3 × Количество отработанных месяцев - Исключаемые дни). Из полученной суммы удерживается НДФЛ 13%."
    },
    {
      question: "Что такое средний дневной заработок?",
      answer: "Средний дневной заработок - это сумма, которую работник в среднем зарабатывает за один день. Для расчета отпускных используется среднее количество дней в месяце 29.3 (установлено ТК РФ). Учитываются все выплаты за последние 12 месяцев: зарплата, премии, надбавки."
    },
    {
      question: "Учитываются ли премии при расчете отпускных?",
      answer: "Да, премии учитываются при расчете отпускных. Включаются ежемесячные, квартальные и годовые премии, выплаченные в расчетном периоде. Разовые премии к праздникам и материальная помощь не учитываются. Премии добавляются к общей сумме заработка за 12 месяцев."
    },
    {
      question: "Что такое исключаемые дни при расчете отпускных?",
      answer: "Исключаемые дни - это периоды, которые не учитываются при расчете среднего заработка: больничные, отпуск за свой счет, командировки с сохранением среднего заработка, простои не по вине работника. Эти дни вычитаются из общего количества календарных дней расчетного периода."
    },
    {
      question: "Когда должны выплатить отпускные?",
      answer: "По Трудовому кодексу РФ отпускные должны быть выплачены не позднее чем за 3 календарных дня до начала отпуска. Если этот срок нарушен, работник имеет право перенести отпуск на другое время. НДФЛ с отпускных удерживается при выплате, а перечисляется в бюджет не позднее последнего дня месяца."
    }
  ];

  return (
    <>
      <SEO {...seoData} structuredData={structuredData} />
      
      <CalculatorLayout
        title="Калькулятор отпускных"
        description="Рассчитайте отпускные по Трудовому кодексу РФ с учетом всех выплат"
      >
        <Breadcrumbs items={breadcrumbs} />
        
        <VacationCalculator />
        
        <div className="mt-16">
          <FAQ items={faqItems} />
        </div>

        <div className="mt-12 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              О калькуляторе отпускных
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Наш калькулятор отпускных поможет вам быстро и точно рассчитать сумму отпускных выплат 
              в соответствии с Трудовым кодексом РФ. Калькулятор учитывает все необходимые параметры: 
              среднюю зарплату, премии, отработанные месяцы, исключаемые дни и автоматически рассчитывает 
              НДФЛ 13%.
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
                    Расчет среднего дневного заработка по формуле ТК РФ
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет ежемесячной зарплаты и премий за расчетный период
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет количества отработанных месяцев (от 1 до 12)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Вычет исключаемых дней (больничные, отпуск за свой счет)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Автоматический расчет НДФЛ 13%
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                    <Palmtree className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Детальная разбивка всех расчетов и сумма к выплате
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              Как пользоваться калькулятором отпускных
            </h3>
            <div className="space-y-4">
              {[
                "Укажите количество дней отпуска (обычно 28 календарных дней в год)",
                "Введите вашу ежемесячную зарплату (оклад + постоянные надбавки)",
                "Добавьте сумму премий и бонусов за последние 12 месяцев",
                "Укажите количество полностью отработанных месяцев",
                "Введите количество исключаемых дней (если были больничные или отпуск за свой счет)",
                "Изучите результат: средний дневной заработок, сумму отпускных, НДФЛ и сумму к выплате"
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
          <h3>Формула расчета отпускных</h3>
          <p>
            Расчет отпускных производится в несколько этапов:
          </p>
          <ol>
            <li><strong>Расчет заработка за период:</strong> Зарплата × 12 месяцев + Премии</li>
            <li><strong>Расчет календарных дней:</strong> 29.3 × Отработанные месяцы - Исключаемые дни</li>
            <li><strong>Средний дневной заработок:</strong> Заработок за период / Календарные дни</li>
            <li><strong>Сумма отпускных:</strong> Средний дневной заработок × Дни отпуска</li>
            <li><strong>НДФЛ:</strong> Сумма отпускных × 13%</li>
            <li><strong>К выплате:</strong> Сумма отпускных - НДФЛ</li>
          </ol>

          <h3>Что учитывается при расчете отпускных</h3>
          <p>
            При расчете среднего заработка для отпускных учитываются:
          </p>
          <ul>
            <li>Заработная плата (оклад, тарифная ставка)</li>
            <li>Постоянные надбавки и доплаты</li>
            <li>Премии (ежемесячные, квартальные, годовые)</li>
            <li>Районные коэффициенты и северные надбавки</li>
            <li>Оплата за сверхурочную работу</li>
            <li>Оплата работы в выходные и праздничные дни</li>
          </ul>

          <h3>Что НЕ учитывается при расчете</h3>
          <ul>
            <li>Больничные выплаты</li>
            <li>Предыдущие отпускные</li>
            <li>Командировочные расходы</li>
            <li>Материальная помощь</li>
            <li>Разовые премии к праздникам</li>
            <li>Компенсации (питание, проезд)</li>
          </ul>

          <h3>Исключаемые периоды</h3>
          <p>
            Из расчетного периода исключаются дни, когда:
          </p>
          <ul>
            <li>Работник был на больничном</li>
            <li>Работник был в отпуске (оплачиваемом или за свой счет)</li>
            <li>Работник был в командировке с сохранением среднего заработка</li>
            <li>Был простой не по вине работника</li>
            <li>Работник не работал из-за забастовки</li>
            <li>Работница была в отпуске по беременности и родам или по уходу за ребенком</li>
          </ul>

          <h3>Сроки выплаты отпускных</h3>
          <p>
            Согласно статье 136 ТК РФ, отпускные должны быть выплачены не позднее чем за 3 календарных 
            дня до начала отпуска. Например, если отпуск начинается в понедельник, отпускные должны 
            быть выплачены не позднее предыдущей пятницы. Нарушение этого срока является основанием 
            для переноса отпуска на другое время по желанию работника.
          </p>

          <h3>НДФЛ с отпускных</h3>
          <p>
            С отпускных удерживается НДФЛ по ставке 13% (для резидентов РФ с доходом до 5 млн рублей в год). 
            НДФЛ удерживается при выплате отпускных, но перечисляется в бюджет не позднее последнего числа 
            месяца, в котором была произведена выплата. Страховые взносы с отпускных начисляются в обычном порядке.
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            <strong>Обратите внимание:</strong> Расчет калькулятора является ориентировочным. Точная сумма 
            отпускных может отличаться в зависимости от особенностей начисления зарплаты в вашей организации. 
            Для получения точной информации обратитесь в бухгалтерию вашей компании.
          </p>
          </div>
        </div>
      </CalculatorLayout>
    </>
  );
};

export default VacationCalculatorPage;
