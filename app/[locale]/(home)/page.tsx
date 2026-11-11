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
import { getPublishedCareer } from '@/app/lib/content/career/career-service';
import { careerYears } from '@/app/lib/content/career/career';
import { getPublishedEducation } from '@/app/lib/content/education/education-service';
import { isLocale } from '@/app/lib/i18n/routing';

export const revalidate = 604800;

// Every home section comes from Turso; only the recent blog posts still come
// from Strapi (until the blog stories #11–#14).
const BLOG_QUERY = qs.stringify({
    fields: ['title', 'summary', 'publishedDate', 'readingTime', 'slug'],
    populate: {
        featuredImage: { fields: ['url'] },
        blog_tags: { fields: ['title'] },
    },
    sort: ['publishedDate:desc'],
    pagination: { pageSize: 3 },
}, { encodeValuesOnly: true });

async function fetchRecentPosts(): Promise<BlogEntry[]> {
    const data = await getStrapiData(`/api/blog-entries?${BLOG_QUERY}`);
    if (!data?.data?.length) return [];
    return transformBlogEntries(data.data);
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();

    const [recentPosts, hero, profile, projects, areas, skillCategories, career, education] = await Promise.all([
        fetchRecentPosts(),
        // No row for this locale yet → the hero shows the dictionary fallback headline.
        getPublishedHero(locale),
        getPublishedProfile(locale),
        getPublishedProjects(locale),
        getPublishedAreas(locale),
        getPublishedSkillCategories(locale),
        getPublishedCareer(locale),
        getPublishedEducation(locale),
    ]);

    return (
        <ClientWrapper
            recentPosts={recentPosts}
            headline={hero?.headline}
            profile={profile}
            projects={projects}
            areas={areas}
            skillCategories={skillCategories}
            career={career.entries}
            // Depends on today's date: computed at render (page revalidates weekly).
            careerYears={career.since ? careerYears([{ start: career.since }]) : 0}
            education={education}
        />
    );
}
