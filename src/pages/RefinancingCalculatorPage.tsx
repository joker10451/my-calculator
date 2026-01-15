import CalculatorLayout from "@/components/CalculatorLayout";
import RefinancingCalculator from "@/components/calculators/RefinancingCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { RefreshCw, TrendingDown, DollarSign, FileText, BarChart3, Clock } from "lucide-react";

const RefinancingCalculatorPage = () => {
    const seoData = {
        title: "Калькулятор рефинансирования кредита 2026",
        description: "Рассчитайте выгоду от рефинансирования кредита или ипотеки. Сравните платежи и переплату. Актуальные ставки 2026 года.",
        keywords: "калькулятор рефинансирования, рефинансирование кредита, рефинансирование ипотеки 2026, перекредитование",
        canonical: "https://schitay-online.ru/calculator/refinancing"
    };

    const structuredData = generateCalculatorSchema(
        "Калькулятор рефинансирования",
        "Бесплатный онлайн калькулятор для расчета выгоды от рефинансирования кредита",
        "https://schitay-online.ru/calculator/refinancing",
        "FinanceApplication"
    );

    const breadcrumbs = [
        { label: "Финансы", href: "/category/financial" },
        { label: "Калькулятор рефинансирования" }
    ];

    const faqItems = [
        {
            question: "Что такое рефинансирование кредита?",
            answer: "Рефинансирование - это получение нового кредита для погашения существующего, обычно на более выгодных условиях (ниже ставка, больше срок). Это позволяет снизить ежемесячный платеж или общую переплату по кредиту."
        },
        {
            question: "Когда выгодно рефинансировать кредит?",
            answer: "Рефинансирование выгодно, когда новая ставка ниже текущей минимум на 2-3%, остаток долга значительный, а срок погашения еще достаточно длительный. Также нужно учесть комиссии и расходы на оформление нового кредита."
        },
        {
            question: "Можно ли рефинансировать ипотеку?",
            answer: "Да, ипотеку можно рефинансировать как в своем банке, так и в другом. В 2026 году многие банки предлагают программы рефинансирования ипотеки со ставками от 8% до 14% годовых в зависимости от условий."
        },
        {
            question: "Какие документы нужны для рефинансирования?",
            answer: "Обычно требуются: паспорт, справка о доходах (2-НДФЛ или по форме банка), справка об остатке долга по текущему кредиту, кредитный договор. Для ипотеки дополнительно нужны документы на недвижимость."
        },
        {
            question: "Сколько стоит рефинансирование?",
            answer: "Стоимость включает: комиссию за выдачу нового кредита (0-2% от суммы), оценку залога для ипотеки (3-10 тыс. рублей), страховку, нотариальные расходы. Общие расходы обычно составляют 1-3% от суммы кредита."
        }
    ];

    return (
        <>
            <SEO {...seoData} structuredData={structuredData} />
            
            <CalculatorLayout
                title="Калькулятор рефинансирования"
                description="Узнайте, выгодно ли рефинансировать кредит: сравните ставки и платежи"
            >
                <Breadcrumbs items={breadcrumbs} />
                
                <RefinancingCalculator />
                
                <div className="mt-16">
                    <FAQ items={faqItems} />
                </div>

                <div className="mt-12 space-y-8">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                            О калькуляторе рефинансирования
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                            Калькулятор рефинансирования поможет вам оценить выгоду от перекредитования существующего 
                            займа. Инструмент сравнивает параметры текущего и нового кредита: ежемесячные платежи, 
                            общую переплату, срок погашения. Это позволяет принять обоснованное решение о целесообразности 
                            рефинансирования с учетом всех расходов.
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
                                        <RefreshCw className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Сравнение текущего и нового кредита
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                                        <TrendingDown className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Расчет экономии на процентах
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Учет расходов на рефинансирование
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Определение срока окупаемости рефинансирования
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Сравнение ежемесячных платежей
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Расчет итоговой выгоды
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
                                "Введите параметры текущего кредита: остаток долга, ставку, срок",
                                "Укажите условия нового кредита: ставку и срок",
                                "Добавьте расходы на рефинансирование (комиссии, оценка)",
                                "Изучите сравнительную таблицу платежей",
                                "Оцените итоговую экономию и срок окупаемости",
                                "Примите решение о целесообразности рефинансирования"
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

export default RefinancingCalculatorPage;
