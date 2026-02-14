import type { BlogPost } from '@/types/blog';
import { tokenize, stem } from './searchService';

/**
 * Интерфейс для факторов схожести статей
 */
export interface SimilarityFactors {
  categoryMatch: number;    // 0.4 weight
  tagOverlap: number;        // 0.3 weight
  contentSimilarity: number; // 0.3 weight
}

/**
 * Интерфейс для калькулятора
 */
export interface Calculator {
  id: string;
  name: string;
  href: string;
  category?: string;
}

/**
 * Расчет схожести между двумя статьями
 * 
 * Алгоритм:
 * similarity = 0.4 * categoryMatch + 0.3 * tagOverlap + 0.3 * contentSimilarity
 * 
 * где:
 * - categoryMatch = 1 если категории совпадают, 0 иначе
 * - tagOverlap = (общие_теги / всего_уникальных_тегов)
 * - contentSimilarity = косинусное сходство векторов контента
 */
export function calculateSimilarity(article1: BlogPost, article2: BlogPost): number {
  // Не сравниваем статью саму с собой
  if (article1.id === article2.id) {
    return 0;
  }

  // 1. Category Match (вес 0.4)
  const categoryMatch = article1.category.id === article2.category.id ? 1 : 0;

  // 2. Tag Overlap (вес 0.3)
  const tags1 = new Set(article1.tags);
  const tags2 = new Set(article2.tags);
  
  const commonTags = new Set([...tags1].filter(tag => tags2.has(tag)));
  const allUniqueTags = new Set([...tags1, ...tags2]);
  
  const tagOverlap = allUniqueTags.size > 0 
    ? commonTags.size / allUniqueTags.size 
    : 0;

  // 3. Content Similarity (вес 0.3) - упрощенное косинусное сходство
  const contentSimilarity = calculateContentSimilarity(article1, article2);

  // Итоговая схожесть
  const similarity = 
    0.4 * categoryMatch + 
    0.3 * tagOverlap + 
    0.3 * contentSimilarity;

  return similarity;
}

/**
 * Расчет схожести контента через косинусное сходство
 */
