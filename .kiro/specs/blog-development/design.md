# Design Document: Blog Development

## Overview

Комплексная система развития блога для сайта Считай.RU, включающая расширение контента, улучшение функциональности и оптимизацию пользовательского опыта. Система будет построена на существующей архитектуре React + TypeScript с использованием современных паттернов и best practices.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Blog System                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Content    │  │     SEO      │  │    Search    │      │
│  │   Manager    │  │  Optimizer   │  │    Engine    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Recommendation│  │  Analytics   │  │   Comment    │      │
│  │    Engine    │  │   Tracker    │  │    System    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  BlogPost[] │ BlogCategory[] │ BlogAuthor[] │ Analytics     │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```
src/
├── components/
│   └── blog/
│       ├── BlogCard.tsx              # Карточка статьи
│       ├── BlogSearch.tsx            # Компонент поиска
│       ├── BlogFilters.tsx           # Фильтры блога
│       ├── BlogRecommendations.tsx   # Рекомендации
│       ├── BlogComments.tsx          # Система комментариев
│       ├── BlogProgress.tsx          # Прогресс чтения
│       ├── BlogTOC.tsx               # Оглавление
│       ├── BlogShare.tsx             # Кнопки шеринга
│       └── BlogAnalytics.tsx         # Трекинг аналитики
├── pages/
│   ├── BlogPage.tsx                  # Список статей
│   ├── BlogPostPage.tsx              # Страница статьи
│   └── BlogCategoryPage.tsx          # Страница категории
├── services/
│   ├── blogService.ts                # API для работы с блогом
│   ├── searchService.ts              # Сервис поиска
│   ├── recommendationService.ts      # Сервис рекомендаций
│   └── analyticsService.ts           # Сервис аналитики
├── utils/
│   ├── seoOptimizer.ts               # SEO утилиты
│   ├── contentValidator.ts           # Валидация контента
│   └── readingTime.ts                # Расчет времени чтения
└── data/
    ├── blogPosts.ts                  # Данные статей
    ├── blogCategories.ts             # Категории
    └── blogAuthors.ts                # Авторы
```

## Components and Interfaces

### 1. Content Manager

**Purpose:** Управление созданием, редактированием и валидацией контента блога.

**Interface:**
```typescript
interface ContentManager {
  createArticle(data: ArticleData): Promise<BlogPost>;
  updateArticle(id: string, data: Partial<ArticleData>): Promise<BlogPost>;
  validateArticle(article: BlogPost): ValidationResult;
  generateSlug(title: string): string;
  suggestTags(content: string): string[];
  checkDuplicateContent(content: string): DuplicateCheckResult;
  autoSave(draft: DraftArticle): void;
}

interface ArticleData {
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  tags: string[];
  authorId: string;
  featuredImage?: ImageData;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  qualityScore: number;
}
```

**Key Methods:**
- `validateArticle()`: Проверяет минимальную длину (2000 слов), наличие связанных калькуляторов, качество контента
- `generateSlug()`: Создает URL-friendly slug из заголовка (транслитерация, lowercase, дефисы)
- `suggestTags()`: Анализирует контент и предлагает релевантные теги
- `checkDuplicateContent()`: Проверяет на дубликаты используя similarity score

### 2. SEO Optimizer

**Purpose:** Автоматическая оптимизация контента для поисковых систем.

**Interface:**
```typescript
interface SEOOptimizer {
  generateMetaTitle(article: BlogPost): string;
  generateMetaDescription(article: BlogPost): string;
  extractKeywords(content: string): string[];
  validateKeywordDensity(content: string, keywords: string[]): boolean;
  generateCanonicalURL(slug: string): string;
  generateStructuredData(article: BlogPost): ArticleSchema;
  validateH1Tag(content: string, primaryKeyword: string): boolean;
  generateAltTags(images: ImageData[]): ImageData[];
}

interface ArticleSchema {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  author: AuthorSchema;
  datePublished: string;
  publisher: PublisherSchema;
  image?: string;
}
```

