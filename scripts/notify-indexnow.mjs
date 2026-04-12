import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://schitay-online.ru';
const KEY_FILE = join(__dirname, '..', 'public', '2tdwde3ewl2316bk0y73xloj7irqap5n.txt');

const INDEXNOW_HOSTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

async function notifyIndexNow() {
  const key = readFileSync(KEY_FILE, 'utf8').trim();
  if (!key) {
    console.warn('⚠️  IndexNow API key not found');
    return;
  }

  const sitemapPath = join(__dirname, '..', 'dist', 'sitemap.xml');
  let urls = [];

  try {
    const sitemap = readFileSync(sitemapPath, 'utf8');
    const matches = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)];
    urls = matches.map(m => m[1]);
  } catch {
    console.warn('⚠️  sitemap.xml not found in dist/, using homepage only');
    urls = [SITE_URL + '/'];
  }

  if (urls.length === 0) {
    console.warn('⚠️  No URLs found in sitemap');
    return;
  }

  const body = JSON.stringify({
    host: 'schitay-online.ru',
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: urls.slice(0, 10000),
  });

  console.log(`📡 IndexNow: уведомляем поисковики о ${urls.length} URL...`);

  for (const endpoint of INDEXNOW_HOSTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok || res.status === 202) {
        console.log(`  ✅ ${new URL(endpoint).hostname} — принят (${res.status})`);
      } else {
        console.warn(`  ⚠️  ${new URL(endpoint).hostname} — ${res.status}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  ⚠️  ${new URL(endpoint).hostname} — ошибка: ${msg}`);
    }
  }

  console.log('📡 IndexNow: готово');
}

notifyIndexNow().catch(err => {
  console.error('❌ IndexNow error:', err);
  process.exit(0);
});
