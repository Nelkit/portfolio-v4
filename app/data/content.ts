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
};

export type Expertise = {
  code: string;
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
};

export type Project = {
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

export const navLinks: NavLink[] = [
  { label: 'Home', href: '#overview' },
  { label: 'Projects', href: '#projects' },
  { label: 'Tech Stack', href: '#skills' },
  { label: 'Education', href: '#education' },
  { label: 'About Me', href: '#about' },
  { label: 'Blog', href: '/blog' },
];

export const skillCategories: SkillCategory[] = [
  {
    key: 'ai',
    label: 'AI & Innovation',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    description:
      'Bringing AI-assisted features into products through data science rigor.',
    emphasis: 'UTS Master’s research focused on ML-powered UX enhancements.',
    skills: [
      'Data Science',
      'Machine Learning',
      'AI Integration',
      'TensorFlow',
      'LangChain',
      'Data Storytelling',
    ],
  },
  {
    key: 'mobile',
    label: 'Mobile Development',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    description:
      'Native iOS and cross-platform builds with buttery-smooth experiences.',
    emphasis: 'Crafted 15+ consumer and enterprise apps.',
    skills: ['Swift', 'SwiftUI', 'Flutter', 'React Native', 'UIKit', 'Core Animation'],
  },
  {
    key: 'backend',
    label: 'Backend & Data',
    gradient: 'from-orange-500 via-amber-500 to-red-600',
    description: 'Reliable APIs, realtime sync, and data pipelines powering products.',
    emphasis: 'Designing resilient services with observability baked in.',
    skills: ['Django', 'RESTful APIs', 'CloudKit', 'CoreData', 'RealmDB', 'PostgreSQL'],
  },
  {
    key: 'frontend',
    label: 'Frontend & Design',
    gradient: 'from-green-500 via-emerald-500 to-lime-500',
    description: 'Immersive web experiences with meticulous attention to detail.',
    emphasis: 'Responsive design systems crafted with accessibility in mind.',
    skills: ['React', 'Next.js', 'Astro', 'Tailwind CSS', 'Framer Motion', 'Mapbox'],
  },
];

export const expertise: Expertise[] = [
  {
    code: 'ai',
    title: 'AI & Data Science',
    icon: Brain,
    color: 'from-purple-500 to-pink-600',
    description: "Master's in Data Science & Innovation at UTS",
  },
  {
    code: 'mobile',
    title: 'Mobile Innovation',
    icon: Smartphone,
    color: 'from-cyan-500 to-blue-600',
    description: '7+ years crafting native & hybrid mobile experiences',
  },
  {
    code: 'full-stack',
    title: 'Full-Stack Dev',
    icon: Layers,
    color: 'from-orange-500 to-red-600',
    description: 'Backend with Django, Frontend with modern frameworks',
  },
  {
    code: 'gis',
    title: 'GIS & Web',
    icon: Globe,
    color: 'from-green-500 to-emerald-600',
    description: 'Freelance GIS development & web solutions',
  },
];

export const projects: Project[] = [
  {
    title: 'E-Commerce Mobile App',
    description:
      'Full-featured iOS shopping application with real-time inventory, payment integration, and personalized recommendations.',
    tech: ['Swift', 'SwiftUI', 'CoreData', 'CloudKit'],
    color: 'from-cyan-500 to-blue-600',
    icon: Smartphone,
    expertise_area: 'mobile',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Health Tracking Platform',
    description:
      'Cross-platform health monitoring app with ML-powered insights and seamless data synchronization.',
    tech: ['Flutter', 'Django', 'TensorFlow', 'PostgreSQL'],
    color: 'from-purple-500 to-pink-600',
    icon: Brain,
    expertise_area: 'ai',
    image:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'GIS Analytics Dashboard',
    description:
      'Interactive web-based GIS platform for spatial data visualization and real-time geographic analysis.',
    tech: ['React', 'Mapbox', 'Python', 'PostGIS'],
    color: 'from-green-500 to-emerald-600',
    icon: Globe,
    expertise_area: 'gis',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Social Media Mobile Client',
    description:
      'High-performance social networking app with real-time messaging, media sharing, and engagement features.',
    tech: ['React Native', 'Firebase', 'Redux', 'WebSocket'],
    color: 'from-orange-500 to-red-600',
    icon: Layers,
    expertise_area: 'full-stack',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
  },
];

export const education: EducationItem[] = [
  {
    degree: 'Master of Data Science and Innovation',
    institution: 'University of Technology Sydney (UTS)',
    period: '2024 - Present',
    description:
      'Specializing in artificial intelligence, machine learning, and innovative technology applications in software development.',
    status: 'In Progress',
  },
  {
    degree: 'Bachelor of Software Engineering',
    institution: 'University',
    period: '2013 - 2017',
    description:
      'Foundation in computer science, software architecture, algorithms, and mobile application development.',
    status: 'Completed',
  },
];

export const careerTimeline: CareerTimelineItem[] = [
  {
    period: '2025 – Present',
    title: 'AI Engineer in Training',
    detail: 'Master of Data Science & Innovation · UTS',
    accent: 'text-cyan-400',
  },
  {
    period: 'Oct 2022 – Feb 2025',
    title: 'Freelance Web & GIS Developer',
    detail: 'Consultant',
    accent: 'text-purple-400',
  },
  {
    period: 'Sep 2021 – Sep 2022',
    title: 'Sr Mobile Apps Engineer',
    detail: 'Sumadi',
    accent: 'text-indigo-400',
  },
  {
    period: 'May 2019 – Oct 2021',
    title: 'Senior iOS Developer',
    detail: 'Ryte',
    accent: 'text-emerald-400',
  },
  {
    period: 'Apr 2017 – May 2019',
    title: 'Mobile Developer',
    detail: 'Locstatt',
    accent: 'text-amber-400',
  },
  {
    period: 'Jan 2016 – Apr 2017',
    title: 'Mobile and Web Developer',
    detail: 'Crayon Star',
    accent: 'text-orange-400',
  },
  {
    period: 'Jan 2011 – Dec 2015',
    title: 'Bachelor of Engineering in Information Technology and Communications',
    detail: 'Universidad Politécnica de Ingeniería',
    accent: 'text-pink-400',
  },
];

