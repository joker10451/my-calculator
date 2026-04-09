#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const COMPLIANCE_COPY_FILES = [
  'src/pages/YandexCourierPage.tsx',
  'src/pages/JobsLandingPage.tsx',
  'src/pages/RukiVacancyPage.tsx',
  'src/pages/OffersCatalogPage.tsx',
  'src/components/affiliate/OffersBlock.tsx',
];

const BANNED_PATTERNS = [
  { re: /\bЦД\b/iu, reason: 'упоминание "ЦД" в публичном тексте' },
  { re: /целев(ое|ые)\s+действ/iu, reason: 'упоминание целевого действия' },
  { re: /закрепля(ется|ются)\s+за/iu, reason: 'упоминание механики закрепления' },
  { re: /ваш(им|его|ей)?\s+источник/iu, reason: 'упоминание источника трафика' },
  { re: /реф(ерал|ссылк|ов)/iu, reason: 'упоминание реферальной механики в витрине' },
];

function readFileSafe(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function validateAffiliateLinksErid() {
  const file = 'src/config/affiliateLinks.ts';
  const content = readFileSafe(file);
  if (!content) return [`Не найден файл ${file}`];

  const errors = [];
  const urlMatches = Array.from(content.matchAll(/url:\s*'([^']+)'/g));
  for (const match of urlMatches) {
    const url = match[1];
    if (url.includes('trk.ppdu.ru') && !url.includes('erid=')) {
      errors.push(`Ссылка без erid: ${url}`);
    }
  }

  return errors;
}

function validatePublicCopy() {
  const errors = [];

  for (const relPath of COMPLIANCE_COPY_FILES) {
    const content = readFileSafe(relPath);
    if (!content) {
      errors.push(`Не найден файл для проверки текста: ${relPath}`);
      continue;
    }

    for (const { re, reason } of BANNED_PATTERNS) {
      if (re.test(content)) {
        errors.push(`${relPath}: ${reason}`);
      }
    }
  }

  return errors;
}

function validateEridLabelPresence() {
  const targetPages = ['src/pages/YandexCourierPage.tsx', 'src/pages/JoyMoneyPage.tsx'];
  const errors = [];

  for (const relPath of targetPages) {
    const content = readFileSafe(relPath);
    if (!content) {
      errors.push(`Не найден файл для проверки рекламной маркировки: ${relPath}`);
      continue;
    }

    if (!content.includes('Реклама • erid:')) {
      errors.push(`${relPath}: отсутствует текстовая маркировка "Реклама • erid:"`);
    }
  }

  return errors;
}

function run() {
  const errors = [
    ...validateAffiliateLinksErid(),
    ...validatePublicCopy(),
    ...validateEridLabelPresence(),
  ];

  if (errors.length > 0) {
    console.error('❌ Affiliate compliance check failed:\n');
    errors.forEach((e) => console.error(`- ${e}`));
    process.exit(1);
  }

  console.log('✅ Affiliate compliance check passed');
}

run();
