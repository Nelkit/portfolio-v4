import { ClientWrapper } from '@/app/components/ClientWrapper';
import { getStrapiData } from '@/app/lib/strapi';
import { transformBlogEntries, type BlogEntry } from '@/app/data/content';
import qs from 'qs';

export const revalidate = 604800;

const HOME_PAGE_QUERY = {
    populate: {
        avatarImage: {
            fields: ['url', 'alternativeText'],
        },
        resume: {
            fields: ['url'],
        },
        ctaSection: {
            populate: {
                links: '*',
            },
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

export default async function Home() {
    const [strapiData, recentPosts] = await Promise.all([
        fetchHomePageData(),
        fetchRecentPosts(),
    ]);

    return <ClientWrapper strapiData={strapiData} recentPosts={recentPosts} />;
}
