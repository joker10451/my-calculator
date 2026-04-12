import { blogPosts } from '@/data/blogPosts';
import { getAssetUrl } from './blogImageMap';
import { SITE_URL } from '@/shared/constants';

export const generateRSSFeed = () => {
  
  const publishedPosts = blogPosts.filter(post => post.isPublished);
  
  const rssItems = publishedPosts
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map(post => {
      const postUrl = `${SITE_URL}/blog/${post.slug}`;
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
      ${post.featuredImage ? (() => {
        const resolvedImage = getAssetUrl(post.featuredImage.url);
        const absoluteImageUrl = resolvedImage.startsWith('http') ? resolvedImage : `${SITE_URL}${resolvedImage.startsWith('/') ? '' : '/'}${resolvedImage}`;
        return `<enclosure url="${absoluteImageUrl}" type="image/jpeg" />`;
      })() : ''}
    </item>`;
    }).join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Считай.RU - Финансовый блог</title>
    <description>Экспертные статьи о финансах, налогах, ипотеке и экономии. Актуальная информация для принятия правильных финансовых решений.</description>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
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
      <url>${SITE_URL}/icon-192.png</url>
      <title>Считай.RU</title>
      <link>${SITE_URL}</link>
      <width>192</width>
      <height>192</height>
    </image>${rssItems}
  </channel>
</rss>`;

  return rssXml;
};

export const generateSitemap = () => {
  
  const publishedPosts = blogPosts.filter(post => post.isPublished);
  
  const blogUrls = publishedPosts.map(post => {
    const lastmod = post.updatedAt || post.publishedAt;
    return `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>${blogUrls}
</urlset>`;

  return sitemapXml;
};