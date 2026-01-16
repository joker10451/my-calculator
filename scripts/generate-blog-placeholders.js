#!/usr/bin/env node

/**
 * Скрипт для генерации placeholder изображений для блога
 * Создает простые SVG изображения с названием статьи
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Список изображений, которые нужно создать
const blogImages = [
  { name: 'ipoteka-2026.jpg', title: 'Ипотека 2026', color: '#3B82F6' },
  { name: 'ndfl-2026.jpg', title: 'НДФЛ 2026', color: '#10B981' },
  { name: 'tarify-zhkh-2026.jpg', title: 'Тарифы ЖКХ 2026', color: '#F59E0B' },
  { name: 'alimenty-2026.jpg', title: 'Алименты 2026', color: '#8B5CF6' },
  { name: 'matkapital-2026.jpg', title: 'Маткапитал 2026', color: '#EC4899' },
  { name: 'osago-2026.jpg', title: 'ОСАГО 2026', color: '#EF4444' },
  { name: 'kasko-2026.jpg', title: 'КАСКО 2026', color: '#06B6D4' },
  { name: 'kak-pohudet-2026.jpg', title: 'Как похудеть', color: '#84CC16' },
  { name: 'refinansirovanie-2026.jpg', title: 'Рефинансирование', color: '#6366F1' },
  { name: 'otpusknye-2026.jpg', title: 'Отпускные 2026', color: '#14B8A6' },
  { name: 'bolnichnyj-2026.jpg', title: 'Больничный 2026', color: '#F97316' },
  { name: 'imt-2026.jpg', title: 'ИМТ 2026', color: '#A855F7' },
  { name: 'vklady-2026.jpg', title: 'Вклады 2026', color: '#22C55E' },
  { name: 'kreditnye-karty-2026.jpg', title: 'Кредитные карты', color: '#0EA5E9' },
  { name: 'materinskij-kapital-2026.jpg', title: 'Материнский капитал', color: '#F43F5E' },
  { name: 'raschet-kalorij-2026.jpg', title: 'Расчет калорий', color: '#8B5CF6' },
  { name: 'investicii-2026.jpg', title: 'Инвестиции 2026', color: '#3B82F6' },
  { name: 'gosposhliny-2026.jpg', title: 'Госпошлины 2026', color: '#10B981' },
];

// Функция для создания SVG placeholder
function createSVGPlaceholder(title, color, width = 1200, height = 630) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(color, -30)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
    ${title}
  </text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">
    Считай.RU
  </text>
</svg>`;
}

// Функция для затемнения цвета
function adjustColor(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Создаем директорию если не существует
const blogDir = path.join(__dirname, '..', 'public', 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

// Генерируем изображения
let created = 0;
let skipped = 0;

blogImages.forEach(({ name, title, color }) => {
  const svgName = name.replace(/\.jpg$/, '.svg');
  const filePath = path.join(blogDir, svgName);
  
  // Проверяем, существует ли уже JPG или SVG версия
  const jpgPath = path.join(blogDir, name);
  if (fs.existsSync(jpgPath) || fs.existsSync(filePath)) {
    console.log(`⏭️  Пропущено: ${name} (уже существует)`);
    skipped++;
    return;
  }
  
  const svg = createSVGPlaceholder(title, color);
  fs.writeFileSync(filePath, svg, 'utf8');
  console.log(`✅ Создано: ${svgName}`);
  created++;
});

console.log(`\n📊 Итого:`);
console.log(`   Создано: ${created}`);
console.log(`   Пропущено: ${skipped}`);
console.log(`   Всего: ${blogImages.length}`);
