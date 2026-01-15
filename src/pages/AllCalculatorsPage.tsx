import CalculatorLayout from "@/components/CalculatorLayout";
import { categories } from "@/lib/data";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight } from "lucide-react";
import { PSBCardWidget } from "@/components/PSBCardWidget";
import { shouldShowPSBCard, getPSBCardVariant, getPSBCardSource } from "@/lib/psbCardPlacement";

const AllCalculatorsPage = () => {
    return (
        <CalculatorLayout
            title="Все калькуляторы"
            description="Полный список всех инструментов для расчёта финансов, налогов, здоровья и многого другого."
        >
            <div className="space-y-16">
                {categories.map((category) => {
                    // Определяем, нужно ли показывать карту ПСБ для этой категории
                    const showPSBCard = shouldShowPSBCard({
                        pageType: 'category',
                        hasOtherBankProducts: category.id === 'finance' || category.id === 'salary'
                    });

                    const psbCardVariant = getPSBCardVariant({
                        pageType: 'category',
                        hasOtherBankProducts: true
                    });

                    const psbCardSource = getPSBCardSource({
                        pageType: 'category'
                    });

                    return (
                        <section key={category.id} className="animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${category.color}`}>
                                <category.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{category.name}</h2>
                                <p className="text-muted-foreground">{category.description}</p>
                            </div>
                        </div>

                        {/* Карта ПСБ для релевантных категорий */}
                        {showPSBCard && (
                            <div className="mb-6 animate-fade-in">
                                <PSBCardWidget 
                                    source={psbCardSource}
                                    variant={psbCardVariant}
                                    className="max-w-md"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.calculators.map((calc, index) => (
                                <Link
                                    key={calc.name}
                                    to={calc.href}
                                    className="group glass-card p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-card border flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                            <Calculator className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                {calc.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Перейти к расчету
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                );
                })}
            </div>
        </CalculatorLayout>
    );
};

export default AllCalculatorsPage;
