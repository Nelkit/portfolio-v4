import { ClientWrapper } from '@/app/components/ClientWrapper';
import { getStrapiData } from '@/app/lib/strapi';
import qs from 'qs';

const HOME_PAGE_QUERY = {
    populate: {
        avatarImage: {
            fields: ['url', 'alternativeText'],
        },
        socialNetworkLinks: '*',
        projectSection: {
            populate: {
                projects: {
                    fields: ['title', 'description', 'color', 'icon'],
                    populate: {
                        image: {
                            fields: ['url', 'alternativeText'],
                        },
                        skills: {
                            fields: ['title'],
                        },
                        expertiseArea: {
                            fields: ['code', 'title'],
                        },
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
                    fields: ['code','label', 'gradient', 'description', 'emphasis', 'isFeatured'],
                    populate: {
                        skills: {
                            fields: ['title'],
                        },
                    },
                }
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

function buildQueryString(query: object): string {
    return qs.stringify(query, {
        encodeValuesOnly: true,
    });
}

async function fetchHomePageData() {
    'use cache';
    const queryString = buildQueryString(HOME_PAGE_QUERY);
    const url = `/api/home-page?${queryString}`;
    console.log('Fetching Home Page Data from URL:', url);
    return getStrapiData(url);
}

export default async function Home() {
    const strapiData = await fetchHomePageData();
    console.log('Strapi Home Page Data:', strapiData);

    return <ClientWrapper strapiData={strapiData} />;
}
