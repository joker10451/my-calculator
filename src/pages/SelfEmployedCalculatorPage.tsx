import { Shield, TrendingDown, PiggyBank, Calculator, Wallet, ArrowRight } from "lucide-react";
import { SEO, generateFAQSchema } from "@/components/SEO";
import { generateHowToSchema } from "@/utils/seoSchemas";
import { SelfEmployedCalculator } from "@/components/calculators/SelfEmployedCalculator";
import { OffersBlock } from "@/components/affiliate/OffersBlock";

const SITE_URL = 'https://schitay-online.ru';

const faqItems = [
    {
        question: "Чем отличается самозанятый от ИП?",
        answer: "Самозанятый (НПД) — это специальный налоговый режим с упрощённой отчётностью и низкими ставками (4% с физлиц, 6% с юрлиц). ИП — это статус предпринимателя, который может работать на разных налоговых режимах (УСН, патент, ОСНО). Самозанятый не платит страховые взносы и не может нанимать сотрудников, ИП платит взносы и может иметь работников."
    },
    {
        question: "Какой лимит дохода для самозанятых в 2026 году?",
        answer: "Лимит дохода для самозанятых — 2.4 млн ₽ в год (200 000 ₽ в месяц). При превышении лимита необходимо перейти на другой налоговый режим (УСН или ОСНО)."
    },
    {
        question: "Нужно ли платить страховые взносы самозанятым?",
        answer: "Нет, самозанятые на НПД не платят обязательные страховые взносы. Это одно из главных преимуществ режима. Однако и пенсионные баллы не начисляются."
    },
    {
        question: "Какая эффективная ставка для ИП на УСН?",
        answer: "Для ИП на УСН «Доходы» ставка составляет 6% от дохода плюс фиксированные страховые взносы (49 500 ₽ в год в 2026). При доходе 100 000 ₽/мес эффективная ставка составляет около 10%."
    },
    {
        question: "Можно ли совмещать самозанятость с работой по найму?",
        answer: "Да, самозанятость можно совмещать с работой по трудовому договору. Однако нельзя оказывать услуги своему текущему работодателю как самозанятый."
    }
];

const howToSteps = [
    { name: 'Выберите режим', text: 'Самозанятость, ИП на УСН или ИП на патенте', url: `${SITE_URL}/calculator/self-employed#regime` },
    { name: 'Укажите доход', text: 'Введите ваш ежемесячный доход', url: `${SITE_URL}/calculator/self-employed#income` },
    { name: 'Укажите сотрудников', text: 'Есть ли у вас наёмные сотрудники', url: `${SITE_URL}/calculator/self-employed#employees` },
    { name: 'Посмотрите результат', text: 'Узнайте чистый доход после налогов', url: `${SITE_URL}/calculator/self-employed#result` },
];

export default function SelfEmployedCalculatorPage() {
    const faqSchema = generateFAQSchema(faqItems);
    const howToSchema = generateHowToSchema(
        'Как рассчитать налоги самозанятого или ИП',
        'Пошаговая инструкция по расчёту налогов для самозанятых и индивидуальных предпринимателей',
        `${SITE_URL}/calculator/self-employed`,
        howToSteps
    );

    const features = [
        { icon: TrendingDown, title: "Налог", desc: "Сколько платить" },
        { icon: Wallet, title: "Чистый доход", desc: "После налогов" },
        { icon: PiggyBank, title: "Взносы", desc: "Страховые взносы" },
        { icon: Shield, title: "Сравнение", desc: "Режимы налогообложения" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
            <SEO
                title="Калькулятор налогов для самозанятых и ИП 2026"
                description="Рассчитайте налоги для самозанятых, ИП на УСН и патенте. Сравните режимы налогообложения и узнайте чистый доход после уплаты налогов."
                keywords="калькулятор самозанятых, налоги ИП 2026, УСН калькулятор, патент калькулятор, налоги самозанятых НПД"
                canonical={`${SITE_URL}/calculator/self-employed`}
                structuredData={[faqSchema, howToSchema]}
            />
            <div className="container mx-auto px-4">
                <SelfEmployedCalculator />

                <div className="max-w-5xl mx-auto mt-10">
                    <OffersBlock product="vacancies" placement="result_block" title="Подработка и вакансии" subtitle="Дополнительный доход для самозанятых — курьер, мастер и другие." />
                </div>

                {/* Features */}
                <div className="max-w-5xl mx-auto mt-20">
                    <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Что покажет калькулятор</h2>
                    <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">Полный расчёт налогов и взносов</p>
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
                    <p className="text-slate-500 text-center mb-10">Ответы на вопросы о налогах самозанятых и ИП</p>
                    <div className="space-y-3">
                        {faqItems.map((item, i) => (
                            <details key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
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
                        <h2 className="text-2xl md:text-3xl font-black mb-4">Нужен займ для бизнеса?</h2>
                        <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
                            Быстрый займ на развитие бизнеса или покрытие кассовых разрывов
                        </p>
                        <a
                            href="/joy-money"
                            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-black text-lg py-4 px-10 rounded-2xl hover:bg-emerald-50 hover:scale-105 transition-all"
                        >
                            Получить займ
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
