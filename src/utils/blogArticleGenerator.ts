import type { BlogPost, BlogCategory } from '@/types/blog';

/**
 * Генератор статей для блога
 * Упрощает создание больших статей с правильной структурой
 */

interface ArticleSection {
  heading: string;
  level: 1 | 2 | 3 | 4;
  content: string;
}

interface ArticleMetadata {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    bio: string;
  };
  publishedAt: string;
  category: BlogCategory;
  tags: string[];
  featuredImage?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  relatedCalculators: string[];
  readingTime?: number;
  isFeatured?: boolean;
}

export class BlogArticleBuilder {
  private sections: ArticleSection[] = [];
  private metadata: Partial<ArticleMetadata> = {};

  /**
   * Установить метаданные статьи
   */
  setMetadata(metadata: ArticleMetadata): this {
    this.metadata = metadata;
    return this;
  }

  /**
   * Добавить заголовок H1
   */
  addH1(text: string): this {
    this.sections.push({
      heading: text,
      level: 1,
      content: ''
    });
    return this;
  }

  /**
   * Добавить заголовок H2
   */
  addH2(text: string): this {
    this.sections.push({
      heading: text,
      level: 2,
      content: ''
    });
    return this;
  }

  /**
   * Добавить заголовок H3
   */
  addH3(text: string): this {
    this.sections.push({
      heading: text,
      level: 3,
      content: ''
    });
    return this;
  }

  /**
   * Добавить параграф
   */
  addParagraph(text: string): this {
    const lastSection = this.sections[this.sections.length - 1];
    if (lastSection) {
      lastSection.content += `\n\n${text}`;
    }
    return this;
  }

  /**
   * Добавить список
   */
  addList(items: string[], ordered: boolean = false): this {
    const lastSection = this.sections[this.sections.length - 1];
    if (lastSection) {
      const listItems = items.map((item, index) => 
        ordered ? `${index + 1}. ${item}` : `- ${item}`
      ).join('\n');
      lastSection.content += `\n\n${listItems}`;
    }
    return this;
  }

  /**
   * Добавить таблицу
   */
  addTable(headers: string[], rows: string[][]): this {
    const lastSection = this.sections[this.sections.length - 1];
    if (lastSection) {
      const headerRow = `| ${headers.join(' | ')} |`;
      const separator = `|${headers.map(() => '-------').join('|')}|`;
      const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
      const table = `\n\n${headerRow}\n${separator}\n${dataRows}`;
      lastSection.content += table;
    }
    return this;
  }

  /**
   * Добавить цитату
   */
  addQuote(text: string): this {
    const lastSection = this.sections[this.sections.length - 1];
    if (lastSection) {
      lastSection.content += `\n\n> ${text}`;
    }
    return this;
  }

  /**
   * Добавить код
   */
  addCode(code: string, language: string = ''): this {
    const lastSection = this.sections[this.sections.length - 1];
    if (lastSection) {
      lastSection.content += `\n\n\`\`\`${language}\n${code}\n\`\`\``;
    }
    return this;
  }

  /**
   * Добавить ссылку на калькулятор
   */
  addCalculatorLink(calculatorId: string, text: string): this {
    const lastSection = this.sections[this.sections.length - 1];
    if (lastSection) {
      lastSection.content += `\n\n**${text}** с помощью нашего [калькулятора](#/calculator/${calculatorId})!`;
    }
    return this;
  }

  /**
   * Добавить пример расчета
   */
  addCalculationExample(title: string, data: Record<string, unknown>, result: string): this {
    this.addH3(title);
    
    const dataList = Object.entries(data).map(([key, value]) => `- **${key}**: ${value}`);
    this.addList(dataList, false);
    
    this.addParagraph(`**Результат**: ${result}`);
    
    return this;
  }

  /**
   * Добавить FAQ секцию
   */
  addFAQ(questions: Array<{ question: string; answer: string }>): this {
    this.addH2('Частые вопросы');
    
    questions.forEach(({ question, answer }) => {
      this.addH3(question);
      this.addParagraph(answer);
    });
    
    return this;
  }

  /**
   * Добавить заключение с призывом к действию
   */
  addConclusion(text: string, calculatorId?: string): this {
    this.addH2('Заключение');
    this.addParagraph(text);
    
    if (calculatorId) {
      this.addCalculatorLink(calculatorId, 'Рассчитайте прямо сейчас');
    }
    
    return this;
  }

  /**
   * Построить контент статьи
   */
  private buildContent(): string {
    return this.sections.map(section => {
      const heading = '#'.repeat(section.level) + ' ' + section.heading;
      return heading + section.content;
    }).join('\n\n');
  }

  /**
   * Рассчитать время чтения
   */
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Сгенерировать SEO метаданные
   */
  private generateSEO(metadata: ArticleMetadata): BlogPost['seo'] {
    return {
      metaTitle: `${metadata.title} | Считай.RU`,
      metaDescription: metadata.excerpt,
      keywords: metadata.tags,
      canonical: `/blog/${metadata.slug}`
    };
  }

  /**
   * Сгенерировать structured data
   */
  private generateStructuredData(metadata: ArticleMetadata): BlogPost['structuredData'] {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": metadata.title,
      "author": {
        "@type": "Person",
        "name": metadata.author.name
      },
      "datePublished": metadata.publishedAt,
      "publisher": {
        "@type": "Organization",
        "name": "Считай.RU"
      }
    };
  }

  /**
   * Собрать финальную статью
   */
  build(): BlogPost {
    const metadata = this.metadata as ArticleMetadata;
    const content = this.buildContent();
    const readingTime = metadata.readingTime || this.calculateReadingTime(content);

    return {
      id: metadata.id,
      slug: metadata.slug,
      title: metadata.title,
      excerpt: metadata.excerpt,
      content,
      author: metadata.author,
      publishedAt: metadata.publishedAt,
      category: metadata.category,
      tags: metadata.tags,
      featuredImage: metadata.featuredImage,
      seo: this.generateSEO(metadata),
      readingTime,
      isPublished: true,
      isFeatured: metadata.isFeatured || false,
      relatedCalculators: metadata.relatedCalculators,
      structuredData: this.generateStructuredData(metadata)
    };
  }
}

/**
 * Хелпер для быстрого создания статьи
 */
export function createArticle(metadata: ArticleMetadata): BlogArticleBuilder {
  return new BlogArticleBuilder().setMetadata(metadata);
}
