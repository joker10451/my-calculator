import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { blogPosts } from '../src/data/blogPosts';
import { AFFILIATE_LINKS } from '../src/config/affiliateLinks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://schitay-online.ru';

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mdToTurboHtml(md: string) {
  if (!md) return '';

  // 1. Convert Lists
  let inUl = false;
  let inOl = false;
  const lines = md.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inUl) {
        processedLines.push('<ul>');
        inUl = true;
      }
      processedLines.push(`<li>${line.substring(2)}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      if (!inOl) {
        processedLines.push('<ol>');
        inOl = true;
      }
      processedLines.push(`<li>${line.replace(/^\d+\.\s/, '')}</li>`);
    } else {
      if (inUl) {
        processedLines.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        processedLines.push('</ol>');
        inOl = false;
      }
      processedLines.push(line);
    }
  }
  
  if (inUl) processedLines.push('</ul>');
  if (inOl) processedLines.push('</ol>');

  let html = processedLines.join('\n');

  // 2. Custom Multi-line Blocks :::offer and :::info
  html = html.replace(/:::offer\n([\s\S]*?)\n:::/g, (match, content) => {
    // Content looks like:
    // ### Title
    // Text description
    // https://url | Button text
    
    const offerLines = content.split('\n').map(l => l.trim()).filter(Boolean);
    let title = '';
    let description = '';
    let url = '';
    let cta = '';

    // Find the link line "url | cta"
    const linkLineIndex = offerLines.findIndex(l => l.includes('|') && (l.startsWith('http') || (AFFILIATE_LINKS && AFFILIATE_LINKS[l.split('|')[0].trim()])));
    
    let linkLine = '';
    if (linkLineIndex !== -1) {
      linkLine = offerLines.splice(linkLineIndex, 1)[0];
      const parts = linkLine.split('|');
      url = parts[0].trim();
      cta = parts.slice(1).join('|').trim();
    }

    if (AFFILIATE_LINKS && AFFILIATE_LINKS[url]) {
      url = AFFILIATE_LINKS[url].url;
    }

    // What's left is title and desc
    offerLines.forEach(l => {
      if (l.startsWith('### ')) {
        title = l.replace('### ', '');
      } else {
        description += `<p>${l}</p>`;
      }
    });

    return `<div>
      ${title ? `<h3>${title}</h3>` : ''}
      ${description}
      ${url ? `<button formaction="${url}" data-background-color="#2a86ff" data-color="white" data-primary="true">${cta || 'Оформить'}</button>` : ''}
    </div>`;
  });

  html = html.replace(/:::(info|fact)\n([\s\S]*?)\n:::/g, (match, type, content) => {
    let title = '';
    let description = '';
    const infoLines = content.split('\n').map(l => l.trim()).filter(Boolean);
    
    infoLines.forEach(l => {
      if (l.startsWith('### ')) {
        title = l.replace('### ', '');
      } else {
        description += `<p>${l}</p>`;
      }
    });

    return `<div>
      ${title ? `<h3>${title}</h3>` : ''}
      ${description}
    </div>`;
  });

  // Remove any remaining generic delimiters
  html = html.replace(/:::(.*?):::/gs, '');

  // 3. Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 4. Bold and Italics
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 5. Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // 6. Tables (Basic representation)
  html = html.replace(/\|(.+)\|\n\|[-|\s]+\|\n((\|.*\|\n?)+)/g, (match, header, rows) => {
    const headers = header.split('|').filter(Boolean).map(h => `<th>${h.trim()}</th>`).join('');
    const tableRows = rows.trim().split('\n').map(row => {
      const cells = row.split('|').filter(Boolean).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table><tr>${headers}</tr>${tableRows}</table>`;
  });

  // 7. Paragraphs
  const pChunks = html.split('\n\n').filter(p => p.trim());
  html = pChunks.map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<ol') || p.trim().startsWith('<table') || p.trim().startsWith('<button') || p.trim().startsWith('<div')) {
      return p;
    }
    return `<p>${p}</p>`;
  }).join('\n');

  return html;
}

const generateTurboFeed = () => {
  const publishedPosts = blogPosts.filter(post => post.isPublished);

  const items = publishedPosts
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime())
    .map(post => {
      const postUrl = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date().toUTCString();
      const author = post.author?.name || 'Команда Считай.RU';

      let turboContentHtml = '';

      turboContentHtml += `<header>\n<h1>${post.title}</h1>\n`;
      if (post.featuredImage) {
        let finalImgUrl = post.featuredImage.url;
        if (finalImgUrl.startsWith('/')) {
          finalImgUrl = SITE_URL + finalImgUrl;
        }
        turboContentHtml += `<figure><img src="${finalImgUrl}" /></figure>\n`;
      }
      turboContentHtml += `</header>\n`;

      turboContentHtml += mdToTurboHtml(post.content || post.excerpt || '');

      return `
    <item turbo="true">
      <link>${postUrl}</link>
      <title>${escapeHtml(post.title)}</title>
      <description><![CDATA[ ${post.excerpt || post.title} ]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeHtml(author)}</author>
      <turbo:content>
        <![CDATA[
          ${turboContentHtml}
        ]]>
      </turbo:content>
    </item>`;
    })
    .join('');

  const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:yandex="http://news.yandex.ru"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:turbo="http://turbo.yandex.ru"
     version="2.0">
  <channel>
    <title>Считай.RU - Финансовый блог</title>
    <link>${SITE_URL}</link>
    <description>Бесплатные финансовые калькуляторы и экспертные статьи.</description>
    <language>ru</language>
    ${items}
  </channel>
</rss>`;

  return feedXml;
};

const publicDir = path.join(__dirname, '..', 'public');
const rssContent = generateTurboFeed();
fs.writeFileSync(path.join(publicDir, 'turbo-rss.xml'), rssContent, 'utf8');
console.log('✅ Yandex Turbo RSS feed generated: public/turbo-rss.xml');
