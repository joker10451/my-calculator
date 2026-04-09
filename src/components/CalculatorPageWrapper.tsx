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
  afterCalculator?: ReactNode;
  
  // Опциональные секции
  aboutTitle?: string;
  aboutDescription?: string;
  features?: Feature[];
  howToUseSteps?: string[];
}

const colorClasses = {
  blue: {
    bg: 'bg-slate-50 dark:bg-slate-900/70',
    border: 'border-slate-200 dark:border-slate-800',
    icon: 'bg-blue-600'
  },
  green: {
    bg: 'bg-slate-50 dark:bg-slate-900/70',
    border: 'border-slate-200 dark:border-slate-800',
    icon: 'bg-emerald-600'
  },
  purple: {
    bg: 'bg-slate-50 dark:bg-slate-900/70',
    border: 'border-slate-200 dark:border-slate-800',
    icon: 'bg-purple-500'
  },
  orange: {
    bg: 'bg-slate-50 dark:bg-slate-900/70',
    border: 'border-slate-200 dark:border-slate-800',
    icon: 'bg-orange-500'
  },
  pink: {
    bg: 'bg-slate-50 dark:bg-slate-900/70',
    border: 'border-slate-200 dark:border-slate-800',
    icon: 'bg-pink-500'
  },
  indigo: {
    bg: 'bg-slate-50 dark:bg-slate-900/70',
    border: 'border-slate-200 dark:border-slate-800',
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
  afterCalculator,
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

        {afterCalculator && (
          <div className="mt-8 md:mt-10">
            {afterCalculator}
          </div>
        )}
        
        <div className="mt-14 md:mt-16">
          <FAQ items={faqItems} />
        </div>

        {(aboutTitle || features || howToUseSteps) && (
          <div className="mt-12 md:mt-14 space-y-8">
            {/* About Section */}
            {aboutTitle && aboutDescription && (
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    const colors = colorClasses[feature.color];
                    
                    return (
                      <div
                        key={index}
                        className={`group p-5 rounded-xl ${colors.bg} border ${colors.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
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
              <div className="surface-muted p-8">
                <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
                  Как пользоваться калькулятором
                </h3>
                <div className="space-y-4">
                  {howToUseSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
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
