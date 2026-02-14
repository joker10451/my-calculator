import { useSearchParams, Link } from "react-router-dom";
import CalculatorLayout from "@/components/CalculatorLayout";
import { categories } from "@/lib/data";
import { Search, Calculator, ArrowRight } from "lucide-react";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const allCalculators = categories.flatMap(cat =>
        cat.calculators.map(calc => ({ ...calc, categoryId: cat.id, categoryName: cat.name }))
    );

    const results = allCalculators.filter(calc =>
        calc.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <CalculatorLayout
            title={`Результаты поиска: ${query}`}
            description={`Найдено ${results.length} калькуляторов по вашему запросу.`}
        >
            <div className="max-w-4xl mx-auto">
                {results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.map((calc, index) => (
                            <Link
                                key={calc.name + index}
                                to={calc.href}
                                className="group glass-card p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Calculator className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                            {calc.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Категория: {calc.categoryName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4 border-t pt-4">
                                    <span className="text-xs text-muted-foreground">
                                        Нажмите для перехода к расчёту
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-background/50 rounded-3xl border-2 border-dashed">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Ничего не нашли</h2>
                        <p className="text-muted-foreground mb-8">
                            Попробуйте изменить запрос или поискать в категориях.
                        </p>
                        <Button asChild variant="outline">
                            <Link to="/">Вернуться на главную</Link>
                        </Button>
                    </div>
                )}
            </div>
        </CalculatorLayout>
    );
};

// Internal Import for Button to avoid dependency loop in this specific file if needed, 
// but we just use Link/Button from UI.
import { Button } from "@/components/ui/button";

export default SearchPage;