**Key Logic:**
- Meta title: 50-70 символов, включает primary keyword
- Meta description: 150-160 символов, включает call-to-action
- Keyword density: 1-3% от общего текста
- Structured data: Schema.org Article format

### 3. Search Engine

**Purpose:** Полнотекстовый поиск по статьям с поддержкой русского языка.

**Interface:**
```typescript
interface SearchEngine {
  search(query: string, filters?: SearchFilters): SearchResult[];
  highlightMatches(text: string, query: string): string;
  suggestAlternatives(query: string): string[];
  calculateRelevance(article: BlogPost, query: string): number;
}

interface SearchFilters {
  categoryId?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

interface SearchResult {
  article: BlogPost;
  relevanceScore: number;
  matchedFields: string[];
  highlightedExcerpt: string;
}
```

**Search Algorithm:**
1. Tokenize query (split by spaces, remove stop words)
2. Search in: title (weight: 3), excerpt (weight: 2), content (weight: 1), tags (weight: 2)
3. Apply Russian morphology (stem words)
4. Calculate relevance score: `sum(matches * field_weight) / total_words`
5. Sort by relevance score descending

### 4. Recommendation Engine

**Purpose:** Рекомендации похожих статей и калькуляторов.

**Interface:**
```typescript
interface RecommendationEngine {
  getRelatedArticles(articleId: string, limit: number): BlogPost[];
  getRelatedCalculators(article: BlogPost): Calculator[];
  calculateSimilarity(article1: BlogPost, article2: BlogPost): number;
  trackReadingHistory(userId: string, articleId: string): void;
  getPersonalizedRecommendations(userId: string): BlogPost[];
}

interface SimilarityFactors {
  categoryMatch: number;    // 0.4 weight
  tagOverlap: number;        // 0.3 weight
  contentSimilarity: number; // 0.3 weight
}
```

**Similarity Algorithm:**
```
similarity = 0.4 * categoryMatch + 0.3 * tagOverlap + 0.3 * contentSimilarity

where:
- categoryMatch = 1 if same category, 0 otherwise
- tagOverlap = (common_tags / total_unique_tags)
- contentSimilarity = cosine_similarity(article1_vector, article2_vector)
```


### 5. Analytics Tracker

**Purpose:** Отслеживание метрик и поведения пользователей.

**Interface:**
```typescript
interface AnalyticsTracker {
  trackPageView(articleId: string): void;
  trackReadingTime(articleId: string, duration: number): void;
  trackScrollDepth(articleId: string, depth: number): void;
  trackCalculatorClick(articleId: string, calculatorId: string): void;
  trackSearchQuery(query: string, resultsCount: number): void;
  trackCompletion(articleId: string): void;
  getArticleMetrics(articleId: string): ArticleMetrics;
}

interface ArticleMetrics {
  pageViews: number;
  averageReadingTime: number;
  completionRate: number;
  calculatorClicks: number;
  scrollDepthDistribution: {
    "25%": number;
    "50%": number;
    "75%": number;
    "100%": number;
  };
}
```

**Tracking Events:**
- Page view: On component mount
- Reading time: Track time between mount and unmount
- Scroll depth: Track when user reaches 25%, 50%, 75%, 100%
- Completion: When user reaches 100% scroll depth AND stays for 5+ seconds
- Calculator clicks: Track clicks on related calculator links

### 6. Comment System

**Purpose:** Система комментариев с модерацией.

**Interface:**
```typescript
interface CommentSystem {
  postComment(articleId: string, comment: CommentData): Promise<Comment>;
  replyToComment(commentId: string, reply: CommentData): Promise<Comment>;
  moderateComment(commentId: string, action: ModerationAction): Promise<void>;
  getComments(articleId: string): Comment[];
  validateComment(comment: CommentData): ValidationResult;
}

interface CommentData {
  name: string;
  email: string;
  content: string;
  parentId?: string;
}

interface Comment {
  id: string;
  articleId: string;
  author: { name: string; email: string };
  content: string;
  createdAt: Date;
  status: "pending" | "approved" | "rejected";
  replies: Comment[];
}

type ModerationAction = "approve" | "reject" | "spam";
```

