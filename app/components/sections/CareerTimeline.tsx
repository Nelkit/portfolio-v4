import { CareerTimelineItem } from '@/app/data/content';

type CareerTimelineProps = {
  items: CareerTimelineItem[];
  textSecondaryClass: string;
  darkMode: boolean;
};

export function CareerTimeline({ items, textSecondaryClass, darkMode }: CareerTimelineProps) {
  return (
    <section className="mt-10 scroll-mt-24">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-2xl font-bold">Career Timeline</h2>
      </div>
      <div className="relative pl-9">
        <div className={`absolute left-4 top-0 bottom-0 w-px ${darkMode ? 'bg-white/15' : 'bg-slate-200/70'} rounded-full`} />
        {items.map((item) => (
          <div key={item.period} className="relative pb-8 last:pb-0">
            <div className="absolute -left-8 top-1.5 w-6 h-6">
              <div
                className={`w-full h-full rounded-full border-2 ${
                  darkMode ? 'border-white/30 bg-slate-900/40' : 'border-white/70 bg-white/60'
                } flex items-center justify-center`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${darkMode ? 'bg-white' : 'bg-slate-600'}`} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base pt-2">
              <span className={`font-semibold ${item.accent}`}>{item.period}</span>
              <p className={`flex-1 ${textSecondaryClass}`}>
                {item.title} · {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

