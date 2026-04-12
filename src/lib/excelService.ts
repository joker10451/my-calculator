/**
 * Excel export service для калькуляторов Считай.RU
 * Использует SheetJS (xlsx)
 */

/** Строка данных для Excel */
export interface ExcelRow {
  label: string;
  value: string | number;
}

/** Опции экспорта */
export interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  title?: string;
  rows: ExcelRow[];
  tableRows?: Array<Record<string, string | number>>;
  tableHeaders?: string[];
}

/**
 * Создаёт и скачивает Excel-файл с результатами расчёта.
 * Lazy-импортирует xlsx только при первом вызове.
 */
export async function exportToExcel(options: ExcelExportOptions): Promise<void> {
  const XLSX = await import('xlsx');

  const {
    fileName = 'расчёт',
    sheetName = 'Результаты',
    title = 'Результаты расчёта — Считай.RU',
    rows,
    tableRows,
    tableHeaders,
  } = options;

  // Заголовок
  const headerRows: (string | number | null)[][] = [
    [title],
    [`Дата: ${new Date().toLocaleDateString('ru-RU')}`],
    [],
  ];

  // Основные результаты
  const summaryRows: (string | number | null)[][] = [
    ['Показатель', 'Значение'],
    ...rows.map(r => [r.label, r.value]),
    [],
  ];

  // Табличные данные (например, график платежей)
  const tableSection: (string | number | null)[][] = [];
  if (tableRows && tableRows.length > 0 && tableHeaders) {
    tableSection.push(tableHeaders);
    tableRows.forEach(row => {
      tableSection.push(tableHeaders.map(h => row[h] ?? ''));
    });
  }

  const allData: (string | number | null)[][] = [
    ...headerRows,
    ...summaryRows,
    ...tableSection,
  ];

  const ws = XLSX.utils.aoa_to_sheet(allData);

  // Стиль колонок
  ws['!cols'] = [{ wch: 35 }, { wch: 25 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const safeFileName = `${fileName.replace(/[^а-яёa-z0-9\-_]/gi, '_')}_${new Date().getFullYear()}`;
  XLSX.writeFile(wb, `${safeFileName}.xlsx`);
}

/**
 * Извлекает строки из DOM-элемента результатов (переиспользует логику pdfService).
 * Ищет пары label-value в таблицах и dl/dt/dd.
 */
export function extractRowsFromElement(container: HTMLElement): ExcelRow[] {
  const rows: ExcelRow[] = [];

  // Ищем таблицы
  container.querySelectorAll('table tr').forEach(tr => {
    const cells = tr.querySelectorAll('td, th');
    if (cells.length >= 2) {
      rows.push({
        label: cells[0].textContent?.trim() || '',
        value: cells[1].textContent?.trim() || '',
      });
    }
  });

  // Ищем dl > dt + dd
  container.querySelectorAll('dl').forEach(dl => {
    const dts = dl.querySelectorAll('dt');
    const dds = dl.querySelectorAll('dd');
    dts.forEach((dt, i) => {
      if (dds[i]) {
        rows.push({
          label: dt.textContent?.trim() || '',
          value: dds[i].textContent?.trim() || '',
        });
      }
    });
  });

  return rows;
}
