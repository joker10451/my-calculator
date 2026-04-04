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
        { icon: AlertTriangle, text: "Шокирующая правда о переплате", color: 'red' as const },
        { icon: TrendingDown, text: "Сравнение ставок банков", color: 'blue' as const },
        { icon: PiggyBank, text: "Сколько сэкономите при выборе лучшего банка", color: 'green' as const },
        { icon: Shield, text: "Эквивалент переплаты в понятных вещах", color: 'purple' as const },
        { icon: Percent, text: "Реальная стоимость кредита", color: 'orange' as const },
        { icon: Home, text: "Сколько квартир вы покупаете", color: 'pink' as const }
    ];

    const howToUseSteps = [
        "Введите сумму кредита — сколько хотите взять в банке",
        "Укажите ставку — текущую или ту, что предлагает банк",
        "Выберите срок — на сколько лет берёте ипотеку",
        "Нажмите «Узнать правду» — увидите реальную переплату",
        "Сравните предложения банков и узнайте, сколько сэкономите"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
            <div className="container mx-auto px-4">
                <OverpaymentCalculator />

                {/* Features */}
                <div className="max-w-5xl mx-auto mt-20">
                    <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Что вы узнаете</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 hover:shadow-lg transition-all">
                                <f.icon className={`w-8 h-8 text-${f.color}-500 flex-shrink-0`} />
                                <span className="text-slate-700 font-semibold text-sm">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How to use */}
                <div className="max-w-5xl mx-auto mt-20">
                    <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Как пользоваться</h2>
                    <div className="grid md:grid-cols-5 gap-4">
                        {howToUseSteps.map((step, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-lg mx-auto mb-4">{i + 1}</div>
                                <p className="text-slate-600 text-sm font-medium">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div className="max-w-5xl mx-auto mt-20 mb-16">
                    <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Частые вопросы</h2>
                    <div className="space-y-4">
                        {faqItems.map((item, i) => (
                            <details key={i} className="bg-white rounded-2xl border border-slate-200 group">
                                <summary className="p-6 cursor-pointer font-bold text-slate-900 text-lg flex items-center gap-3 list-none">
                                    <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    {item.question}
                                </summary>
                                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
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