**Validation Rules:**
- Name: 2-50 characters, no special characters
- Email: Valid email format
- Content: 10-1000 characters, no spam patterns
- CAPTCHA: Required for all submissions

## Data Models

### BlogPost (Extended)

```typescript
interface BlogPost {
  // Existing fields
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  publishedAt: string;
  category: BlogCategory;
  tags: string[];
  featuredImage?: ImageData;
  seo: SEOMetadata;
  readingTime: number;
  isPublished: boolean;
  isFeatured: boolean;
  relatedCalculators?: string[];
  structuredData?: ArticleSchema;
  
  // New fields
  wordCount: number;
  qualityScore: number;
  lastUpdated?: string;
  viewCount: number;
  completionRate: number;
  averageReadingTime: number;
  comments: Comment[];
  shareCount: number;
  tableOfContents?: TOCItem[];
}

interface TOCItem {
  id: string;
  level: number;
  title: string;
  anchor: string;
}
```

### SearchIndex

```typescript
interface SearchIndex {
  articleId: string;
  title: string;
  titleTokens: string[];
  excerpt: string;
  excerptTokens: string[];
  content: string;
  contentTokens: string[];
  tags: string[];
  categoryId: string;
  publishedAt: Date;
}
```

### AnalyticsEvent

```typescript
interface AnalyticsEvent {
  id: string;
  type: "page_view" | "reading_time" | "scroll_depth" | "calculator_click" | "search" | "completion";
  articleId?: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  data: Record<string, any>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Content Validation

*For any* article being saved, if the word count is less than 2000 words, the Content_Manager should reject it with a validation error.

**Validates: Requirements 1.3**

### Property 2: Calculator Linking

*For any* published article, it must have at least one related calculator link in the relatedCalculators array.

**Validates: Requirements 1.4**

### Property 3: Quality Score Threshold

*For any* article being published, if the Content_Quality_Score is below 80, the Content_Manager should reject it.

**Validates: Requirements 1.5**

### Property 4: Meta Title Length

*For any* article, the generated meta title should be between 50 and 70 characters inclusive.

**Validates: Requirements 2.1**

### Property 5: Meta Description Length

*For any* article, the generated meta description should be between 150 and 160 characters inclusive.

**Validates: Requirements 2.2**

### Property 6: Keyword Validation

*For any* article being published, it must have at least 5 keywords in the SEO metadata.

**Validates: Requirements 2.3**

### Property 7: Canonical URL Generation

*For any* article, the canonical URL should be generated in the format `/blog/{slug}` where slug is URL-safe.

**Validates: Requirements 2.4**

### Property 8: Structured Data Presence

*For any* published article, it must have valid Article schema structured data.

**Validates: Requirements 2.5**

### Property 9: H1 Tag Validation

*For any* article content, there should be exactly one H1 tag and it should contain the primary keyword.

**Validates: Requirements 2.6**

### Property 10: Keyword Density

*For any* article content and its keywords, the keyword density should be between 1% and 3%.

**Validates: Requirements 2.7**

### Property 11: Image Alt Tags

*For any* article with images, all images must have non-empty alt text.

**Validates: Requirements 2.8**

### Property 12: Search Coverage

*For any* published article and any search query matching its title, excerpt, content, or tags, the article should appear in search results.

**Validates: Requirements 3.1, 3.4**

### Property 13: Search Result Highlighting

*For any* search result, matching keywords should be wrapped in highlight tags.

**Validates: Requirements 3.3**

### Property 14: Search Relevance Sorting

*For any* search results, they should be sorted by relevance score in descending order.

**Validates: Requirements 3.7**

### Property 15: Recommendation Count

*For any* article, the Recommendation_Engine should return at least 3 related articles (or all available if less than 3 exist).

**Validates: Requirements 4.1**

### Property 16: Same Category Priority

*For any* article recommendations, articles from the same category should have higher similarity scores than articles from different categories.

**Validates: Requirements 4.4**

### Property 17: Exclude Read Articles

*For any* user with reading history, already-read articles should not appear in their recommendations.

**Validates: Requirements 4.6**

### Property 18: Reading Progress Display

*For any* article with word count greater than 1000, a reading progress indicator should be displayed.

**Validates: Requirements 5.1**

### Property 19: Table of Contents Generation

*For any* article with 5 or more H2 headings, a table of contents should be automatically generated.

**Validates: Requirements 5.2**

### Property 20: Reading Time Calculation

*For any* article, the estimated reading time should be calculated as `wordCount / 200` (rounded up to nearest minute).

**Validates: Requirements 5.5**

### Property 21: Image Optimization

*For any* article images, they should be converted to WebP format and have lazy loading enabled.

**Validates: Requirements 5.6**

### Property 22: Analytics Event Recording

*For any* user interaction (page view, scroll, click), an analytics event should be recorded with correct type and timestamp.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

### Property 23: Open Graph Tags

*For any* published article, Open Graph meta tags (og:title, og:description, og:type, og:url) should be generated.

**Validates: Requirements 7.3**

### Property 24: Twitter Card Tags

*For any* published article, Twitter Card meta tags should be generated.

**Validates: Requirements 7.4**

### Property 25: Share Count Display

*For any* article with 10 or more shares, the share count should be displayed.

**Validates: Requirements 7.6**

### Property 26: Comment Validation

*For any* comment submission, if name or email is invalid, the Comment_System should reject it.

**Validates: Requirements 8.2**

### Property 27: Comment Count Accuracy

*For any* article, the displayed comment count should equal the number of approved comments.

**Validates: Requirements 8.6**

### Property 28: Slug Generation

*For any* article title, the generated slug should be lowercase, use hyphens instead of spaces, and contain only alphanumeric characters and hyphens.

**Validates: Requirements 9.2**

### Property 29: Tag Suggestion Relevance

*For any* article content, suggested tags should appear in the content or be semantically related.

**Validates: Requirements 9.3**

### Property 30: Link Validation

*For any* article with calculator links, all links should point to valid calculator routes.

**Validates: Requirements 9.4**

### Property 31: Duplicate Content Detection

*For any* two articles, if their content similarity is above 80%, they should be flagged as potential duplicates.

**Validates: Requirements 9.6**

### Property 32: Language-Specific SEO

*For any* article in multiple languages, each language version should have separate SEO metadata.

**Validates: Requirements 10.5**

### Property 33: Hreflang Tags

*For any* article with translations, hreflang tags should be generated linking all language versions.

**Validates: Requirements 10.6**

### Property 34: Image Lazy Loading

*For any* article images below the fold, the loading attribute should be set to "lazy".

**Validates: Requirements 11.6**

### Property 35: Heading Hierarchy

*For any* article content, headings should follow proper hierarchy (H1 → H2 → H3, no skipping levels).

**Validates: Requirements 12.2**

### Property 36: Color Contrast

*For any* text element, the color contrast ratio with its background should be at least 4.5:1.

**Validates: Requirements 12.3**

### Property 37: Alt Text Presence

*For any* image in an article, it must have non-empty alt text.

**Validates: Requirements 12.4**

### Property 38: Semantic HTML

*For any* blog page, it should use semantic HTML elements (article, nav, aside, header, footer).

**Validates: Requirements 12.7**


## Error Handling

### Content Validation Errors

```typescript
enum ContentValidationError {
  INSUFFICIENT_WORD_COUNT = "Article must have at least 2000 words",
  NO_RELATED_CALCULATORS = "Article must link to at least one calculator",
  LOW_QUALITY_SCORE = "Article quality score must be above 80",
  INVALID_SLUG = "Article slug contains invalid characters",
  DUPLICATE_CONTENT = "Similar content already exists",
  MISSING_REQUIRED_FIELDS = "Required fields are missing",
}
```

**Handling Strategy:**
- Display user-friendly error messages
- Provide suggestions for fixing errors
- Allow saving as draft even with errors
- Block publishing until all errors are resolved

### Search Errors

```typescript
enum SearchError {
  EMPTY_QUERY = "Search query cannot be empty",
  QUERY_TOO_SHORT = "Search query must be at least 2 characters",
  NO_RESULTS = "No articles found matching your query",
  SEARCH_TIMEOUT = "Search took too long, please try again",
}
```

**Handling Strategy:**
- Show helpful error messages
- Suggest alternative queries or popular articles
- Log search failures for analysis
- Implement retry logic for timeouts

### Comment Errors

```typescript
enum CommentError {
  INVALID_EMAIL = "Please provide a valid email address",
  INVALID_NAME = "Name must be 2-50 characters",
  CONTENT_TOO_SHORT = "Comment must be at least 10 characters",
  CONTENT_TOO_LONG = "Comment must be less than 1000 characters",
  SPAM_DETECTED = "Comment flagged as spam",
  CAPTCHA_FAILED = "Please complete the CAPTCHA",
}
```

**Handling Strategy:**
- Inline validation with immediate feedback
- Clear error messages next to form fields
- Preserve user input on validation failure
- Rate limiting to prevent spam

### Analytics Errors

```typescript
enum AnalyticsError {
  TRACKING_FAILED = "Failed to record analytics event",
  INVALID_EVENT_DATA = "Analytics event data is invalid",
  STORAGE_FULL = "Analytics storage is full",
}
```

**Handling Strategy:**
- Silent failures (don't disrupt user experience)
- Queue events for retry
- Log errors for debugging
- Fallback to basic tracking if advanced features fail

## Testing Strategy

### Unit Testing

**Framework:** Vitest + React Testing Library

**Coverage Areas:**
1. **Utility Functions**
   - SEO optimizer functions (meta title/description generation)
   - Content validator functions (word count, quality score)
   - Slug generation and sanitization
   - Reading time calculation
   - Keyword density calculation

2. **Component Logic**
   - BlogCard rendering with different props
   - BlogSearch filtering and sorting
   - BlogFilters state management
   - BlogComments form validation

3. **Service Functions**
   - Search algorithm correctness
   - Recommendation similarity calculation
   - Analytics event creation
   - Comment moderation logic

**Example Unit Tests:**
```typescript
describe('SEO Optimizer', () => {
  test('generates meta title within 50-70 characters', () => {
    const article = createMockArticle({ title: 'Very Long Title...' });
    const metaTitle = generateMetaTitle(article);
    expect(metaTitle.length).toBeGreaterThanOrEqual(50);
    expect(metaTitle.length).toBeLessThanOrEqual(70);
  });

  test('calculates keyword density correctly', () => {
    const content = 'test '.repeat(100); // 100 words
    const keywords = ['test'];
    const density = calculateKeywordDensity(content, keywords);
    expect(density).toBeCloseTo(100, 1); // 100% density
  });
});
```

### Property-Based Testing

**Framework:** fast-check (JavaScript property testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `Feature: blog-development, Property {number}: {property_text}`

**Property Test Examples:**

```typescript
import fc from 'fast-check';

