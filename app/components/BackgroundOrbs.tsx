type BackgroundOrbsProps = {
  scrollY: number;
  darkMode: boolean;
};

export function BackgroundOrbs({ scrollY, darkMode }: BackgroundOrbsProps) {
  const orbColorDark = darkMode ? 'bg-cyan-500/20' : 'bg-cyan-500/10';
  const orbColorPurple = darkMode ? 'bg-purple-500/20' : 'bg-purple-500/10';
  const orbColorPink = darkMode ? 'bg-pink-500/10' : 'bg-pink-500/8';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className={`absolute top-1/4 -left-48 w-96 h-96 ${orbColorDark} rounded-full blur-3xl animate-pulse`}
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />
      <div
        className={`absolute bottom-1/4 -right-48 w-96 h-96 ${orbColorPurple} rounded-full blur-3xl animate-pulse`}
        style={{ transform: `translateY(${-scrollY * 0.2}px)`, animationDelay: '1s' }}
      />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${orbColorPink} rounded-full blur-3xl animate-pulse`}
        style={{ animationDelay: '2s' }}
      />
    </div>
  );
}

