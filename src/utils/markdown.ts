/**
 * Универсальная обработка инлайнового форматирования (жирный, курсив, ссылки)
 */
function applyInlineFormatting(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline font-medium">$1</a>')
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
  let listItems = [];

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
  let html = content;

  // 1. Кастомные блоки (Offer, Grid, Expert, Fact, Quote)
  html = html.replace(/:::offer\s+([\s\S]*?):::/g, (_match, p1) => {
    const lines = p1.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    let title = 'Специальное предложение';
    let description = '';
    let link = '#';
    let cta = 'Подробнее';

    for(const line of lines) {
      if(line.startsWith('### ')) title = line.substring(4);
      else if(line.includes('|') && line.includes('http')) {
        const [l, c] = line.split('|');
        link = l.trim();
        cta = c.trim();
      }
      else description = line;
    }

    return `<div class="offer-box-modern">
      <div class="offer-tag">Рекомендация Считай.RU</div>
      <h3 class="offer-title">${title}</h3>
      <p class="offer-description">${description}</p>
      <a href="${link}" target="_blank" rel="nofollow" class="offer-cta">${cta}</a>
      <div class="offer-footer">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        Безопасная сделка через официального партнера
      </div>
    </div>`;
  });

  html = html.replace(/:::grid\s+([\s\S]*?):::/g, (_match, p1) => `<div class="premium-data-grid">${parseInnerMarkdown(p1)}</div>`);
  html = html.replace(/:::expert\s+([\s\S]*?):::/g, (_match, p1) => `<div class="expert-box-modern"><div class="expert-header">💡 Совет эксперта</div><div class="expert-content">${parseInnerMarkdown(p1)}</div></div>`);
  html = html.replace(/:::fact\s+([\s\S]*?):::/g, (_match, p1) => `<div class="fact-box-modern"><div class="fact-icon">📝</div><div class="fact-body"><div class="fact-title font-black text-black text-xl mb-1 uppercase tracking-tight">Важный факт</div><div class="fact-text text-lg text-slate-700 font-semibold leading-relaxed">${parseInnerMarkdown(p1)}</div></div></div>`);
  html = html.replace(/:::quote\s+([\s\S]*?):::/g, (_match, p1) => {
    const lines = p1.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    let title = '';
    const items: string[] = [];

    for (const line of lines) {
      if (line.startsWith('### ')) {
        title = line.substring(4);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.replace(/^[-*]\s+/, '');
        if (content.includes(':')) {
          const colonIdx = content.indexOf(':');
          const label = content.substring(0, colonIdx);
          const value = content.substring(colonIdx + 1).trim();
          items.push(`<div class="calc-row"><span class="calc-label">${applyInlineFormatting(label)}:</span><span class="calc-value">${applyInlineFormatting(value)}</span></div>`);
        } else {
          items.push(`<div class="calc-row"><span class="calc-value">${applyInlineFormatting(content)}</span></div>`);
        }
      } else {
        items.push(`<p class="calc-text">${applyInlineFormatting(line)}</p>`);
      }
    }

    return `<div class="calc-example">
      ${title ? `<h4 class="calc-title">${applyInlineFormatting(title)}</h4>` : ''}
      <div class="calc-body">${items.join('')}</div>
    </div>`;
  });

  // 2. Структурные элементы (Заголовки и Списки)
  html = html.replace(/^\s*###\s+(.*$)/gim, '<h3 class="modern-h3">$1</h3>');
  html = html.replace(/^\s*##\s+(.*$)/gim, '<h2 class="modern-h2">$1</h2>'); 
  html = html.replace(/^\s*#\s+(.*$)/gim, '<h1 class="modern-h1">$1</h1>');
  html = html.replace(/^\s*[-*—–]\s+(.*$)/gim, '<li class="standard-li">$1</li>');

  // 3. Финальная сборка и инлайновая очистка
  const blocks = html.split('\n\n');
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