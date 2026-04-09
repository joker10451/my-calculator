import { ShieldCheck, CalendarClock, FileText, Info } from 'lucide-react';
import { useEffect } from 'react';
import { trackUxEvent } from '@/lib/analytics/uxMetrics';

interface TrustInfoBlockProps {
  page: string;
  updatedAt: string;
  sourceLabel: string;
  methodology: string;
  forWho: string;
}

export function TrustInfoBlock({ page, updatedAt, sourceLabel, methodology, forWho }: TrustInfoBlockProps) {
  useEffect(() => {
    trackUxEvent('trust_block_view', {
      page,
      section: 'trust_block',
    });
  }, [page]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
      <h3 className="text-lg md:text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        Почему этому расчёту можно доверять
      </h3>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-slate-600" />
            Дата актуализации
          </div>
          <div className="text-sm text-slate-700">{updatedAt}</div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-slate-600" />
            Источник данных
          </div>
          <div className="text-sm text-slate-700">{sourceLabel}</div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 md:col-span-2">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-slate-600" />
            Методика
          </div>
          <div className="text-sm text-slate-700">{methodology}</div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 md:col-span-2">
          <div className="text-sm font-bold text-slate-900 mb-1">Кому подходит</div>
          <div className="text-sm text-slate-700">{forWho}</div>
        </div>
      </div>
    </section>
  );
}

