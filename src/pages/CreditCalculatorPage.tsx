import CalculatorLayout from "@/components/CalculatorLayout";
import CreditCalculator from "@/components/calculators/CreditCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Calculator, TrendingUp, FileText, BarChart3, PieChart, DollarSign } from "lucide-react";

const CreditCalculatorPage = () => {
    const seoData = {
        title: "Кредитный калькулятор 2026",
        description: "Рассчитайте потребительский кредит онлайн: ежемесячный платеж, переплата, график платежей. Актуальные ставки 2026 года.",
        keywords: "кредитный калькулятор, расчет кредита, калькулятор кредита онлайн, потребительский кредит 2026",
        canonical: "https://schitay-online.ru/calculator/credit"
    };

    const structuredData = generateCalculatorSchema(
        "Кредитный калькулятор",
        "Бесплатный онлайн калькулятор для расчета потребительского кредита",
        "https://schitay-online.ru/calculator/credit",
        "FinanceApplication"
    );

    const breadcrumbs = [
        { label: "Финансы", href: "/category/financial" },
        { label: "Кредитный калькулятор" }
    ];

    const faqItems = [
        {
            question: "Как рассчитать ежемесячный платеж по кредиту?",
            answer: "Ежемесячный платеж по кредиту рассчитывается по формуле аннуитетного платежа, которая учитывает сумму кредита, процентную ставку и срок. Наш калькулятор автоматически производит точный расчет с учетом всех параметров."
        },
        {
            question: "Что такое полная стоимость кредита (ПСК)?",
            answer: "ПСК - это общая сумма, которую вы заплатите банку за весь срок кредита, включая проценты, комиссии и другие платежи. ПСК выражается в процентах годовых и позволяет сравнивать предложения разных банков."
        },
        {
            question: "Чем отличается потребительский кредит от ипотеки?",
            answer: "Потребительский кредит выдается без залога на меньшие суммы (до 5 млн рублей) и на более короткий срок (до 7 лет). Ставки по потребительским кредитам обычно выше, чем по ипотеке, но оформление проще и быстрее."
        },
        {
            question: "Можно ли досрочно погасить потребительский кредит?",
            answer: "Да, с 2011 года в России действует право на досрочное погашение кредита без штрафов и комиссий. Вы можете погасить кредит полностью или частично в любой момент, уведомив банк за 30 дней."
        },
        {
            question: "Какая средняя ставка по потребительским кредитам в 2026 году?",
            answer: "Средняя ставка по потребительским кредитам в 2026 году составляет от 12% до 25% годовых в зависимости от банка, суммы кредита, срока и кредитной истории заемщика. Самые низкие ставки предлагаются зарплатным клиентам."
        }
    ];

    return (
        <>
            <SEO {...seoData} structuredData={structuredData} />
            
            <CalculatorLayout
                title="Кредитный калькулятор"
                description="Рассчитайте параметры потребительского кредита и узнайте реальную переплату"
            >
                <Breadcrumbs items={breadcrumbs} />
                
                <CreditCalculator />
                
                <div className="mt-16">
                    <FAQ items={faqItems} />
                </div>

                <div className="mt-12 space-y-8">
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
                                        Точный расчет ежемесячного аннуитетного платежа
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Расчет полной стоимости кредита (ПСК)
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Определение общей переплаты по процентам
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
                                        Сравнение различных вариантов кредитования
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Экспорт результатов для анализа
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
                                "Введите желаемую сумму кредита",
                                "Укажите срок кредита в месяцах или годах",
                                "Введите процентную ставку (уточните актуальную ставку в банке)",
                                "Изучите результаты расчета: ежемесячный платеж и переплату",
                                "Просмотрите детальный график платежей",
                                "Сравните несколько вариантов, изменяя параметры"
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

export default CreditCalculatorPage;
