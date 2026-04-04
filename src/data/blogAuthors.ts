import type { BlogAuthor } from '@/types/blog';

export const blogAuthors: BlogAuthor[] = [
  {
    id: 'alexander-smirnov',
    name: 'Александр Смирнов',
    slug: 'alexander-smirnov',
    specialization: 'Финансовый аналитик, эксперт по личным финансам',
    bio: 'Профессиональный финансовый консультант с более чем 12-летним опытом работы в банковском секторе и инвестициях. Специализируется на планировании личного бюджета, оптимизации налогов и управлении капиталом. Регулярный спикер на профильных форумах и автор публикаций в ведущих деловых СМИ.',
    education: 'МГУ им. Ломоносова, Экономический факультет; Сертификация CFA.',
    avatar: '/authors/alexander-smirnov.png',
    social: {
      twitter: 'https://twitter.com/smirnov_fin',
      linkedin: 'https://linkedin.com/in/asmirnov-pro',
      email: 'a.smirnov@schitay.ru'
    },
    expertise: ['Личные финансы', 'Инвестиции', 'Налоговое планирование', 'Банковские продукты']
  },
  {
    id: 'elena-ivanova',
    name: 'Елена Иванова',
    slug: 'elena-ivanova',
    specialization: 'Юрист по семейному и трудовому праву',
    bio: 'Ведущий юрист со специализацией в области гражданского и семейного законодательства. Более 100 успешно проведенных дел в судах общей юрисдикции. Помогает читателям Считай.RU разбираться в сложных правовых аспектах выплат, пособий и алиментных обязательств.',
    education: 'МГЮА им. О.Е. Кутафина (Юридическая академия).',
    avatar: '/authors/elena-ivanova.png',
    social: {
      linkedin: 'https://linkedin.com/in/eivanova-law',
      email: 'e.ivanova@schitay.ru'
    },
    expertise: ['Семейное право', 'Трудовой кодекс', 'Социальные выплаты', 'Судебная практика']
  },
  {
    id: 'dmitry-kozlov',
    name: 'Дмитрий Козлов',
    slug: 'dmitry-kozlov',
    specialization: 'Эксперт по рынку недвижимости и ипотеки',
    bio: 'Сертифицированный аналитик рынка недвижимости. Прошел путь от брокера до руководителя аналитического департамента в крупном девелоперском холдинге. Знает всё о том, как выбрать выгодную ипотечную программу и сэкономить на покупке жилья.',
    education: 'Российская экономическая школа (РЭШ).',
    avatar: '/authors/dmitry-kozlov.png',
    social: {
      twitter: 'https://twitter.com/kozlov_realty',
      email: 'd.kozlov@schitay.ru'
    },
    expertise: ['Ипотечное кредитование', 'Рынок жилья', 'Государственные льготы', 'Оценка недвижимости']
  },
  {
    id: 'anna-petrova',
    name: 'Анна Петрова',
    slug: 'anna-petrova',
    specialization: 'Нутрициолог, специалист по здоровому образу жизни',
    bio: 'Консультант по питанию и ЗОЖ с высшим медицинским образованием. Помогает людям достигать баланса в жизни через правильные привычки и осознанный подход к здоровью. Автор методических пособий по расчету КБЖУ и ИМТ.',
    education: 'Первый МГМУ им. И.М. Сеченова.',
    avatar: '/authors/anna-petrova.png',
    social: {
      twitter: 'https://twitter.com/anna_health',
      email: 'a.petrova@schitay.ru'
    },
    expertise: ['Нутрициология', 'ЗОЖ-калькуляторы', 'Профилактика здоровья', 'Фитнес-планирование']
  }
];

export const getAuthorById = (id: string): BlogAuthor | undefined => {
  return blogAuthors.find(author => author.id === id);
};

export const getAuthorBySlug = (slug: string): BlogAuthor | undefined => {
  return blogAuthors.find(author => author.slug === slug);
};
