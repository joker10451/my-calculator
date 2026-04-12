/**
 * Универсальная обработка инлайнового форматирования (жирный, курсив, ссылки)
 */
function applyInlineFormatting(text: string): string {
  const normalizeHref = (href: string): string => {
    // Легаси-ссылки вида "#/calculator/..." переводим в обычные роуты
    if (href.startsWith('#/')) return href.slice(1);
    return href;
  };

  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const normalizedHref = normalizeHref(String(href));
      const isExternal = /^https?:\/\//i.test(normalizedHref);
      const rel = isExternal ? ' rel="noopener noreferrer"' : '';
      const target = isExternal ? ' target="_blank"' : '';
      return `<a href="${normalizedHref}" class="text-blue-600 hover:underline font-medium"${target}${rel}>${label}</a>`;
    })
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-black">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>')
    .trim();
}

/**
 * Парсинг содержимого внутри кастомных блоков
 */
function parseInnerMarkdown(md: string): string {
  const lines = md.split('\n').map(l => l.trim()).filter(l => l);
  let result = '';
  const listItems: string[] = [];

  for (const line of lines) {
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const rawContent = line.replace(/^[-*]\s+/, '');
      if (rawContent.includes(':')) {
        const [label, ...valueParts] = rawContent.split(':');
        const value = valueParts.join(':').trim();
        listItems.push(`<li class="data-card">
          <span class="card-label">${applyInlineFormatting(label)}</span>
          <span class="card-value">${applyInlineFormatting(value)}</span>
        </li>`);
      } else {
        listItems.push(`<li class="data-card">${applyInlineFormatting(rawContent)}</li>`);
      }
    } else if (line.startsWith('### ')) {
      result += `<h3 class="inner-h3">${applyInlineFormatting(line.substring(4))}</h3>`;
    } else {
      result += `<p class="inner-p">${applyInlineFormatting(line)}</p>`;
    }
  }

  if (listItems.length > 0) {
    result += `<ul class="inner-list">${listItems.join('')}</ul>`;
  }

  return result;
}

/**
 * Основной парсер Markdown
 */
