import { Shield, TrendingDown, PiggyBank, AlertTriangle, Calculator, Home, Percent } from "lucide-react";
import { OverpaymentCalculator } from "@/components/calculators/OverpaymentCalculator";

const OverpaymentCalculatorPage = () => {
    const faqItems = [
        {
            question: "Почему переплата по ипотеке такая большая?",
            answer: "При аннуитетных платежах вы первые годы платите в основном проценты, а не основной долг. За 20 лет при ставке 22% переплата может составить 200-300% от суммы кредита. Это особенность аннуитетной схемы, которую используют все российские банки."
        },
        {
            question: "Как уменьшить переплату по ипотеке?",
            answer: "Способы: 1) Увеличить первоначальный взнос — меньше долг = меньше процентов. 2) Выбрать меньший срок — за 10 лет переплата в разы меньше, чем за 20. 3) Досрочное погашение — даже небольшие доп. платежи значительно сокращают переплату. 4) Сравнить предложения разных банков — разница в 1-2% экономит сотни тысяч."
        },
        {
            question: "Что значит 'переплата 200%'?",
            answer: "Это значит, что вы отдадите банку в 3 раза больше, чем взяли. Например, при кредите 3 млн рублей вы вернёте 9 млн: 3 млн — основной долг и 6 млн — проценты. Фактически вы покупаете 3 квартиры по цене одной."
        },
        {
            question: "Какой срок ипотеки оптимален?",
            answer: "Оптимальный срок — тот, при котором ежемесячный платёж не превышает 30-40% дохода. Лучше взять длинный срок для безопасности, но платить как по короткому (досрочное погашение). Это даст гибкость при финансовых трудностях."
        },
        {
            question: "Стоит ли брать ипотеку при высоких ставках?",
            answer: "При ставках выше 20% переплата становится экстремальной. Рассмотрите альтернативы: льготные программы (семейная ипотека, IT-ипотека), накопление большего первоначального взноса, покупка менее дорогого жилья. Если берёте — планируйте рефинансирование при снижении ставок."
        }
    ];

    const features = [
        { icon: AlertTriangle, title: "Шокирующая правда", desc: "Узнайте реальную переплату" },
        { icon: TrendingDown, title: "Сравнение банков", desc: "Лучшие и худшие ставки" },
        { icon: PiggyBank, title: "Экономия", desc: "Сколько сэкономите" },
        { icon: Shield, title: "Эквивалент", desc: "Переплата в понятных вещах" },
        { icon: Percent, title: "Реальная стоимость", desc: "Скрытые расходы" },
        { icon: Home, title: "Квартиры", desc: "Сколько покупаете" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
            <div className="container mx-auto px-4">
                <OverpaymentCalculator />

                {/* Features */}
                <div className="max-w-5xl mx-auto mt-20">
                    <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">Что вы узнаете</h2>
                    <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">Калькулятор покажет скрытые расходы, о которых банки не рассказывают</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:border-slate-200 transition-all">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                                    <f.icon className="w-5 h-5 text-red-500" />
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
                    <p className="text-slate-500 text-center mb-10">Ответы на главные вопросы об ипотеке</p>
                    <div className="space-y-3">
                        {faqItems.map((item, i) => (
                            <details key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
                                <summary className="p-5 cursor-pointer font-bold text-slate-900 flex items-center gap-3 list-none hover:bg-slate-50 transition-colors">
                                    <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    {item.question}
                                </summary>
                                <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                                    {item.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverpaymentCalculatorPage;
