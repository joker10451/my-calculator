import { BankComparisonTable } from "@/components/calculators/BankComparisonTable";
import { Building2, TrendingDown, Wallet, Shield, Star, ArrowRight } from "lucide-react";

const BankComparisonPage = () => {
    const features = [
        { icon: Star, text: "Рейтинги банков от реальных клиентов", color: 'amber' as const },
        { icon: TrendingDown, text: "Сравнение ставок в реальном времени", color: 'blue' as const },
        { icon: Wallet, text: "Все условия: комиссии, сроки, лимиты", color: 'green' as const },
        { icon: Shield, text: "Пометка партнёрских программ", color: 'purple' as const },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
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
                </div>

                {/* Table */}
                <div className="max-w-6xl mx-auto">
                    <BankComparisonTable />
                </div>

                {/* Features */}
                <div className="max-w-5xl mx-auto mt-20">
                    <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Почему это удобно</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center gap-3 hover:shadow-lg transition-all">
                                <f.icon className={`w-8 h-8 text-${f.color}-500`} />
                                <span className="text-slate-700 font-semibold text-sm">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="max-w-4xl mx-auto mt-16 mb-12">
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
