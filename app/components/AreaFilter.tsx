'use client';

import { useI18n } from '@/app/lib/i18n/I18nProvider';

export type AreaChip = { id: number; name: string; count: number };

/**
 * "All" + one chip per area that has projects. Styled like the tech-stack
 * tabs. Hidden when there is nothing to filter (fewer than 2 areas in use).
 */
export function AreaFilter({
	areas,
	total,
	selected,
	onSelect,
}: {
	areas: AreaChip[];
	total: number;
	selected: number | null;
	onSelect: (id: number | null) => void;
}) {
	const { t } = useI18n();
	if (areas.length < 2) return null;

	const chip = (id: number | null, label: string, count: number) => (
		<button
			key={id ?? 'all'}
			type="button"
			className={'stack-tab' + (selected === id ? ' on' : '')}
			aria-pressed={selected === id}
			onClick={() => onSelect(id)}
		>
			{label}<span className="c">{String(count).padStart(2, '0')}</span>
		</button>
	);

	return (
		<div className="stack-tabs" role="group" aria-label={t.sections.projects.filterAria}>
			{chip(null, t.sections.projects.all, total)}
			{areas.map((a) => chip(a.id, a.name, a.count))}
		</div>
	);
}

/** Areas that have at least one project, in area order, with their project count. */
export function areaChips<T extends { areaId: number | null }>(
	areas: { id: number; name: string }[],
	projects: T[],
): AreaChip[] {
	return areas
		.map((a) => ({ ...a, count: projects.filter((p) => p.areaId === a.id).length }))
		.filter((a) => a.count > 0);
}
