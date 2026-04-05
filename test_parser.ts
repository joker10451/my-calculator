import { seoArticles } from './src/data/seoArticles.ts';
import { parseMarkdown } from './src/utils/markdown.ts';
import fs from 'fs';

const refPost = seoArticles.find(a => a.id === 'seo-refinancing-2026');
if (refPost) {
  const html = parseMarkdown(refPost.content);
  const match = html.match(/<table.*?<\/table>/s);
  if (match) {
    fs.writeFileSync('table_output.html', match[0]);
  } else {
    fs.writeFileSync('table_output.html', 'No table found');
  }
}
