import Link from 'next/link';
import { NavLink } from '@/app/data/content';

type MainNavProps = {
  links: NavLink[];
  textTertiaryClass: string;
  cardBgClass: string;
  cardHoverClass: string;
};

export function MainNav({
  links,
  textTertiaryClass,
  cardBgClass,
  cardHoverClass,
}: MainNavProps) {
  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center justify-center gap-4 px-6 py-3 rounded-3xl border ${cardBgClass} ${cardHoverClass}`}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-semibold tracking-wide uppercase ${textTertiaryClass} hover:text-cyan-400 transition-colors`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

