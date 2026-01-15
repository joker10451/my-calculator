import CalculatorLayout from "@/components/CalculatorLayout";
import DepositCalculator from "@/components/calculators/DepositCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { TrendingUp, PiggyBank, Calendar, BarChart3, Calculator, LineChart } from "lucide-react";

const DepositCalculatorPage = () => {
    const seoData = {
        title: "Калькулятор вкладов 2026",
        description: "Рассчитайте доходность вклада с капитализацией процентов и пополнением. Актуальные ставки банков 2026 года.",
        keywords: "калькулятор вкладов, расчет процентов по вкладу, депозитный калькулятор, вклады 2026, капитализация процентов",
        canonical: "https://schitay-online.ru/calculator/deposit"
    };

    const structuredData = generateCalculatorSchema(
        "Калькулятор вкладов",
        "Бесплатный онлайн калькулятор для расчета доходности банковских вкладов с капитализацией",
        "https://schitay-online.ru/calculator/deposit",
        "FinanceApplication"
    );

    const breadcrumbs = [
        { label: "Финансы", href: "/category/financial" },
        { label: "Калькулятор вкладов" }
    ];

    const faqItems = [
        {
            question: "Что такое капитализация процентов по вкладу?",
            answer: "Капитализация - это начисление процентов на проценты. Банк периодически (ежемесячно, ежеквартально) добавляет начисленные проценты к сумме вклада, и в следующем периоде проценты начисляются уже на увеличенную сумму. Это позволяет получить больший доход."
        },
        {
            question: "Как рассчитать доход по вкладу с капитализацией?",
            answer: "Для расчета используется формула сложных процентов: S = P × (1 + r/n)^(n×t), где P - начальная сумма, r - годовая ставка, n - количество капитализаций в год, t - срок в годах. Наш калькулятор автоматически производит этот расчет."
        },
        {
            question: "Какие ставки по вкладам в 2026 году?",
            answer: "Средние ставки по вкладам в 2026 году составляют от 8% до 18% годовых в зависимости от банка, суммы вклада и срока размещения. Самые высокие ставки предлагаются по вкладам на срок от 1 года без возможности досрочного снятия."
        },
        {
            question: "Облагаются ли проценты по вкладам налогом?",
            answer: "С 2021 года проценты по вкладам облагаются НДФЛ 13%, если их сумма превышает необлагаемый минимум (1 млн рублей × ключевая ставка ЦБ). Налог удерживается автоматически банком или налоговой службой."
        },
        {
            question: "Что выгоднее: вклад с капитализацией или без?",
            answer: "Вклад с капитализацией всегда выгоднее при прочих равных условиях, так как проценты начисляются на проценты. Однако банки могут предлагать более высокую ставку по вкладам без капитализации, поэтому нужно сравнивать итоговую доходность."
        }
    ];

    return (
        <>
            <SEO {...seoData} structuredData={structuredData} />

            <CalculatorLayout
                title="Калькулятор вкладов"
                description="Рассчитайте сложный процент по вкладу с пополнением и капитализацией"
            >
                <Breadcrumbs items={breadcrumbs} />

                <DepositCalculator />

                <div className="mt-16">
                    <FAQ items={faqItems} />
                </div>

                <div className="mt-12 space-y-8">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                            О калькуляторе вкладов
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                            Калькулятор вкладов поможет вам рассчитать доходность банковского депозита с учетом
                            капитализации процентов и регулярных пополнений. Инструмент использует формулу сложных
                            процентов и позволяет сравнить различные варианты размещения средств в банках.
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
                                        Расчет доходности с капитализацией процентов
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                                        <PiggyBank className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Учет регулярных пополнений вклада
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Различные периоды капитализации (ежемесячно, ежеквартально, ежегодно)
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Сравнение вкладов с разными условиями
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                                        <Calculator className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Расчет эффективной процентной ставки
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                                        <LineChart className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Детальный график начисления процентов
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
                                "Введите начальную сумму вклада",
                                "Укажите процентную ставку (уточните актуальную ставку в банке)",
                                "Выберите срок размещения вклада",
                                "Укажите периодичность капитализации процентов",
                                "При необходимости добавьте регулярные пополнения",
                                "Изучите итоговую доходность и график начислений"
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

export default DepositCalculatorPage;
