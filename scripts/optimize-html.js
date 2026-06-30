#!/usr/bin/env node

/**
 * HTML-оптимизация после сборки:
 * 1. CSS не блокирует рендер (preload → onload)
 * 2. Критический CSS inline для первого кадра
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');

const CRITICAL_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{font-family:system-ui,-apple-system,sans-serif;line-height:1.5;-webkit-text-size-adjust:100%}
body{margin:0;background:#0f172a;color:#f8fafc;min-height:100vh;-webkit-font-smoothing:antialiased}
a{color:#60a5fa;text-decoration:none}
img{max-width:100%;display:block}
.flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-center{justify-content:center}
.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.inset-x-0{left:0;right:0}.bottom-0{bottom:0}.top-0{top:0}.left-0{left:0}.z-50{z-index:50}
.mx-auto{margin-left:auto;margin-right:auto}.p-4{padding:1rem}.px-4{padding-left:1rem;padding-right:1rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}
.w-full{width:100%}.max-w-3xl{max-width:48rem}
.bg-white{background-color:#fff}.dark\\:bg-slate-800{background-color:#1e293b}.bg-primary{background-color:#3b82f6}
.text-white{color:#fff}.text-center{text-align:center}
.rounded-2xl{border-radius:1rem}.shadow-2xl{box-shadow:0 25px 50px -12px rgba(0,0,0,.25)}
.border{border:1px solid}.border-slate-200{border-color:#e2e8f0}.dark\\:border-slate-700{border-color:#334155}
.min-h-screen{min-height:100vh}
`;

function optimizeAllHtml() {
  let count = 0;
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === 'index.html') {
        let html = fs.readFileSync(fullPath, 'utf8');
        
        // Делаем CSS async: preload + onload
        html = html.replace(
          /<link rel="stylesheet" crossorigin="" href="\/assets\/index-([^"]+\.css)">/g,
          `<link rel="preload" as="style" href="/assets/index-$1" onload="this.onload=null;this.rel='stylesheet'">\n<noscript><link rel="stylesheet" href="/assets/index-$1"></noscript>`
        );

        // Заменяем базовый FOUC-стиль на расширенный критический CSS
        html = html.replace(
          /<!-- Prevent FOUC -->\s*<style>html\{font-family:system-ui,.*?color:#f8fafc}<\/style>/s,
          `<!-- Critical CSS (first paint) -->\n<style>${CRITICAL_CSS}</style>`
        );

        fs.writeFileSync(fullPath, html, 'utf8');
        count++;
      }
    }
  };

  walk(DIST_DIR);
  console.log(`✅ Оптимизировано ${count} HTML файлов (CSS async + critical inline)`);
}

optimizeAllHtml();
