import { Shield, TrendingDown, PiggyBank, Calculator, Percent, ArrowRight } from "lucide-react";
import { SEO, generateFAQSchema } from "@/components/SEO";
import { generateHowToSchema } from "@/utils/seoSchemas";
import { RefinancingCalculator } from "@/components/calculators/RefinancingCalculator";

const SITE_URL = 'https://schitay-online.ru';

const faqItems = [
    {
        question: "Когда рефинансирование выгодно?",
        answer: "Рефинансирование выгодно, если новая ставка ниже текущей минимум на 1.5-2%. Чем больше разница в ставках и остаток долга, тем больше экономия. При ставках 22%+ даже снижение на 3-4% экономит сотни тысяч рублей."
    },
    {
        question: "Можно ли рефинансировать ипотеку?",
        answer: "Да, ипотеку можно рефинансировать в другом банке. При этом новый банк погашает ваш текущий кредит, а вы начинаете платить по новым условиям. Учитывайте расходы на оценку жилья и регистрацию."
    },
    {
        question: "Какие расходы при рефинансировании?",
        answer: "Возможные расходы: оценка недвижимости (3-10 тыс ₽), страхование (0.5-1% от суммы), комиссия за выдачу. Убедитесь, что экономия от новой ставки превышает эти расходы."
    },
    {
        question: "Сколько раз можно рефинансировать?",
        answer: "Количество рефинансирований не ограничено. Однако каждое новое оформление — это новые расходы и проверка кредитной истории. Оптимально — 1-2 рефинансирования за весь срок кредита."
    },
    {
        question: "Влияет ли рефинансирование на кредитную историю?",
        answer: "Рефинансирование не ухудшает кредитную историю. Наоборот, своевременные платежи по новому кредиту улучшают ваш скоринг. Однако частые запросы в БКИ могут временно снизить рейтинг."
    }
];

const howToSteps = [
    { name: 'Введите остаток долга', text: 'Укажите сколько осталось выплатить по текущему кредиту', url: `${SITE_URL}/calculator/refinancing#balance` },
    { name: 'Укажите текущую ставку', text: 'Введите процентную ставку вашего текущего кредита', url: `${SITE_URL}/calculator/refinancing#old-rate` },
    { name: 'Введите новую ставку', text: 'Укажите ставку, которую предлагает новый банк', url: `${SITE_URL}/calculator/refinancing#new-rate` },
    { name: 'Выберите срок', text: 'Укажите сколько месяцев осталось до конца кредита', url: `${SITE_URL}/calculator/refinancing#term` },
    { name: 'Узнайте выгоду', text: 'Посмотрите сколько сэкономите на рефинансировании', url: `${SITE_URL}/calculator/refinancing#result` },
];

export default function RefinancingCalculatorPage() {
    const faqSchema = generateFAQSchema(faqItems);
    const howToSchema = generateHowToSchema(
        'Как рассчитать выгоду рефинансирования',
        'Пошаговая инструкция по расчёту экономии от рефинансирования кредита',
        `${SITE_URL}/calculator/refinancing`,
        howToSteps
    );

    const features = [
        { icon: TrendingDown, title: "Экономия", desc: "Сколько сэкономите" },
        { icon: Percent, title: "Сравнение ставок", desc: "Текущая vs новая" },
        { icon: PiggyBank, title: "Платёж", desc: "Новый ежемесячный" },
        { icon: Shield, title: "Выгода", desc: "Общая экономия" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
            <SEO
                title="Калькулятор рефинансирования — сколько сэкономите при снижении ставки"
                description="Рассчитайте выгоду от рефинансирования кредита. Узнайте сколько сэкономите при снижении процентной ставки. Актуальные расчёты для ипотеки и потребительских кредитов."
                keywords="калькулятор рефинансирования, рефинансирование ипотеки, снижение ставки, экономия на кредите, рефинансирование кредита 2026"
                canonical={`${SITE_URL}/calculator/refinancing`}
                structuredData={[faqSchema, howToSchema]}
            />
            <div className="container mx-auto px-4">
                <RefinancingCalculator />

                {/* Features */}
                <div className="max-w-5xl mx-auto mt-20">
                    <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Что покажет калькулятор</h2>
                    <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">Полный расчёт выгоды от рефинансирования</p>
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
                    <p className="text-slate-500 text-center mb-10">Ответы на главные вопросы о рефинансировании</p>
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
                        <h2 className="text-2xl md:text-3xl font-black mb-4">Хотите сравнить ставки банков?</h2>
                        <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
                            Найдите банк с самой низкой ставкой для рефинансирования
                        </p>
                        <a
                            href="/compare-banks"
                            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-black text-lg py-4 px-10 rounded-2xl hover:bg-emerald-50 hover:scale-105 transition-all"
                        >
                            Сравнить банки
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
