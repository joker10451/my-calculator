/**
 * Простой парсер Markdown для блога
 */

export function parseMarkdown(content: string): string {
  let html = content;

  // Заголовки
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Жирный текст
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Курсив
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Ссылки
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

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
    const listItems: string[] = [];
    const nonListLines: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^- /)) {
        listItems.push(`<li>${line.substring(2)}</li>`);
      } else if (line.match(/^\d+\. /)) {
        listItems.push(`<li>${line.replace(/^\d+\. /, '')}</li>`);
      } else {
        nonListLines.push(line);
      }
    }

    // Если есть элементы списка, создаем список
    if (listItems.length > 0) {
      return `<ul>${listItems.join('')}</ul>`;
    }

    // Обычный параграф
    return `<p>${nonListLines.join('<br>')}</p>`;
  });

  return processedBlocks.filter(block => block).join('\n\n');
}