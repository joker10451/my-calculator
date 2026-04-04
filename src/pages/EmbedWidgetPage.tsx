import { useState } from 'react';
import { Code, Copy, Check, ExternalLink, Share2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { WIDGETS, generateEmbedCode, generateJSEmbedCode, type EmbedWidgetConfig } from '@/lib/embedWidgets';
import { useToast } from '@/hooks/use-toast';

const SITE_URL = 'https://schitay-online.ru';

export default function EmbedWidgetPage() {
  const { toast } = useToast();
  const [selectedWidget, setSelectedWidget] = useState<EmbedWidgetConfig>(WIDGETS[0]);
  const [embedType, setEmbedType] = useState<'html' | 'js'>('html');
  const [copied, setCopied] = useState(false);

  const embedCode = embedType === 'html'
    ? generateEmbedCode(selectedWidget)
    : generateJSEmbedCode(selectedWidget);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({ title: 'Скопировано!', description: 'Код виджета скопирован в буфер обмена' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
      <SEO
        title="Виджеты калькуляторов для встраивания на сайт"
        description="Встройте наши калькуляторы на свой сайт. Бесплатные виджеты для ипотеки, кредитов, вкладов и других расчётов. Обратные ссылки и трафик."
        keywords="виджет калькулятора, встроить калькулятор на сайт, ипотечный виджет, калькулятор для сайта"
        canonical={`${SITE_URL}/widgets`}
      />
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Code className="w-4 h-4" />
            Бесплатные виджеты
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
            Встройте <span className="text-blue-600">калькуляторы</span> на свой сайт
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Выберите калькулятор, скопируйте код и вставьте на свой сайт. Бесплатно, с обратной ссылкой.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Widget Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {WIDGETS.map(widget => (
              <button
                key={widget.calculatorId}
                onClick={() => setSelectedWidget(widget)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedWidget.calculatorId === widget.calculatorId
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 mb-1">{widget.title}</div>
                <div className="text-xs text-slate-500 line-clamp-2">{widget.description}</div>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">{selectedWidget.title}</h2>
                <p className="text-sm text-slate-500">{selectedWidget.description}</p>
              </div>
              <a
                href={`/calculator/${selectedWidget.calculatorId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:underline"
              >
                Открыть
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="p-6 bg-slate-50">
              <iframe
                src={`${SITE_URL}/embed/${selectedWidget.calculatorId}`}
                width="100%"
                height={selectedWidget.height || '500px'}
                frameBorder="0"
                style={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}
                title={selectedWidget.title}
              />
            </div>
          </div>

          {/* Embed Type Toggle */}
          <div className="flex gap-2 mb-4">
            {(['html', 'js'] as const).map(type => (
              <button
                key={type}
                onClick={() => setEmbedType(type)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  embedType === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'html' ? 'HTML (iframe)' : 'JavaScript'}
              </button>
            ))}
          </div>

          {/* Code Block */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <span className="text-slate-400 text-sm font-medium">Код для встраивания</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
            <pre className="p-6 text-sm text-slate-300 overflow-x-auto max-h-64">
              <code>{embedCode}</code>
            </pre>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-2xl border-2 border-blue-100 p-8">
            <h3 className="font-black text-blue-900 text-lg mb-4">Как встроить виджет?</h3>
            <div className="space-y-3 text-blue-800">
              <p className="font-medium">1. Скопируйте код виджета</p>
              <p className="font-medium">2. Вставьте код в HTML-код вашей страницы</p>
              <p className="font-medium">3. Виджет появится на вашем сайте с обратной ссылкой на Считай.RU</p>
            </div>
            <div className="mt-6 flex gap-3">
              <a
                href="/all"
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Все калькуляторы
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
