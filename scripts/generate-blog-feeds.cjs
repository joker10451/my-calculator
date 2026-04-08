/**
 * Генерация RSS и sitemap для блога
 * Запуск: node scripts/generate-blog-feeds.js
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://schitay-online.ru';

// Load all blog data
const blogPostsPath = path.resolve(__dirname, '../src/data/blogPosts.ts');
const blogPostsNew3Path = path.resolve(__dirname, '../src/data/blogPostsNew3.ts');
const blogPostsNew4Path = path.resolve(__dirname, '../src/data/blogPostsNew4.ts');
const blogPostsNew5Path = path.resolve(__dirname, '../src/data/blogPostsNew5.ts');
const blogArticlesGenPath = path.resolve(__dirname, '../src/data/blogArticlesGenerated.ts');
const blogArticlesGen2Path = path.resolve(__dirname, '../src/data/blogArticlesGenerated2.ts');

function extractPosts(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const posts = [];
    const regex = /title:\s*['"`]([^'"`]+)['"`]/g;
    const slugRegex = /slug:\s*['"`]([^'"`]+)['"`]/g;
    const excerptRegex = /excerpt:\s*['"`]([^'"`]+)['"`]/g;
    const publishedAtRegex = /publishedAt:\s*['"`]([^'"`]+)['"`]/g;
    const updatedAtRegex = /updatedAt:\s*['"`]([^'"`]+)['"`]/g;
    const authorRegex = /author:\s*\{[^}]*name:\s*['"`]([^'"`]+)['"`]/;
    const categoryRegex = /category:\s*blogCategories\[(\d+)\]/;
    const categoryInlineRegex = /name:\s*['"]([^'"]+)['"],\s*\n\s*slug:/;

    let match;
    const titles = [];
    while ((match = regex.exec(content)) !== null) titles.push(match[1]);

    const slugs = [];
    while ((match = slugRegex.exec(content)) !== null) slugs.push(match[1]);

    const excerpts = [];
    while ((match = excerptRegex.exec(content)) !== null) excerpts.push(match[1]);

    const dates = [];
    while ((match = publishedAtRegex.exec(content)) !== null) dates.push(match[1]);

    const updatedDates = [];
    while ((match = updatedAtRegex.exec(content)) !== null) updatedDates.push(match[1]);

    for (let i = 0; i < titles.length; i++) {
      posts.push({
        title: titles[i],
        slug: slugs[i] || titles[i].toLowerCase().replace(/\s+/g, '-'),
        excerpt: excerpts[i] || '',
        publishedAt: dates[i] || new Date().toISOString(),
        updatedAt: updatedDates[i] || dates[i] || new Date().toISOString(),
      });
    }
    return posts;
  } catch {
    return [];
  }
}

const allPosts = [
  ...extractPosts(blogPostsPath),
  ...extractPosts(blogPostsNew3Path),
  ...extractPosts(blogPostsNew4Path),
  ...extractPosts(blogPostsNew5Path),
  ...extractPosts(blogArticlesGenPath),
  ...extractPosts(blogArticlesGen2Path),
];

console.log(`📝 Found ${allPosts.length} blog posts`);

// Generate RSS
function generateRSS(posts) {
  const items = posts
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .map(post => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const date = new Date(post.publishedAt).toUTCString();
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
    </item>`;
    }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Считай.RU — Финансовый блог</title>
    <description>Экспертные статьи о финансах, налогах, ипотеке и экономии</description>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <language>ru-RU</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>${items}
  </channel>
</rss>`;
}

// Generate sitemap
function generateSitemap(posts) {
  const urls = posts.map(post => {
    const url = `${SITE_URL}/blog/${post.slug}`;
    const lastmod = new Date(post.updatedAt || post.publishedAt).toISOString().split('T')[0];
    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
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
  </url>${urls}
</urlset>`;
}

// Write files
const rssXml = generateRSS(allPosts);

fs.writeFileSync(path.resolve(__dirname, '../public/rss.xml'), rssXml);

console.log('✅ RSS feed generated: public/rss.xml');
