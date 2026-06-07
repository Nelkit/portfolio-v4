'use client';

import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { BASE_URL } from '@/app/lib/constant';

/* ---- Icons ---- */
const IMail = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
const IDown = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14"/></svg>;
const IArrowUp = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5m0 0-6 6m6-6 6 6"/></svg>;
const IPlus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 5v14M5 12h14"/></svg>;
const IMic = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>;
const ISpark = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3v4m0 10v4m9-9h-4M7 12H3m13.5-6.5-2.8 2.8m-5.4 5.4-2.8 2.8m11 0-2.8-2.8M8.3 8.3 5.5 5.5"/></svg>;
const IArrowUR = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 17 17 7M9 7h8v8"/></svg>;
const IGithub = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/></svg>;
const ILinkedin = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21H17.5v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9V9Z"/></svg>;
const IBriefcase = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>;
const ILayers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m12 3 9 5-9 5-9-5 9-5Zm9 9-9 5-9-5m18 4-9 5-9-5"/></svg>;
const IRoute = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H14a3.5 3.5 0 0 0 0-7H10a3.5 3.5 0 0 1 0-7h5.5"/></svg>;
const IPen = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>;
const IAt = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>;

const NAV_ITEMS = [
	{ id: 'work',    label: 'Work',    sub: '7 projects · shipped',  meta: '01', Icon: IBriefcase },
	{ id: 'stack',   label: 'Stack',   sub: '23 tools · 4 domains',  meta: '02', Icon: ILayers },
	{ id: 'career',  label: 'Career',  sub: '9 years · receipts',    meta: '03', Icon: IRoute },
	{ id: 'writing', label: 'Writing', sub: '3 recent notes',        meta: '04', Icon: IPen },
	{ id: 'contact', label: 'Contact', sub: 'open to roles · 2026',  meta: '05', Icon: IAt },
];

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
function Sidebar({ onNav, socialNetworkLinks }: {
	onNav: (id: string) => void;
	socialNetworkLinks?: { type: string; href: string }[];
}) {
	const github = socialNetworkLinks?.find((l) => l.type === 'github')?.href || 'https://github.com/nelkit';
	const linkedin = socialNetworkLinks?.find((l) => l.type === 'linkedin')?.href || 'https://linkedin.com/in/nelkit';
	const cvLink = socialNetworkLinks?.find((l) => l.type === 'cv')?.href;

	return (
		<aside className="sidebar">
			<div className="brand">
				<div className="mark">nc</div>
				<div className="wm">
					<b>Nelkit Chavez</b>
					<span><i className="dot-live" />portfolio agent · online</span>
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

			<div className="side-label"><span>Navigate</span><span>5 threads</span></div>
			<nav className="convo-list">
				{NAV_ITEMS.map((n) => (
					<a key={n.id} className="convo" href={'#' + n.id}
					   onClick={(e) => { e.preventDefault(); onNav(n.id); }}>
						<span className="ic"><n.Icon /></span>
						<span className="tx"><b>{n.label}</b><span>{n.sub}</span></span>
						<span className="meta">{n.meta}</span>
					</a>
				))}
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
};

const SCROLL_DISTANCE = 320;
const PAD_START = 34;   // px — initial padding (matches clamp max)
const PAD_END   = 15;   // px — minimum margin, never goes below this
const RADIUS_START = 26;
const RADIUS_END   = 14; // px — keeps a subtle radius at full expansion

export function HeroSection({ heroRef, onNav, title, subtitle, description, socialNetworkLinks, avatarImage }: HeroSectionProps) {
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
					<Sidebar onNav={onNav} socialNetworkLinks={socialNetworkLinks} />
					<ChatMain onNav={onNav} title={title} description={description} subtitle={subtitle} avatarImage={avatarImage} />
				</div>
			</header>
		</div>
	);
}