export function parseMarkdown(content: string): string {
  if (!content) return '';
  let html = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 1. Кастомные блоки (Offer, Grid, Expert, Fact, Quote, Calculator, TOC)
  html = html.replace(/:::offer\s+([\s\S]*?):::/g, (_match, p1) => {
    const lines = p1.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    let title = 'Специальное предложение';
    let description = '';
    let link = '';
    let cta = 'Подробнее';
    let badge = '';

    for(const line of lines) {
      if(line.startsWith('### ')) title = line.substring(4);
      else if(line.startsWith('[badge] ')) badge = line.substring(8);
      else if(line.includes('|') && (line.includes('http') || line.trim().startsWith('/'))) {
        const [l, c] = line.split('|');
        link = l.trim();
        cta = c.trim();
      }
      else if (!line.startsWith('###') && !line.startsWith('[badge]')) {
        description = line;
      }
    }

    const hasLink = link.length > 0 && link !== '#';
    const isExternal = link.startsWith('http');
    const linkAttrs = hasLink
      ? (isExternal
        ? `href="${link}" target="_blank" rel="nofollow noopener"`
        : `href="${link}"`)
      : '';

    const ctaHtml = hasLink
      ? `<a ${linkAttrs} class="offer-cta">${cta}</a>`
      : '';

    return `<div class="offer-box-modern ${badge ? 'is-highlighted' : ''}">
      <div class="offer-tag">Рекомендация Считай.RU</div>
      ${badge ? `<span class="offer-badge">${badge}</span>` : ''}
      <h3 class="offer-title">${title}</h3>
      <p class="offer-description">${description}</p>
      ${ctaHtml}
      <div class="offer-footer">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        ${hasLink && isExternal ? 'Безопасная сделка через официального партнера' : 'Проверенные предложения от Считай.RU'}
      </div>
    </div>`;
  });

  // :::grid — сетка данных/характеристик
  html = html.replace(/:::grid\s+([\s\S]*?):::/g, (_match, p1) => {
    return `<div class="premium-data-grid">${parseInnerMarkdown(p1)}</div>`;
  });

  // :::expert — блок экспертного совета
  html = html.replace(/:::expert\s+([\s\S]*?):::/g, (_match, p1) => {
    const lines = p1.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    let title = 'Совет эксперта';
    const contentLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('### ')) title = line.substring(4);
      else contentLines.push(line);
    }

    return `<div class="expert-box-modern">
      <div class="expert-header">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        ${title}
      </div>
      <div class="expert-content">${contentLines.map(l => applyInlineFormatting(l)).join('<br>')}</div>
    </div>`;
  });

  // :::fact — блок с интересным фактом
  html = html.replace(/:::fact\s+([\s\S]*?):::/g, (_match, p1) => {
    const lines = p1.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    let title = 'Важно знать';
    const contentLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('### ')) title = line.substring(4);
      else contentLines.push(line);
    }

    return `<div class="fact-box-modern">
      <div class="fact-icon">💡</div>
      <div>
        <div class="fact-title">${title}</div>
        <div class="fact-text">${contentLines.map(l => applyInlineFormatting(l)).join('<br>')}</div>
      </div>
    </div>`;
  });

  // :::quote — блок цитаты/расчёта
  html = html.replace(/:::quote\s+([\s\S]*?):::/g, (_match, p1) => {
    return `<div class="calc-example">
      <div class="calc-body">${parseInnerMarkdown(p1)}</div>
    </div>`;
  });

  html = html.replace(/:::calculator\s+([\s\S]*?):::/g, (_match, p1) => {
    const lines = p1.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    let title = 'Умный калькулятор';
    let description = '';
    let link = '/calculator/';
    let cta = 'Перейти к расчету';

    for(const line of lines) {
      if(line.startsWith('### ')) title = line.substring(4);
      else if(line.includes('|') && (line.includes('/') || line.includes('calc'))) {
        const [l, c] = line.split('|');
        link = l.trim();
        cta = c.trim();
      }
      else if (!line.startsWith('###')) {
        description = line;
      }
    }

    return `<div class="calculator-bridge-card">
      <div class="calc-bridge-icon">
        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>
      </div>
      <div class="calc-bridge-content">
        <h3 class="calc-bridge-title">${title}</h3>
        <p class="calc-bridge-desc">${description}</p>
        <a href="${link}" class="calc-bridge-btn">
          ${cta}
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
      </div>
    </div>`;
  });

  html = html.replace(/:::toc:::/g, '<div id="article-toc-placeholder" class="toc-container"></div>');

  // Блок сравнения продуктов :::compare
  html = html.replace(/:::compare\s+([\s\S]*?):::/g, (_match, p1) => {
    const lines = p1.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    let tableTitle = 'Сравнение продуктов';
    const products: Array<{
      name: string;
      badge?: string;
      rating?: number;
      href?: string;
      features: Record<string, string>;
    }> = [];
    let currentProduct: typeof products[0] | null = null;

    for (const line of lines) {
      if (line.startsWith('### ')) {
        tableTitle = line.substring(4);
      } else if (line.startsWith('## ')) {
        // Новый продукт
        if (currentProduct) products.push(currentProduct);
        currentProduct = { name: line.substring(3), features: {} };
      } else if (currentProduct) {
        if (line.startsWith('[badge] ')) {
          currentProduct.badge = line.substring(8);
        } else if (line.startsWith('[rating] ')) {
          currentProduct.rating = parseFloat(line.substring(9));
        } else if (line.startsWith('[link] ')) {
          currentProduct.href = line.substring(7);
        } else if (line.includes(':')) {
          const [key, ...valParts] = line.split(':');
          currentProduct.features[key.replace(/^[-*]\s*/, '').trim()] = valParts.join(':').trim();
        }
      }
    }
    if (currentProduct) products.push(currentProduct);

    if (products.length === 0) return '';

    const featureKeys = Object.keys(products[0].features);
    const headerCells = products.map(p =>
      `<th class="product-comparison-product-col ${p.badge ? 'is-best' : ''}">
        ${p.badge ? `<span class="product-comparison-badge">${p.badge}</span>` : ''}
        <span class="product-comparison-name">${p.name}</span>
        ${p.rating ? `<div class="product-comparison-stars">${[1,2,3,4,5].map(s => `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="${s <= p.rating! ? 'currentColor' : 'none'}" class="${s <= p.rating! ? 'star-filled' : 'star-empty'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`).join('')}</div>` : ''}
      </th>`
    ).join('');

    const bodyRows = featureKeys.map(key => {
      const cells = products.map(p => {
        const val = p.features[key] || '—';
        const isPos = val === 'Да' || val === '✓' || val === 'Есть';
        const isNeg = val === 'Нет' || val === '✗';
        const content = isPos
          ? '<svg viewBox="0 0 24 24" width="18" height="18" stroke="#10b981" stroke-width="3" fill="none"><polyline points="20 6 9 17 4 12"/></svg>'
          : isNeg
            ? '<svg viewBox="0 0 24 24" width="18" height="18" stroke="#f87171" stroke-width="3" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
            : val;
        return `<td class="product-comparison-value ${p.badge ? 'is-best-col' : ''}">${content}</td>`;
      }).join('');
      return `<tr><td class="product-comparison-feature-label">${key}</td>${cells}</tr>`;
    }).join('');

    const ctaRow = products.some(p => p.href) 
      ? `<div class="product-comparison-cta-row">${products.map(p => 
          `<div class="product-comparison-cta-cell">${p.href 
            ? `<a href="${p.href}" target="_blank" rel="nofollow noopener noreferrer" class="product-comparison-cta ${p.badge ? 'is-primary' : ''}">Оформить <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>` 
            : ''}</div>`
        ).join('')}</div>` 
      : '';

    return `<div class="product-comparison-wrapper">
      <div class="product-comparison-header">
        <div class="product-comparison-icon"><svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
        <h3 class="product-comparison-title">${tableTitle}</h3>
      </div>
      <div class="product-comparison-scroll">
        <table class="product-comparison-table">
          <thead><tr><th class="product-comparison-feature-col">Параметр</th>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
      ${ctaRow}
    </div>`;
  });

  // 2. Структурные элементы (Заголовки и Списки)
  html = html.replace(/^\s*###\s+(.*$)/gim, '<h3 class="modern-h3">$1</h3>');
  html = html.replace(/^\s*##\s+(.*$)/gim, '<h2 class="modern-h2">$1</h2>'); 
  html = html.replace(/^\s*#\s+(.*$)/gim, '<h1 class="modern-h1">$1</h1>');
  html = html.replace(/^\s*[-*—–]\s+(.*$)/gim, '<li class="standard-li">$1</li>');

  // 3. Финальная сборка и инлайновая очистка
  const blocks = html.split(/\n{2,}/);
  return blocks.map(block => {
    let trimmed = block.trim();
    if (!trimmed) return '';

    // Применяем жирный/курсив ко ВСЕМ блокам
    trimmed = applyInlineFormatting(trimmed);

    // Поддержка Markdown таблиц
    if (trimmed.startsWith('|') && trimmed.includes('\n')) {
      const rows = trimmed.split('\n');
      // Проверяем, является ли вторая строка разделителем (типа |---|---|)
      if (rows.length >= 2 && rows[1].match(/\|[-:\s]+\|/)) {
        const parseRow = (row: string, isHead: boolean) => {
          const cells = row.split('|').slice(1, -1); // Убираем пустые крайние элементы до / после пайпов
          const tag = isHead ? 'th' : 'td';
          return cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('');
        };
        
        const thead = `<tr>${parseRow(rows[0], true)}</tr>`;
        const tbody = rows.slice(2)
                          .map(r => r.trim() ? `<tr>${parseRow(r, false)}</tr>` : '')
                          .join('');
                          
        return `<div class="modern-table-wrapper overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm"><table class="w-full text-left border-collapse bg-white"><thead class="bg-slate-50 border-b border-slate-200 text-slate-700">${thead}</thead><tbody class="divide-y divide-slate-100">${tbody.replace(/<td>/g, '<td class="py-3 px-4 text-slate-700">').replace(/<tr>/g, '<tr class="hover:bg-slate-50/50 transition-colors">')}</tbody></table></div>`.replace(/<th>/g, '<th class="py-3 px-4 font-semibold">');
      }
    }

    if (trimmed.startsWith('<li')) {
      return `<ul class="standard-ul">${trimmed}</ul>`;
    }
    
    if (trimmed.startsWith('<div') || trimmed.startsWith('<h') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<ul')) {
      return trimmed;
    }

    return `<p class="modern-p">${trimmed.split('\n').join('<br>')}</p>`;
  }).filter(b => b).join('\n\n');
}