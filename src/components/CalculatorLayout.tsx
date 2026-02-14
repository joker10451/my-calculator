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
    bgClass?: string;
}

const CalculatorLayout = ({
    children,
    title,
    description,
    bgClass = "bg-gradient-to-b from-muted/30 via-background to-muted/20"
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

    const canonicalUrl = `https://joker10451.github.io/my-calculator/#${currentPath}`;

    return (
        <>
            <Helmet>
                <title>{title} | Считай.RU</title>
                <meta name="description" content={description} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={`${title} | Считай.RU`} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content="https://schitay.ru/og-image.png" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={canonicalUrl} />
                <meta property="twitter:title" content={`${title} | Считай.RU`} />
                <meta property="twitter:description" content={description} />
                <meta property="twitter:image" content="https://joker10451.github.io/my-calculator/og-image.png" />

                {/* Structured Data (JSON-LD) */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": title,
                        "description": description,
                        "url": canonicalUrl,
                        "applicationCategory": "FinanceApplication",
                        "operatingSystem": "All",
                        "browserRequirements": "Requires JavaScript",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "RUB"
                        }
                    })}
                </script>
            </Helmet>

            <div className="min-h-screen flex flex-col">
                <Header />

                <main id="main-content" className={`flex-1 ${bgClass}`}>
                    {/* Hero Section */}
                    <div className="relative py-6 md:py-8 lg:py-10 overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute inset-0 -z-10 overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
                        </div>

                        <div className="container mx-auto px-4">
                            <div className="text-center max-w-3xl mx-auto animate-fade-in">
                                {/* Category badge */}
                                {currentCategory && (
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium border rounded-full bg-primary/5 border-primary/20 text-primary">
                                        <Sparkles className="w-4 h-4" />
                                        <span>{currentCategory.name}</span>
                                    </div>
                                )}

                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-tight">
                                    {title.split('—')[0]}
                                </h1>
                                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                    {description}
                                </p>

                                {/* Print Button (Desktop only) */}
                                <button
                                    onClick={() => window.print()}
                                    className="no-print absolute top-4 right-4 p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all hidden lg:flex items-center gap-2"
                                    title="Распечатать"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                                    <span className="text-sm font-medium">Печать</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Calculator Content */}
                    <div className="container mx-auto px-4 pb-16 md:pb-20 lg:pb-24">
                        {children}

                        {/* Related Calculators Section */}
                        {relatedCalculators.length > 0 && (
                            <div className="mt-16 md:mt-20 max-w-4xl mx-auto animate-fade-in no-print">
                                <div className="glass-card p-6 md:p-8">
                                    <h3 className="text-xl md:text-2xl font-bold mb-6 text-center">
                                        Ещё в категории «{currentCategory?.name}»
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {relatedCalculators.slice(0, 6).map((calc) => (
                                            <Link
                                                key={calc.name}
                                                to={calc.href}
                                                className="group bg-background/50 hover:bg-background border border-border/50 hover:border-primary/30 rounded-xl p-4 transition-all flex items-center justify-between"
                                            >
                                                <span className="font-medium text-sm md:text-base group-hover:text-primary transition-colors">
                                                    {calc.name}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </Link>
                                        ))}
                                    </div>
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
