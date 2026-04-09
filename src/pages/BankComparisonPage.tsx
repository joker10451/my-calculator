import { BankComparisonTable } from "@/components/calculators/BankComparisonTable";
import { SEO, generateFAQSchema, generateCalculatorSchema } from "@/components/SEO";
import { generateHowToSchema } from "@/utils/seoSchemas";
import { RateAlertButton } from "@/components/RateAlertButton";
import { Building2, TrendingDown, Wallet, Shield, Star, ArrowRight, CheckCircle } from "lucide-react";

const SITE_URL = 'https://schitay-online.ru';

const faqItems = [
    {
        question: "Как сравнить ставки по ипотеке в разных банках?",
        answer: "На странице сравнения банков выберите категорию «Ипотека» и отсортируйте по ставке. Обращайте внимание не только на процент, но и на наличие досрочного погашения, онлайн-заявки и дополнительных комиссий. Разница в 0.5% может сэкономить сотни тысяч за весь срок."
    },
    {
        question: "Какой банк лучше для вклада в 2026 году?",
        answer: "Выберите категорию «Вклады» и сравните ставки. Учитывайте не только процент, но и условия пополнения, капитализации и досрочного снятия. Вклад с капитализацией может дать больший доход при той же ставке."
    },
    {
        question: "Что значит специальная пометка у банка?",
        answer: "Специальная пометка указывает на расширенную карточку предложения. Это не влияет на объективность сравнения — ставки и условия показываются такие же, как на сайте банка."
    },
    {
        question: "Как часто обновляются ставки?",
        answer: "Ставки обновляются автоматически при изменении условий банками. Рекомендуем проверять актуальные предложения перед оформлением кредита или вклада."
    }
];

const howToSteps = [
    { name: 'Выберите категорию', text: 'Ипотека, Вклады, Кредиты или Дебетовые карты', url: `${SITE_URL}/compare-banks#category` },
    { name: 'Отсортируйте по ставке', text: 'Нажмите «По ставке» для сортировки от меньшей к большей', url: `${SITE_URL}/compare-banks#sort` },
    { name: 'Сравните условия', text: 'Обратите внимание на комиссии, сроки и лимиты', url: `${SITE_URL}/compare-banks#conditions` },
    { name: 'Выберите лучший банк', text: 'Лучшее предложение подсвечено зелёным значком', url: `${SITE_URL}/compare-banks#result` },
];

const BankComparisonPage = () => {
    const calculatorSchema = generateCalculatorSchema(
        'Сравнение банков — ипотека, вклады, кредиты',
        'Сравните ставки и условия банков России. Найдите лучшее предложение по ипотеке, вкладам, кредитам и дебетовым картам.',
        `${SITE_URL}/compare-banks`,
        'FinanceApplication'
    );

    const faqSchema = generateFAQSchema(faqItems);
    const howToSchema = generateHowToSchema(
        'Как сравнить банки',
        'Пошаговая инструкция по сравнению ставок и условий банков России',
        `${SITE_URL}/compare-banks`,
        howToSteps
    );

    const features = [
        { icon: Star, title: "Рейтинги банков", desc: "Оценки реальных клиентов", color: 'amber' },
        { icon: TrendingDown, title: "Ставки", desc: "Сравнение в реальном времени", color: 'blue' },
        { icon: Wallet, title: "Все условия", desc: "Комиссии, сроки, лимиты", color: 'emerald' },
        { icon: Shield, title: "Проверено", desc: "Карточки с расширенной информацией", color: 'purple' },
    ];

    const benefits = [
        "Актуальные ставки от ведущих банков России",
        "Сортировка по ставке, рейтингу и названию",
        "Детальное сравнение условий по каждому продукту",
        "Подсветка лучших предложений",
        "Мобильная адаптация для сравнения на ходу",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
            <SEO
                title="Сравнение банков — ставки по ипотеке, вкладам, кредитам 2026"
                description="Сравните ставки и условия банков России в одной таблице. Найдите лучшее предложение по ипотеке, вкладам, кредитам и дебетовым картам. Актуальные данные на апрель 2026."
                keywords="сравнение банков, ставки по ипотеке, лучшие вклады 2026, сравнение кредитов, рейтинг банков, лучшие ставки ипотеки"
                canonical={`${SITE_URL}/compare-banks`}
                structuredData={[calculatorSchema, faqSchema, howToSchema]}
            />
            <div className="container mx-auto px-4">
                {/* Hero */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <Building2 className="w-4 h-4" />
                        Актуальные предложения 2026
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
                        Сравните <span className="text-blue-600">банки</span> за минуту
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Все ставки, условия и рейтинги — в одной таблице. Найдите лучшее предложение без визита в каждый банк.
                    </p>
                    <div className="mt-6">
                        <RateAlertButton />
                    </div>
                </div>

                {/* Table */}
                <div className="max-w-6xl mx-auto mb-20">
                    <BankComparisonTable />
                </div>

                {/* Features */}
                <div className="max-w-5xl mx-auto mb-20">
                    <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Почему это удобно</h2>
                    <p className="text-slate-500 text-center mb-10">Экономьте время и деньги, сравнивая всё в одном месте</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-md hover:border-slate-200 transition-all">
                                <div className={`w-12 h-12 bg-${f.color}-50 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                                    <f.icon className={`w-6 h-6 text-${f.color}-500`} />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1">{f.title}</h3>
                                <p className="text-slate-500 text-xs">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits */}
                <div className="max-w-3xl mx-auto mb-20">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100 p-8 md:p-10">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">Что вы получаете</h2>
                        <div className="space-y-4">
                            {benefits.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-slate-700 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="max-w-5xl mx-auto mb-20">
                    <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Частые вопросы</h2>
                    <p className="text-slate-500 text-center mb-10">Ответы на главные вопросы о сравнении банков</p>
                    <div className="space-y-3">
                        {faqItems.map((item, i) => (
                            <details key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <summary className="p-5 cursor-pointer font-bold text-slate-900 flex items-center gap-3 list-none hover:bg-slate-50 transition-colors">
                                    {item.question}
                                </summary>
                                <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                                    {item.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="max-w-4xl mx-auto mb-16">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-10 md:p-14 text-center text-white">
                        <h2 className="text-2xl md:text-3xl font-black mb-4">Не нашли нужный продукт?</h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                            Воспользуйтесь нашими калькуляторами для детального расчёта под ваши условия
                        </p>
                        <a
                            href="/all"
                            className="inline-flex items-center gap-2 bg-white text-blue-700 font-black text-lg py-4 px-10 rounded-2xl hover:bg-blue-50 hover:scale-105 transition-all"
                        >
                            Все калькуляторы
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankComparisonPage;
