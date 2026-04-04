/**
 * Универсальная обработка инлайнового форматирования (жирный, курсив, ссылки)
 */
function applyInlineFormatting(text: string): string {
  return text
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

  // 1. Кастомные блоки (Grid, Expert, Fact, Quote)
  html = html.replace(/:::grid\s+([\s\S]*?):::/g, (match, p1) => `<div class="premium-data-grid">${parseInnerMarkdown(p1)}</div>`);
  html = html.replace(/:::expert\s+([\s\S]*?):::/g, (match, p1) => `<div class="expert-box-modern"><div class="expert-header">💡 Совет эксперта</div><div class="expert-content">${parseInnerMarkdown(p1)}</div></div>`);
  html = html.replace(/:::fact\s+([\s\S]*?):::/g, (match, p1) => `<div class="fact-box-modern"><div class="fact-icon">📝</div><div class="fact-body"><div class="fact-title font-black text-black text-xl mb-1 uppercase tracking-tight">Важный факт</div><div class="fact-text text-lg text-slate-700 font-semibold leading-relaxed">${parseInnerMarkdown(p1)}</div></div></div>`);
  html = html.replace(/:::quote\s+([\s\S]*?):::/g, (match, p1) => `<blockquote class="modern-pull-quote">${p1.trim()}</blockquote>`);

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

    if (trimmed.startsWith('<li')) {
      return `<ul class="standard-ul">${trimmed}</ul>`;
    }
    
    if (trimmed.startsWith('<div') || trimmed.startsWith('<h') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<ul')) {
      return trimmed;
    }

    return `<p class="modern-p">${trimmed.split('\n').join('<br>')}</p>`;
  }).filter(b => b).join('\n\n');
}