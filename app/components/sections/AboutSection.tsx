import { Sparkles } from 'lucide-react';
import { CareerTimelineItem } from '@/app/data/content';
import { CareerTimeline } from './CareerTimeline';

type AboutSectionProps = {
  title: string;
  description: string;
  textSecondaryClass: string;
  cardBgClass: string;
  careerTimeline: CareerTimelineItem[];
  darkMode: boolean;
};

export function AboutSection({
  title,
  description,
  textSecondaryClass,
  cardBgClass,
  careerTimeline,
  darkMode,
}: AboutSectionProps) {
  return (
    <section id="about" className="mb-24 scroll-mt-24">
      <div className={`relative overflow-hidden ${cardBgClass} rounded-3xl border p-10`}>
        <div
          className={`absolute top-0 right-0 w-64 h-64 ${
            darkMode ? 'bg-linear-to-br from-cyan-500/20 to-purple-500/20' : 'bg-linear-to-br from-cyan-500/10 to-purple-500/10'
          } rounded-full blur-3xl`}
        />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            {title || 'About Me'}
          </h2>
          <div className={`space-y-4 ${textSecondaryClass} leading-relaxed`}>

            <div dangerouslySetInnerHTML={{ __html: description }}>
            </div>

            <CareerTimeline items={careerTimeline} textSecondaryClass={textSecondaryClass} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </section>
  );
}

