'use client';

import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import Image from 'next/image';
import { BASE_URL } from '@/app/lib/constant';
import {
	IMail, IDown, IArrowUp, IPlus, IMic, ISpark, IArrowUR,
	IGithub, ILinkedin, IBriefcase, ILayers, IRoute, IPen, IAt, ISun, IMoon,
} from '@/app/components/icons';

const NAV_ICONS: Record<string, () => React.ReactElement> = {
	work:    IBriefcase,
	stack:   ILayers,
	career:  IRoute,
	writing: IPen,
	contact: IAt,
};

const SUGGESTIONS = [
	{ q: 'What stack do you use?',        key: 'stack' },
	{ q: 'Are you open to remote roles?', key: 'remote' },
	{ q: 'Tell me about your ML work',    key: 'ml' },
];

const CANNED: Record<string, { text: string; link: { id: string; label: string } }> = {
	stack:  { text: 'Three stacks, really. Mobile is home base — Swift, SwiftUI, Kotlin, Flutter, React Native. For ML I live in Python with CoreML, TensorFlow and LangChain. Backend when I need it: FastAPI, Django, Postgres, Redis.', link: { id: 'stack', label: 'See the full stack' } },
	remote: { text: 'Yes — open to senior IC roles in mobile, ML engineering, or wherever the two intersect. Remote, hybrid, or in person in Sydney are all on the table for 2026.', link: { id: 'contact', label: 'Get in touch' } },
	ml:     { text: 'Seven years shipping mobile, now teaching those products to think. I do applied on-device ML research at UTS, and I\'ve shipped CoreML vision (SightlineQA), a 3M/day recommender, and a grounded support copilot.', link: { id: 'work', label: 'See selected work' } },
};

type Msg = {
	id: string;
	role: 'user' | 'agent';
	text?: string;
	link?: { id: string; label: string };
	typing?: boolean;
};

/* ---- Message ---- */
function Message({ m, onNav }: { m: Msg; onNav: (id: string) => void }) {
	if (m.typing) {
		return (
			<div className="msg agent">
				<div className="av">nc</div>
				<div className="bubble"><div className="typing"><i/><i/><i/></div></div>
			</div>
		);
	}
	return (
		<div className={'msg ' + m.role}>
			{m.role === 'agent' && <div className="av">nc</div>}
			<div className="bubble">
				{m.text}
				{m.link && (
					<a className="seclink" href={'#' + m.link.id}
					   onClick={(e) => { e.preventDefault(); onNav(m.link!.id); }}>
						<IArrowUR /> {m.link.label}
					</a>
				)}
			</div>
		</div>
	);
}

