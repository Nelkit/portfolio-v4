import { LucideIcon } from 'lucide-react';
import { Brain, Globe, Layers, Smartphone } from 'lucide-react';

export type NavLink = {
  label: string;
  href: string;
};

export type SkillCategory = {
  key: string;
  label: string;
  gradient: string;
  description: string;
  emphasis: string;
  skills: string[];
  isFeatured: boolean;
};

export type Expertise = {
  code: string;
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  tech: string[];
  color: string;
  icon: LucideIcon;
  expertise_area: string;
  image: string;
};

export type EducationItem = {
  degree: string;
  institution: string;
  period: string;
  description: string;
  status: 'In Progress' | 'Completed';
};

export type CareerTimelineItem = {
  period: string;
  title: string;
  detail: string;
  accent: string;
};

// Icon mapping for Strapi data
const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  globe: Globe,
  layers: Layers,
  smartphone: Smartphone,
};

// Gradient mapping for Strapi data (Tailwind CSS classes)
const gradientMap: Record<string, string> = {
  'from-purple-500 via-pink-500 to-rose-500': 'from-purple-500 via-pink-500 to-rose-500',
  'from-cyan-500 via-blue-500 to-indigo-500': 'from-cyan-500 via-blue-500 to-indigo-500',
  'from-orange-500 via-amber-500 to-red-600': 'from-orange-500 via-amber-500 to-red-600',
  'from-green-500 via-emerald-500 to-lime-500': 'from-green-500 via-emerald-500 to-lime-500',
  'from-gray-500 to-gray-600': 'from-gray-500 to-gray-600',
};

// Color mapping for Strapi data (Tailwind CSS classes)
const colorMap: Record<string, string> = {
  'from-purple-500 to-pink-600': 'from-purple-500 to-pink-600',
  'from-cyan-500 to-blue-600': 'from-cyan-500 to-blue-600',
  'from-orange-500 to-red-600': 'from-orange-500 to-red-600',
  'from-green-500 to-emerald-600': 'from-green-500 to-emerald-600',
};

// Accent mapping for Strapi data (Tailwind CSS classes)
const accentMap: Record<string, string> = {
  'text-cyan-400': 'text-cyan-400',
  'text-purple-400': 'text-purple-400',
  'text-indigo-400': 'text-indigo-400',
  'text-emerald-400': 'text-emerald-400',
  'text-amber-400': 'text-amber-400',
  'text-orange-400': 'text-orange-400',
  'text-pink-400': 'text-pink-400',
};

// Function to get icon from string
export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Brain;
}

// Function to get gradient class from string
export function getGradient(gradient: string): string {
  return gradientMap[gradient] || 'from-gray-500 to-gray-600';
}

// Function to get color class from string
export function getColor(color: string): string {
  return colorMap[color] || 'from-gray-500 to-gray-600';
}

// Function to get accent class from string
export function getAccent(accent: string): string {
  return accentMap[accent] || 'text-gray-400';
}

// Default nav links (fallback if not provided by Strapi)
export const navLinks: NavLink[] = [
  { label: 'Overview', href: '#overview' },
  { label: 'Work', href: '#projects' },
  { label: 'Stack', href: '#skills' },
  { label: 'Career', href: '#about' },
  { label: 'Writing', href: '#writing' },
  { label: 'Contact', href: '#contacto' },
];

// Transform Strapi expertise areas to Expertise type
export function transformExpertiseAreas(strapiAreas: any[]): Expertise[] {
  return strapiAreas.map((area) => ({
    code: area.code,
    title: area.title,
    icon: getIcon(area.icon),
    color: getColor(area.color),
    description: area.description,
  }));
}

// Transform Strapi skill categories to SkillCategory type
export function transformSkillCategories(strapiCategories: any[]): SkillCategory[] {
  return strapiCategories.map((category) => ({
    key: category.code,
    label: category.label,
    gradient: getGradient(category.gradient),
    description: category.description,
    emphasis: category.emphasis,
    skills: category.skills?.map((s: any) => s.title) || [],
    isFeatured: category.isFeatured || false,
  }));
}

// Transform Strapi projects to Project type
export function transformProjects(strapiProjects: any[], strapiUrl: string = ''): Project[] {
  return strapiProjects.map((project) => ({
    slug: project.documentId || String(project.id),
    title: project.title,
    description: project.description,
    tech: project.skills?.map((s: any) => s.title) || [],
    color: getColor(project.color),
    icon: getIcon(project.icon),
    expertise_area: project.expertiseArea?.code || 'full-stack',
    image: project.image?.url ? `${strapiUrl}${project.image.url}` : '',
  }));
}

// Transform Strapi education entries to EducationItem type
export function transformEducationEntries(strapiEntries: any[]): EducationItem[] {
  return strapiEntries.map((entry) => ({
    degree: entry.degree,
    institution: entry.institution,
    period: entry.period,
    description: entry.description,
    status: entry.completionStatus === 'In Progress' ? 'In Progress' : 'Completed',
  }));
}

// Transform Strapi career entries to CareerTimelineItem type
export function transformCareerEntries(strapiEntries: any[]): CareerTimelineItem[] {
  return strapiEntries.map((entry) => ({
    period: entry.period,
    title: entry.title,
    detail: entry.detail,
    accent: getAccent(entry.accent),
  }));
}

// Fallback/empty data - will be populated from Strapi
export const skillCategories: SkillCategory[] = [];
export const expertise: Expertise[] = [];
export const projects: Project[] = [];
export const education: EducationItem[] = [];
export const careerTimeline: CareerTimelineItem[] = [];
