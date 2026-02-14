import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { EnhancedBlogCard } from '@/components/blog/enhanced/EnhancedBlogCard';
import type { BlogPost } from '@/types/blog';

// Демо-данные для тестирования
const demoPost: BlogPost = {
  id: 'demo-1',
  slug: 'demo-enhanced-card',
  title: 'Как рассчитать ипотеку в 2026 году: полное руководство',
  excerpt: 'Подробное руководство по расчету ипотеки, выбору банка и оптимизации платежей. Узнайте, как сэкономить на процентах и получить лучшие условия.',
  content: '',
  author: {
    name: 'Алексей Иванов',
    avatar: '',
    bio: 'Финансовый эксперт'
  },
  publishedAt: '2026-01-15',
  category: {
    id: 'mortgage-credit',
    name: 'Ипотека и кредиты',
    slug: 'mortgage-credit',
    description: 'Все о ипотечном кредитовании',
    color: '#3B82F6',
    icon: 'Home',
    seo: {},
    language: 'ru',
  },
  tags: ['ипотека', 'кредит', 'банки', 'недвижимость'],
  featuredImage: {
    url: '/blog/ipoteka-2026.jpg',
    alt: 'Ипотека 2026',
    width: 1200,
    height: 630,
  },
  seo: {},
  readingTime: 8,
  isPublished: true,
  isFeatured: true,
  language: 'ru',
};

export default function EnhancedBlogCardDemo() {
  return (
    <>
      <Helmet>
        <title>Enhanced Blog Card Demo | Считай.RU</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Enhanced Blog Card Demo
          </h1>

          <div className="space-y-16">
            {/* Default Variant */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Default Variant (280px)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <EnhancedBlogCard post={demoPost} variant="default" />
                <EnhancedBlogCard post={demoPost} variant="default" />
                <EnhancedBlogCard post={demoPost} variant="default" />
              </div>
            </section>

            {/* Featured Variant */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Featured Variant (360px)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <EnhancedBlogCard post={demoPost} variant="featured" />
                <EnhancedBlogCard post={demoPost} variant="featured" />
              </div>
            </section>

            {/* Hero Variant */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Hero Variant (500px)</h2>
              <div className="max-w-4xl mx-auto">
                <EnhancedBlogCard post={demoPost} variant="hero" />
              </div>
            </section>

            {/* Without Excerpt */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Without Excerpt</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <EnhancedBlogCard 
                  post={demoPost} 
                  variant="default" 
                  showExcerpt={false}
                />
                <EnhancedBlogCard 
                  post={demoPost} 
                  variant="default" 
                  showExcerpt={false}
                />
                <EnhancedBlogCard 
                  post={demoPost} 
                  variant="default" 
                  showExcerpt={false}
                />
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
