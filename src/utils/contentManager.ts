import type { BlogPost } from '@/types/blog';
import { tokenize, stem } from '@/services/searchService';
import { calculateSimilarity } from '@/services/recommendationService';

/**
 * Content Manager Utilities
 * Утилиты для автоматизации управления контентом блога
 */

/**
 * Предлагает теги на основе контента статьи
 * Анализирует заголовок, excerpt и контент для извлечения ключевых слов
 * 
 * @param article - Статья блога
 * @param existingTags - Существующие теги в системе (для приоритизации)
 * @param limit - Максимальное количество предложенных тегов (по умолчанию 5)
 * @returns Массив предложенных тегов, отсортированных по релевантности
 */
export function suggestTags(
  article: BlogPost,
  existingTags: string[] = [],
  limit: number = 5
): string[] {
  // Объединяем весь текст для анализа
  const fullText = `${article.title} ${article.excerpt} ${article.content}`;
  
  // Токенизируем и стеммируем
  const tokens = tokenize(fullText);
  const stemmedTokens = tokens.map(stem);
  
  // Подсчитываем частоту каждого токена
  const frequency = new Map<string, number>();
  
  tokens.forEach((token, index) => {
    const stemmedToken = stemmedTokens[index];
    const currentCount = frequency.get(token) || 0;
    frequency.set(token, currentCount + 1);
  });
  
  // Фильтруем слова: минимум 3 символа, встречаются минимум 2 раза
  const candidates = Array.from(frequency.entries())
    .filter(([word, count]) => word.length >= 3 && count >= 2)
    .sort((a, b) => b[1] - a[1]); // Сортируем по частоте
  
  // Приоритизируем существующие теги
  const suggestions: string[] = [];
  
  // Сначала добавляем совпадения с существующими тегами
  for (const [word] of candidates) {
    const matchingTag = existingTags.find(tag => 
      tag.toLowerCase() === word.toLowerCase() ||
      tag.toLowerCase().includes(word.toLowerCase()) ||
      word.toLowerCase().includes(tag.toLowerCase())
    );
    
    if (matchingTag && !suggestions.includes(matchingTag)) {
      suggestions.push(matchingTag);
    }
  }
  
  // Затем добавляем новые теги из кандидатов
  for (const [word] of candidates) {
    if (!suggestions.some(tag => tag.toLowerCase() === word.toLowerCase())) {
      suggestions.push(word);
    }
    
    if (suggestions.length >= limit) {
      break;
    }
  }
  
  return suggestions.slice(0, limit);
}

/**
 * Валидирует ссылки на калькуляторы в статье
 * Проверяет, что все указанные калькуляторы существуют и доступны
 * 
 * @param article - Статья блога
 * @param validCalculatorIds - Список валидных ID калькуляторов
 * @returns Результат валидации
 */
export interface LinkValidationResult {
  isValid: boolean;
  invalidLinks: string[];
  validLinks: string[];
  suggestions: string[];
}

export function validateCalculatorLinks(
  article: BlogPost,
  validCalculatorIds: string[]
): LinkValidationResult {
  const relatedCalculators = article.relatedCalculators || [];
  
  const validLinks: string[] = [];
  const invalidLinks: string[] = [];
  
  // Проверяем каждую ссылку
  for (const calcId of relatedCalculators) {
    if (validCalculatorIds.includes(calcId)) {
      validLinks.push(calcId);
    } else {
      invalidLinks.push(calcId);
    }
  }
  
  // Предлагаем похожие калькуляторы для невалидных ссылок
  const suggestions: string[] = [];
  
  for (const invalidLink of invalidLinks) {
    // Ищем похожие ID (по началу строки или содержанию)
    const similar = validCalculatorIds.filter(validId =>
      validId.includes(invalidLink) ||
      invalidLink.includes(validId) ||
      levenshteinDistance(validId, invalidLink) <= 3
    );
    
    suggestions.push(...similar);
  }
  
  return {
    isValid: invalidLinks.length === 0,
    invalidLinks,
    validLinks,
    suggestions: Array.from(new Set(suggestions)) // Убираем дубликаты
  };
}

