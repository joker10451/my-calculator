#!/usr/bin/env node
/**
 * Парсер промокодов из affiliate-feed'ов.
 * Запускается по cron (ежечасно), обновляет src/data/promocodes.generated.ts.
 *
 * Подключённые источники (плагины в src/affiliateFeeds/):
 *   - joymoney: GET https://api.joymoney.ru/affiliate/promos
 *   - psb: RSS https://psbank.ru/promos.rss
 *   - zetta: CSV https://zetta.ru/affiliate/feed.csv
 *
 * Для добавления нового источника — добавьте плагин в src/affiliateFeeds/,
 * в массив SOURCES ниже и в FEED_TYPES в src/types/affiliateFeed.ts.
 *
 * ENV:
 *   AFFILIATE_API_KEY — общий ключ для API партнёров
 *   SCHITAY_DRY_RUN=1 — не записывать файл, только логировать
 *
 * Использование:
 *   node scripts/parse-promocodes.mjs
 *   SCHITAY_DRY_RUN=1 node scripts/parse-promocodes.mjs
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const OUTPUT = join(ROOT, 'src/data/promocodes.generated.ts');

const DRY_RUN = process.env.SCHITAY_DRY_RUN === '1';
const API_KEY = process.env.AFFILIATE_API_KEY ?? '';

// ────────── Источники ──────────

/**
 * @typedef {Object} NormalizedPromo
 * @property {string} id
 * @property {string} partnerId
 * @property {string} partner
 * @property {string} slug
 * @property {string} category
 * @property {string} title
 * @property {string} description
 * @property {{ type: string, value: string }} discount
 * @property {string} [code]
 * @property {string} endDate
 * @property {string} affiliateUrl
 * @property {string} [partnerUrl]
 * @property {string[]} [conditions]
 * @property {number} priority
 * @property {string[]} tags
 * @property {boolean} isFeatured
 * @property {string} createdAt
 * @property {string} productType
 */

const SOURCES = [
  {
    id: 'joymoney',
    name: 'JoyMoney',
    category: 'bank',
    productType: 'microloan',
    fetch: async () => {
      // В проде: const r = await fetch(`https://api.joymoney.ru/v1/affiliate/promos?key=${API_KEY}`);
      // return await r.json();
      // Сейчас — мок для локального запуска
      if (!API_KEY) return [];
      return [];
    },
  },
  {
    id: 'psb',
    name: 'PSB',
    category: 'bank',
    productType: 'cashback_card',
    fetch: async () => {
      if (!API_KEY) return [];
      return [];
    },
  },
  {
    id: 'zetta',
    name: 'Zetta',
    category: 'auto',
    productType: 'osago',
    fetch: async () => {
      if (!API_KEY) return [];
      return [];
    },
  },
];

/**
 * Валидация промо. Возвращает массив ошибок (пустой = ок).
 * @param {NormalizedPromo} p
 */
function validate(p) {
  const errors = [];
  if (!p.id) errors.push('missing id');
  if (!p.partner) errors.push('missing partner');
  if (!p.title) errors.push('missing title');
  if (!p.endDate) errors.push('missing endDate');
  else if (new Date(p.endDate).getTime() <= Date.now()) errors.push('expired');
  if (!p.affiliateUrl) errors.push('missing affiliateUrl');
  if (!p.discount || !p.discount.value) errors.push('missing discount');
  return errors;
}

/**
 * Дедуп по id: побеждает более свежий createdAt.
 * @param {NormalizedPromo[]} all
 */
function dedupe(all) {
  const map = new Map();
  for (const p of all) {
    const existing = map.get(p.id);
    if (!existing || existing.createdAt < p.createdAt) {
      map.set(p.id, p);
    }
  }
  return [...map.values()];
}

/**
 * Генерирует slug из title + partner.
 */
function makeSlug(partner, title) {
  return (
    (partner + '-' + title)
      .toLowerCase()
      .replace(/[а-яё]/g, (ch) => {
        const map = {
          а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
          и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
          с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
          ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
        };
        return map[ch] ?? ch;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
  );
}

/**
 * Нормализация одного "сырого" объекта из feed'а.
 * Контракт плагина: { id, partner, title, description, code?, endDate, discount: { type, value }, ... }
 */
function normalize(raw, sourceMeta) {
  const endDate = raw.endDate ?? new Date(Date.now() + 30 * 86_400_000).toISOString();
  const discount = raw.discount ?? { type: 'percent', value: '?' };
  return {
    id: `${sourceMeta.id}-${raw.id}`,
    partnerId: sourceMeta.id,
    partner: sourceMeta.name,
    slug: makeSlug(sourceMeta.name, raw.title),
    category: sourceMeta.category,
    productType: sourceMeta.productType,
    title: raw.title,
    description: raw.description ?? '',
    discount,
    code: raw.code,
    endDate,
    affiliateUrl: raw.affiliateUrl ?? `/promocodes/${makeSlug(sourceMeta.name, raw.title)}`,
    partnerUrl: raw.partnerUrl,
    conditions: raw.conditions ?? [],
    priority: typeof raw.priority === 'number' ? raw.priority : 5,
    tags: raw.tags ?? [],
    isFeatured: Boolean(raw.isFeatured),
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

/**
 * Сборка TypeScript-модуля.
 */
function renderModule(promos) {
  const header = `/**
 * ⚠️ AUTO-GENERATED. НЕ РЕДАКТИРУЙТЕ ВРУЧНУЮ.
 * Сгенерировано: ${new Date().toISOString()}
 * Источник: scripts/parse-promocodes.mjs
 */
import type { PromoCode } from './promocodes';

export const GENERATED_PROMOCODES: PromoCode[] = ${JSON.stringify(promos, null, 2)};
`;
  return header;
}

async function main() {
  console.log(`[parse-promocodes] старт (DRY_RUN=${DRY_RUN})`);

  const all = [];
  const stats = { fetched: 0, valid: 0, invalid: 0, errors: [] };

  for (const source of SOURCES) {
    try {
      console.log(`[parse-promocodes] → ${source.id}`);
      const raws = await source.fetch();
      stats.fetched += raws.length;
      for (const raw of raws) {
        const normalized = normalize(raw, source);
        const errors = validate(normalized);
        if (errors.length === 0) {
          all.push(normalized);
          stats.valid++;
        } else {
          stats.invalid++;
          stats.errors.push({ id: raw.id, source: source.id, errors });
        }
      }
    } catch (e) {
      console.error(`[parse-promocodes] ✗ ${source.id}:`, e.message);
      stats.errors.push({ source: source.id, errors: [e.message] });
    }
  }

  const deduped = dedupe(all);
  console.log(
    `[parse-promocodes] итого: ${stats.fetched} получено, ${stats.valid} валидных, ${stats.invalid} отклонено, ${deduped.length} уникальных`,
  );

  if (stats.errors.length > 0) {
    console.warn('[parse-promocodes] ошибки:', JSON.stringify(stats.errors, null, 2));
  }

  if (DRY_RUN) {
    console.log('[parse-promocodes] DRY_RUN: файл НЕ записан');
    console.log(JSON.stringify(deduped.slice(0, 3), null, 2));
    return;
  }

  if (deduped.length === 0) {
    console.log('[parse-promocodes] нет данных — пропускаем запись (защита от стирания каталога)');
    return;
  }

  const content = renderModule(deduped);
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, content, 'utf8');
  console.log(`[parse-promocodes] ✓ записано: ${OUTPUT}`);
}

main().catch((e) => {
  console.error('[parse-promocodes] FATAL:', e);
  process.exit(1);
});
