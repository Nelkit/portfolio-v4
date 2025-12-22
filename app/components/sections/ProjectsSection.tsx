import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { Expertise, Project } from '@/app/data/content';

type ProjectsSectionProps = {
  title?: string;
  expertise: Expertise[];
  projects: Project[];
  activeExpertiseArea: Expertise;
  selectedExpertise: string;
  onSelectExpertise: (code: string) => void;
  textSecondaryClass: string;
  cardBgClass: string;
  cardHoverClass: string;
  darkMode: boolean;
};

export function ProjectsSection({
  title,
  expertise,
  projects,
  activeExpertiseArea,
  selectedExpertise,
  onSelectExpertise,
  textSecondaryClass,
  cardBgClass,
  cardHoverClass,
  darkMode,
}: ProjectsSectionProps) {
  return (
    <section id="projects" className="mb-24 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
        <activeExpertiseArea.icon className="w-8 h-8 text-purple-400" />
        {title || 'Projects'}
      </h2>
      <p className={`${textSecondaryClass} mb-6 max-w-3xl`}>{activeExpertiseArea.description}</p>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {expertise.map((item) => {
          const isActive = selectedExpertise === item.code;
          return (
            <button
              key={item.code}
              onClick={() => onSelectExpertise(item.code)}
              className={`group relative overflow-hidden ${cardBgClass} rounded-3xl border p-4 ${cardHoverClass} transition-all duration-500 hover:scale-105 cursor-pointer`}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${
                  isActive ? 'opacity-10' : ''
                }`}
              />
              <div className="flex items-center gap-2 relative z-10">
                <div
                  className={`w-10 h-10 bg-linear-to-br ${item.color} rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}
                >
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
              </div>
              <div
                className={`absolute -bottom-2 -right-2 w-24 h-24 bg-linear-to-br ${item.color} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${
                  isActive ? 'opacity-30' : ''
                }`}
              />
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects
          .filter((project) => project.expertise_area === selectedExpertise)
          .map((project, idx) => (
          <article
            key={project.title}
            className={`group flex flex-col ${cardBgClass} rounded-3xl border p-6 ${cardHoverClass} transition-all duration-500`}
          >
            <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
              <Image
                src={project.image}
                alt={project.title}
                fill
                priority={idx === 0}
                sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 45vw, 90vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-3 left-3 px-4 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold tracking-wide text-white uppercase">
                Case Study
              </div>
            </div>

            <div className="flex-1">
              <div className={`w-14 h-14 bg-linear-to-br ${project.color} rounded-2xl flex items-center justify-center mb-4`}>
                <project.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
              <p className={`${textSecondaryClass} mb-5 leading-relaxed`}>{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                      darkMode ? 'bg-white/5 border-white/15 text-white' : 'bg-white/70 border-slate-200/60 text-slate-700'
                    }`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <button className="mt-6 inline-flex items-center gap-2 text-cyan-400 font-semibold hover:gap-3 transition-all">
              Ver proyecto
              <ChevronRight className="w-4 h-4" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

