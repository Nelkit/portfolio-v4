const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Fixed UI copy (not editable content). English is the reference shape:
 * every other locale must provide exactly these keys (enforced by type + test).
 */
export const en = {
	meta: {
		ogLocale: 'en_US',
		/** BCP 47 tag for dates (Intl). */
		dateLocale: 'en-US',
		siteTitle: 'Nelkit Chavez — Software/ML/AI Engineer',
		siteDescription:
			'Seven years shipping production mobile apps. Now building products that think, with ML, LLMs, and the instinct to ship that only comes from doing it for real.',
		blogTitle: 'Writing',
		blogDescription: 'Articles on ML engineering, mobile development, and shipping AI products.',
		projectsTitle: 'Projects',
		projectsDescription: 'A collection of software, ML, and AI projects by Nelkit Chavez.',
	},
	common: {
		nav: {
			work: 'Work',
			stack: 'Stack',
			career: 'Career',
			education: 'Education',
			writing: 'Writing',
			contact: 'Contact',
		},
		navigate: 'Navigate',
		getInTouch: 'Get in touch',
		downloadCv: 'Download CV',
		menu: 'Menu',
		openMenu: 'Open menu',
		toggleTheme: 'Toggle theme',
		back: 'Back',
		loading: 'Loading…',
		builtIn: 'Built in Sydney',
		email: 'Email',
		languageSwitch: {
			/** Short label of the OTHER language, shown on the button. */
			label: 'ES',
			aria: 'Ver el sitio en español',
		},
		notFound: {
			title: 'Page not found',
			body: 'The page you are looking for does not exist.',
			home: 'Go home',
		},
	},
	home: {
		agentOnline: 'Portfolio agent · online',
		threads: (n: number) => plural(n, 'thread', 'threads'),
		location: 'Sydney · AUS',
		navSub: {
			work: (n: number) => `${plural(n, 'project', 'projects')} · shipped`,
			stack: (tools: string, domains: string) => `${tools} tools · ${domains} domains`,
			career: (years: string, roles: number) => `${years} · ${plural(roles, 'role', 'roles')}`,
			years: (n: number) => plural(n, 'year', 'years'),
			education: (n: number) => plural(n, 'entry', 'entries'),
			writing: 'Recent notes',
			contact: 'Open to roles · 2026',
		},
		scrollHint: 'Or scroll down to explore',
		fab: {
			aria: 'Ask the agent about Nelkit',
			label: 'Ask the agent →',
			question: 'Tell me about your ML work',
		},
	},
	chat: {
		status: 'AI agent · ask about Nelkit',
		defaultSubtitle: 'AI/ML Engineer',
		profileAlt: 'Profile',
		newChat: 'New chat',
		suggestions: {
			stack: 'What stack do you use?',
			remote: 'Are you open to remote roles?',
			ml: 'Tell me about your ML work',
		},
		placeholder: 'Ask me anything about Nelkit…',
		placeholderFollowUp: 'Ask a follow-up…',
		messageAria: 'Message',
		modelTitle: 'Model powering this agent',
		focusInput: 'Focus input',
		send: 'Send',
		hint: '↩ to send · built for academic & learning purposes · responses may not be accurate',
		fallbackHeadline: 'Building <em>AI products</em> that actually ship',
	},
	sections: {
		projects: {
			title: 'Selected work',
			note: (n: number) => plural(n, 'project', 'projects'),
		},
		stack: {
			title: 'Tech stack',
			note: (n: number) => `${plural(n, 'tool', 'tools')} · grouped by domain`,
		},
		career: {
			title: 'Career',
			note: (years: number) => `${plural(years, 'year', 'years')} of receipts`,
			period: 'Period',
			role: 'Role',
			status: 'Status',
			current: 'Current',
			past: 'Past',
		},
		education: {
			title: 'Education',
			note: 'Plus scholarships',
			period: 'Period',
			degree: 'Degree',
			institution: 'Institution',
			status: 'Status',
			inProgress: 'In Progress',
			completed: 'Completed',
		},
		writing: {
			title: 'Recent writing',
			note: 'notes on building, mobile & ML',
			viewAll: 'View all writing',
			minutes: (n: number) => `${n} min`,
		},
		contact: {
			available: 'Available 2026',
			headline: "Let's build something <em>that ships.</em>",
			description:
				'Open to senior IC roles in mobile, ML engineering, or anywhere those two intersect. Remote, hybrid, or Sydney in person.',
		},
	},
	blog: {
		heading: 'Writing',
		empty: 'No posts yet — check back soon.',
		count: (n: number) => `${plural(n, 'post', 'posts')} · notes on building, mobile & ML`,
		minRead: (n: number) => `${n} min read`,
		minutes: (n: number) => `${n} min`,
		previous: 'Previous',
		next: 'Next',
		allWriting: 'All writing',
		comingSoon: 'Content coming soon.',
	},
	projects: {
		heading: 'Projects',
		count: (n: number) => `${plural(n, 'project', 'projects')} · software, ML & AI`,
		empty: 'No projects yet — check back soon.',
		backToProjects: 'Back to projects',
		techStack: 'Tech stack',
		screenshots: 'Screenshots',
		moreProjects: 'More projects',
		openScreenshot: (alt: string) => `Open screenshot: ${alt}`,
	},
};

export type Dictionary = typeof en;
