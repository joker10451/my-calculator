import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { useLocation, Link } from "react-router-dom";
import { categories } from "@/lib/data";
import { ArrowRight, Sparkles } from "lucide-react";

interface CalculatorLayoutProps {
    children: ReactNode;
    title: string;
    description: string;
}

const CalculatorLayout = ({
    children,
    title,
    description,
}: CalculatorLayoutProps) => {
    const location = useLocation();
    const currentPath = location.pathname;

    // Find current category and related calculators
    const currentCategory = categories.find(cat =>
        cat.calculators.some(calc => calc.href === currentPath)
    );

    const relatedCalculators = currentCategory?.calculators.filter(
        calc => calc.href !== currentPath
    ) || [];

    // Add trailing slash for canonical URL (GitHub Pages adds it automatically)
    const canonicalPath = currentPath.endsWith('/') || currentPath === '/' 
        ? currentPath 
        : `${currentPath}/`;
    const canonicalUrl = `https://schitay-online.ru${canonicalPath}`;

    return (
        <>
            <Helmet>
                <title>{title} | Считай.RU</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={`${title} | Считай.RU`} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonicalUrl} />
                <link rel="canonical" href={canonicalUrl} />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-background">
                <Header />

                <main id="main-content" className="flex-1 pt-6">
                    {/* Title Section */}
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-6">
                            {currentCategory && (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2 text-[10px] font-medium text-primary bg-primary/10 rounded">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>{currentCategory.name}</span>
                                </div>
                            )}

                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-balance">
                                {title.split('—')[0]}
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {description}
                            </p>

                            {/* Print Button */}
                            <button
                                onClick={() => window.print()}
                                className="no-print absolute top-20 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded hidden lg:flex items-center gap-1"
                                title="Распечатать"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Calculator Content */}
                    <div className="container mx-auto px-4">
                        {children}

                        {/* Related Calculators */}
                        {relatedCalculators.length > 0 && (
                            <div className="mt-12 max-w-4xl mx-auto no-print">
                                <h3 className="text-lg font-semibold mb-4 text-center">
                                    Ещё в категории «{currentCategory?.name}»
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {relatedCalculators.slice(0, 6).map((calc) => (
                                        <Link
                                            key={calc.name}
                                            to={calc.href}
                                            className="group bg-muted/30 hover:bg-muted border border-border/30 hover:border-primary/30 rounded-lg p-3 transition-all flex items-center justify-between text-sm"
                                        >
                                            <span className="group-hover:text-primary transition-colors">
                                                {calc.name}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default CalculatorLayout;
