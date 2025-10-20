import { GET_PROPETRES } from '@/api/apiEndpoints';
import MetaData from '@/components/meta/MetaData';
import axios from 'axios';
import dynamic from 'next/dynamic';
const UserPropertyDetailsPage = dynamic(() => import('@/components/pagescomponents/UserPropertyDetailsPage'), { ssr: false })

const fetchDataFromSeo = async (slug) => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_PROPETRES}?slug_id=${slug}&with_seo=1`
        );

        const SEOData = response.data;

        return SEOData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

const index = ({ seoData, pageName }) => {
    return (
        <div>
            <MetaData
                title={seoData?.data?.[0]?.meta_title}
                description={seoData?.data?.[0]?.meta_description}
                keywords={seoData?.data?.[0]?.meta_keywords}
                ogImage={seoData?.data?.[0]?.meta_image}
                pageName={pageName}
                structuredData={seoData?.data?.[0]?.schema_markup}
            />
            <UserPropertyDetailsPage />
        </div >
    )
}


let serverSidePropsFunction;
if (process.env.NEXT_PUBLIC_SEO === 'true') {
    serverSidePropsFunction = async (context) => {
        const { params } = context;
        const encodedSlug = encodeURIComponent(params?.slug);
        const pageName = `/${params?.locale}/my-property/${(encodedSlug)}`;
        const seoData = await fetchDataFromSeo(encodedSlug);
        return {
            props: { seoData, pageName },
        };
    }
}

export const getServerSideProps = serverSidePropsFunction;

export default index