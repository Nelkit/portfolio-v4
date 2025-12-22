import { Award, Calendar, GraduationCap } from 'lucide-react';
import { EducationItem } from '@/app/data/content';

type EducationSectionProps = {
  title: string;
  education: EducationItem[];
  textSecondaryClass: string;
  textTertiaryClass: string;
  cardBgClass: string;
  cardHoverClass: string;
  darkMode: boolean;
};

export function EducationSection({
  title,
  education,
  textSecondaryClass,
  textTertiaryClass,
  cardBgClass,
  cardHoverClass,
  darkMode,
}: EducationSectionProps) {
  return (
    <section id="education" className="mb-24 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
        <GraduationCap className="w-8 h-8 text-cyan-400" />
        {title || 'Education'}
      </h2>
      <div className="relative pl-8">
        <div className={`absolute left-4 top-0 bottom-0 w-px ${darkMode ? 'bg-white/15' : 'bg-slate-200/70'} rounded-full`} />
        {education.map((edu) => (
          <div key={edu.degree} className="relative pb-12 last:pb-0">
            <div className="absolute -left-7 top-0 w-6 h-6">
              <div
                className={`w-full h-full rounded-full border-2 ${
                  edu.status === 'In Progress' ? 'border-purple-400' : 'border-emerald-400'
                } ${darkMode ? 'bg-slate-900/30' : 'bg-white/30'} backdrop-blur`}
              >
                <div className="absolute inset-0 rounded-full blur-xl bg-linear-to-br from-purple-500/30 to-pink-500/30" />
              </div>
            </div>
            <div className={`relative ml-6 ${cardBgClass} rounded-3xl border px-6 py-6 ${cardHoverClass}`}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {edu.status}
                  </p>
                  <h3 className="text-2xl font-bold mt-2">{edu.degree}</h3>
                  <p className="text-lg text-cyan-500 font-semibold">{edu.institution}</p>
                  <p className={`${textSecondaryClass} mt-4 leading-relaxed`}>{edu.description}</p>
                </div>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                    darkMode ? 'border-white/10 bg-white/5' : 'border-white/40 bg-white/50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className={`text-sm font-semibold ${textTertiaryClass}`}>{edu.period}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

