"use client";

import { useEffect, useState } from 'react';
import { BackgroundOrbs } from '@/app/components/BackgroundOrbs';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { MainNav } from '@/app/components/MainNav';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { ProjectsSection } from '@/app/components/sections/ProjectsSection';
import { SkillsSection } from '@/app/components/sections/SkillsSection';
import { EducationSection } from '@/app/components/sections/EducationSection';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { FooterSection } from '@/app/components/sections/FooterSection';
import {
	navLinks,
	skillCategories,
	expertise,
	projects,
	education,
	careerTimeline,
	type SkillCategory,
	type Expertise as ExpertiseType,
} from '@/app/data/content';

type ClientWrapperProps = {
	strapiData: any; // Adjust type as needed
};

export function ClientWrapper({ strapiData }: ClientWrapperProps) {
	const [scrollY, setScrollY] = useState(0);
	const [darkMode, setDarkMode] = useState(true);
	const [selectedSkillCategory, setSelectedSkillCategory] = useState('ai');
	const [selectedExpertise, setSelectedExpertise] = useState('ai');
	const {title, subtitle, description, avatarImage, socialNetworkLinks} = strapiData.data || {}

	useEffect(() => {
		const handleScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const bgClass = darkMode
		? 'bg-linear-to-br from-slate-950 via-slate-900 to-slate-950'
		: 'bg-linear-to-br from-slate-50 via-gray-300 to-slate-50';
	const textClass = darkMode ? 'text-white' : 'text-slate-900';
	const textSecondaryClass = darkMode ? 'text-slate-300' : 'text-slate-700';
	const textTertiaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
	const cardBgClass = darkMode ? 'backdrop-blur-2xl bg-white/5 border-white/10' : 'backdrop-blur-2xl bg-white/60 border-white/40';
	const cardHoverClass = darkMode ? 'hover:bg-white/10' : 'hover:bg-white/80';

	const activeSkillCategory =
		skillCategories.find((category) => category.key === selectedSkillCategory) ?? skillCategories[0];
	const aiCategory = skillCategories.find((category) => category.key === 'ai');

	const activeExpertiseArea =
		expertise.find((item) => item.code === selectedExpertise) ?? expertise[0];

	return (
		<div className={`min-h-screen ${bgClass} ${textClass} overflow-hidden transition-colors duration-500`}>
			<BackgroundOrbs scrollY={scrollY} darkMode={darkMode} />
			<ThemeToggle
				darkMode={darkMode}
				onToggle={() => setDarkMode((prev) => !prev)}
				cardBgClass={cardBgClass}
				cardHoverClass={cardHoverClass}
			/>
			<MainNav
				links={navLinks}
				textTertiaryClass={textTertiaryClass}
				cardBgClass={cardBgClass}
				cardHoverClass={cardHoverClass}
			/>

			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<HeroSection
					textSecondaryClass={textSecondaryClass}
					cardBgClass={cardBgClass}
					cardHoverClass={cardHoverClass}
					title={title}
					subtitle={subtitle}
					description={description}
					socialNetworkLinks={socialNetworkLinks}
					avatarImage={avatarImage}
				/>

				<ProjectsSection
					expertise={expertise}
					projects={projects}
					activeExpertiseArea={activeExpertiseArea as ExpertiseType}
					selectedExpertise={selectedExpertise}
					onSelectExpertise={setSelectedExpertise}
					textSecondaryClass={textSecondaryClass}
					cardBgClass={cardBgClass}
					cardHoverClass={cardHoverClass}
					darkMode={darkMode}
				/>

				<SkillsSection
					skillCategories={skillCategories}
					selectedSkillCategory={selectedSkillCategory}
					onSelectSkillCategory={setSelectedSkillCategory}
					activeSkillCategory={activeSkillCategory as SkillCategory}
					aiCategory={aiCategory}
					textSecondaryClass={textSecondaryClass}
					textTertiaryClass={textTertiaryClass}
					cardBgClass={cardBgClass}
					cardHoverClass={cardHoverClass}
					darkMode={darkMode}
				/>

				<EducationSection
					education={education}
					textSecondaryClass={textSecondaryClass}
					textTertiaryClass={textTertiaryClass}
					cardBgClass={cardBgClass}
					cardHoverClass={cardHoverClass}
					darkMode={darkMode}
				/>

				<AboutSection
					textSecondaryClass={textSecondaryClass}
					cardBgClass={cardBgClass}
					careerTimeline={careerTimeline}
					darkMode={darkMode}
				/>

				<FooterSection
					cardBgClass={cardBgClass}
					textTertiaryClass={textTertiaryClass}
					darkMode={darkMode}
				/>
			</div>
		</div>
	);
}
