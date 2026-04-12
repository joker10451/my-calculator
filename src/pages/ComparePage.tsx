import { useState, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, XCircle, Minus, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { COMPARISONS, type ComparisonConfig } from '@/data/comparisons';

const SITE_URL = 'https://schitay-online.ru';

function ComparisonTable({ rows, leftLabel, rightLabel }: { rows: ComparisonConfig['tableRows']; leftLabel: string; rightLabel: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Критерий</th>
            <th className="text-center py-3 px-4 text-blue-400 font-bold">{leftLabel}</th>
            <th className="text-center py-3 px-4 text-violet-400 font-bold">{rightLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-slate-800/30' : ''}>
              <td className="py-3 px-4 text-slate-300 font-medium">{row.criterion}</td>
              <td className="py-3 px-4 text-center text-slate-200">{row.left}</td>
              <td className="py-3 px-4 text-center text-slate-200">{row.right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FAQSection({ items }: { items: ComparisonConfig['faq'] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="surface-card overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full p-5 text-left flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
          >
            <span className="font-bold text-slate-200 text-sm">{item.question}</span>
            <ChevronDown className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
          </button>
          {openIndex === i && (
            <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-700/50 pt-3">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CalcSkeleton() {
  return (
    <div className="surface-card p-6 animate-pulse">
      <div className="h-6 bg-slate-700 rounded w-1/3 mb-6" />
      <div className="space-y-4">
        <div className="h-10 bg-slate-700 rounded" />
        <div className="h-10 bg-slate-700 rounded" />
        <div className="h-10 bg-slate-700 rounded" />
      </div>
    </div>
  );
}

function OtherComparisons({ currentSlug }: { currentSlug: string }) {
  const others = COMPARISONS.filter(c => c.slug !== currentSlug);
  if (others.length === 0) return null;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {others.map(c => (
        <Link
          key={c.slug}
          to={`/compare/${c.slug}/`}
          className="surface-card surface-card-hover p-5 flex items-center gap-4"
        >
          <span className="text-2xl">{c.left.emoji}</span>
          <span className="text-slate-500 font-bold text-xs">VS</span>
          <span className="text-2xl">{c.right.emoji}</span>
          <div className="ml-2">
            <div className="text-sm font-bold text-slate-200">{c.left.label}</div>
            <div className="text-xs text-slate-500">vs {c.right.label}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 ml-auto" />
        </Link>
      ))}
    </div>
  );
}

export default function ComparePage({ config }: { config: ComparisonConfig }) {
  const [LeftCalc, setLeftCalc] = useState<React.ComponentType | null>(null);
  const [RightCalc, setRightCalc] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    config.left.calculator().then(m => setLeftCalc(() => m.default));
    config.right.calculator().then(m => setRightCalc(() => m.default));
  }, [config]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faq.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Helmet>
        <title>{config.title}</title>
        <meta name="description" content={config.description} />
        <meta name="keywords" content={config.keywords} />
        <link rel="canonical" href={config.canonical} />
        <meta property="og:title" content={config.title} />
        <meta property="og:description" content={config.description} />
        <meta property="og:url" content={config.canonical} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="text-5xl">{config.left.emoji}</span>
              <span className="text-2xl font-black text-slate-500">VS</span>
              <span className="text-5xl">{config.right.emoji}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tight leading-[1.15]">
              {config.h1}
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              {config.description}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-16">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-blue-400 flex items-center gap-2">
                  {config.left.emoji} {config.left.label}
                </h2>
                <Link to={config.left.link} className="text-xs text-primary hover:underline flex items-center gap-1">
                  Полная версия <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {LeftCalc ? <LeftCalc /> : <CalcSkeleton />}
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-violet-400 flex items-center gap-2">
                  {config.right.emoji} {config.right.label}
                </h2>
                <Link to={config.right.link} className="text-xs text-primary hover:underline flex items-center gap-1">
                  Полная версия <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {RightCalc ? <RightCalc /> : <CalcSkeleton />}
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <div className="surface-card p-6 md:p-8 bg-gradient-to-br from-blue-500/5 to-violet-500/5 border border-blue-500/10">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-black text-slate-100">Итог: что выбрать?</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">{config.verdict}</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-black text-slate-100 mb-6">
              {config.left.label} vs {config.right.label} — сравнение
            </h2>
            <div className="surface-card overflow-hidden">
              <ComparisonTable rows={config.tableRows} leftLabel={config.left.label} rightLabel={config.right.label} />
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-black text-slate-100 mb-6">Частые вопросы</h2>
            <FAQSection items={config.faq} />
          </div>

          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-2xl font-black text-slate-100 mb-6">Другие сравнения</h2>
            <OtherComparisons currentSlug={config.slug} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
