import { Database } from 'lucide-react';
import { SkillCategory } from '@/app/data/content';

type SkillsSectionProps = {
  title?: string;
  subtitle?: string;
  skillCategories: SkillCategory[];
  selectedSkillCategory: string;
  onSelectSkillCategory: (key: string) => void;
  activeSkillCategory: SkillCategory;
  featuredCategory?: SkillCategory;
  textSecondaryClass: string;
  textTertiaryClass: string;
  cardBgClass: string;
  cardHoverClass: string;
  darkMode: boolean;
};

export function SkillsSection({
  title,
  subtitle,
  skillCategories,
  selectedSkillCategory,
  onSelectSkillCategory,
  activeSkillCategory,
  featuredCategory,
  textSecondaryClass,
  textTertiaryClass,
  cardBgClass,
  cardHoverClass,
  darkMode,
}: SkillsSectionProps) {
  return (
    <section id="skills" className="mb-24 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
        <span className="w-10 h-10 rounded-2xl bg-orange-400/15 flex items-center justify-center text-orange-300">
          <Database className="w-6 h-6" />
        </span>
        {title || 'Tech Stack'}
      </h2>
      <p className={`${textSecondaryClass} mb-6 max-w-3xl`}>
        {subtitle || ''}
      </p>
      <div className="flex flex-wrap gap-3 mb-10">
        {skillCategories.map((category) => {
          const isActive = selectedSkillCategory === category.key;
          const isFeatured = category.isFeatured;

          return !isFeatured && (
            <button
              key={category.key}
              onClick={() => onSelectSkillCategory(category.key)}
              className={`px-5 py-2 cursor-pointer rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? `text-white bg-linear-to-r ${category.gradient} shadow-lg shadow-slate-500/20`
                  : `${textTertiaryClass} ${darkMode ? 'bg-white/5' : 'bg-white/60'}`
              }`}
            >
              {category.label} {category.isFeatured}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${cardBgClass} rounded-3xl border p-8 ${cardHoverClass}`}>
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-400 mb-3">{activeSkillCategory.label}</p>
          <h3 className="text-3xl font-bold mb-4">{activeSkillCategory.emphasis}</h3>
          <p className={`${textSecondaryClass} max-w-2xl`}>{activeSkillCategory.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            {activeSkillCategory.skills.map((skill) => (
              <div
                key={skill}
                className={`px-4 py-3 rounded-2xl border text-sm font-semibold ${
                  darkMode ? 'border-white/10 bg-white/5' : 'border-white/60 bg-white/70'
                }`}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {featuredCategory && (
          <div className={`relative overflow-hidden ${cardBgClass} rounded-3xl border p-8 flex flex-col justify-between`}>
            <div
              className={`absolute inset-0 bg-linear-to-br ${
                darkMode ? 'from-purple-500/40 via-pink-500/30 to-rose-500/20' : 'from-purple-500/70 via-pink-500/60 to-rose-500/50'
              }`}
            />
            <div className="relative z-10">
              <p className="text-sm uppercase tracking-[0.4em] text-white/70">{featuredCategory.label}</p>
              <h3 className="text-3xl font-bold mt-3 text-white">{featuredCategory.description }</h3>
              <p className="text-white/80 mt-4">
                {featuredCategory.emphasis}
              </p>
            </div>
            <div className="relative z-10 mt-8 flex flex-wrap gap-2">
              {featuredCategory.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 text-xs font-semibold rounded-full bg-white/15 text-white">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

