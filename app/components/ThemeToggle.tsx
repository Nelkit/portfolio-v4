import { Moon, Sun } from 'lucide-react';

type ThemeToggleProps = {
  darkMode: boolean;
  onToggle: () => void;
};

export function ThemeToggle({ darkMode, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 50,
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.15s',
        color: 'var(--text-secondary)',
      }}
    >
      {darkMode ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
