import { Helmet } from 'react-helmet-async';
import type { BlogPost } from '@/types/blog';

interface BlogSEOProps {
  post?: BlogPost;
  type?: 'article' | 'website';
  title?: string;
  description?: string;
  canonical?: string;
}

export const BlogSEO = ({ 
  post, 
  type = 'article', 
  title, 
  description, 
  canonical 
}: BlogSEOProps) => {
  const siteUrl = 'https://schitay.ru';
  const siteName = 'Считай.RU';
  
  const seoTitle = post?.seo.metaTitle || title || (post ? `${post.title} | ${siteName}` : siteName);
  const seoDescription = post?.seo.metaDescription || description || post?.excerpt || 'Экспертные статьи о финансах, налогах и экономии.';
  const seoCanonical = canonical || post?.seo.canonical || (post ? `${siteUrl}/blog/${post.slug}` : `${siteUrl}/blog`);
  const seoImage = post?.seo.ogImage || post?.featuredImage?.url || `${siteUrl}/og-image-default.png`;

  // JSON-LD для статьи
  const articleSchema = post ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt,
    'image': [post.featuredImage?.url || seoImage],
    'datePublished': post.publishedAt,
    'dateModified': post.updatedAt || post.publishedAt,
    'author': [{
      '@type': 'Person',
      'name': post.author.name,
      'url': `${siteUrl}/blog?author=${encodeURIComponent(post.author.name)}`
    }],
    'publisher': {
      '@type': 'Organization',
      'name': siteName,
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/logo.png`
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`
    }
  } : null;

  // JSON-LD для хлебных крошек
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Главная',
        'item': siteUrl
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Блог',
        'item': `${siteUrl}/blog`
      },
      ...(post ? [{
        '@type': 'ListItem',
        'position': 3,
        'name': post.category.name,
        'item': `${siteUrl}/blog?category=${post.category.slug}`
      }, {
        '@type': 'ListItem',
        'position': 4,
        'name': post.title,
        'item': `${siteUrl}/blog/${post.slug}`
      }] : [])
    ]
  };

  return (
    <Helmet>
      {/* Стандартные мета-теги */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={seoCanonical} />
      
      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={seoCanonical} />
      <meta property="og:image" content={seoImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* JSON-LD Scripts */}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};
