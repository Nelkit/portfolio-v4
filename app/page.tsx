import { ClientWrapper } from '@/app/components/ClientWrapper';
import {getStrapiData} from "@/app/lib/strapi";

export default async function Home() {
    const strapiData =  await getStrapiData('/api/home-page');
    console.log(strapiData);
    return <ClientWrapper strapiData={strapiData} />;
}
