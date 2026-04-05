import { seoArticles } from './src/data/seoArticles.ts';
import { parseMarkdown } from './src/utils/markdown.ts';

const refPost = seoArticles.find(a => a.id === 'seo-refinancing-2026');
if (refPost) {
  const html = parseMarkdown(refPost.content);
  console.log("HTML contains modern-table-wrapper:", html.includes('modern-table-wrapper'));
  
  if (!html.includes('modern-table-wrapper')) {
    console.log("Here is the blocks split of the content:");
    const blocks = refPost.content.split(/\n\s*\n/);
    blocks.forEach((b, i) => {
      console.log(`Block ${i}:`, JSON.stringify(b));
    });
  }
}
