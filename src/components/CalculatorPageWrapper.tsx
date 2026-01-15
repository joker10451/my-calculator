import { ReactNode } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  text: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo';
}

interface CalculatorPageWrapperProps {
  // SEO данные
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonical: string;
  schemaName: string;
  schemaDescription: string;
  
  // Заголовки
  title: string;
  description: string;
  
  // Breadcrumbs
  category: string;
  categoryHref: string;
  
  // FAQ
  faqItems: Array<{ question: string; answer: string }>;
  
  // Контент
  calculator: ReactNode;
  
  // Опциональные секции
  aboutTitle?: string;
  aboutDescription?: string;
  features?: Feature[];
  howToUseSteps?: string[];
}

const colorClasses = {
  blue: {
    bg: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'bg-blue-500'
  },
  green: {
    bg: 'from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'bg-green-500'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'bg-purple-500'
  },
  orange: {
    bg: 'from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'bg-orange-500'
  },
  pink: {
    bg: 'from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20',
    border: 'border-pink-200 dark:border-pink-800',
    icon: 'bg-pink-500'
  },
  indigo: {
    bg: 'from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'bg-indigo-500'
  }
};

const CalculatorPageWrapper = ({
  seoTitle,
  seoDescription,
  seoKeywords,
  canonical,
  schemaName,
  schemaDescription,
  title,
  description,
  category,
  categoryHref,
  faqItems,
  calculator,
  aboutTitle,
  aboutDescription,
  features,
  howToUseSteps
}: CalculatorPageWrapperProps) => {
  const seoData = {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    canonical
  };

  const structuredData = generateCalculatorSchema(
    schemaName,
    schemaDescription,
    canonical,
    "FinanceApplication"
  );

  const breadcrumbs = [
    { label: category, href: categoryHref },
    { label: title }
  ];

  return (
    <>
      <SEO {...seoData} structuredData={structuredData} />
      
      <CalculatorLayout title={title} description={description}>
        <Breadcrumbs items={breadcrumbs} />
        
        {calculator}
        
        <div className="mt-16">
          <FAQ items={faqItems} />
        </div>

        {(aboutTitle || features || howToUseSteps) && (
          <div className="mt-12 space-y-8">
            {/* About Section */}
            {aboutTitle && aboutDescription && (
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                  {aboutTitle}
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                  {aboutDescription}
                </p>
              </div>
            )}

            {/* Features Grid */}
            {features && features.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
                  Возможности калькулятора
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    const colors = colorClasses[feature.color];
                    
                    return (
                      <div
                        key={index}
                        className={`group p-5 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${colors.icon} text-white group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className="text-slate-700 dark:text-slate-200 font-medium">
                            {feature.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* How to Use Section */}
            {howToUseSteps && howToUseSteps.length > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
                  Как пользоваться калькулятором
                </h3>
                <div className="space-y-4">
                  {howToUseSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 pt-1 font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CalculatorLayout>
    </>
  );
};

export default CalculatorPageWrapper;
