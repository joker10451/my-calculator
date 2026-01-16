/**
 * Простой парсер Markdown для блога
 */

export function parseMarkdown(content: string): string {
  let html = content;

  // Заголовки (обрабатываем в обратном порядке чтобы не было конфликтов)
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-8 mb-4">$1</h1>');

  // Жирный текст
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Курсив
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Ссылки
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80">$1</a>');

  // Разделяем на блоки по двойным переносам строк
  const blocks = html.split('\n\n');
  
  const processedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';

    // Если это уже HTML-тег, оставляем как есть
    if (trimmed.startsWith('<h') || trimmed.startsWith('<')) {
      return trimmed;
    }

    // Обрабатываем списки
    const lines = trimmed.split('\n');
    const unorderedListItems: string[] = [];
    const orderedListItems: string[] = [];
    const nonListLines: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Неупорядоченный список (начинается с "- ")
      if (trimmedLine.match(/^- /)) {
        if (inOrderedList) {
          // Закрываем упорядоченный список
          nonListLines.push(`<ol class="my-6 list-decimal pl-6 space-y-2">${orderedListItems.join('')}</ol>`);
          orderedListItems.length = 0;
          inOrderedList = false;
        }
        inUnorderedList = true;
        const content = trimmedLine.substring(2).trim();
        unorderedListItems.push(`<li class="my-2 leading-relaxed">${content}</li>`);
      }
      // Упорядоченный список (начинается с цифры и точки)
      else if (trimmedLine.match(/^\d+\. /)) {
        if (inUnorderedList) {
          // Закрываем неупорядоченный список
          nonListLines.push(`<ul class="my-6 list-disc pl-6 space-y-2">${unorderedListItems.join('')}</ul>`);
          unorderedListItems.length = 0;
          inUnorderedList = false;
        }
        inOrderedList = true;
        const content = trimmedLine.replace(/^\d+\. /, '').trim();
        orderedListItems.push(`<li class="my-2 leading-relaxed">${content}</li>`);
      }
      // Обычная строка
      else {
        // Закрываем открытые списки
        if (inUnorderedList) {
          nonListLines.push(`<ul class="my-6 list-disc pl-6 space-y-2">${unorderedListItems.join('')}</ul>`);
          unorderedListItems.length = 0;
          inUnorderedList = false;
        }
        if (inOrderedList) {
          nonListLines.push(`<ol class="my-6 list-decimal pl-6 space-y-2">${orderedListItems.join('')}</ol>`);
          orderedListItems.length = 0;
          inOrderedList = false;
        }
        nonListLines.push(trimmedLine);
      }
    }

    // Закрываем оставшиеся списки
    if (inUnorderedList && unorderedListItems.length > 0) {
      return `<ul class="my-6 list-disc pl-6 space-y-2">${unorderedListItems.join('')}</ul>`;
    }
    if (inOrderedList && orderedListItems.length > 0) {
      return `<ol class="my-6 list-decimal pl-6 space-y-2">${orderedListItems.join('')}</ol>`;
    }

    // Обычный параграф
    if (nonListLines.length > 0) {
      return `<p class="mb-4 leading-relaxed">${nonListLines.join('<br>')}</p>`;
    }

    return '';
  });

  return processedBlocks.filter(block => block).join('\n\n');
}