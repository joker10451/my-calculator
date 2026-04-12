import { SITE_URL } from '@/shared/constants';
/**
 * Виджет для встраивания калькуляторов на внешние сайты
 * Генерирует iframe-код для встраивания
 */

export interface EmbedWidgetConfig {
  calculatorId: string;
  title: string;
  description: string;
  width?: string;
  height?: string;
  theme?: 'light' | 'dark';
}

const WIDGETS: EmbedWidgetConfig[] = [
  {
    calculatorId: 'mortgage',
    title: 'Ипотечный калькулятор',
    description: 'Рассчитайте ежемесячный платёж и переплату по ипотеке',
    height: '600px',
  },
  {
    calculatorId: 'credit',
    title: 'Кредитный калькулятор',
    description: 'Рассчитайте платежи по потребительскому кредиту',
    height: '550px',
  },
  {
    calculatorId: 'overpayment',
    title: 'Калькулятор переплаты',
    description: 'Узнайте реальную переплату по кредиту',
    height: '500px',
  },
  {
    calculatorId: 'refinancing',
    title: 'Калькулятор рефинансирования',
    description: 'Рассчитайте выгоду от рефинансирования',
    height: '550px',
  },
  {
    calculatorId: 'deposit',
    title: 'Калькулятор вкладов',
    description: 'Рассчитайте доход по вкладу',
    height: '500px',
  },
  {
    calculatorId: 'salary',
    title: 'Калькулятор зарплаты',
    description: 'Рассчитайте зарплату после вычета НДФЛ',
    height: '500px',
  },
];

/**
 * Генерирует HTML-код для встраивания виджета
 */
export function generateEmbedCode(widget: EmbedWidgetConfig): string {
  const width = widget.width || '100%';
  const height = widget.height || '500px';
  const theme = widget.theme || 'light';
  const url = `${SITE_URL}/calculator/${widget.calculatorId}/?embed=1&theme=${theme}`;

  return `<div style="max-width: 800px; margin: 0 auto;">
  <iframe
    src="${url}"
    width="${width}"
    height="${height}"
    frameborder="0"
    style="border: 1px solid #e2e8f0; border-radius: 16px; width: 100%;"
    allow="clipboard-write"
    loading="lazy"
    title="${widget.title}"
  ></iframe>
  <p style="text-align: center; margin-top: 8px; font-size: 12px; color: #94a3b8;">
    Калькулятор предоставлен <a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: none;">Считай.RU</a>
  </p>
</div>`;
}

/**
 * Генерирует JavaScript-код для динамической вставки виджета
 */
export function generateJSEmbedCode(widget: EmbedWidgetConfig): string {
  const width = widget.width || '100%';
  const height = widget.height || '500px';
  const theme = widget.theme || 'light';
  const url = `${SITE_URL}/calculator/${widget.calculatorId}/?embed=1&theme=${theme}`;

  return `<div id="schitay-widget-${widget.calculatorId}"></div>
<script>
(function() {
  var container = document.getElementById('schitay-widget-${widget.calculatorId}');
  var wrapper = document.createElement('div');
  wrapper.style.maxWidth = '800px';
  wrapper.style.margin = '0 auto';
  
  var iframe = document.createElement('iframe');
  iframe.src = '${url}';
  iframe.width = '${width}';
  iframe.height = '${height}';
  iframe.frameBorder = '0';
  iframe.style.border = '1px solid #e2e8f0';
  iframe.style.borderRadius = '16px';
  iframe.style.width = '100%';
  iframe.allow = 'clipboard-write';
  iframe.loading = 'lazy';
  iframe.title = '${widget.title}';
  
  var credit = document.createElement('p');
  credit.style.textAlign = 'center';
  credit.style.marginTop = '8px';
  credit.style.fontSize = '12px';
  credit.style.color = '#94a3b8';
  var link = document.createElement('a');
  link.href = '${SITE_URL}';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.style.color = '#3b82f6';
  link.style.textDecoration = 'none';
  link.textContent = 'Считай.RU';
  credit.textContent = 'Калькулятор предоставлен ';
  credit.appendChild(link);
  
  wrapper.appendChild(iframe);
  wrapper.appendChild(credit);
  container.appendChild(wrapper);
})();
</script>`;
}

export { WIDGETS };
