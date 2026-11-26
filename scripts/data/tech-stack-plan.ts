/**
 * The tech-stack tabs that replace the current ones (pure, unit tested).
 * Applied by tech-stack.ts. The list and its order come from the owner.
 */
import type { CategoryInput, CategoryRecord, Skill } from '@/app/lib/content/skills/skill-category';

/** Tabs in display order; tools in display order within each tab. */
export const STACK_PLAN: CategoryInput[] = [
	{
		translations: { en: { name: 'AI & Machine Learning' }, es: { name: 'IA y Machine Learning' } },
		skills: [
			'PyTorch',
			'TensorFlow',
			'scikit-learn',
			'RAG',
			'LangChain',
			'CrewAI',
			'Qdrant',
			'Hugging Face Transformers',
			'YOLO',
			'Reinforcement Learning (PPO)',
		],
	},
	{
		translations: { en: { name: 'Data Science' }, es: { name: 'Ciencia de datos' } },
		skills: ['Pandas', 'NumPy', 'Statistics', 'EDA', 'Plotly', 'Jupyter'],
	},
	{
		translations: { en: { name: 'Data Engineering' }, es: { name: 'Ingeniería de datos' } },
		skills: ['Apache Airflow', 'dbt', 'Apache Spark', 'Databricks', 'SQL', 'PostgreSQL'],
	},
	{
		translations: { en: { name: 'MLOps & Cloud' }, es: { name: 'MLOps y nube' } },
		skills: ['Docker', 'FastAPI', 'GitHub Actions', 'AWS', 'Google Cloud', 'Oracle Cloud (OCI)', 'Cloudflare R2', 'Render'],
	},
	{
		translations: { en: { name: 'Full-Stack & GIS' }, es: { name: 'Full-Stack y SIG' } },
		skills: [
			'Python',
			'TypeScript',
			'Next.js',
			'React',
			'Tailwind CSS',
			'Django',
			'Streamlit',
			'PostGIS',
			'GeoServer',
			'OpenLayers',
		],
	},
	{
		translations: { en: { name: 'Mobile' }, es: { name: 'Móvil' } },
		skills: ['Swift', 'SwiftUI', 'UIKit', 'Flutter', 'React Native', 'Mapbox'],
	},
];

export type StackImportPlan = {
	/** The database already holds exactly the planned tabs: nothing to write. */
	alreadyApplied: boolean;
	deleteCategories: { id: number; name: string }[];
	createCategories: CategoryInput[];
	/** Same catalog entry, different case: take the planned spelling (projects show it too). */
	renameSkills: { id: number; from: string; to: string }[];
	/** Planned tools the catalog does not have yet. */
	newSkills: string[];
	/** Catalog tools that end up unused (no tab, no project): deleted. */
	droppedSkills: string[];
	/** Tools leaving the tabs that stay in the catalog because projects use them. */
	keptForProjects: string[];
};

const key = (name: string) => name.toLowerCase();

function sameTabs(plan: CategoryInput[], current: CategoryRecord[]): boolean {
	if (plan.length !== current.length) return false;
	return plan.every((p, i) => {
		const c = current[i];
		const names = Object.entries(p.translations).every(
			([locale, t]) => c.translations[locale as keyof typeof c.translations]?.name === t.name,
		);
		return names && JSON.stringify(c.skills.map((s) => s.name)) === JSON.stringify(p.skills);
	});
}

export function planStackImport(input: {
	plan: CategoryInput[];
	/** Current tabs, in display order. */
	current: CategoryRecord[];
	/** Every skill in the catalog. */
	catalog: Skill[];
	/** Ids of the skills any project uses. */
	projectSkillIds: number[];
}): StackImportPlan {
	const { plan, current, catalog } = input;
	const usedByProjects = new Set(input.projectSkillIds);
	const planned = new Map(plan.flatMap((c) => c.skills).map((name) => [key(name), name]));
	const catalogByKey = new Map(catalog.map((s) => [key(s.name), s]));

	const renameSkills = catalog.flatMap((s) => {
		const to = planned.get(key(s.name));
		return to && to !== s.name ? [{ id: s.id, from: s.name, to }] : [];
	});
	const newSkills = [...planned.values()].filter((name) => !catalogByKey.has(key(name)));
	const droppedSkills = catalog.filter((s) => !planned.has(key(s.name)) && !usedByProjects.has(s.id)).map((s) => s.name);

	const leaving = new Map(
		current.flatMap((c) => c.skills).filter((s) => !planned.has(key(s.name))).map((s) => [s.id, s.name]),
	);
	const keptForProjects = [...leaving].filter(([id]) => usedByProjects.has(id)).map(([, name]) => name);

	if (sameTabs(plan, current) && renameSkills.length === 0) {
		return {
			alreadyApplied: true,
			deleteCategories: [],
			createCategories: [],
			renameSkills: [],
			newSkills: [],
			droppedSkills: [],
			keptForProjects: [],
		};
	}

	return {
		alreadyApplied: false,
		deleteCategories: current.map((c) => ({ id: c.id, name: c.translations.en?.name ?? `#${c.id}` })),
		createCategories: plan,
		renameSkills,
		newSkills,
		droppedSkills,
		keptForProjects,
	};
}
