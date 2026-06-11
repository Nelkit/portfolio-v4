import { createHighlighter, type Highlighter, type BundledLanguage } from 'shiki';

// Singleton highlighter — created once, reused across requests
let highlighterPromise: Promise<Highlighter> | null = null;

const THEME = 'github-dark';

// Languages we pre-load. Shiki only bundles what we declare here.
const LANGS: BundledLanguage[] = [
	'javascript', 'typescript', 'jsx', 'tsx', 'json', 'bash', 'shell',
	'css', 'html', 'python', 'go', 'rust', 'sql', 'yaml', 'markdown', 'diff',
];

async function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({ themes: [THEME], langs: LANGS });
	}
	return highlighterPromise;
}

// Maps Strapi's language values to Shiki language IDs
function normalizeLang(lang: string | undefined): BundledLanguage | 'text' {
	if (!lang) return 'text';
	const l = lang.toLowerCase();
	const alias: Record<string, BundledLanguage> = {
		js: 'javascript', ts: 'typescript', py: 'python',
		sh: 'bash', shell: 'bash', yml: 'yaml', md: 'markdown',
	};
	const resolved = alias[l] ?? l;
	return LANGS.includes(resolved as BundledLanguage) ? (resolved as BundledLanguage) : 'text';
}

export async function highlightCode(code: string, lang: string | undefined): Promise<string> {
	const highlighter = await getHighlighter();
	const language = normalizeLang(lang);
	return highlighter.codeToHtml(code, {
		lang: language,
		theme: THEME,
	});
}
