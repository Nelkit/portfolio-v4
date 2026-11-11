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
import type { PublicProfile } from '@/app/lib/content/profile/profile';
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
import { useI18n } from '@/app/lib/i18n/I18nProvider';

type ClientWrapperProps = {
	strapiData: any;
	recentPosts: BlogEntry[];
	/** Hero headline from the admin (Turso). Sections not yet migrated still read strapiData. */
	headline?: string;
	/** Name, avatar, role, intro, CV, links and contact copy from the admin (Turso). */
	profile: PublicProfile | null;
};

/** Adapts admin links to the shape the existing sections render. */
function toSectionLinks(profile: PublicProfile | null) {
	return profile?.links.map((l) => ({
		type: l.type,
		href: l.url,
		label: l.label,
		isExternal: l.type !== 'email',
	}));
}

const THEME_CYCLE: ('plum' | 'light')[] = ['plum', 'light'];

export function ClientWrapper({ strapiData, recentPosts, headline, profile }: ClientWrapperProps) {
	const [theme, setTheme] = useState<'plum' | 'light'>('plum');
	const [navShow, setNavShow] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [chatInputFocused, setChatInputFocused] = useState(false);
	const heroRef = useRef<HTMLElement | null>(null);
	const { t } = useI18n();

	const data = strapiData?.data || {};
	const title = profile?.name;
	const subtitle = profile?.role;
	const description = profile?.intro;
	const avatarImage = profile?.avatarUrl ? { url: profile.avatarUrl, alternativeText: profile.name } : undefined;
	const socialNetworkLinks = toSectionLinks(profile);
	const resumeUrl = profile?.cvUrl ?? undefined;
	const ctaSection = profile
		? {
			available: profile.contact.available,
			header: profile.contact.headline,
			description: profile.contact.description,
			email: profile.contact.email ?? undefined,
		}
		: undefined;

	const expertise: ExpertiseType[] = data.projectSection?.expertiseAreas
		? transformExpertiseAreas(data.projectSection.expertiseAreas)
		: [];

	const skillCategories: SkillCategory[] = data.techStackSection?.skillCategories
		? transformSkillCategories(data.techStackSection.skillCategories)
		: [];

	// Section titles are fixed UI copy (dictionary), not Strapi content.
	const projectSectionTitle = t.sections.projects.title;
	const projects = data.projectSection?.projects
		? transformProjects(data.projectSection.projects)
		: [];

	const careerSectionTitle = t.sections.career.title;
	const careerTimeline = data.careerSection?.careerEntries
		? transformCareerEntries(data.careerSection.careerEntries)
		: [];

	const education = data.educationSection?.educationEntries
		? transformEducationEntries(data.educationSection.educationEntries)
		: [];

	// On mount: read the theme the inline <head> script already applied to <html>
	// (OS preference or saved choice) and sync React state to it. We never write
	// back to the DOM here — the script is the single source of truth at load.
	useEffect(() => {
		const applied = document.documentElement.getAttribute('data-theme');
		if (applied === 'plum' || applied === 'light') {
			setTheme(applied);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Follow OS changes — but ONLY while the user hasn't made an explicit choice.
	useEffect(() => {
		const mq = window.matchMedia('(prefers-color-scheme: light)');
		const onChange = (e: MediaQueryListEvent) => {
			try {
				if (localStorage.getItem('portfolio-theme')) return; // user chose manually → ignore OS
			} catch {}
			const next = e.matches ? 'light' : 'plum';
			setTheme(next);
			document.documentElement.setAttribute('data-theme', next);
		};
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
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
		document.documentElement.setAttribute('data-theme', next);
		// Explicit user choice — persist it so it overrides OS preference from now on.
		try { localStorage.setItem('portfolio-theme', next); } catch {}
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

	const sub = t.home.navSub;
	const navItems = [
		{ id: 'work',      label: t.common.nav.work,      sub: sub.work(projects.length),                                                             meta: '01' },
		{ id: 'stack',     label: t.common.nav.stack,     sub: sub.stack(String(totalTools || '—'), String(totalDomains || '—')),                    meta: '02' },
		{ id: 'career',    label: t.common.nav.career,    sub: sub.career(careerYears ? sub.years(careerYears) : '—', careerTimeline.length),         meta: '03' },
		{ id: 'education', label: t.common.nav.education, sub: sub.education(education.length),                                                      meta: '04' },
		{ id: 'writing',   label: t.common.nav.writing,   sub: sub.writing,                                                                          meta: '05' },
		{ id: 'contact',   label: t.common.nav.contact,   sub: sub.contact,                                                                          meta: '06' },
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

			<MainNav show={navShow} theme={theme} onToggleTheme={toggleTheme} onNav={navTo} open={drawerOpen} setOpen={setDrawerOpen} resumeUrl={resumeUrl} />

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
				onOpenMenu={() => setDrawerOpen(true)}
				onChatInputFocusChange={setChatInputFocused}
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

			{/* Floating ask-the-agent launcher — hidden while the chat input is
			    focused on mobile (keyboard open) so it doesn't overlap the keyboard. */}
			<button
				className={'ask-fab' + (chatInputFocused ? ' ask-fab-hidden' : '')}
				aria-label={t.home.fab.aria}
				onClick={() => askAgent(t.home.fab.question, 'ml')}
			>
				<span className="pop">{t.home.fab.label}</span>
				<IHelp />
			</button>
		</>
	);
}
