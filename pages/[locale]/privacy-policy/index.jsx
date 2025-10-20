import { GET_SEO_SETTINGS } from "@/api/apiEndpoints";
import MetaData from "@/components/meta/MetaData";
import axios from "axios";
import dynamic from "next/dynamic";
const PrivacyPolicyPage = dynamic(
  () => import("@/components/pagescomponents/PrivacyPolicyPage"),
  { ssr: false },
);
const fetchDataFromSeo = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_SEO_SETTINGS}?page=privacy-policy`
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
        pageName={seoData?.data?.[0]?.page || pageName}
        structuredData={seoData?.data?.[0]?.schema_markup}
      />
      <PrivacyPolicyPage />
    </div>
  );
};

let serverSidePropsFunction = null;
if (process.env.NEXT_PUBLIC_SEO === "true") {
  serverSidePropsFunction = async (context) => {
    const { params } = context; // Extract query and request object from context
    const pageName = `/${params.locale}/privacy-policy/`;
    const seoData = await fetchDataFromSeo();
    // Pass the fetched data as props to the page component
    return {
      props: {
        seoData,
        pageName,
      },
    };
  };
}

export const getServerSideProps = serverSidePropsFunction;

export default index;