/* ---- Sidebar ---- */
function Sidebar({ onNav, socialNetworkLinks, theme, onToggleTheme, navItems }: {
	onNav: (id: string) => void;
	socialNetworkLinks?: { type: string; href: string }[];
	theme: 'plum' | 'light';
	onToggleTheme: () => void;
	navItems: { id: string; label: string; sub: string; meta: string }[];
}) {
	const github = socialNetworkLinks?.find((l) => l.type === 'github')?.href || 'https://github.com/nelkit';
	const linkedin = socialNetworkLinks?.find((l) => l.type === 'linkedin')?.href || 'https://linkedin.com/in/nelkit';
	const cvLink = socialNetworkLinks?.find((l) => l.type === 'cv')?.href;

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
					<IMail /> Get in touch
				</a>
				<a className="btn btn-outline" href={cvLink || '#'}
				   target={cvLink ? '_blank' : undefined} rel={cvLink ? 'noopener noreferrer' : undefined}
				   onClick={cvLink ? undefined : (e) => e.preventDefault()}>
					<IDown /> Download CV
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
function ChatMain({ onNav, title, subtitle, description, avatarImage }: {
	onNav: (id: string) => void;
	title?: string;
	subtitle?: string;
	description?: string;
	avatarImage?: { url: string; alternativeText: string };
}) {
	const [messages, setMessages] = useState<Msg[]>([]);
	const [input, setInput] = useState('');
	const [busy, setBusy] = useState(false);
	const threadRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const started = messages.length > 0;

	useEffect(() => {
		const el = threadRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [messages]);

	const pushAgent = useCallback((payload: Partial<Msg>, delay = 720) => {
		setBusy(true);
		setMessages((m) => [...m, { role: 'agent', typing: true, id: 't' + Date.now() }]);
		setTimeout(() => {
			setMessages((m) => {
				const out = m.filter((x) => !x.typing);
				return [...out, { role: 'agent', id: Date.now().toString(), ...payload }];
			});
			setBusy(false);
		}, delay);
	}, []);

	const ask = useCallback(async (text: string, cannedKey?: string) => {
		if (!text.trim() || busy) return;
		setMessages((m) => [...m, { role: 'user', text, id: Date.now().toString() }]);
		setInput('');

		if (cannedKey && CANNED[cannedKey]) {
			pushAgent(CANNED[cannedKey]);
			return;
		}
		setBusy(true);
		setMessages((m) => [...m, { role: 'agent', typing: true, id: 't' + Date.now() }]);
		const fallback = "Good question — that one's best answered directly. Reach out via Contact and I'll get back to you. In the meantime, the Work and Stack threads cover most of it.";
		setMessages((m) => {
			const out = m.filter((x) => !x.typing);
			return [...out, { role: 'agent', id: Date.now().toString(), text: fallback, link: { id: 'contact', label: 'Get in touch' } }];
		});
		setBusy(false);
	}, [busy, pushAgent]);

	const reset = () => { setMessages([]); setInput(''); setBusy(false); };

	useEffect(() => {
		(window as any).__askAgent = (q: string, key: string) => ask(q, key);
		return () => { delete (window as any).__askAgent; };
	}, [ask]);

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
							src={`${BASE_URL}${avatarImage.url}`}
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
				{/* Default: headline */}
				<div className="headline-wrap">
			
					<h1 className="headline">
						Applied ML <em className="ac">engineer.</em> Shipping intelligence into products<span className="ac">.</span>
						 
					</h1>
					<p className="sub">
						{description}<span className="caret">_</span>
					</p>
				</div>

				{/* Active: thread */}
				{started && (
					<div className="thread" ref={threadRef}>
						<div className="thread-head">
							<span className="lbl"><i className="dot-live" /> Conversation</span>
							<button className="new-chat" onClick={reset}><ISpark /> New chat</button>
						</div>
						<div className="msgs">
							{messages.map((m, i) => <Message key={m.id || i} m={m} onNav={onNav} />)}
						</div>
					</div>
				)}
			</div>

			<div className="composer">
				{!started && (
					<div className="chips">
						{SUGGESTIONS.map((s) => (
							<button key={s.key} className="chip" onClick={() => ask(s.q, s.key)}>
								{s.q}
							</button>
						))}
					</div>
				)}
				<form className="input-box" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
					<button type="button" className="io-lead" aria-label="New conversation"
					        onClick={() => { if (started) reset(); inputRef.current?.focus(); }}>
						<IPlus />
					</button>
					<input
						ref={inputRef}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={started ? 'Ask a follow-up…' : 'Ask me anything about Nelkit…'}
						aria-label="Message"
					/>
					<button type="button" className="io-mic" aria-label="Focus input"
					        onClick={() => inputRef.current?.focus()}>
						<IMic />
					</button>
					<button className="send" type="submit" disabled={!input.trim() || busy} aria-label="Send">
						<IArrowUp />
					</button>
				</form>
				<div className="hint">
					<span>↩ to send · powered by an on-page agent</span>
					<span>{started ? messages.filter((m) => !m.typing).length + ' messages' : '3 quick prompts above'}</span>
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
	socialNetworkLinks?: { type: string; href: string; label: string; isExternal?: boolean }[];
	avatarImage?: { url: string; alternativeText: string };
	theme: 'plum' | 'light';
	onToggleTheme: () => void;
	navItems: { id: string; label: string; sub: string; meta: string }[];
};

const SCROLL_DISTANCE = 320;
const PAD_START = 34;   // px — initial padding (matches clamp max)
const PAD_END   = 15;   // px — minimum margin, never goes below this
const RADIUS_START = 26;
const RADIUS_END   = 14; // px — keeps a subtle radius at full expansion

export function HeroSection({ heroRef, onNav, title, subtitle, description, socialNetworkLinks, avatarImage, theme, onToggleTheme, navItems }: HeroSectionProps) {
	const outerRef = useRef<HTMLDivElement>(null);
	const shellRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const hero = heroRef.current as HTMLElement | null;
		const onScroll = () => {
			const outer = outerRef.current;
			const shell = shellRef.current;
			if (!outer || !shell || !hero) return;

			const top = outer.getBoundingClientRect().top;
			const progress = Math.min(1, Math.max(0, -top / SCROLL_DISTANCE));

			// padding: 34px → 15px (never below PAD_END)
			const pad = Math.round(PAD_START + (PAD_END - PAD_START) * progress);
			hero.style.padding = `${pad}px`;

			// border-radius: 26px → 14px (keeps a subtle curve at full expansion)
			const radius = RADIUS_START + (RADIUS_END - RADIUS_START) * progress;
			shell.style.borderRadius = `${radius}px`;

			// height: 86svh → 100svh minus 2×PAD_END so it respects the margin
			const svh = 86 + progress * 14;
			shell.style.height = `calc(${svh}svh - ${pad * 2}px)`;

			// max-width: 1400px → min(1500px, 100vw) minus 2×PAD_END
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
					<Sidebar onNav={onNav} socialNetworkLinks={socialNetworkLinks} theme={theme} onToggleTheme={onToggleTheme} navItems={navItems} />
					<ChatMain onNav={onNav} title={title} description={description} subtitle={subtitle} avatarImage={avatarImage} />
				</div>
			</header>
		</div>
	);
}
