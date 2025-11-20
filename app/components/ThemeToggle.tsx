import { Moon, Sun } from 'lucide-react';

type ThemeToggleProps = {
  darkMode: boolean;
  onToggle: () => void;
  cardBgClass: string;
  cardHoverClass: string;
};

export function ThemeToggle({
  darkMode,
  onToggle,
  cardBgClass,
  cardHoverClass,
}: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`fixed top-6 right-6 z-50 p-4 ${cardBgClass} rounded-2xl border ${cardHoverClass} transition-all duration-300 hover:scale-110 group`}
      aria-label="Toggle theme"
    >
      {darkMode ? (
        <Sun className="w-6 h-6 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
      ) : (
        <Moon className="w-6 h-6 text-slate-700 group-hover:rotate-180 transition-transform duration-500" />
      )}
    </button>
  );
}

