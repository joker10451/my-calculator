import { useParams, Navigate, Link } from "react-router-dom";
import CalculatorLayout from "@/components/CalculatorLayout";
import { categories } from "@/lib/data";
import { ArrowRight, Calculator } from "lucide-react";
import { PSBCardWidget } from "@/components/PSBCardWidget";
import { shouldShowPSBCard, getPSBCardVariant, getPSBCardSource } from "@/lib/psbCardPlacement";

const CategoryPage = () => {
    const { id } = useParams();
    const category = categories.find((c) => c.id === id);

    if (!category) {
        return <Navigate to="/404" />;
    }

    // Определяем, нужно ли показывать карту ПСБ
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
        <CalculatorLayout
            title={category.name}
            description={category.description}
            bgClass={category.color.split(" ")[0] + " bg-opacity-10"}
        >
            {/* Карта ПСБ для релевантных категорий */}
            {showPSBCard && (
                <div className="mb-8 animate-fade-in">
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
                        className="group glass-card p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-card border flex items-center justify-center`}>
                                <Calculator className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                    {calc.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Перейти к расчету
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 border-t pt-4">
                            <span className="text-xs text-muted-foreground">
                                Онлайн калькулятор
                            </span>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>
        </CalculatorLayout>
    );
};

export default CategoryPage;
