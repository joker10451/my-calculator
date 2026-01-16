import type { BlogPost } from '@/types/blog';

/**
 * Интерфейс для фильтров поиска
 */
export interface SearchFilters {
  categoryId?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Интерфейс для результата поиска
 */
export interface SearchResult {
  article: BlogPost;
  relevanceScore: number;
  matchedFields: string[];
  highlightedExcerpt: string;
}

/**
 * Стоп-слова для русского языка (наиболее частые)
 */
const STOP_WORDS = new Set([
  'и', 'в', 'на', 'с', 'по', 'для', 'не', 'от', 'за', 'к', 'до', 'из', 'о',
  'об', 'у', 'а', 'но', 'как', 'что', 'это', 'то', 'так', 'все', 'еще', 'уже',
  'или', 'ни', 'быть', 'был', 'была', 'было', 'были', 'есть', 'мы', 'вы', 'он',
  'она', 'оно', 'они', 'я', 'ты', 'его', 'её', 'их', 'этот', 'эта', 'это', 'эти'
]);

/**
 * Веса для различных полей при расчете релевантности
 */
const FIELD_WEIGHTS = {
  title: 3,
  excerpt: 2,
  content: 1,
  tags: 2
};

/**
 * Токенизация текста: разбивает на слова, удаляет стоп-слова, приводит к нижнему регистру
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wа-яё\s]/gi, ' ') // Оставляем только буквы и пробелы
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Простой стемминг для русского языка (удаление окончаний)
 * Упрощенная версия алгоритма Портера для русского языка
 */
export function stem(word: string): string {
  // Удаляем распространенные окончания
  const suffixes = [
    'ами', 'ями', 'ах', 'ях', 'ом', 'ем', 'ой', 'ей', 'ый', 'ий', 'ая', 'яя',
    'ое', 'ее', 'ые', 'ие', 'ого', 'его', 'ому', 'ему', 'ым', 'им', 'ых', 'их',
    'ую', 'юю', 'ой', 'ей', 'ою', 'ею', 'ами', 'ями', 'ах', 'ях', 'ам', 'ям',
    'ов', 'ев', 'ам', 'ям', 'ом', 'ем', 'ах', 'ях', 'ы', 'и', 'а', 'я', 'у', 'ю',
    'о', 'е', 'й'
  ];

  // Сортируем по длине (сначала длинные)
  suffixes.sort((a, b) => b.length - a.length);

  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      return word.slice(0, -suffix.length);
    }
  }

  return word;
}

/**
 * Подсветка совпадений в тексте
 */
export function highlightMatches(text: string, query: string): string {
  const queryTokens = tokenize(query);
  const stemmedQueryTokens = queryTokens.map(stem);

  let highlightedText = text;

  // Находим все слова в тексте
  const words = text.match(/[\wа-яё]+/gi) || [];

  // Создаем карту замен
  const replacements = new Map<string, string>();

  for (const word of words) {
    const stemmedWord = stem(word.toLowerCase());

    // Проверяем, совпадает ли слово с запросом
    if (stemmedQueryTokens.some(token => stemmedWord.includes(token) || token.includes(stemmedWord))) {
      replacements.set(word, `<mark>${word}</mark>`);
    }
  }

  // Применяем замены
  replacements.forEach((replacement, original) => {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, replacement);
  });

  return highlightedText;
}

/**
 * Расчет релевантности статьи к поисковому запросу
 */
export function calculateRelevance(article: BlogPost, query: string): number {
  const queryTokens = tokenize(query);
  const stemmedQueryTokens = queryTokens.map(stem);

  if (stemmedQueryTokens.length === 0) {
    return 0;
  }

  let totalScore = 0;
  const matchedFields: string[] = [];

  // Поиск в заголовке
  const titleTokens = tokenize(article.title).map(stem);
  const titleMatches = stemmedQueryTokens.filter(qt =>
    titleTokens.some(tt => tt.includes(qt) || qt.includes(tt))
  ).length;
  if (titleMatches > 0) {
    totalScore += titleMatches * FIELD_WEIGHTS.title;
    matchedFields.push('title');
  }

  // Поиск в excerpt
  const excerptTokens = tokenize(article.excerpt).map(stem);
  const excerptMatches = stemmedQueryTokens.filter(qt =>
    excerptTokens.some(et => et.includes(qt) || qt.includes(et))
  ).length;
  if (excerptMatches > 0) {
    totalScore += excerptMatches * FIELD_WEIGHTS.excerpt;
    matchedFields.push('excerpt');
  }

  // Поиск в контенте
  const contentTokens = tokenize(article.content).map(stem);
  const contentMatches = stemmedQueryTokens.filter(qt =>
    contentTokens.some(ct => ct.includes(qt) || qt.includes(ct))
  ).length;
  if (contentMatches > 0) {
    totalScore += contentMatches * FIELD_WEIGHTS.content;
    matchedFields.push('content');
  }

  // Поиск в тегах
  const tagsText = article.tags.join(' ');
  const tagsTokens = tokenize(tagsText).map(stem);
  const tagsMatches = stemmedQueryTokens.filter(qt =>
    tagsTokens.some(tt => tt.includes(qt) || qt.includes(tt))
  ).length;
  if (tagsMatches > 0) {
    totalScore += tagsMatches * FIELD_WEIGHTS.tags;
    matchedFields.push('tags');
  }

  // Нормализуем score
  const totalWords = titleTokens.length + excerptTokens.length + contentTokens.length + tagsTokens.length;
  const normalizedScore = totalWords > 0 ? totalScore / totalWords : 0;

  return normalizedScore;
}

