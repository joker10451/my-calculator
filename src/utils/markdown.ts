/**
 * Простой парсер Markdown для блога
 */

export function parseMarkdown(content: string): string {
  let html = content;

  // 1. Обработка кастомных блоков (контейнеров) типа :::expert ... :::
  // Обрабатываем их ПЕРЕД заголовками и параграфами
  html = html.replace(/:::expert\s+([\s\S]*?):::/g, (match, p1) => {
    return `<div class="expert-tip-box glass-card border-l-4 border-primary p-6 my-10 animate-fade-in">
              <div class="flex items-center gap-3 mb-4 text-primary font-bold uppercase tracking-wider text-sm">
                <span class="p-1 bg-primary/10 rounded-lg">💡</span> Совет эксперта
              </div>
              <div class="italic text-lg leading-relaxed text-foreground/90 font-medium">${p1.trim()}</div>
            </div>`;
  });

  html = html.replace(/:::quote\s+([\s\S]*?):::/g, (match, p1) => {
    return `<blockquote class="pull-quote text-2xl md:text-3xl font-extrabold text-center my-16 px-4 md:px-12 leading-tight text-primary/90 italic">
              "${p1.trim()}"
            </blockquote>`;
  });

  html = html.replace(/:::fact\s+([\s\S]*?):::/g, (match, p1) => {
    return `<div class="fact-box bg-accent/20 border border-primary/20 p-6 my-10 rounded-2xl flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
              <div class="text-3xl">📝</div>
              <div>
                <div class="font-bold text-lg mb-1">Важный факт</div>
                <div class="text-base leading-relaxed opacity-90">${p1.trim()}</div>
              </div>
            </div>`;
  });

  // Заголовки (обрабатываем в обратном порядке чтобы не было конфликтов)
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-12 mb-6 group flex items-center gap-2"><span class="h-8 w-1 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-extrabold mt-16 mb-8 pb-4 border-b-2 border-primary/10 relative"><span class="absolute -bottom-0.5 left-0 w-24 h-0.5 bg-primary"></span>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl md:text-5xl font-black mt-20 mb-10 tracking-tight text-gradient-primary">$1</h1>');

  // Жирный текст и курсив
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic opacity-90">$1</em>');

  // Ссылки
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary font-semibold underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all">$1</a>');

  // Разделяем на блоки по двойным переносам строк
  const blocks = html.split('\n\n');
  let isFirstParagraph = true;
  
  const processedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';

    // Если это уже HTML-тег (наш кастомный блок или заголовок), оставляем как есть
    if (trimmed.startsWith('<div') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) {
      return trimmed;
    }

    // Обрабатываем списки (неизменено, но добавим стили)
    const lines = trimmed.split('\n');
    const unorderedListItems: string[] = [];
    const orderedListItems: string[] = [];
    const nonListLines: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.match(/^- /)) {
        inUnorderedList = true;
        const content = trimmedLine.substring(2).trim();
        unorderedListItems.push(`<li class="flex gap-3 items-start my-4 pr-4"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span><span>${content}</span></li>`);
      } else if (trimmedLine.match(/^\d+\. /)) {
        inOrderedList = true;
        const content = trimmedLine.replace(/^\d+\. /, '').trim();
        const num = trimmedLine.match(/^(\d+)\. /)?.[1] || '1';
        orderedListItems.push(`<li class="flex gap-4 items-start my-4 pr-4"><span class="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">${num}</span><span>${content}</span></li>`);
      } else {
        nonListLines.push(trimmedLine);
      }
    }

    if (inUnorderedList) return `<ul class="my-10 space-y-2">${unorderedListItems.join('')}</ul>`;
    if (inOrderedList) return `<ol class="my-10 space-y-2">${orderedListItems.join('')}</ol>`;

    // Обычный параграф с поддержкой Drop Cap для первого
    if (nonListLines.length > 0) {
      const pContent = nonListLines.join('<br>');
      if (isFirstParagraph) {
        isFirstParagraph = false;
        return `<p class="mb-8 leading-relaxed text-lg first-letter:text-6xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:mt-1 first-letter:leading-[1]">${pContent}</p>`;
      }
      return `<p class="mb-8 leading-relaxed text-lg opacity-90">${pContent}</p>`;
    }

    return '';
  });

  return processedBlocks.filter(block => block).join('\n\n');
}