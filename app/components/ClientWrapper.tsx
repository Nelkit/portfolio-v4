'use client';

import { useEffect, useRef, useState } from 'react';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { ProjectsSection } from '@/app/components/sections/ProjectsSection';
import { SkillsSection } from '@/app/components/sections/SkillsSection';
import { CareerSection } from '@/app/components/sections/CareerSection';
import { EducationSection } from '@/app/components/sections/EducationSection';
import { RecentWritingSection } from '@/app/components/sections/RecentWritingSection';
import { FooterSection } from '@/app/components/sections/FooterSection';
import { MainNav } from '@/app/components/MainNav';
import { mediaUrl } from '@/app/lib/constant';
import {
	type SkillCategory,
	type Expertise as ExpertiseType,
	type BlogEntry,
	transformExpertiseAreas,
	transformSkillCategories,
	transformProjects,
	transformCareerEntries,
	transformEducationEntries,
} from '@/app/data/content';

import { IHelp } from '@/app/components/icons';

type ClientWrapperProps = { strapiData: any; recentPosts: BlogEntry[] };

const THEME_CYCLE: ('plum' | 'light')[] = ['plum', 'light'];

export function ClientWrapper({ strapiData, recentPosts }: ClientWrapperProps) {
	const [theme, setTheme] = useState<'plum' | 'light'>('plum');
	const [navShow, setNavShow] = useState(false);
	const heroRef = useRef<HTMLElement | null>(null);

	const data = strapiData?.data || {};
	const { title, subtitle, description, headline, avatarImage, socialNetworkLinks, resume, ctaSection } = data;
	const resumeUrl = mediaUrl(resume?.url) || undefined;

	const expertise: ExpertiseType[] = data.projectSection?.expertiseAreas
		? transformExpertiseAreas(data.projectSection.expertiseAreas)
		: [];

	const skillCategories: SkillCategory[] = data.techStackSection?.skillCategories
		? transformSkillCategories(data.techStackSection.skillCategories)
		: [];

	const projectSectionTitle: string = data.projectSection?.title || 'Selected work';
	const projects = data.projectSection?.projects
		? transformProjects(data.projectSection.projects)
		: [];

	const careerSectionTitle: string = data.careerSection?.title || 'Career';
	const careerTimeline = data.careerSection?.careerEntries
		? transformCareerEntries(data.careerSection.careerEntries)
		: [];

	const education = data.educationSection?.educationEntries
		? transformEducationEntries(data.educationSection.educationEntries)
		: [];

	// Apply theme to <html>
	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		// persist
		try { localStorage.setItem('portfolio-theme', theme); } catch {}
	}, [theme]);

	// Restore persisted theme
	useEffect(() => {
		try {
			const saved = localStorage.getItem('portfolio-theme') as 'plum' | 'light' | null;
			if (saved && THEME_CYCLE.includes(saved)) setTheme(saved);
		} catch {}
	}, []);

	// Floating nav scroll trigger
	useEffect(() => {
		const onScroll = () => {
			const h = heroRef.current;
			const trigger = h ? h.offsetHeight - 140 : window.innerHeight * 0.7;
			setNavShow(window.scrollY > trigger);
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, []);

	const toggleTheme = () => {
		const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
		setTheme(next);
	};

	const navTo = (id: string) => {
		if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
		const el = document.getElementById(id);
		if (el) {
			const y = el.getBoundingClientRect().top + window.scrollY - 76;
			window.scrollTo({ top: y, behavior: 'smooth' });
		}
	};

	const askAgent = (q: string, key: string) => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		if ((window as any).__askAgent) (window as any).__askAgent(q, key);
	};

	const totalTools = skillCategories.reduce((a, c) => a + c.skills.length, 0);
	const totalDomains = skillCategories.length;
	const careerYears = (() => {
		if (!careerTimeline.length) return 0;
		const years = careerTimeline
			.flatMap((c) => [...(c.period.match(/\d{4}/g) ?? [])])
			.map(Number)
			.filter(Boolean);
		if (!years.length) return 0;
		return new Date().getFullYear() - Math.min(...years);
	})();

	const navItems = [
		{ id: 'work',      label: 'Work',      sub: `${projects.length} project${projects.length !== 1 ? 's' : ''} · shipped`,      meta: '01' },
		{ id: 'stack',     label: 'Stack',     sub: `${totalTools || '—'} tools · ${totalDomains || '—'} domains`,                  meta: '02' },
		{ id: 'career',    label: 'Career',    sub: `${careerYears ? `${careerYears} years` : '—'} · ${careerTimeline.length} roles`, meta: '03' },
		{ id: 'education', label: 'Education', sub: `${education.length} entr${education.length !== 1 ? 'ies' : 'y'}`,              meta: '04' },
		{ id: 'writing',   label: 'Writing',   sub: 'Recent notes',                                                                  meta: '05' },
		{ id: 'contact',   label: 'Contact',   sub: 'Open to roles · 2026',                                                         meta: '06' },
	];

	return (
		<>
			{/* Atmospheric background layers */}
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" />
				<div className="glow-2" />
				<div className="grid" />
				<div className="grain" />
			</div>

			<MainNav show={navShow} theme={theme} onToggleTheme={toggleTheme} onNav={navTo} />

			<HeroSection
				heroRef={heroRef}
				onNav={navTo}
				title={title}
				subtitle={subtitle}
				description={description}
				headline={headline}
				socialNetworkLinks={socialNetworkLinks}
				avatarImage={avatarImage}
				theme={theme}
				onToggleTheme={toggleTheme}
				navItems={navItems}
				resumeUrl={resumeUrl}
			/>

			<div className="wrap">
				<ProjectsSection
					title={projectSectionTitle}
					projects={projects}
					onNav={navTo}
				/>

				<SkillsSection
					skillCategories={skillCategories}
				/>

				<CareerSection
					title={careerSectionTitle}
					careerTimeline={careerTimeline}
				/>

				<EducationSection education={education} />

				<RecentWritingSection posts={recentPosts} />

				<FooterSection
					socialNetworkLinks={socialNetworkLinks}
					ctaSection={ctaSection}
					onNav={navTo}
				/>
			</div>

			{/* Floating ask-the-agent launcher */}
			<button
				className="ask-fab"
				aria-label="Ask the agent about Nelkit"
				onClick={() => askAgent('Tell me about your ML work', 'ml')}
			>
				<span className="pop">Ask the agent →</span>
				<IHelp />
			</button>
		</>
	);
}
