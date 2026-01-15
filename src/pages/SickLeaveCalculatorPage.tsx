import CalculatorLayout from "@/components/CalculatorLayout";
import SickLeaveCalculator from "@/components/calculators/SickLeaveCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Heart, Calculator, Users, FileText, BarChart3, DollarSign } from "lucide-react";

const SickLeaveCalculatorPage = () => {
  const seoData = {
    title: "Калькулятор больничного 2026 - Расчет пособия по нетрудоспособности",
    description: "Рассчитайте больничный онлайн: пособие по временной нетрудоспособности с учетом стажа. Оплата работодателем и ФСС. Максимальные суммы 2026 года.",
    keywords: "калькулятор больничного, расчет больничного, больничный лист 2026, пособие по нетрудоспособности, расчет больничного онлайн",
    canonical: "https://schitay-online.ru/calculator/sick-leave"
  };

  const structuredData = generateCalculatorSchema(
    "Калькулятор больничного",
    "Бесплатный онлайн калькулятор для расчета пособия по временной нетрудоспособности",
    "https://schitay-online.ru/calculator/sick-leave",
    "FinanceApplication"
  );

  const breadcrumbs = [
    { label: "Зарплата и налоги", href: "/category/salary" },
    { label: "Калькулятор больничного" }
  ];

  const faqItems = [
    {
      question: "Как рассчитывается больничный в 2026 году?",
      answer: "Больничный рассчитывается по формуле: Средний дневной заработок × Коэффициент стажа × Количество дней. Средний дневной заработок = Зарплата за 2 года / 730 дней. Коэффициент стажа: до 5 лет - 60%, 5-8 лет - 80%, более 8 лет - 100%. Первые 3 дня оплачивает работодатель, остальные - ФСС."
    },
    {
      question: "Кто оплачивает больничный - работодатель или ФСС?",
      answer: "При болезни или травме первые 3 дня оплачивает работодатель, с 4-го дня - Фонд социального страхования (ФСС). При уходе за больным ребенком или членом семьи все дни оплачивает ФСС с первого дня. Выплата производится вместе с ближайшей зарплатой."
    },
    {
      question: "Как стаж влияет на размер больничного?",
      answer: "Страховой стаж напрямую влияет на размер пособия: менее 5 лет - 60% от среднего заработка, от 5 до 8 лет - 80%, более 8 лет - 100%. Стаж менее 6 месяцев - пособие рассчитывается исходя из МРОТ. В стаж включаются все периоды работы, когда уплачивались страховые взносы."
    },
    {
      question: "Какой максимальный размер больничного в 2026 году?",
      answer: "Максимальный размер дневного пособия в 2026 году составляет 4 039 рублей. Это ограничение связано с предельной базой для начисления страховых взносов за предыдущие годы. Даже если ваш средний заработок выше, пособие будет рассчитано исходя из этого лимита."
    },
    {
      question: "Удерживается ли НДФЛ с больничного?",
      answer: "Да, с пособия по временной нетрудоспособности удерживается НДФЛ по ставке 13% (для резидентов РФ). Страховые взносы с больничных не начисляются. НДФЛ удерживается при выплате пособия и перечисляется в бюджет в установленные сроки."
    }
  ];

  return (
    <>
      <SEO {...seoData} structuredData={structuredData} />
      
      <CalculatorLayout
        title="Калькулятор больничного"
        description="Рассчитайте пособие по временной нетрудоспособности с учетом стажа"
      >
        <Breadcrumbs items={breadcrumbs} />
        
        <SickLeaveCalculator />
        
        <div className="mt-16">
          <FAQ items={faqItems} />
        </div>

        <div className="mt-12 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              О калькуляторе больничного
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Наш калькулятор больничного поможет вам рассчитать размер пособия по временной 
              нетрудоспособности в соответствии с законодательством РФ. Калькулятор учитывает 
              страховой стаж, средний заработок за 2 года, максимальные ограничения и автоматически 
              разделяет оплату между работодателем и ФСС.
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
                    Расчет среднего дневного заработка за 2 календарных года
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Применение коэффициента стажа (60%, 80%, 100%)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет максимального дневного пособия (4 039₽ в 2026 году)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Разделение оплаты: работодатель (первые 3 дня) и ФСС (остальные дни)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Выбор причины нетрудоспособности (болезнь/травма или уход за ребенком)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Автоматический расчет НДФЛ 13% и суммы к выплате
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              Как пользоваться калькулятором больничного
            </h3>
            <div className="space-y-4">
              {[
                "Укажите количество дней больничного (по больничному листу)",
                "Введите вашу среднюю зарплату за последние 2 года (можно посмотреть в справке 2-НДФЛ)",
                "Укажите ваш страховой стаж в годах",
                "Выберите причину нетрудоспособности (болезнь/травма или уход за ребенком)",
                "Изучите результат: средний дневной заработок, дневное пособие, разделение оплаты, НДФЛ и сумму к выплате"
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
          <h3>Формула расчета больничного</h3>
          <p>
            Расчет пособия по временной нетрудоспособности производится в несколько этапов:
          </p>
          <ol>
            <li><strong>Средний дневной заработок:</strong> Зарплата за 2 года / 730 дней</li>
            <li><strong>Применение коэффициента стажа:</strong>
              <ul>
                <li>Менее 5 лет: 60% от среднего заработка</li>
                <li>От 5 до 8 лет: 80% от среднего заработка</li>
                <li>Более 8 лет: 100% от среднего заработка</li>
              </ul>
            </li>
            <li><strong>Проверка максимума:</strong> Не более 4 039₽ в день (2026 год)</li>
            <li><strong>Расчет пособия:</strong> Дневное пособие × Количество дней</li>
            <li><strong>Разделение оплаты:</strong>
              <ul>
                <li>Работодатель: первые 3 дня (при болезни/травме)</li>
                <li>ФСС: остальные дни или все дни (при уходе за ребенком)</li>
              </ul>
            </li>
            <li><strong>НДФЛ:</strong> Общая сумма × 13%</li>
            <li><strong>К выплате:</strong> Общая сумма - НДФЛ</li>
          </ol>

          <h3>Страховой стаж для больничного</h3>
          <p>
            Страховой стаж - это периоды работы, в течение которых за работника уплачивались 
            страховые взносы в ФСС. В страховой стаж включаются:
          </p>
          <ul>
            <li>Периоды работы по трудовому договору</li>
            <li>Периоды государственной гражданской или муниципальной службы</li>
            <li>Периоды военной службы</li>
            <li>Периоды деятельности в качестве ИП (при уплате добровольных взносов)</li>
            <li>Периоды деятельности в качестве адвоката, нотариуса</li>
          </ul>

          <h3>Кто оплачивает больничный</h3>
          <p>
            Порядок оплаты зависит от причины нетрудоспособности:
          </p>
          <ul>
            <li><strong>Болезнь или травма работника:</strong> первые 3 дня оплачивает работодатель, 
            с 4-го дня - ФСС</li>
            <li><strong>Уход за больным ребенком:</strong> все дни оплачивает ФСС с первого дня</li>
            <li><strong>Уход за больным членом семьи:</strong> все дни оплачивает ФСС с первого дня</li>
            <li><strong>Карантин:</strong> все дни оплачивает ФСС с первого дня</li>
            <li><strong>Протезирование:</strong> все дни оплачивает ФСС с первого дня</li>
          </ul>

          <h3>Максимальный размер больничного</h3>
          <p>
            Размер пособия ограничен предельной базой для начисления страховых взносов. 
            В 2026 году максимальный размер дневного пособия составляет 4 039 рублей. 
            Это ограничение применяется независимо от фактического заработка работника.
          </p>
          <p>
            Расчет максимума: (1 032 000₽ + 1 917 000₽) / 730 дней = 4 039₽ в день
          </p>

          <h3>Минимальный размер больничного</h3>
          <p>
            Если страховой стаж работника менее 6 месяцев, пособие рассчитывается исходя из МРОТ. 
            В 2026 году МРОТ составляет 19 242 рубля. Минимальное дневное пособие: 19 242₽ / 30.4 = 633₽ в день.
          </p>

          <h3>НДФЛ и страховые взносы</h3>
          <p>
            С пособия по временной нетрудоспособности:
          </p>
          <ul>
            <li><strong>Удерживается НДФЛ:</strong> 13% для резидентов РФ (15% для доходов свыше 5 млн₽ в год)</li>
            <li><strong>НЕ начисляются страховые взносы:</strong> пособие освобождено от взносов в ПФР, ФСС и ФОМС</li>
          </ul>

          <h3>Сроки выплаты больничного</h3>
          <p>
            Пособие по временной нетрудоспособности назначается в течение 10 календарных дней 
            со дня обращения за ним и выплачивается в ближайший день выплаты зарплаты, 
            установленный у работодателя. ФСС перечисляет свою часть пособия напрямую работнику 
            на банковскую карту или через работодателя.
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            <strong>Обратите внимание:</strong> Расчет калькулятора является ориентировочным. 
            Точная сумма пособия может отличаться в зависимости от особенностей вашей ситуации. 
            Для получения точной информации обратитесь в бухгалтерию вашей компании или в ФСС.
          </p>
          </div>
        </div>
      </CalculatorLayout>
    </>
  );
};

export default SickLeaveCalculatorPage;
