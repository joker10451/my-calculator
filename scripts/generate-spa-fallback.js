#!/usr/bin/env node

/**
 * Генерирует 404.html и SPA-fallback для GitHub Pages.
 *
 * GitHub Pages не умеет fallback для React Router, поэтому:
 * 1. dist/404.html используется как fallback для неизвестных URL;
 * 2. для URL из sitemap создаются route/index.html только если файла ещё нет,
 *    чтобы не затереть полноценно сгенерированные статические страницы.
 */

import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');
const sitemapPath = path.join(distDir, 'sitemap.xml');

function readSitemapUrls() {
  if (!fs.existsSync(sitemapPath)) {
    return [];
  }

  const content = fs.readFileSync(sitemapPath, 'utf8');
  const urls = Array.from(content.matchAll(/<loc>([^<]+)<\/loc>/g)).map(match => match[1]);

  return urls
    .filter(url => url.startsWith('https://schitay-online.ru/'))
    .map(url => new URL(url).pathname)
    .filter(pathname => pathname && pathname !== '/');
}

function toRoutePath(urlPath) {
  return urlPath.replace(/^\/+/, '');
}

function ensureRouteFallback(urlPath) {
  const routePath = toRoutePath(urlPath);
  const targetFile = path.join(distDir, routePath, 'index.html');

  if (fs.existsSync(targetFile)) {
    return false;
  }

  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.copyFileSync(indexPath, targetFile);
  return true;
}

function main() {
  if (!fs.existsSync(distDir)) {
    console.error('❌ Error: dist directory not found. Run build first.');
    process.exit(1);
  }

  if (!fs.existsSync(indexPath)) {
    console.error('❌ Error: dist/index.html not found. Run build first.');
    process.exit(1);
  }

  const fallbackPath = path.join(distDir, '404.html');
  fs.copyFileSync(indexPath, fallbackPath);
  console.log('✅ Created: 404.html');

  const sitemapUrls = readSitemapUrls();
  let fallbackCount = 0;

  for (const urlPath of sitemapUrls) {
    if (ensureRouteFallback(urlPath)) {
      fallbackCount += 1;
      console.log(`✅ Fallback created: ${urlPath}`);
    }
  }

  console.log(`📊 Summary:`);
  console.log(`   - Sitemap URLs checked: ${sitemapUrls.length}`);
  console.log(`   - Fallback route files created: ${fallbackCount}`);
  console.log(`\n✨ Done! GitHub Pages SPA fallback is ready.`);
}

main();
