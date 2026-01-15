/**
 * Утилиты для экспорта данных в различные форматы
 */

/**
 * Экспорт данных в CSV
 */
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Получаем заголовки из первого объекта
  const headers = Object.keys(data[0]);
  
  // Создаем CSV строку
  const csvContent = [
    // Заголовки
    headers.join(','),
    // Данные
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Экранируем значения с запятыми и кавычками
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Добавляем BOM для корректного отображения кириллицы в Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Экспорт данных в Excel (простой формат)
 */
export function exportToExcel(data: Record<string, any>[], filename: string, sheetName: string = 'Sheet1') {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  
  // Создаем HTML таблицу для Excel
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
  html += `<x:Name>${sheetName}</x:Name>`;
  html += '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
  html += '<meta charset="UTF-8"></head><body>';
  html += '<table border="1">';
  
  // Заголовки
  html += '<thead><tr>';
  headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead>';
  
  // Данные
  html += '<tbody>';
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      html += `<td>${row[header] ?? ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></body></html>';

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, `${filename}.xls`);
}

/**
 * Экспорт данных в JSON
 */
export function exportToJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * Печать содержимого элемента
 */
export function printElement(elementId: string, title?: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        // Игнорируем ошибки CORS для внешних стилей
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title || 'Печать'}</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; padding: 20px; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Ждем загрузки контента перед печатью
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

/**
 * Создание уникальной ссылки для расшаривания результатов
 */
export function generateShareableLink(
  calculatorType: string,
  params: Record<string, any>
): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const encodedParams = btoa(JSON.stringify(params));
  return `${baseUrl}#/calculator/${calculatorType}?share=${encodedParams}`;
}

/**
 * Парсинг параметров из расшаренной ссылки
 */
export function parseShareableLink(): Record<string, any> | null {
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get('share');
  
  if (!shareParam) {
    return null;
  }

  try {
    const decoded = atob(shareParam);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error parsing shareable link:', error);
    return null;
  }
}

/**
 * Копирование текста в буфер обмена
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (error) {
        console.error('Fallback: Could not copy text', error);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Could not copy text', error);
    return false;
  }
}

/**
 * Вспомогательная функция для скачивания blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
