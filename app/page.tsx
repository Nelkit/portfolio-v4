import { ClientWrapper } from '@/app/components/ClientWrapper';
import { getStrapiData } from '@/app/lib/strapi';
import { transformBlogEntries, type BlogEntry } from '@/app/data/content';
import qs from 'qs';

export const revalidate = 60;

const HOME_PAGE_QUERY = {
    populate: {
        avatarImage: {
            fields: ['url', 'alternativeText'],
        },
        socialNetworkLinks: '*',
        projectSection: {
            populate: {
                projects: {
                    fields: ['title', 'description', 'summary', 'company', 'documentId'],
                    populate: {
                        image: { fields: ['url', 'alternativeText'] },
                        skills: { fields: ['title'] },
                        expertiseArea: { fields: ['code', 'title'] },
                        links: '*',
                    },
                },
                expertiseAreas: {
                    fields: ['code', 'title', 'description', 'icon', 'color'],
                },
            },
        },
        techStackSection: {
            populate: {
                skillCategories: {
                    fields: ['code', 'label', 'gradient', 'description', 'emphasis', 'isFeatured'],
                    populate: {
                        skills: {
                            fields: ['title'],
                        },
                    },
                },
            },
        },
        educationSection: {
            populate: {
                educationEntries: {
                    fields: ['degree', 'institution', 'period', 'description', 'completionStatus'],
                },
            },
        },
        aboutSection: {
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

const FALLBACK_POSTS: BlogEntry[] = [
    { slug: 'portfolio-v4', title: 'Building Portfolio v4: From Static HTML to an AI Agent Experience', summary: '', publishedDate: '2026-05-01', readingTime: 4, tags: ['Next.js', 'Design', 'AI'] },
    { slug: 'on-device-ml', title: 'Why I bet my career on on-device ML', summary: '', publishedDate: '2026-03-10', readingTime: 6, tags: ['ML', 'Mobile'] },
    { slug: 'shipping-mobile', title: 'Six rules for shipping mobile at scale', summary: '', publishedDate: '2026-01-20', readingTime: 9, tags: ['Mobile', 'Process'] },
];

function buildQueryString(query: object): string {
    return qs.stringify(query, { encodeValuesOnly: true });
}

async function fetchHomePageData() {
    const queryString = buildQueryString(HOME_PAGE_QUERY);
    return getStrapiData(`/api/home-page?${queryString}`);
}

async function fetchRecentPosts(): Promise<BlogEntry[]> {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const data = await getStrapiData(`/api/blog-entries?${BLOG_QUERY}`);
    if (!data?.data?.length) return FALLBACK_POSTS;
    return transformBlogEntries(data.data, strapiUrl);
}

export default async function Home() {
    const [strapiData, recentPosts] = await Promise.all([
        fetchHomePageData(),
        fetchRecentPosts(),
    ]);

    return <ClientWrapper strapiData={strapiData} recentPosts={recentPosts} />;
}