describe('Property Tests: Content Validation', () => {
  test('Property 1: Articles under 2000 words are rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 1999 }),
        (content) => {
          const article = { ...mockArticle, content };
          const result = validateArticle(article);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContainEqual(
            expect.objectContaining({
              code: 'INSUFFICIENT_WORD_COUNT'
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: blog-development, Property 1: Content Validation

  test('Property 2: Published articles must have calculator links', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string(),
          content: fc.string({ minLength: 2000 }),
          relatedCalculators: fc.constant([]), // Empty array
        }),
        (articleData) => {
          const article = { ...mockArticle, ...articleData, isPublished: true };
          const result = validateArticle(article);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContainEqual(
            expect.objectContaining({
              code: 'NO_RELATED_CALCULATORS'
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: blog-development, Property 2: Calculator Linking
});

describe('Property Tests: SEO Optimization', () => {
  test('Property 4: Meta title length is 50-70 characters', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 10, maxLength: 200 }),
          excerpt: fc.string({ minLength: 50, maxLength: 300 }),
        }),
        (articleData) => {
          const article = { ...mockArticle, ...articleData };
          const metaTitle = generateMetaTitle(article);
          expect(metaTitle.length).toBeGreaterThanOrEqual(50);
          expect(metaTitle.length).toBeLessThanOrEqual(70);
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: blog-development, Property 4: Meta Title Length

  test('Property 9: Exactly one H1 tag with primary keyword', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 100, maxLength: 5000 }),
        fc.string({ minLength: 3, maxLength: 20 }),
        (content, keyword) => {
          const contentWithH1 = `# ${keyword}\n\n${content}`;
          const result = validateH1Tag(contentWithH1, keyword);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: blog-development, Property 9: H1 Tag Validation
});

describe('Property Tests: Search Engine', () => {
  test('Property 12: Articles matching query appear in results', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.uuid(),
          title: fc.string(),
          content: fc.string(),
          tags: fc.array(fc.string()),
        })),
        fc.string({ minLength: 2 }),
        (articles, query) => {
          const matchingArticles = articles.filter(a =>
            a.title.includes(query) ||
            a.content.includes(query) ||
            a.tags.some(t => t.includes(query))
          );
          
          const results = searchArticles(articles, query);
          const resultIds = results.map(r => r.article.id);
          
          matchingArticles.forEach(article => {
            expect(resultIds).toContain(article.id);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: blog-development, Property 12: Search Coverage
});

describe('Property Tests: Recommendations', () => {
  test('Property 16: Same category articles have higher similarity', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          categoryId: fc.string(),
          tags: fc.array(fc.string()),
          content: fc.string(),
        }),
        (article) => {
          const sameCategoryArticle = {
            ...mockArticle,
            categoryId: article.categoryId,
          };
          const differentCategoryArticle = {
            ...mockArticle,
            categoryId: 'different-category',
          };
          
          const sameCategorySimilarity = calculateSimilarity(
            article,
            sameCategoryArticle
          );
          const differentCategorySimilarity = calculateSimilarity(
            article,
            differentCategoryArticle
          );
          
          expect(sameCategorySimilarity).toBeGreaterThan(
            differentCategorySimilarity
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: blog-development, Property 16: Same Category Priority
});
```

### Integration Testing

**Focus Areas:**
1. **Blog Page Flow**
   - Navigate from blog list to article
   - Filter and search articles
   - Click related calculators
   - Share article

2. **Comment System Flow**
   - Submit comment
   - Validate form
   - Moderate comment
   - Display approved comments

3. **Analytics Flow**
   - Track page view
   - Track scroll depth
   - Track calculator clicks
   - Aggregate metrics

### End-to-End Testing

**Framework:** Playwright

**Test Scenarios:**
1. User searches for "ипотека" and finds relevant articles
2. User reads article and sees reading progress
3. User clicks related calculator and navigates correctly
4. User shares article on social media
5. User posts comment and sees moderation message

## Performance Considerations

### Content Loading

**Strategy:** Progressive enhancement
- Load critical content first (title, excerpt, featured image)
- Lazy load article body and comments
- Prefetch related articles on hover
- Cache article data in localStorage

**Metrics:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s

### Search Performance

**Optimization:**
- Build search index at build time
- Use Web Workers for search computation
- Implement debouncing (300ms) for search input
- Cache search results for 5 minutes

**Target:** Search results in < 500ms

### Image Optimization

**Strategy:**
- Convert all images to WebP format
- Generate multiple sizes (thumbnail, medium, large)
- Use responsive images with srcset
- Implement lazy loading for below-the-fold images
- Use blur-up placeholder technique

### Bundle Size

**Optimization:**
- Code splitting by route
- Dynamic imports for heavy components (comments, analytics)
- Tree shaking unused code
- Minification and compression

**Target:** Initial bundle < 200KB gzipped

## Accessibility

### Keyboard Navigation

- All interactive elements accessible via Tab
- Skip-to-content link at page top
- Focus indicators visible and clear
- Escape key closes modals and dropdowns

### Screen Reader Support

- Semantic HTML (article, nav, aside, header, footer)
- ARIA labels for icon buttons
- ARIA live regions for dynamic content
- Alt text for all images

### Visual Accessibility

- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- No information conveyed by color alone
- Resizable text up to 200% without loss of functionality

### WCAG 2.1 Level AA Compliance

- Perceivable: Text alternatives, adaptable content, distinguishable
- Operable: Keyboard accessible, enough time, navigable
- Understandable: Readable, predictable, input assistance
- Robust: Compatible with assistive technologies

## Security Considerations

### Content Security

- Sanitize all user-generated content (comments)
- Validate and escape HTML in markdown
- Prevent XSS attacks in search queries
- Rate limiting on comment submissions

### Data Privacy

- No tracking without user consent
- Anonymize analytics data
- Secure storage of email addresses
- GDPR compliance for EU users

### API Security

- Rate limiting on search API
- Input validation on all endpoints
- CSRF protection for comment submissions
- Content-Security-Policy headers

## Deployment Strategy

### Phase 1: Content Expansion (Week 1-2)
- Add 11 new articles (total 15)
- Cover all 8 blog categories
- Optimize existing articles for SEO
- Add related calculator links

### Phase 2: Search & Recommendations (Week 3-4)
- Implement search engine
- Build search index
- Implement recommendation engine
- Add related articles section

### Phase 3: Enhanced UX (Week 5-6)
- Add reading progress indicator
- Generate table of contents
- Implement social sharing
- Add font size adjustment

### Phase 4: Analytics & Comments (Week 7-8)
- Implement analytics tracking
- Build analytics dashboard
- Add comment system
- Implement moderation workflow

### Phase 5: Performance & Accessibility (Week 9-10)
- Optimize images and bundle size
- Implement lazy loading
- Audit and fix accessibility issues
- Performance testing and optimization

## Monitoring and Metrics

### Key Performance Indicators (KPIs)

1. **Content Metrics**
   - Total published articles: Target 15+
   - Average article quality score: Target 85+
   - Articles per category: Target 2+ per category

2. **Engagement Metrics**
   - Average reading time: Target 5+ minutes
   - Completion rate: Target 40%+
   - Calculator click-through rate: Target 15%+

3. **Search Metrics**
   - Search usage rate: Target 20% of visitors
   - Search success rate: Target 80%+
   - Average results per query: Target 3-10

4. **Performance Metrics**
   - Page load time: Target < 2s
   - Search response time: Target < 500ms
   - Lighthouse score: Target 90+

5. **Accessibility Metrics**
   - WCAG 2.1 Level AA compliance: Target 100%
   - Keyboard navigation coverage: Target 100%
   - Screen reader compatibility: Target 100%

### Monitoring Tools

- Google Analytics for traffic and engagement
- Yandex Metrika for Russian market insights
- Lighthouse CI for performance monitoring
- Sentry for error tracking
- Custom analytics dashboard for blog-specific metrics

## Future Enhancements

### Phase 6: Advanced Features (Future)
- Newsletter subscription
- Author profiles and bios
- Article series and collections
- Bookmarking and reading lists
- Dark mode support
- Print-friendly layouts

### Phase 7: Internationalization (Future)
- English translations
- Multi-language support
- Localized content
- Regional calculators

### Phase 8: AI-Powered Features (Future)
- AI-generated article summaries
- Personalized content recommendations
- Automated tag suggestions
- Content quality scoring using ML
