import { PiggyBank, Calculator, Home, Heart, GraduationCap, ArrowRight } from "lucide-react";
import { SEO, generateFAQSchema } from "@/components/SEO";
import { generateHowToSchema } from "@/utils/seoSchemas";
import { TaxDeductionCalculator } from "@/components/calculators/TaxDeductionCalculator";
import { OffersBlock } from "@/components/affiliate/OffersBlock";
import { TrustInfoBlock } from "@/components/TrustInfoBlock";
import { trackUxEvent } from "@/lib/analytics/uxMetrics";
import { Link } from "react-router-dom";

const SITE_URL = 'https://schitay-online.ru';

const faqItems = [
    {
        question: "Кто может получить налоговый вычет?",
        answer: "Любой гражданин РФ, который работает официально и платит НДФЛ (13%). Самозанятые на НПД не платят НДФЛ, поэтому не могут получить вычет."
    },
    {
        question: "За какой период можно получить вычет?",
        answer: "За последние 3 года. Например, в 2027 году можно подать декларации за 2026, 2025 и 2024 годы."
    },
    {
        question: "Сколько раз можно получить имущественный вычет?",
        answer: "Один раз в жизни, но лимит 2 млн ₽ можно использовать частями. Если квартира стоила 1,5 млн ₽ — остаток 500 000 ₽ можно использовать при следующей покупке."
    },
    {
        question: "Как подать на вычет?",
        answer: "Через личный кабинет ФНС (nalog.ru) — заполните 3-НДФЛ онлайн и приложите документы. Или через работодателя — получите уведомление из ФНС и передайте его работодателю."
    },
    {
        question: "Сколько времени занимает возврат?",
        answer: "Камеральная проверка — до 3 месяцев. Перечисление денег — до 1 месяца после проверки. Итого: до 4 месяцев."
    }
];

const howToSteps = [
    { name: 'Выберите тип вычета', text: 'Имущественный, социальный, за обучение или лечение', url: `${SITE_URL}/calculator/tax-deduction#type` },
    { name: 'Укажите расходы', text: 'Сумму, которую вы потратили на жильё, лечение и т.д.', url: `${SITE_URL}/calculator/tax-deduction#expense` },
    { name: 'Укажите доход', text: 'Годовой доход до вычета НДФЛ', url: `${SITE_URL}/calculator/tax-deduction#income` },
    { name: 'Узнайте сумму возврата', text: 'Сколько денег вернёт государство', url: `${SITE_URL}/calculator/tax-deduction#result` },
];

export default function TaxDeductionCalculatorPage() {
    const faqSchema = generateFAQSchema(faqItems);
    const howToSchema = generateHowToSchema(
        'Как рассчитать налоговый вычет',
        'Пошаговая инструкция по расчёту налогового вычета 13%',
        `${SITE_URL}/calculator/tax-deduction`,
        howToSteps
    );

    const features = [
        { icon: Home, title: "Имущественный", desc: "До 260 000 ₽" },
        { icon: Heart, title: "Социальный", desc: "До 14 300 ₽" },
        { icon: GraduationCap, title: "Обучение", desc: "До 14 300 ₽" },
        { icon: PiggyBank, title: "Пенсионный", desc: "До 14 300 ₽" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-12 md:pt-28 md:pb-20">
            <SEO
                title="Калькулятор налогового вычета 2026 — сколько вернёт государство"
                description="Рассчитайте налоговый вычет 13% за покупку жилья, лечение, обучение. Имущественный, социальный, стандартный вычеты. Актуальные лимиты 2026."
                keywords="налоговый вычет 2026, калькулятор вычета, имущественный вычет, социальный вычет, возврат НДФЛ, 3-НДФЛ"
                canonical={`${SITE_URL}/calculator/tax-deduction`}
                structuredData={[faqSchema, howToSchema]}
            />
            <div className="container mx-auto px-4">
                <h1 className="sr-only">Калькулятор налогового вычета 2026</h1>
                <TaxDeductionCalculator />

                <div className="max-w-5xl mx-auto mt-10">
                    <div className="space-y-6">
                        <OffersBlock
                            product="insurance"
                            placement="result_block"
                            title="Как увеличить выгоду после вычета"
                            subtitle="Некоторые программы накоплений позволяют дополнительно использовать налоговые льготы. Изучите доступные условия и форматы."
                        />
                        <div className="text-sm text-slate-600">
                            Подобрать больше программ можно в{" "}
                            <Link to="/offers?category=insurance" className="font-semibold text-primary hover:underline">
                                каталоге предложений
                            </Link>
                            .
                        </div>
                        <TrustInfoBlock
                            page="/calculator/tax-deduction"
                            updatedAt="Апрель 2026"
                            sourceLabel="Лимиты и правила ФНС России"
                            methodology="Калькулятор применяет действующие лимиты вычетов и ставку НДФЛ 13% к указанным расходам."
                            forWho="Для тех, кто платит НДФЛ и хочет оценить ориентировочную сумму возврата до подачи документов."
                        />
                    </div>
                </div>

                {/* Features */}
                <div className="max-w-5xl mx-auto mt-20">
                    <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Виды налоговых вычетов</h2>
                    <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">Верните 13% от своих расходов</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:border-slate-200 transition-all">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                                    <f.icon className="w-5 h-5 text-emerald-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1">{f.title}</h3>
                                <p className="text-slate-500 text-xs">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div className="max-w-5xl mx-auto mt-20 mb-16">
                    <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Частые вопросы</h2>
                    <p className="text-slate-500 text-center mb-10">Ответы на вопросы о налоговых вычетах</p>
                    <div className="space-y-3">
                        {faqItems.map((item, i) => (
                            <details
                                key={i}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden group"
                                onToggle={(event) => {
                                    const opened = (event.currentTarget as HTMLDetailsElement).open;
                                    if (opened) {
                                        trackUxEvent('faq_toggle', {
                                            page: '/calculator/tax-deduction',
                                            section: 'faq',
                                            value: item.question,
                                        });
                                    }
                                }}
                            >
                                <summary className="p-5 cursor-pointer font-bold text-slate-900 flex items-center gap-3 list-none hover:bg-slate-50 transition-colors">
                                    <Calculator className="w-5 h-5 text-emerald-600 flex-shrink-0" />
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
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 md:p-14 text-center text-white">
                        <h2 className="text-2xl md:text-3xl font-black mb-4">Купили квартиру в ипотеку?</h2>
                        <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
                            Посчитайте переплату и узнайте, сколько вернёт государство
                        </p>
                        <a
                            href="/calculator/overpayment"
                            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-black text-lg py-4 px-10 rounded-2xl hover:bg-emerald-50 hover:scale-105 transition-all"
                        >
                            Калькулятор переплаты
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
