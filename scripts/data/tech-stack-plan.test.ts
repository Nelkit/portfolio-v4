import { describe, expect, it } from 'vitest';
import { MAX_SKILLS_PER_CATEGORY, type CategoryRecord } from '@/app/lib/content/skills/skill-category';
import { planStackImport, STACK_PLAN } from './tech-stack-plan';

const record = (id: number, en: string, es: string, skills: [number, string][]): CategoryRecord => ({
	id,
	translations: { en: { name: en }, es: { name: es } },
	skills: skills.map(([skillId, name]) => ({ id: skillId, name })),
});

describe('STACK_PLAN', () => {
	it('has the six tabs in order, with the agreed number of tools', () => {
		expect(STACK_PLAN.map((c) => [c.translations.en.name, c.skills.length])).toEqual([
			['AI & Machine Learning', 10],
			['Data Science', 6],
			['Data Engineering', 6],
			['MLOps & Cloud', 8],
			['Full-Stack & GIS', 10],
			['Mobile', 6],
		]);
	});

	it('names every tab in both languages and stays within the admin limits', () => {
		for (const category of STACK_PLAN) {
			for (const t of Object.values(category.translations)) expect(t.name.length).toBeGreaterThan(0);
			for (const t of Object.values(category.translations)) expect(t.name.length).toBeLessThanOrEqual(40);
			expect(category.skills.length).toBeLessThanOrEqual(MAX_SKILLS_PER_CATEGORY);
			for (const skill of category.skills) expect(skill.length).toBeLessThanOrEqual(40);
		}
	});

	it('lists no tool twice, in any tab, ignoring case', () => {
		const all = STACK_PLAN.flatMap((c) => c.skills.map((s) => s.toLowerCase()));
		expect(new Set(all).size).toBe(all.length);
	});
});

describe('planStackImport', () => {
	const plan = [
		{ translations: { en: { name: 'AI' }, es: { name: 'IA' } }, skills: ['PyTorch', 'Mapbox', 'YOLO'] },
	];

	it('deletes every current category and creates the planned ones', () => {
		const current = [record(1, 'Old', 'Viejo', [[10, 'PyTorch']]), record(2, 'Other', 'Otro', [])];
		const result = planStackImport({ plan, current, catalog: [{ id: 10, name: 'PyTorch' }], projectSkillIds: [] });

		expect(result.alreadyApplied).toBe(false);
		expect(result.deleteCategories).toEqual([
			{ id: 1, name: 'Old' },
			{ id: 2, name: 'Other' },
		]);
		expect(result.createCategories).toEqual(plan);
	});

	it('reports which tools are new to the catalog', () => {
		const result = planStackImport({ plan, current: [], catalog: [{ id: 10, name: 'PyTorch' }], projectSkillIds: [] });
		expect(result.newSkills).toEqual(['Mapbox', 'YOLO']);
	});

	it('fixes the spelling of a tool that only differs in case (it is the same catalog entry)', () => {
		const result = planStackImport({ plan, current: [], catalog: [{ id: 7, name: 'MapBox' }], projectSkillIds: [7] });
		expect(result.renameSkills).toEqual([{ id: 7, from: 'MapBox', to: 'Mapbox' }]);
		expect(result.newSkills).toEqual(['PyTorch', 'YOLO']);
	});

	it('drops only tools left unused: not in the plan and not used by any project', () => {
		const current = [record(1, 'Old', 'Viejo', [[10, 'PyTorch'], [11, 'GoogLeNet'], [12, 'Astro']])];
		const result = planStackImport({
			plan,
			current,
			catalog: [
				{ id: 10, name: 'PyTorch' },
				{ id: 11, name: 'GoogLeNet' },
				{ id: 12, name: 'Astro' },
				{ id: 13, name: 'Orphan already' },
			],
			projectSkillIds: [11],
		});
		expect(result.droppedSkills).toEqual(['Astro', 'Orphan already']);
		expect(result.keptForProjects).toEqual(['GoogLeNet']);
	});

	it('changes nothing when the database already matches the plan (idempotent)', () => {
		const current = [record(5, 'AI', 'IA', [[1, 'PyTorch'], [2, 'Mapbox'], [3, 'YOLO']])];
		const result = planStackImport({
			plan,
			current,
			catalog: [
				{ id: 1, name: 'PyTorch' },
				{ id: 2, name: 'Mapbox' },
				{ id: 3, name: 'YOLO' },
			],
			projectSkillIds: [],
		});
		expect(result.alreadyApplied).toBe(true);
		expect(result.deleteCategories).toEqual([]);
		expect(result.createCategories).toEqual([]);
	});

	it('is not applied when only the order of the tools differs', () => {
		const current = [record(5, 'AI', 'IA', [[3, 'YOLO'], [1, 'PyTorch'], [2, 'Mapbox']])];
		const result = planStackImport({ plan, current, catalog: [], projectSkillIds: [] });
		expect(result.alreadyApplied).toBe(false);
	});
});