/**
 * Полнотекстовый поиск по статьям
 */
export function search(
  articles: BlogPost[],
  query: string,
  filters?: SearchFilters
): SearchResult[] {
  // Фильтруем только опубликованные статьи
  let filteredArticles = articles.filter(article => article.isPublished);

  // Применяем фильтры
  if (filters) {
    if (filters.categoryId) {
      filteredArticles = filteredArticles.filter(
        article => article.category.id === filters.categoryId
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredArticles = filteredArticles.filter(article =>
        filters.tags!.some(tag => article.tags.includes(tag))
      );
    }

    if (filters.dateFrom) {
      filteredArticles = filteredArticles.filter(
        article => new Date(article.publishedAt) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filteredArticles = filteredArticles.filter(
        article => new Date(article.publishedAt) <= filters.dateTo!
      );
    }
  }

  // Если запрос пустой, возвращаем все отфильтрованные статьи
  if (!query.trim()) {
    return filteredArticles.map(article => ({
      article,
      relevanceScore: 0,
      matchedFields: [],
      highlightedExcerpt: article.excerpt
    }));
  }

  // Рассчитываем релевантность для каждой статьи
  const results: SearchResult[] = [];

  for (const article of filteredArticles) {
    const relevanceScore = calculateRelevance(article, query);

    if (relevanceScore > 0) {
      const matchedFields: string[] = [];

      // Определяем, в каких полях найдены совпадения
      const queryTokens = tokenize(query).map(stem);

      if (queryTokens.some(qt => tokenize(article.title).map(stem).some(tt => tt.includes(qt) || qt.includes(tt)))) {
        matchedFields.push('title');
      }
      if (queryTokens.some(qt => tokenize(article.excerpt).map(stem).some(et => et.includes(qt) || qt.includes(et)))) {
        matchedFields.push('excerpt');
      }
      if (queryTokens.some(qt => tokenize(article.content).map(stem).some(ct => ct.includes(qt) || qt.includes(ct)))) {
        matchedFields.push('content');
      }
      if (queryTokens.some(qt => tokenize(article.tags.join(' ')).map(stem).some(tt => tt.includes(qt) || qt.includes(tt)))) {
        matchedFields.push('tags');
      }

      // Подсвечиваем совпадения в excerpt
      const highlightedExcerpt = highlightMatches(article.excerpt, query);

      results.push({
        article,
        relevanceScore,
        matchedFields,
        highlightedExcerpt
      });
    }
  }

  // Сортируем по релевантности (по убыванию)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results;
}

/**
 * Предложение альтернативных запросов
 */
export function suggestAlternatives(query: string, articles: BlogPost[]): string[] {
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return [];
  }

  // Собираем все слова из заголовков и тегов
  const allWords = new Set<string>();

  articles.forEach(article => {
    tokenize(article.title).forEach(word => allWords.add(word));
    article.tags.forEach(tag => {
      tokenize(tag).forEach(word => allWords.add(word));
    });
  });

  // Находим похожие слова (простое совпадение по началу)
  const suggestions = new Set<string>();

  queryTokens.forEach(queryToken => {
    const stemmedQuery = stem(queryToken);

    allWords.forEach(word => {
      const stemmedWord = stem(word);

      // Если слово начинается с запроса или запрос начинается со слова
      if (
        stemmedWord.startsWith(stemmedQuery) ||
        stemmedQuery.startsWith(stemmedWord)
      ) {
        suggestions.add(word);
      }
    });
  });

  // Удаляем слова из оригинального запроса
  queryTokens.forEach(token => suggestions.delete(token));

  return Array.from(suggestions).slice(0, 5);
}

/**
 * Получение популярных статей (для отображения при отсутствии результатов)
 */
export function getPopularArticles(articles: BlogPost[], limit: number = 5): BlogPost[] {
  return articles
    .filter(article => article.isPublished)
    .sort((a, b) => {
      // Сортируем по featured, затем по дате
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, limit);
}
