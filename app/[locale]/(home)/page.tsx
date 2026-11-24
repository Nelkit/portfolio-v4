import { ClientWrapper } from '@/app/components/ClientWrapper';
import { notFound } from 'next/navigation';
import { getPublishedHero } from '@/app/lib/content/hero/hero-service';
import { getPublishedProfile } from '@/app/lib/content/profile/profile-service';
import { getPublishedProjects } from '@/app/lib/content/projects/project-service';
import { featuredProjects } from '@/app/lib/content/projects/project-display';
import { getPublishedSkillCategories } from '@/app/lib/content/skills/skill-service';
import { getPublishedCareer } from '@/app/lib/content/career/career-service';
import { careerYears } from '@/app/lib/content/career/career';
import { getPublishedEducation } from '@/app/lib/content/education/education-service';
import { getPublishedPosts } from '@/app/lib/content/posts/post-service';
import { toPostSummary } from '@/app/lib/content/posts/post';
import { isLocale } from '@/app/lib/i18n/routing';
import { chatModels, modelLabel } from '@/app/lib/chat/models';

export const revalidate = 604800;

/** Recent posts shown on the home page. */
const RECENT_POSTS = 3;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();

    const [posts, hero, profile, projects, skillCategories, career, education] = await Promise.all([
        getPublishedPosts(locale),
        // No row for this locale yet → the hero shows the dictionary fallback headline.
        getPublishedHero(locale),
        getPublishedProfile(locale),
        getPublishedProjects(locale),
        getPublishedSkillCategories(locale),
        getPublishedCareer(locale),
        getPublishedEducation(locale),
    ]);

    return (
        <ClientWrapper
            recentPosts={posts.slice(0, RECENT_POSTS).map(toPostSummary)}
            headline={hero?.headline}
            profile={profile}
            featuredProjects={featuredProjects(projects)}
            projectCount={projects.length}
            // Read on the server; the page re-renders on deploy, when env vars change.
            chatModel={modelLabel(chatModels().primary)}
            skillCategories={skillCategories}
            career={career.entries}
            // Depends on today's date: computed at render (page revalidates weekly).
            careerYears={career.since ? careerYears([{ start: career.since }]) : 0}
            education={education}
        />
    );
}
