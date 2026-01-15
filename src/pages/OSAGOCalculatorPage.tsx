import CalculatorLayout from "@/components/CalculatorLayout";
import OSAGOCalculator from "@/components/calculators/OSAGOCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Car, Calculator, TrendingDown, MapPin, Zap, Shield } from "lucide-react";

const OSAGOCalculatorPage = () => {
  const seoData = {
    title: "Калькулятор ОСАГО 2026 - Рассчитать стоимость полиса онлайн",
    description: "Рассчитайте стоимость ОСАГО с учетом всех коэффициентов 2026 года: КБМ, регион, мощность, стаж водителя. Точный расчет за 1 минуту. Актуальные тарифы ЦБ РФ.",
    keywords: "осаго калькулятор, расчет осаго, стоимость осаго 2026, калькулятор осаго онлайн, кбм осаго, коэффициенты осаго",
    canonical: "https://schitay-online.ru/calculator/osago"
  };

  const structuredData = generateCalculatorSchema(
    "Калькулятор ОСАГО",
    "Бесплатный онлайн калькулятор для расчета стоимости полиса ОСАГО с учетом всех коэффициентов 2026 года",
    "https://schitay-online.ru/calculator/osago",
    "FinanceApplication"
  );

  const breadcrumbs = [
    { label: "Авто", href: "/category/auto" },
    { label: "Калькулятор ОСАГО" }
  ];

  const faqItems = [
    {
      question: "Как рассчитывается стоимость ОСАГО?",
      answer: "Стоимость ОСАГО рассчитывается по формуле: Базовый тариф × Региональный коэффициент × Коэффициент мощности × Коэффициент возраста/стажа × КБМ × Коэффициент периода использования × Коэффициент количества водителей. Базовые тарифы устанавливаются Центральным Банком РФ и зависят от типа транспортного средства."
    },
    {
      question: "Что такое КБМ и как он влияет на цену ОСАГО?",
      answer: "КБМ (коэффициент бонус-малус) - это скидка или надбавка за безаварийную езду. Минимальный КБМ 0.5 (скидка 50%) дается за 10+ лет без аварий. Максимальный КБМ 2.45 (надбавка 145%) - за частые ДТП. Каждый год без аварий снижает КБМ на 5%, а каждое ДТП по вашей вине повышает его."
    },
    {
      question: "Можно ли купить ОСАГО на 3 или 6 месяцев?",
      answer: "Да, можно оформить ОСАГО на период от 3 месяцев. Это удобно для сезонного использования автомобиля. Стоимость рассчитывается с применением коэффициента периода: 3 месяца - 0.5, 6 месяцев - 0.7, 12 месяцев - 1.0. Однако годовой полис выгоднее при постоянном использовании."
    },
    {
      question: "Какие документы нужны для оформления ОСАГО?",
      answer: "Для оформления ОСАГО потребуются: паспорт владельца, водительское удостоверение, СТС (свидетельство о регистрации ТС) или ПТС, диагностическая карта (для авто старше 4 лет). Если в полис вписываются другие водители, нужны их водительские удостоверения."
    },
    {
      question: "Как сэкономить на ОСАГО в 2026 году?",
      answer: "Способы экономии: 1) Ездите аккуратно для снижения КБМ (до 50% скидки), 2) Оформляйте полис онлайн (часто дешевле), 3) Выбирайте ограниченное количество водителей вместо неограниченного, 4) Сравнивайте предложения разных страховых компаний, 5) Используйте телематику (устройство контроля стиля вождения) для дополнительных скидок."
    }
  ];

  return (
    <>
      <SEO {...seoData} structuredData={structuredData} />
      
      <CalculatorLayout
        title="Калькулятор ОСАГО"
        description="Рассчитайте стоимость полиса ОСАГО онлайн с учетом всех коэффициентов 2026 года"
      >
        <Breadcrumbs items={breadcrumbs} />
        
        <OSAGOCalculator />
        
        <div className="mt-16">
          <FAQ items={faqItems} />
        </div>

        <div className="mt-12 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              О калькуляторе ОСАГО
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Наш калькулятор ОСАГО поможет вам быстро и точно рассчитать стоимость полиса обязательного 
              страхования автогражданской ответственности. Калькулятор учитывает все актуальные коэффициенты 
              2026 года, установленные Центральным Банком РФ, и позволяет получить предварительный расчет 
              стоимости полиса за несколько секунд.
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
                    <Car className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет для всех типов транспортных средств
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Учет регионального коэффициента для всех регионов России
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет коэффициента мощности двигателя
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Применение КБМ (коэффициента бонус-малус) от 0.5 до 2.45
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Расчет для разных периодов страхования (3, 6, 12 месяцев)
                  </p>
                </div>
              </div>

              <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Детальная разбивка расчета по всем коэффициентам
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              Как пользоваться калькулятором ОСАГО
            </h3>
            <div className="space-y-4">
              {[
                "Выберите тип вашего транспортного средства (легковой автомобиль, грузовик, мотоцикл или автобус)",
                "Укажите регион регистрации автомобиля - это влияет на региональный коэффициент",
                "Введите мощность двигателя в лошадиных силах (указана в СТС)",
                "Укажите возраст самого молодого водителя и минимальный стаж среди всех водителей",
                "Введите ваш КБМ (можно узнать на сайте РСА или в личном кабинете страховой)",
                "Выберите, будет ли полис ограниченным (конкретные водители) или неограниченным",
                "Укажите период страхования (3, 6 или 12 месяцев)",
                "Изучите результат расчета с детальной разбивкой по коэффициентам"
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
          <h3>Что такое ОСАГО и зачем оно нужно</h3>
          <p>
            ОСАГО (Обязательное Страхование Автогражданской Ответственности) - это обязательный вид 
            страхования для всех владельцев транспортных средств в России. Полис ОСАГО защищает 
            финансовые интересы водителя в случае, если он станет виновником ДТП. Страховая компания 
            возместит ущерб пострадавшим до установленных лимитов: до 400 000 рублей на имущество и 
            до 500 000 рублей на здоровье каждого пострадавшего.
          </p>

          <h3>Коэффициенты ОСАГО 2026 года</h3>
          <p>
            Стоимость полиса ОСАГО рассчитывается на основе базового тарифа и нескольких коэффициентов:
          </p>
          <ul>
            <li><strong>Базовый тариф</strong> - зависит от типа ТС (легковой - 5 980₽, грузовой - 7 200₽, мотоцикл - 1 850₽, автобус - 8 100₽)</li>
            <li><strong>Территориальный коэффициент (КТ)</strong> - от 1.2 до 2.0 в зависимости от региона регистрации</li>
            <li><strong>Коэффициент мощности (КМ)</strong> - от 0.6 до 1.6 в зависимости от мощности двигателя</li>
            <li><strong>Коэффициент возраста и стажа (КВС)</strong> - от 1.0 до 1.8, минимальный для водителей старше 22 лет со стажем более 3 лет</li>
            <li><strong>Коэффициент бонус-малус (КБМ)</strong> - от 0.5 до 2.45, зависит от аварийности</li>
            <li><strong>Коэффициент периода (КП)</strong> - 0.5 для 3 месяцев, 0.7 для 6 месяцев, 1.0 для года</li>
            <li><strong>Коэффициент количества водителей (КО)</strong> - 1.0 для ограниченного, 1.8 для неограниченного</li>
          </ul>

          <h3>Советы по экономии на ОСАГО</h3>
          <p>
            Чтобы снизить стоимость полиса ОСАГО, следуйте этим рекомендациям:
          </p>
          <ul>
            <li>Ездите аккуратно и избегайте ДТП - каждый год без аварий снижает КБМ на 5%</li>
            <li>Оформляйте полис онлайн - многие страховые компании предлагают скидки за электронное оформление</li>
            <li>Выбирайте ограниченный список водителей вместо неограниченного (экономия до 80%)</li>
            <li>Сравнивайте предложения разных страховых компаний - цены могут отличаться в пределах тарифного коридора</li>
            <li>Используйте телематику - некоторые страховые предлагают скидки за установку устройства контроля стиля вождения</li>
            <li>Оформляйте полис заранее - не ждите последнего дня, чтобы иметь время на сравнение предложений</li>
          </ul>

          <p className="text-sm text-muted-foreground mt-8">
            <strong>Обратите внимание:</strong> Расчет калькулятора является предварительным и может отличаться 
            от финальной стоимости полиса в страховой компании. Точную стоимость уточняйте при оформлении полиса. 
            Базовые тарифы и коэффициенты актуальны на 2026 год согласно указаниям Центрального Банка РФ.
          </p>
          </div>
        </div>
      </CalculatorLayout>
    </>
  );
};

export default OSAGOCalculatorPage;
