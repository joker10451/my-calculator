import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { useLocation, Link } from "react-router-dom";
import { categories } from "@/lib/data";
import { ArrowRight } from "lucide-react";

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
    bgClass = "bg-muted/30"
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

                <main className={`flex-1 py-12 md:py-20 ${bgClass}`}>
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12 animate-fade-in relative group">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                                {title.split('—')[0]}
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                {description}
                            </p>

                            {/* Print Button (Desktop only) */}
                            <button
                                onClick={() => window.print()}
                                className="no-print absolute top-0 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors hidden md:block"
                                title="Распечатать"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                            </button>
                        </div>

                        {children}

                        {/* Related Calculators Section */}
                        {relatedCalculators.length > 0 && (
                            <div className="mt-20 max-w-4xl mx-auto animate-fade-in no-print">
                                <h3 className="text-2xl font-bold mb-6 text-center">
                                    Смотрите также в категории «{currentCategory?.name}»
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {relatedCalculators.map((calc) => (
                                        <Link
                                            key={calc.name}
                                            to={calc.href}
                                            className="group bg-background border rounded-xl p-4 hover:border-primary/50 transition-all flex items-center justify-between"
                                        >
                                            <span className="font-medium group-hover:text-primary transition-colors">
                                                {calc.name}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
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
