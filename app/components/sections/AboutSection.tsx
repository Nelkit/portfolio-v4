import { Sparkles } from 'lucide-react';
import { CareerTimelineItem } from '@/app/data/content';
import { CareerTimeline } from './CareerTimeline';

type AboutSectionProps = {
  textSecondaryClass: string;
  cardBgClass: string;
  careerTimeline: CareerTimelineItem[];
  darkMode: boolean;
};

export function AboutSection({
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
            About Me
          </h2>
          <div className={`space-y-4 ${textSecondaryClass} leading-relaxed`}>
            <p>
              I’m a <span className="text-cyan-400 font-semibold">Software and AI Engineer</span> from{' '}
              <span className="text-cyan-400 font-semibold">Honduras</span> with over{' '}
              <span className="text-cyan-400 font-semibold">seven years</span> of experience building mobile applications and scalable digital products using Swift, React Native, Flutter, Django, ReactJS, Astro, and modern cloud services.
            </p>
            <p>
              I graduated <span className="text-purple-400 font-semibold">Summa Cum Laude</span> with a Bachelor of Software Engineering and later became a recipient of the{' '}
              <span className="text-pink-400 font-semibold">HonduFuturo 2024 Scholarship</span>, a program that supports high-impact professionals to study abroad.
            </p>
            <p>
              Today, I’m expanding my expertise into <span className="text-purple-400 font-semibold">Artificial Intelligence</span> and{' '}
              <span className="text-purple-400 font-semibold">Machine Learning</span>. I am currently pursuing a{' '}
              <span className="text-pink-400 font-semibold">Master’s in Data Science and Innovation</span> at the University of Technology Sydney, where I focus on AI-powered UX, machine-learning experimentation, data engineering, and{' '}
              <span className="text-purple-400 font-semibold">ML microservices</span>.
            </p>
            <p>
              I bring a multidisciplinary mindset that blends software engineering, product design, and data science. I am passionate about creating intelligent, high-quality digital experiences and exploring how AI can transform products, industries, and access to technology in developing countries.
            </p>

            <CareerTimeline items={careerTimeline} textSecondaryClass={textSecondaryClass} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </section>
  );
}

