import CalculatorLayout from "@/components/CalculatorLayout";
import MaternityCapitalCalculator from "@/components/calculators/MaternityCapitalCalculator";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Baby, Home, GraduationCap, TrendingUp, DollarSign, Calendar } from "lucide-react";

const MaternityCapitalCalculatorPage = () => {
    const seoData = {
        title: "Калькулятор материнского капитала 2026",
        description: "Рассчитайте размер материнского капитала на первого и второго ребенка. Актуальные суммы господдержки 2026 года с учетом индексации.",
        keywords: "материнский капитал 2026, калькулятор маткапитала, размер материнского капитала, господдержка семей",
        canonical: "https://schitay-online.ru/calculator/maternity-capital"
    };

    const structuredData = generateCalculatorSchema(
        "Калькулятор материнского капитала",
        "Бесплатный онлайн калькулятор для расчета размера материнского капитала",
        "https://schitay-online.ru/calculator/maternity-capital",
        "FinanceApplication"
    );

    const breadcrumbs = [
        { label: "Финансы", href: "/category/financial" },
        { label: "Материнский капитал" }
    ];

    const faqItems = [
        {
            question: "Какой размер материнского капитала в 2026 году?",
            answer: "В 2026 году размер материнского капитала составляет 934 058 рублей на первого ребенка и 1 232 881 рубль при рождении второго ребенка (если не получали на первого). Если получали на первого, доплата на второго составит 298 823 рубля."
        },
        {
            question: "На что можно потратить материнский капитал?",
            answer: "Материнский капитал можно использовать на: улучшение жилищных условий (покупка, строительство, ипотека), образование детей, накопительную пенсию матери, товары и услуги для детей-инвалидов, ежемесячные выплаты на второго ребенка до 3 лет."
        },
        {
            question: "Когда можно использовать материнский капитал?",
            answer: "Сертификат можно получить сразу после рождения ребенка, но использовать средства в большинстве случаев можно только после достижения ребенком 3 лет. Исключения: погашение ипотеки, ежемесячные выплаты, товары для детей-инвалидов - доступны сразу."
        },
        {
            question: "Индексируется ли материнский капитал?",
            answer: "Да, материнский капитал ежегодно индексируется государством. Индексация происходит автоматически, даже если вы получили сертификат несколько лет назад, но еще не использовали средства. Неиспользованный остаток также индексируется."
        },
        {
            question: "Можно ли получить материнский капитал на первого ребенка?",
            answer: "Да, с 2020 года материнский капитал выплачивается на первого ребенка, рожденного или усыновленного после 1 января 2020 года. На второго ребенка выплачивается дополнительная сумма."
        }
    ];

    return (
        <>
            <SEO {...seoData} structuredData={structuredData} />
            
            <CalculatorLayout
                title="Калькулятор материнского капитала"
                description="Узнайте размер господдержки для вашей семьи в 2025-2026 году"
            >
                <Breadcrumbs items={breadcrumbs} />
                
                <MaternityCapitalCalculator />
                
                <div className="mt-16">
                    <FAQ items={faqItems} />
                </div>

                <div className="mt-12 space-y-8">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                            О калькуляторе материнского капитала
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                            Калькулятор материнского капитала поможет вам узнать точный размер государственной поддержки, 
                            на которую имеет право ваша семья. Инструмент учитывает год рождения детей, количество детей 
                            и все изменения в законодательстве, включая индексацию 2026 года.
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
                                        <Baby className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Расчет суммы на первого ребенка (с 2020 года)
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-green-500 text-white group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Расчет доплаты на второго ребенка
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500 text-white group-hover:scale-110 transition-transform">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Учет года рождения детей
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-orange-500 text-white group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Актуальные суммы с учетом индексации 2026 года
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-pink-500 text-white group-hover:scale-110 transition-transform">
                                        <Home className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Информация о способах использования средств
                                    </p>
                                </div>
                            </div>

                            <div className="group p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">
                                        Подсказки по оформлению сертификата
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
                                "Укажите год рождения первого ребенка",
                                "Если есть второй ребенок, укажите год его рождения",
                                "Отметьте, получали ли вы материнский капитал ранее",
                                "Калькулятор автоматически рассчитает положенную сумму",
                                "Изучите информацию о способах использования средств"
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

export default MaternityCapitalCalculatorPage;
