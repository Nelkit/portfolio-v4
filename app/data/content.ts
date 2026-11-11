import { LucideIcon } from 'lucide-react';
import { Brain, Globe, Layers, Smartphone } from 'lucide-react';

/** Card shape rendered by the home projects section (adapted from ProjectView). */
export type ProjectLink = {
  label: string;
  url: string;
  type: 'github' | 'linkedin' | 'email' | 'link';
  isExternal: boolean;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  summary: string;
  company: string;
  tech: string[];
  color: string;
  icon: LucideIcon;
  expertise_area: string;
  /** Expertise area id (for filtering); null when the project has no area. */
  areaId?: number | null;
  image: string;
  screenshots: string[];
  links: ProjectLink[];
};

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  globe: Globe,
  layers: Layers,
  smartphone: Smartphone,
};

export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Brain;
}
