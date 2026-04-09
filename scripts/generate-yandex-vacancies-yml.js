import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://schitay-online.ru';
const NOW = new Date().toISOString().slice(0, 19).replace('T', ' ');

const vacancies = [
  {
    id: 'courier-yandex',
    name: 'Курьер Яндекс.Еда / Яндекс.Лавка',
    url: `${SITE_URL}/courier-yandex/`,
    category: 'Вакансии',
    description:
      'Подработка и работа курьером в Москве. Гибкий график, быстрый старт и понятные условия по этапам оформления.',
    region: 'Москва',
    city: 'Москва',
    employer: 'Партнерский сервис доставки',
    employment: 'Частичная занятость',
    schedule: 'Гибкий график',
    experience: 'Без опыта',
    salaryFrom: 90000,
    salaryTo: 180000,
    currency: 'RUR',
  },
  {
    id: 'ruki-masters',
    name: 'Мастер по сборке кухонь и установке дверей',
    url: `${SITE_URL}/ruki-masters/`,
    category: 'Вакансии',
    description:
      'Вакансии для мастеров по ремонту в Москве: заказы по профилю, гибкий формат работы и прозрачные требования.',
    region: 'Москва',
    city: 'Москва',
    employer: 'Сервис «Руки»',
    employment: 'Полная занятость',
    schedule: 'Гибкий график',
    experience: 'От 1 года',
    salaryFrom: 120000,
    salaryTo: 220000,
    currency: 'RUR',
  },
  {
    id: 'jobs-overview',
    name: 'Работа и подработка в Москве',
    url: `${SITE_URL}/jobs/`,
    category: 'Вакансии',
    description:
      'Подбор актуальных вакансий: курьерские направления и работа для мастеров. Удобный выбор формата под ваш график.',
    region: 'Москва',
    city: 'Москва',
    employer: 'Считай.RU',
    employment: 'Смешанный формат',
    schedule: 'Гибкий график',
    experience: 'Разный уровень',
    salaryFrom: 80000,
    salaryTo: 220000,
    currency: 'RUR',
  },
];

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildYml() {
  const offersXml = vacancies
    .map((item) => {
      return `    <offer id="${escapeXml(item.id)}" available="true">
      <name>${escapeXml(item.name)}</name>
      <url>${escapeXml(item.url)}</url>
      <category>${escapeXml(item.category)}</category>
      <description>${escapeXml(item.description)}</description>
      <region>${escapeXml(item.region)}</region>
      <city>${escapeXml(item.city)}</city>
      <employer>${escapeXml(item.employer)}</employer>
      <employment>${escapeXml(item.employment)}</employment>
      <schedule>${escapeXml(item.schedule)}</schedule>
      <experience>${escapeXml(item.experience)}</experience>
      <salary_from>${item.salaryFrom}</salary_from>
      <salary_to>${item.salaryTo}</salary_to>
      <currency>${escapeXml(item.currency)}</currency>
    </offer>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${NOW}">
  <shop>
    <name>Считай.RU</name>
    <company>Считай.RU</company>
    <url>${SITE_URL}</url>
    <platform>schitay-online</platform>
    <offers>
${offersXml}
    </offers>
  </shop>
</yml_catalog>
`;
}

function writeFeed(targetRoot) {
  const feedDir = path.join(targetRoot, 'feeds');
  fs.mkdirSync(feedDir, { recursive: true });
  const yml = buildYml();
  const outputPath = path.join(feedDir, 'vacancies.yml');
  fs.writeFileSync(outputPath, yml, 'utf8');
  const outputXmlPath = path.join(feedDir, 'vacancies.xml');
  fs.writeFileSync(outputXmlPath, yml, 'utf8');

  // Совместимость: часть систем ожидает фид в корне домена (/vacancies.yml)
  const rootOutputPath = path.join(targetRoot, 'vacancies.yml');
  fs.writeFileSync(rootOutputPath, yml, 'utf8');
  const rootOutputXmlPath = path.join(targetRoot, 'vacancies.xml');
  fs.writeFileSync(rootOutputXmlPath, yml, 'utf8');

  return { outputPath, outputXmlPath, rootOutputPath, rootOutputXmlPath };
}

try {
  const publicDir = path.join(__dirname, '..', 'public');
  const distDir = path.join(__dirname, '..', 'dist');

  const publicPaths = writeFeed(publicDir);
  const distPaths = writeFeed(distDir);

  console.log('✅ Yandex vacancies YML generated');
  console.log(`📍 public (feeds): ${publicPaths.outputPath}`);
  console.log(`📍 public (feeds): ${publicPaths.outputXmlPath}`);
  console.log(`📍 public (root):  ${publicPaths.rootOutputPath}`);
  console.log(`📍 public (root):  ${publicPaths.rootOutputXmlPath}`);
  console.log(`📍 dist (feeds):   ${distPaths.outputPath}`);
  console.log(`📍 dist (feeds):   ${distPaths.outputXmlPath}`);
  console.log(`📍 dist (root):    ${distPaths.rootOutputPath}`);
  console.log(`📍 dist (root):    ${distPaths.rootOutputXmlPath}`);
  console.log(`🔗 URL: ${SITE_URL}/vacancies.xml`);
  console.log(`🔗 URL: ${SITE_URL}/feeds/vacancies.xml`);
  console.log(`🔗 URL: ${SITE_URL}/vacancies.yml`);
  console.log(`🔗 URL: ${SITE_URL}/feeds/vacancies.yml`);
} catch (error) {
  console.error('❌ Failed to generate vacancies YML feed:', error);
  process.exit(1);
}
