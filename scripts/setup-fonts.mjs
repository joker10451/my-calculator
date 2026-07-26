import { mkdirSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(__dirname, '..', 'public', 'fonts');
mkdirSync(fontsDir, { recursive: true });

const FONTS = [
  { family: 'Inter', cssUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
  { family: 'Unbounded', cssUrl: 'https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700;800;900&display=swap' },
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

for (const font of FONTS) {
  console.log(`\n=== ${font.family} ===`);
  const resp = await fetch(font.cssUrl, { headers: { 'User-Agent': UA } });
  const raw = await resp.text();

  const parts = raw.split(/(?=\/\*)/).filter(p => p.includes('@font-face'));

  for (const part of parts) {
    const subset = ((part.match(/\/\*\s*([^*]+)\s*\*\//) || [, ''])[1]).replace(/\s+/g, '').replace(/-/g, '');
    const weight = (part.match(/font-weight:\s*(\d+)/) || [, '400'])[1];
    const style = (part.match(/font-style:\s*(normal|italic)/) || [, 'normal'])[1];
    const url = (part.match(/url\(([^)]+)\)/) || [, null])[1];
    const fmt = (part.match(/format\(['"]?([^'")]+)['"]?\)/) || [, 'woff2'])[1];
    if (!url) continue;

    const filename = `${font.family.toLowerCase()}-${weight}-${style}-${subset}.${fmt}`;
    const filepath = join(fontsDir, filename);
    if (existsSync(filepath)) continue;

    console.log(`  ${filename}...`);
    try {
      const fr = await fetch(url);
      const buf = Buffer.from(await fr.arrayBuffer());
      writeFileSync(filepath, buf);
      console.log(`    ${(buf.length / 1024).toFixed(0)} KB`);
    } catch (e) {
      console.log(`    FAILED: ${e.message}`);
    }
  }
}

for (const font of FONTS) {
  const prefix = font.family.toLowerCase();
  const files = readdirSync(fontsDir).filter(f => f.startsWith(prefix));
  
  const groups = {};
  for (const f of files) {
    const m = f.match(new RegExp(`${prefix}-(\\d+)-(normal|italic)-([^.]+)\\.(woff2|ttf)`));
    if (!m) continue;
    const key = `${m[1]}-${m[2]}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(f);
  }

  let css = '';
  for (const [key, gfiles] of Object.entries(groups)) {
    const [weight, style] = key.split('-');
    const srcs = gfiles.map(f => {
      const ext = f.split('.').pop();
      return `    url('/fonts/${f}') format('${ext}')`;
    }).join(',\n');
    css += `@font-face {\n  font-family: '${font.family}';\n  font-style: ${style};\n  font-weight: ${weight};\n  src:\n${srcs};\n  font-display: swap;\n}\n\n`;
  }

  writeFileSync(join(fontsDir, `${prefix}.css`), css);
  const count = Object.keys(groups).length;
  console.log(`\n${font.family}: ${count} @font-face rules, ${files.length} files`);
}

console.log('\nDone');
