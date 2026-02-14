/**
 * Компонент FAQ (Часто задаваемые вопросы)
 * С поддержкой структурированных данных Schema.org
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { generateFAQSchema } from './SEO';
import { Helmet } from 'react-helmet-async';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
  className?: string;
}

export function FAQ({ items, title = 'Часто задаваемые вопросы', className = '' }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = generateFAQSchema(items);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div className={`space-y-4 ${className}`}>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden bg-card"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-semibold pr-4">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-6 py-4 border-t border-border bg-muted/30 animate-fade-in"
                >
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
