import { ClientWrapper } from '@/app/components/ClientWrapper';
import { getStrapiData } from '@/app/lib/strapi';
import { transformBlogEntries, type BlogEntry } from '@/app/data/content';
import qs from 'qs';
import { notFound } from 'next/navigation';
import { getPublishedHero } from '@/app/lib/content/hero/hero-service';
import { getPublishedProfile } from '@/app/lib/content/profile/profile-service';
import { getPublishedProjects } from '@/app/lib/content/projects/project-service';
import { getPublishedAreas } from '@/app/lib/content/areas/area-service';
import { getPublishedSkillCategories } from '@/app/lib/content/skills/skill-service';
import { isLocale } from '@/app/lib/i18n/routing';

export const revalidate = 604800;

// Profile data (name, avatar, CV, links, contact) now comes from Turso.
// Strapi still provides the sections that have not been migrated yet.
const HOME_PAGE_QUERY = {
    populate: {
        educationSection: {
            populate: {
                educationEntries: {
                    fields: ['degree', 'institution', 'period', 'description', 'completionStatus'],
                },
            },
        },
        careerSection: {
            populate: {
                careerEntries: {
                    fields: ['period', 'title', 'detail', 'accent'],
                },
            },
        },
    },
};

const BLOG_QUERY = qs.stringify({
    fields: ['title', 'summary', 'publishedDate', 'readingTime', 'slug'],
    populate: {
        featuredImage: { fields: ['url'] },
        blog_tags: { fields: ['title'] },
    },
    sort: ['publishedDate:desc'],
    pagination: { pageSize: 3 },
}, { encodeValuesOnly: true });

function buildQueryString(query: object): string {
    return qs.stringify(query, { encodeValuesOnly: true });
}

async function fetchHomePageData() {
    const queryString = buildQueryString(HOME_PAGE_QUERY);
    return getStrapiData(`/api/home-page?${queryString}`);
}

async function fetchRecentPosts(): Promise<BlogEntry[]> {
    const data = await getStrapiData(`/api/blog-entries?${BLOG_QUERY}`);
    if (!data?.data?.length) return [];
    return transformBlogEntries(data.data);
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();

    const [strapiData, recentPosts, hero, profile, projects, areas, skillCategories] = await Promise.all([
        fetchHomePageData(),
        fetchRecentPosts(),
        // No row for this locale yet → the hero shows the dictionary fallback headline.
        getPublishedHero(locale),
        getPublishedProfile(locale),
        getPublishedProjects(locale),
        getPublishedAreas(locale),
        getPublishedSkillCategories(locale),
    ]);

    return (
        <ClientWrapper
            strapiData={strapiData}
            recentPosts={recentPosts}
            headline={hero?.headline}
            profile={profile}
            projects={projects}
            areas={areas}
            skillCategories={skillCategories}
        />
    );
}
