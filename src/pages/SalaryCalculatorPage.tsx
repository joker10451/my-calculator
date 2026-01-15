import CalculatorLayout from "@/components/CalculatorLayout";
import SalaryCalculator from "@/components/calculators/SalaryCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Calculator, TrendingDown, Users, FileText, BarChart3, DollarSign } from "lucide-react";

const SalaryCalculatorPage = () => {
    const seoData = {
        title: "Калькулятор зарплаты и НДФЛ 2026",
        description: "Рассчитайте зарплату на руки с учетом НДФЛ и страховых взносов. Актуальные ставки 2026 года. Прогрессивная шкала налогообложения.",
        keywords: "калькулятор зарплаты, расчет НДФЛ, зарплата на руки, калькулятор налогов 2026, подоходный налог",
        canonical: "https://schitay-online.ru/calculator/salary"
    };

    const structuredData = generateCalculatorSchema(
        "Калькулятор зарплаты и НДФЛ",
        "Бесплатный онлайн калькулятор для расчета зарплаты с учетом НДФЛ и страховых взносов",
        "https://schitay-online.ru/calculator/salary",
        "FinanceApplication"
    );

    const breadcrumbs = [
        { label: "Финансы", href: "/category/financial" },
        { label: "Калькулятор зарплаты" }
    ];

    const faqItems = [
        {
            question: "Как рассчитать зарплату на руки?",
            answer: "Зарплата на руки = Начисленная зарплата - НДФЛ. НДФЛ рассчитывается по прогрессивной шкале: 13% с доходов до 5 млн рублей в год и 15% с суммы превышения. Наш калькулятор автоматически учитывает все налоговые вычеты."
        },
        {
            question: "Что такое прогрессивная шкала НДФЛ?",
            answer: "С 2021 года в России действует прогрессивная шкала НДФЛ: 13% для доходов до 5 млн рублей в год и 15% для доходов свыше этой суммы. В 2026 году эти ставки остаются актуальными."
        },
        {
            question: "Какие налоговые вычеты можно применить?",
            answer: "Основные вычеты: стандартные (на детей), социальные (обучение, лечение), имущественные (покупка жилья), инвестиционные (ИИС). Наш калькулятор учитывает стандартные вычеты на детей."
        },
        {
            question: "Сколько платит работодатель сверх зарплаты?",
            answer: "Работодатель платит страховые взносы: 30% от зарплаты (22% в ПФР, 5.1% в ФОМС, 2.9% в ФСС). Эти взносы не вычитаются из зарплаты работника, но увеличивают расходы работодателя."
        },
        {
            question: "Как рассчитать зарплату от суммы на руки?",
            answer: "Чтобы рассчитать начисленную зарплату от суммы на руки, используйте обратный расчет: Начисленная = Сумма на руки / (1 - Ставка НДФЛ). Наш калькулятор поддерживает оба направления расчета."
        }
    ];

    return (
        <>
            <SEO {...seoData} structuredData={structuredData} />
            
            <CalculatorLayout
                title="Калькулятор зарплаты и НДФЛ"
                description="Рассчитайте зарплату на руки, подоходный налог и взносы. Актуальные ставки 2026 года"
            >
                <Breadcrumbs items={breadcrumbs} />
                
                <SalaryCalculator />
                
                <div className="mt-16">
                    <FAQ items={faqItems} />
                </div>

                <div className="mt-12 space-y-8">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                            О калькуляторе зарплаты
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                            Калькулятор зарплаты поможет вам точно рассчитать сумму, которую вы получите на руки 
                            после вычета НДФЛ и других налогов. Инструмент учитывает актуальную прогрессивную шкалу 
                            налогообложения 2026 года, стандартные налоговые вычеты на детей и позволяет рассчитать 
                            как зарплату на руки от начисленной, так и начисленную от желаемой суммы на руки.
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
                                        Расчет зарплаты на руки с учетом НДФЛ по прогрессивной шкале
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                                        <TrendingDown className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Обратный расчет: от суммы на руки к начисленной зарплате
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Учет стандартных налоговых вычетов на детей
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Расчет страховых взносов работодателя
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Детальная разбивка всех начислений и удержаний
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Актуальные ставки налогов и взносов 2026 года
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
                                "Выберите тип расчета: от начисленной зарплаты или от суммы на руки",
                                "Введите сумму зарплаты",
                                "Укажите количество детей для применения налоговых вычетов",
                                "Изучите детальный расчет с разбивкой по всем налогам и взносам",
                                "При необходимости скорректируйте параметры для оптимизации"
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

export default SalaryCalculatorPage;
