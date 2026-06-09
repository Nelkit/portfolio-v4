'use client';

import { useState, useRef, useEffect, RefObject } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { mediaUrl } from '@/app/lib/constant';
import {
	IMail, IDown, IArrowUp, IPlus, IMic, ISpark,
	IGithub, ILinkedin, IBriefcase, ILayers, IRoute, IPen, IAt, ISun, IMoon,
} from '@/app/components/icons';

type RichTextBlock = { children?: { text?: string }[] };

function parseHeadline(raw: RichTextBlock[] | string | undefined): React.ReactNode {
	const fallback = <>Building <em className="ac">AI products</em> that actually ship</>;
	if (!raw) return fallback;
	const text = Array.isArray(raw)
		? raw.map((b) => b.children?.map((c) => c.text || '').join('')).join('')
		: String(raw);
	const match = text.match(/^(.*?)<em[^>]*>(.*?)<\/em>(.*)$/s);
	if (!match) return text || fallback;
	return <>{match[1]}<em className="ac">{match[2]}</em>{match[3]}</>;
}

const NAV_ICONS: Record<string, () => React.ReactElement> = {
	work:      IBriefcase,
	stack:     ILayers,
	career:    IRoute,
	education: ISpark,
	writing:   IPen,
	contact:   IAt,
};

const SUGGESTIONS = [
	{ q: 'What stack do you use?',        key: 'stack' },
	{ q: 'Are you open to remote roles?', key: 'remote' },
	{ q: 'Tell me about your ML work',    key: 'ml' },
];