/**
 * Расстояние Левенштейна для поиска похожих строк
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Проверяет контент на дубликаты
 * Использует алгоритм схожести из recommendationService
 * 
 * @param article - Проверяемая статья
 * @param allArticles - Все существующие статьи
 * @param threshold - Порог схожести для определения дубликата (по умолчанию 0.8 = 80%)
 * @returns Результат проверки на дубликаты
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicates: Array<{
    article: BlogPost;
    similarity: number;
  }>;
  highSimilarity: Array<{
    article: BlogPost;
    similarity: number;
  }>;
}

export function checkDuplicateContent(
  article: BlogPost,
  allArticles: BlogPost[],
  threshold: number = 0.8
): DuplicateCheckResult {
  const duplicates: Array<{ article: BlogPost; similarity: number }> = [];
  const highSimilarity: Array<{ article: BlogPost; similarity: number }> = [];
  
  // Проверяем схожесть с каждой существующей статьей
  for (const existingArticle of allArticles) {
    // Пропускаем саму статью (если она уже существует)
    if (existingArticle.id === article.id) {
      continue;
    }
    
    const similarity = calculateSimilarity(article, existingArticle);
    
    if (similarity >= threshold) {
      duplicates.push({ article: existingArticle, similarity });
    } else if (similarity >= 0.6) {
      // Статьи с схожестью 60-80% - потенциально похожие
      highSimilarity.push({ article: existingArticle, similarity });
    }
  }
  
  // Сортируем по убыванию схожести
  duplicates.sort((a, b) => b.similarity - a.similarity);
  highSimilarity.sort((a, b) => b.similarity - a.similarity);
  
  return {
    isDuplicate: duplicates.length > 0,
    duplicates,
    highSimilarity
  };
}

/**
 * Предлагает похожие статьи на основе контента
 * Используется для создания связей между статьями
 * 
 * @param article - Текущая статья
 * @param allArticles - Все доступные статьи
 * @param limit - Максимальное количество предложений (по умолчанию 5)
 * @returns Массив похожих статей с оценкой схожести
 */
export function suggestRelatedArticles(
  article: BlogPost,
  allArticles: BlogPost[],
  limit: number = 5
): Array<{ article: BlogPost; similarity: number; reason: string }> {
  const suggestions: Array<{ article: BlogPost; similarity: number; reason: string }> = [];
  
  for (const candidate of allArticles) {
    // Пропускаем саму статью и неопубликованные
    if (candidate.id === article.id || !candidate.isPublished) {
      continue;
    }
    
    const similarity = calculateSimilarity(article, candidate);
    
    // Определяем причину схожести
    let reason = '';
    
    if (article.category.id === candidate.category.id) {
      reason = 'Та же категория';
    }
    
    const commonTags = article.tags.filter(tag => candidate.tags.includes(tag));
    if (commonTags.length > 0) {
      if (reason) reason += ', ';
      reason += `Общие теги: ${commonTags.join(', ')}`;
    }
    
    if (similarity >= 0.3) {
      suggestions.push({
        article: candidate,
        similarity,
        reason: reason || 'Похожий контент'
      });
    }
  }
  
  // Сортируем по схожести и возвращаем топ N
  suggestions.sort((a, b) => b.similarity - a.similarity);
  
  return suggestions.slice(0, limit);
}

/**
 * Автоматическое сохранение черновика
 * Сохраняет статью в localStorage с временной меткой
 * 
 * @param article - Черновик статьи
 * @returns true если сохранение успешно, false иначе
 */
export interface DraftArticle {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  lastSaved?: string;
}

export function autoSaveDraft(draft: DraftArticle): boolean {
  try {
    const storageKey = `blog_draft_${draft.id || 'new'}`;
    
    const draftWithTimestamp = {
      ...draft,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(draftWithTimestamp));
    
    return true;
  } catch (error) {
    console.error('Failed to auto-save draft:', error);
    return false;
  }
}

/**
 * Загружает черновик из localStorage
 * 
 * @param draftId - ID черновика (или 'new' для нового)
 * @returns Черновик или null если не найден
 */
export function loadDraft(draftId: string): DraftArticle | null {
  try {
    const storageKey = `blog_draft_${draftId}`;
    const savedDraft = localStorage.getItem(storageKey);
    
    if (!savedDraft) {
      return null;
    }
    
    return JSON.parse(savedDraft);
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

/**
 * Удаляет черновик из localStorage
 * 
 * @param draftId - ID черновика
 * @returns true если удаление успешно, false иначе
 */
export function deleteDraft(draftId: string): boolean {
  try {
    const storageKey = `blog_draft_${draftId}`;
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('Failed to delete draft:', error);
    return false;
  }
}

/**
 * Получает список всех черновиков
 * 
 * @returns Массив черновиков
 */
export function getAllDrafts(): DraftArticle[] {
  const drafts: DraftArticle[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('blog_draft_')) {
        const draftData = localStorage.getItem(key);
        
        if (draftData) {
          const draft = JSON.parse(draftData);
          drafts.push(draft);
        }
      }
    }
    
    // Сортируем по дате последнего сохранения (новые первыми)
    drafts.sort((a, b) => {
      const dateA = a.lastSaved ? new Date(a.lastSaved).getTime() : 0;
      const dateB = b.lastSaved ? new Date(b.lastSaved).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Failed to get all drafts:', error);
  }
  
  return drafts;
}
