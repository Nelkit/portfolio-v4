import { Github, Linkedin, Mail } from 'lucide-react';

type FooterSectionProps = {
  cardBgClass: string;
  textTertiaryClass: string;
  darkMode: boolean;
};

export function FooterSection({ cardBgClass, textTertiaryClass, darkMode }: FooterSectionProps) {
  return (
    <footer id="contacto" className="text-center pb-12 scroll-mt-24">
      <div className={`${cardBgClass} rounded-3xl border p-8`}>
        <p className={`${textTertiaryClass} mb-4`}>Let&rsquo;s build something amazing together</p>
        <div className="flex justify-center gap-6">
          <a
            href="mailto:contact@nelkit.dev"
            className="text-cyan-500 hover:text-cyan-600 transition-colors hover:scale-110 transform duration-200"
          >
            <Mail className="w-6 h-6" />
          </a>
          <a
            href="https://github.com"
            className="text-cyan-500 hover:text-cyan-600 transition-colors hover:scale-110 transform duration-200"
          >
            <Github className="w-6 h-6" />
          </a>
          <a
            href="https://linkedin.com"
            className="text-cyan-500 hover:text-cyan-600 transition-colors hover:scale-110 transform duration-200"
          >
            <Linkedin className="w-6 h-6" />
          </a>
        </div>
        <p className={`${darkMode ? 'text-slate-500' : 'text-slate-400'} text-sm mt-6`}>
          © 2026 Nelkit Chavez. Crafted with passion.
        </p>
      </div>
    </footer>
  );
}