/* ---- Sidebar ---- */
function Sidebar({ onNav, socialNetworkLinks, theme, onToggleTheme, navItems, resumeUrl }: {
	onNav: (id: string) => void;
	socialNetworkLinks?: { type: string; href: string }[];
	theme: 'plum' | 'light';
	onToggleTheme: () => void;
	navItems: { id: string; label: string; sub: string; meta: string }[];
	resumeUrl?: string;
}) {
	const github = socialNetworkLinks?.find((l) => l.type === 'github')?.href || 'https://github.com/nelkit';
	const linkedin = socialNetworkLinks?.find((l) => l.type === 'linkedin')?.href || 'https://linkedin.com/in/nelkit';

	return (
		<aside className="sidebar">
			<div className="brand">
				<Image src="/img/logo.webp" alt="Nelkit Chavez Logo" width={80} height={80} className="mark" />
				<div className="wm">
					<b>Nelkit Chavez</b>
					<span><i className="dot-live" />Portfolio agent · online</span>
				</div>
			</div>

			<div className="cta-stack">
				<a className="btn btn-accent" href="#contact"
				   onClick={(e) => { e.preventDefault(); onNav('contact'); }}>
					<IMail /><span>Get in touch</span>
				</a>
				<a className="btn btn-outline" href={resumeUrl || '#'}
				   target={resumeUrl ? '_blank' : undefined} rel={resumeUrl ? 'noopener noreferrer' : undefined}
				   onClick={resumeUrl ? undefined : (e) => e.preventDefault()}>
					<IDown /><span>Download CV</span>
				</a>
			</div>

			<div className="side-label"><span>Navigate</span><span>{navItems.length} threads</span></div>
			<nav className="convo-list">
				{navItems.map((n) => {
					const Icon = NAV_ICONS[n.id];
					return (
						<a key={n.id} className="convo" href={'#' + n.id}
						   onClick={(e) => { e.preventDefault(); onNav(n.id); }}>
							<span className="ic">{Icon && <Icon />}</span>
							<span className="tx"><b>{n.label}</b><span>{n.sub}</span></span>
							<span className="meta">{n.meta}</span>
						</a>
					);
				})}
			</nav>

			<div className="spacer" />
			<div className="side-foot">
				<div className="socials">
					<a className="soc" href={github} target="_blank" rel="noreferrer" aria-label="GitHub">
						<IGithub />
					</a>
					<a className="soc" href={linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
						<ILinkedin />
					</a>
					<button className="soc theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
						{theme === 'light' ? <IMoon /> : <ISun />}
					</button>
				</div>
				<div className="loc">Sydney · AUS<br />UTC+10 · 2026</div>
			</div>
		</aside>
	);
}

/* ---- Chat Main ---- */
function ChatMain({ onNav, title, subtitle, description, headline, avatarImage, onReset }: {
	onNav: (id: string) => void;
	title?: string;
	subtitle?: string;
	description?: string;
	headline?: RichTextBlock[] | string;
	avatarImage?: { url: string; alternativeText: string };
	onReset: () => void;
}) {
	const threadRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [inputVal, setInputVal] = useState('');

	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({ api: '/api/chat' }),
	});

	const isLoading = status === 'streaming' || status === 'submitted';
	const started = messages.length > 0;

	useEffect(() => {
		const el = threadRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [messages]);

	const ask = (text: string) => {
		if (!text.trim() || isLoading) return;
		sendMessage({ text });
		setInputVal('');
	};

	// Expose ask globally so the FAB in ClientWrapper can trigger it
	useEffect(() => {
		(window as { __askAgent?: (q: string) => void }).__askAgent = (q: string) => ask(q);
		return () => { delete (window as { __askAgent?: (q: string) => void }).__askAgent; };
	});

	const getMessageText = (m: (typeof messages)[number]): string =>
		m.parts.filter((p): p is { type: 'text'; text: string } => p.type === 'text').map((p) => p.text).join('');

	return (
		<main className="chat">
			<div className="chat-top">
				<div className="status-pill">
					<i className="dot-live" /> AI agent · ask about Nelkit
				</div>
				<div className="profile">
					{avatarImage?.url ? (
						<img
							className="avatar"
							src={mediaUrl(avatarImage.url)}
							alt={avatarImage.alternativeText || title || 'Profile'}
						/>
					) : (
						<div className="avatar-placeholder">nc</div>
					)}
					<div className="who">
						<b>{title || 'Nelkit Chavez'}</b>
						<span>{subtitle || 'AI/ML Engineer'}</span>
					</div>
				</div>
			</div>

			<div className={'stage' + (started ? ' thread-on' : '')}>
				<div className="headline-wrap">
					<h1 className="headline">
						{parseHeadline(headline)}
						<span className="ac">.</span>
					</h1>
					<p className="sub">
						{description}<span className="caret">_</span>
					</p>
				</div>

				{started && (
					<div className="thread" ref={threadRef}>
						<div className="thread-head">
							<span className="lbl"><i className="dot-live" /> Conversation</span>
							<button className="new-chat" onClick={onReset}><ISpark /> New chat</button>
						</div>
						<div className="msgs">
							{messages.map((m) => (
								<div key={m.id} className={'msg ' + (m.role === 'user' ? 'user' : 'agent')}>
									{m.role === 'assistant' && <div className="av">nc</div>}
									<div className="bubble">
										{getMessageText(m)
											? <ReactMarkdown>{getMessageText(m)}</ReactMarkdown>
											: (isLoading && m === messages[messages.length - 1]
												? <div className="typing"><i/><i/><i/></div>
												: null)}
									</div>
								</div>
							))}
							{isLoading && messages[messages.length - 1]?.role === 'user' && (
								<div className="msg agent">
									<div className="av">nc</div>
									<div className="bubble"><div className="typing"><i/><i/><i/></div></div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="composer">
				{!started && (
					<div className="chips">
						{SUGGESTIONS.map((s) => (
							<button key={s.key} className="chip" onClick={() => ask(s.q)}>
								{s.q}
							</button>
						))}
					</div>
				)}
				<form className="input-box" onSubmit={(e) => { e.preventDefault(); ask(inputVal); }}>
					<button type="button" className="io-lead" aria-label="New conversation"
					        onClick={() => { onReset(); inputRef.current?.focus(); }}>
						<IPlus />
					</button>
					<input
						ref={inputRef}
						value={inputVal}
						onChange={(e) => setInputVal(e.target.value)}
						placeholder={started ? 'Ask a follow-up…' : 'Ask me anything about Nelkit…'}
						aria-label="Message"
					/>
					<button type="button" className="io-mic" aria-label="Focus input"
					        onClick={() => inputRef.current?.focus()}>
						<IMic />
					</button>
					<button className="send" type="submit" disabled={!inputVal.trim() || isLoading} aria-label="Send">
						<IArrowUp />
					</button>
				</form>
				<div className="hint">
					<span>↩ to send · built for academic & learning purposes · responses may not be accurate</span>
					<span>{started ? messages.length + ' messages' : '3 quick prompts above'}</span>
				</div>
			</div>
		</main>
	);
}

/* ---- HeroSection ---- */
type HeroSectionProps = {
	heroRef: RefObject<HTMLElement | null>;
	onNav: (id: string) => void;
	title?: string;
	subtitle?: string;
	description?: string;
	headline?: RichTextBlock[] | string;
	socialNetworkLinks?: { type: string; href: string; label: string; isExternal?: boolean }[];
	avatarImage?: { url: string; alternativeText: string };
	theme: 'plum' | 'light';
	onToggleTheme: () => void;
	navItems: { id: string; label: string; sub: string; meta: string }[];
	resumeUrl?: string;
};

const SCROLL_DISTANCE = 320;
const PAD_START = 34;   // px — initial padding (matches clamp max)
const PAD_END   = 15;   // px — minimum margin, never goes below this
const RADIUS_START = 26;
const RADIUS_END   = 14; // px — keeps a subtle radius at full expansion

export function HeroSection({ heroRef, onNav, title, subtitle, description, headline, socialNetworkLinks, avatarImage, theme, onToggleTheme, navItems, resumeUrl }: HeroSectionProps) {
	const outerRef = useRef<HTMLDivElement>(null);
	const shellRef = useRef<HTMLDivElement>(null);
	const [chatKey, setChatKey] = useState(0);
	const [hintVisible, setHintVisible] = useState(true);

	useEffect(() => {
		const hero = heroRef.current as HTMLElement | null;
		const onScroll = () => {
			const outer = outerRef.current;
			const shell = shellRef.current;
			if (!outer || !shell || !hero) return;

			// disable scroll effect on mobile
			if (window.innerWidth < 768) {
				hero.style.padding = '0px';
				shell.style.borderRadius = '0px';
				shell.style.height = '100svh';
				shell.style.maxWidth = '100%';
				return;
			}

			const top = outer.getBoundingClientRect().top;
			const progress = Math.min(1, Math.max(0, -top / SCROLL_DISTANCE));

			// hide hint once scroll has started
			setHintVisible(progress < 0.15);

			const pad = Math.round(PAD_START + (PAD_END - PAD_START) * progress);
			hero.style.padding = `${pad}px`;

			const radius = RADIUS_START + (RADIUS_END - RADIUS_START) * progress;
			shell.style.borderRadius = `${radius}px`;

			const svh = 86 + progress * 14;
			shell.style.height = `calc(${svh}svh - ${pad * 2}px)`;

			const targetW = Math.min(1500, window.innerWidth) - PAD_END * 2;
			const maxw = Math.round(1400 + (targetW - 1400) * progress);
			shell.style.maxWidth = `${maxw}px`;
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, [heroRef]);

	return (
		// outer wrapper taller than viewport → provides the sticky scroll zone
		<div
			ref={outerRef}
			id="top"
			style={{ height: `calc(100svh + ${SCROLL_DISTANCE}px)`, position: 'relative' }}
		>
			<header
				className="hero"
				ref={heroRef}
				style={{ position: 'sticky', top: 0, height: '100svh' }}
			>
				<div ref={shellRef} className="app-shell">
					<Sidebar onNav={onNav} socialNetworkLinks={socialNetworkLinks} theme={theme} onToggleTheme={onToggleTheme} navItems={navItems} resumeUrl={resumeUrl} />
					<ChatMain key={chatKey} onNav={onNav} title={title} description={description} subtitle={subtitle} headline={headline} avatarImage={avatarImage} onReset={() => setChatKey((k) => k + 1)} />
				</div>

				<div className={'scroll-hint' + (hintVisible ? '' : ' scroll-hint-hidden')} onClick={() => onNav('work')}>
					<span className="scroll-hint-label">Explore the traditional portfolio</span>
					<span className="scroll-hint-arrow">
						<IDown />
					</span>
				</div>
			</header>
		</div>
	);
}
