import { ReactNode, useState, useEffect } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { SEO, generateCalculatorSchema } from "@/components/SEO";
import { generateFAQSchema, generateHowToSchema, generateBreadcrumbSchema } from "@/utils/seoSchemas";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { RelatedCalculators } from "@/components/RelatedCalculators";
import { storage } from "@/shared/utils/storage";
import { toast } from "sonner";
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
  // Slug калькулятора для внутренней перелинковки
  relatedSlug?: string;
}

function CalculatorFeedback({ calculatorId }: { calculatorId: string }) {
  const [voted, setVoted] = useState<'positive' | 'negative' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const val = storage.get<string>(`calc_feedback_${calculatorId}`, '');
      if (val === 'positive' || val === 'negative') {
        setVoted(val);
        setSubmitted(true);
      }
    } catch {}
  }, [calculatorId]);

  const handleVote = (type: 'positive' | 'negative') => {
    if (submitted) return;
    setVoted(type);
    setSubmitted(true);
    try { storage.set(`calc_feedback_${calculatorId}`, type); } catch {}
    // Note: backend API not available — feedback stored in localStorage only
    toast.success(type === 'positive' ? 'Круто, мы полезны! 🎉' : 'Учтём, спасибо за честность!');
  };

  if (submitted && voted) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500 dark:text-slate-400">
        Спасибо за отзыв!
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <span className="text-sm text-slate-500 dark:text-slate-400">Был ли полезен калькулятор?</span>
      <div className="flex items-center gap-2">
        <button onClick={() => handleVote('positive')} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Да">👍</button>
        <button onClick={() => handleVote('negative')} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Нет">👎</button>
      </div>
    </div>
  );
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
  howToUseSteps,
  relatedSlug
}: CalculatorPageWrapperProps) => {
  const seoData = {
    title: seoTitle || title,
    description: seoDescription || description,
    keywords: seoKeywords,
    canonical
  };

  const webAppSchema = generateCalculatorSchema(
    schemaName,
    schemaDescription,
    canonical,
    "FinanceApplication"
  );

  const graphItems: object[] = [webAppSchema];

  if (faqItems && faqItems.length > 0) {
    const faqSchema = generateFAQSchema(faqItems);
    graphItems.push(faqSchema);
  }

  if (howToUseSteps && howToUseSteps.length > 0) {
    const howToSchema = generateHowToSchema(
      `Как пользоваться: ${schemaName}`,
      schemaDescription,
      canonical,
      howToUseSteps.map((step, i) => ({ name: `Шаг ${i + 1}`, text: step }))
    );
    graphItems.push(howToSchema);
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Главная', url: 'https://schitay-online.ru/' },
    { name: category, url: `https://schitay-online.ru${categoryHref}` },
    { name: title, url: canonical }
  ]);
  graphItems.push(breadcrumbSchema);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': graphItems.map(item => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { '@context': _ctx, ...rest } = item as any;
      void _ctx;
      return rest;
    })
  };

  const breadcrumbs = [
    { label: category, href: categoryHref },
    { label: title }
  ];

  return (
    <>
      <SEO {...seoData} structuredData={structuredData} />
      
      <CalculatorLayout title={title} description={description}>
        <h1 className="sr-only">{title}</h1>
        <Breadcrumbs items={breadcrumbs} />
        
        {calculator}

        <div className="mt-6">
          <CalculatorFeedback calculatorId={title} />
        </div>

        {afterCalculator && (
          <div className="mt-8 md:mt-10">
            {afterCalculator}
          </div>
        )}
        
        {faqItems && faqItems.length > 0 && (
          <div className="mt-14 md:mt-16">
            <FAQ items={faqItems} />
          </div>
        )}

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

        {relatedSlug && (
          <RelatedCalculators currentSlug={relatedSlug} />
        )}
      </CalculatorLayout>
    </>
  );
};

export default CalculatorPageWrapper;
