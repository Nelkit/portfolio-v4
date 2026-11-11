'use client';

import Link from 'next/link';
import { useState } from 'react';
import { IArrowUR } from '@/app/components/icons';
import { AreaFilter, areaChips } from '@/app/components/AreaFilter';
import { useI18n } from '@/app/lib/i18n/I18nProvider';
import type { ProjectView } from '@/app/lib/content/projects/project';
import type { AreaView } from '@/app/lib/content/areas/area';

/** Projects grid with the area filter (client-side, so the page stays static). */
export function ProjectsListGrid({ projects, areas }: { projects: ProjectView[]; areas: AreaView[] }) {
	const { href } = useI18n();
	const [selected, setSelected] = useState<number | null>(null);
	const withArea = projects.map((p) => ({ ...p, areaId: p.area?.id ?? null }));
	const visible = selected === null ? withArea : withArea.filter((p) => p.areaId === selected);

	return (
		<>
			<AreaFilter areas={areaChips(areas, withArea)} total={projects.length} selected={selected} onSelect={setSelected} />
			<div className="proj-list-grid">
				{visible.map((p, idx) => {
					const featured = idx === 0;
					return (
						<Link key={p.slug} href={href(`/projects/${p.slug}`)}
							className={'proj-list-card' + (featured ? ' proj-list-card-feat' : '')}>
							{p.imageUrl ? (
								<div className="proj-list-thumb">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={p.imageUrl} alt={p.title} />
								</div>
							) : (
								<div className="proj-list-thumb proj-list-thumb-empty">
									<span>{String(idx + 1).padStart(2, '0')}</span>
								</div>
							)}
							<div className="proj-list-body">
								<div className="proj-list-meta">
									{p.area && <span className="proj-area">{p.area.name}</span>}
									{p.company && <span className="proj-company">{p.company}</span>}
								</div>
								<h2 className={'proj-list-title' + (featured ? ' proj-list-title-feat' : '')}>{p.title}</h2>
								{p.summary && <p className="proj-list-summary">{p.summary}</p>}
							</div>
							<span className="proj-list-go"><IArrowUR /></span>
						</Link>
					);
				})}
			</div>
		</>
	);
}
