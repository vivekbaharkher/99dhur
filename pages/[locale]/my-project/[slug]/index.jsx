import { GET_PROJECTS } from '@/api/apiEndpoints';
import MetaData from '@/components/meta/MetaData';
import UserProjectDetailsPage from '@/components/pagescomponents/UserProjectDetailsPage';
import axios from 'axios';

const fetchDataFromSeo = async (slug) => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_PROJECTS}?slug_id=${slug}`
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
            <UserProjectDetailsPage />
        </div>
    )
}

let serverSidePropsFunction;
if (process.env.NEXT_PUBLIC_SEO === 'true') {
    serverSidePropsFunction = async (context) => {
        const { params } = context;
        const encodedSlug = encodeURIComponent(params?.slug);
        const pageName = `/${params?.locale}/my-project/${(encodedSlug)}`;
        const seoData = await fetchDataFromSeo(encodedSlug);
        return {
            props: { seoData, pageName },
        };
    }
}

export const getServerSideProps = serverSidePropsFunction;
export default index