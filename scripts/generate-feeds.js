import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Импортируем данные блога
const blogPosts = [
  {
    id: '1',
    slug: 'ipoteka-2026-novye-usloviya',
    title: 'Ипотека в 2026 году: новые условия и льготные программы',
    excerpt: 'Разбираем актуальные ставки по ипотеке, государственные программы поддержки и изменения в законодательстве. Как получить ипотеку на выгодных условиях.',
    publishedAt: '2026-01-13T10:00:00Z',
    isPublished: true,
    isFeatured: true,
    author: { name: 'Анна Финансова' },
    category: { name: 'Ипотека и кредиты' },
    tags: ['ипотека', 'кредит', '2026', 'льготы', 'ставки'],
    featuredImage: {
      url: 'https://считай.ru/blog/ipoteka-2026.jpg',
      alt: 'Ипотека в 2026 году - новые условия'
    }
  },
  {
    id: '2',
    slug: 'ndfl-2026-progressivnaya-shkala',
    title: 'НДФЛ в 2026 году: как работает прогрессивная шкала налогообложения',
    excerpt: 'Подробный разбор изменений в подоходном налоге. Кто и сколько будет платить, как рассчитать налог с зарплаты, примеры расчетов.',
    publishedAt: '2026-01-12T14:30:00Z',
    isPublished: true,
    isFeatured: true,
    author: { name: 'Михаил Налогов' },
    category: { name: 'Налоги и зарплата' },
    tags: ['НДФЛ', 'налоги', 'зарплата', 'прогрессивная шкала', '2026']
  },
  {
    id: '3',
    slug: 'tarify-zhkh-2026-kak-ekonomit',
    title: 'Тарифы ЖКХ в 2026 году: как экономить на коммунальных платежах',
    excerpt: 'Актуальные тарифы на электричество, газ, воду и отопление. Способы экономии, льготы и субсидии, нормативы потребления по регионам.',
    publishedAt: '2026-01-11T09:15:00Z',
    isPublished: true,
    isFeatured: false,
    author: { name: 'Елена Коммунальная' },
    category: { name: 'ЖКХ и коммунальные услуги' },
    tags: ['ЖКХ', 'тарифы', 'коммунальные услуги', 'экономия', 'льготы', '2026']
  }
];

const generateRSSFeed = () => {
  const siteUrl = 'https://считай.ru';
  const publishedPosts = blogPosts.filter(post => post.isPublished);
  
  const rssItems = publishedPosts
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map(post => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>noreply@считай.ru (${post.author.name})</author>
      <category><![CDATA[${post.category.name}]]></category>
      ${post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('')}
      ${post.featuredImage ? `<enclosure url="${post.featuredImage.url}" type="image/jpeg" />` : ''}
    </item>`;
    }).join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Считай.RU - Финансовый блог</title>
    <description>Экспертные статьи о финансах, налогах, ипотеке и экономии. Актуальная информация для принятия правильных финансовых решений.</description>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>ru-RU</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>noreply@считай.ru (Команда Считай.RU)</managingEditor>
    <webMaster>noreply@считай.ru (Команда Считай.RU)</webMaster>
    <category>Финансы</category>
    <category>Калькуляторы</category>
    <category>Налоги</category>
    <category>Ипотека</category>
    <category>ЖКХ</category>
    <ttl>60</ttl>
    <image>
      <url>${siteUrl}/icon-192.png</url>
      <title>Считай.RU</title>
      <link>${siteUrl}</link>
      <width>192</width>
      <height>192</height>
    </image>${rssItems}
  </channel>
</rss>`;

  return rssXml;
};

const generateSitemap = () => {
  const siteUrl = 'https://считай.ru';
  const publishedPosts = blogPosts.filter(post => post.isPublished);
  
  const blogUrls = publishedPosts.map(post => {
    const lastmod = post.updatedAt || post.publishedAt;
    return `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>${blogUrls}
</urlset>`;

  return sitemapXml;
};

// Генерируем файлы
const publicDir = path.join(__dirname, '..', 'public');

// RSS Feed
const rssContent = generateRSSFeed();
fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssContent, 'utf8');
console.log('✅ RSS feed сгенерирован: public/rss.xml');

// Sitemap
const sitemapContent = generateSitemap();
fs.writeFileSync(path.join(publicDir, 'sitemap-blog.xml'), sitemapContent, 'utf8');
console.log('✅ Sitemap блога сгенерирован: public/sitemap-blog.xml');

console.log('🎉 Все файлы успешно сгенерированы!');