function calculateContentSimilarity(article1: BlogPost, article2: BlogPost): number {
  // Токенизируем и стеммируем контент обеих статей
  const tokens1 = tokenize(article1.title + ' ' + article1.excerpt + ' ' + article1.content).map(stem);
  const tokens2 = tokenize(article2.title + ' ' + article2.excerpt + ' ' + article2.content).map(stem);

  // Создаем частотные словари
  const freq1 = new Map<string, number>();
  const freq2 = new Map<string, number>();

  tokens1.forEach(token => {
    freq1.set(token, (freq1.get(token) || 0) + 1);
  });

  tokens2.forEach(token => {
    freq2.set(token, (freq2.get(token) || 0) + 1);
  });

  // Находим общие токены
  const commonTokens = new Set([...freq1.keys()].filter(token => freq2.has(token)));

  if (commonTokens.size === 0) {
    return 0;
  }

  // Вычисляем косинусное сходство
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  // Скалярное произведение
  commonTokens.forEach(token => {
    dotProduct += (freq1.get(token) || 0) * (freq2.get(token) || 0);
  });

  // Магнитуды векторов
  freq1.forEach(count => {
    magnitude1 += count * count;
  });

  freq2.forEach(count => {
    magnitude2 += count * count;
  });

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Получение похожих статей
 * 
 * @param articleId - ID текущей статьи
 * @param allArticles - Все доступные статьи
 * @param limit - Максимальное количество рекомендаций (по умолчанию 3)
 * @param readArticleIds - ID прочитанных статей для исключения
 * @returns Массив похожих статей, отсортированных по схожести
 */
export function getRelatedArticles(
  articleId: string,
  allArticles: BlogPost[],
  limit: number = 3,
  readArticleIds: string[] = []
): BlogPost[] {
  // Находим текущую статью
  const currentArticle = allArticles.find(a => a.id === articleId);
  
  if (!currentArticle) {
    return [];
  }

  // Фильтруем: только опубликованные, не текущая, не прочитанные
  const candidateArticles = allArticles.filter(article => 
    article.isPublished &&
    article.id !== articleId &&
    !readArticleIds.includes(article.id)
  );

  // Рассчитываем схожесть для каждой статьи
  const articlesWithSimilarity = candidateArticles.map(article => ({
    article,
    similarity: calculateSimilarity(currentArticle, article)
  }));

  // Сортируем по схожести (по убыванию)
  articlesWithSimilarity.sort((a, b) => b.similarity - a.similarity);

  // Возвращаем топ N статей
  return articlesWithSimilarity
    .slice(0, limit)
    .map(item => item.article);
}

/**
 * Получение связанных калькуляторов для статьи
 * 
 * @param article - Статья блога
 * @param allCalculators - Все доступные калькуляторы
 * @returns Массив связанных калькуляторов
 */
export function getRelatedCalculators(
  article: BlogPost,
  allCalculators: Calculator[]
): Calculator[] {
  // Если в статье явно указаны связанные калькуляторы
  if (article.relatedCalculators && article.relatedCalculators.length > 0) {
    return allCalculators.filter(calc => 
      article.relatedCalculators!.some(relatedId => 
        calc.href.includes(relatedId) || calc.id === relatedId
      )
    );
  }

  // Иначе пытаемся найти по категории статьи
  const categoryMapping: Record<string, string[]> = {
    'mortgage-credit': ['mortgage', 'credit', 'refinancing', 'deposit', 'currency', 'investment'],
    'taxes-salary': ['salary', 'vacation', 'sick-leave', 'self-employed', 'pension'],
    'utilities-housing': ['utilities', 'water'],
    'auto-transport': ['osago', 'kasko', 'fuel', 'tire-size'],
    'health-fitness': ['bmi', 'calories', 'water'],
    'investments-deposits': ['deposit', 'investment', 'currency'],
    'legal-questions': ['court-fee', 'alimony'],
    'family-children': ['maternity-capital', 'alimony']
  };

  const relatedCalcIds = categoryMapping[article.category.id] || [];

  return allCalculators.filter(calc =>
    relatedCalcIds.some(id => calc.href.includes(id) || calc.id === id)
  );
}

/**
 * Отслеживание истории чтения пользователя
 * Сохраняет ID прочитанных статей в localStorage
 */
export function trackReadingHistory(articleId: string): void {
  try {
    const storageKey = 'blog_reading_history';
    const existingHistory = localStorage.getItem(storageKey);
    
    let history: string[] = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Добавляем статью, если её еще нет в истории
    if (!history.includes(articleId)) {
      history.push(articleId);
      
      // Ограничиваем историю последними 50 статьями
      if (history.length > 50) {
        history = history.slice(-50);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(history));
    }
  } catch (error) {
    // Игнорируем ошибки localStorage (например, в приватном режиме)
    console.warn('Failed to track reading history:', error);
  }
}

/**
 * Получение истории чтения пользователя
 */
export function getReadingHistory(): string[] {
  try {
    const storageKey = 'blog_reading_history';
    const existingHistory = localStorage.getItem(storageKey);
    
    return existingHistory ? JSON.parse(existingHistory) : [];
  } catch (error) {
    console.warn('Failed to get reading history:', error);
    return [];
  }
}

/**
 * Получение персонализированных рекомендаций на основе истории чтения
 * 
 * @param allArticles - Все доступные статьи
 * @param limit - Максимальное количество рекомендаций
 * @returns Массив рекомендованных статей
 */
export function getPersonalizedRecommendations(
  allArticles: BlogPost[],
  limit: number = 5
): BlogPost[] {
  const readHistory = getReadingHistory();
  
  if (readHistory.length === 0) {
    // Если истории нет, возвращаем популярные статьи
    return allArticles
      .filter(article => article.isPublished)
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      })
      .slice(0, limit);
  }

  // Находим прочитанные статьи
  const readArticles = allArticles.filter(article => 
    readHistory.includes(article.id)
  );

  // Собираем все рекомендации для прочитанных статей
  const allRecommendations = new Map<string, number>();

  readArticles.forEach(readArticle => {
    const related = getRelatedArticles(readArticle.id, allArticles, 10, readHistory);
    
    related.forEach((article, index) => {
      // Вес уменьшается с позицией (первая рекомендация важнее)
      const weight = 1 / (index + 1);
      const currentWeight = allRecommendations.get(article.id) || 0;
      allRecommendations.set(article.id, currentWeight + weight);
    });
  });

  // Сортируем по весу и возвращаем топ N
  const sortedRecommendations = Array.from(allRecommendations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([articleId]) => allArticles.find(a => a.id === articleId))
    .filter((article): article is BlogPost => article !== undefined);

  return sortedRecommendations;
}
