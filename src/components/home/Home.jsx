import * as api from "@/api/apiRoutes";
import {
    ArticleSectionSkeleton,
    CircularItemsSkeleton,
    CitiesSkeleton,
    FaqsSkeleton,
    FeaturedProjectsSkeleton,
    FeaturedPropertiesSkeleton,
    MainSwiperSkeleton,
    MapSkeleton,
    MostLikedSkeleton,
    MostViewedSkeleton,
    NearbyPropertiesSkeleton,
    PremiumPropertiesSkeleton,
    ProjectsSkeleton,
    PropertySectionSkeleton,
    UserRecommendationSkeleton
} from '@/components/skeletons/home/index';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useTranslation } from '../context/TranslationContext';
import LocationSearchWithRadius from '../location-search/LocationSearchWithRadius';
import { useQuery } from "@tanstack/react-query";
const MainSwiper = dynamic(() => import('../mainswiper/MainSwiper'), { ssr: false });
const Faqs = dynamic(() => import('../faqs/Faqs'), { ssr: false });


const HomeNewSectionOne = dynamic(() => import('../homepagesections/HomeNewSectionOne'), { ssr: false });
const HomeNewSectionFour = dynamic(() => import('../homepagesections/HomeNewSectionFour'), { ssr: false });
const PremiumPropertiesSection = dynamic(() => import('../homepagesections/PremiumPropertiesSection'), { ssr: false });
const AgentSwiperSection = dynamic(() => import('../homepagesections/AgentSwiperSection'), { ssr: false });
const HomeNewSectionTwo = dynamic(() => import('../homepagesections/HomeNewSectionTwo'), { ssr: false });
const HomePropertiesOnMap = dynamic(() => import('../homepagesections/HomePropertiesOnMap'), { ssr: false });


const Home = () => {
    const t = useTranslation();

    // --- Use the custom hook to get reactive login status ---
    const isUserLoggedIn = useAuthStatus();

    const userSelectedLocation = useSelector(state => state.location);
    const languageCode = useSelector(state => state.LanguageSettings?.current_language?.code);
    const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
    const settings = useSelector(state => state.WebSetting?.data);
    const isPropertiesOnMapEnabled = settings?.is_properties_on_map_section_active === true;
    const isNearByCitiesEnabled = settings?.is_properties_by_city_section_active === true;
    const isHomePageLocationAlertEnabled = settings?.homepage_location_alert_status === "1";
    const isLanguageLoaded = useSelector(state => state.LanguageSettings?.isLanguageLoaded);

    // Memoized API call function to prevent unnecessary re-renders
    const fetchHomeData = async () => {
        try {
            const response = await api.getHomePageData({
                latitude: userSelectedLocation?.latitude,
                longitude: userSelectedLocation?.longitude,
                radius: userSelectedLocation?.radius
            });
            if (response?.data?.homepage_location_data_available === false && isHomePageLocationAlertEnabled) {
                Swal.fire({
                    title: t("locationDataNotAvailable"),
                    text: t("pleaseChangeLocationOrContinue"),
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: t("changeLocation"),
                    cancelButtonText: t("continue"),
                    customClass: {
                        confirmButton: "Swal-confirm-buttons",
                        cancelButton: "Swal-cancel-buttons",
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        setIsLocationPopupOpen(true);
                    }
                });
            }

            // Update state with new data
            setHomePageData(response.data);

            // Update refs with current values to track changes
            prevLocationRef.current = {
                latitude: userSelectedLocation?.latitude,
                longitude: userSelectedLocation?.longitude,
                radius: userSelectedLocation?.radius
            };
            prevAuthStatusRef.current = isUserLoggedIn;
            prevLanguageRef.current = languageCode;
            dataFetchedRef.current = true;

            return response.data;
        } catch (error) {
            console.error("Error fetching home data:", error);
            return null;
        }
    };

    const query = useQuery({
        queryKey: [
            'homePageData',
            userSelectedLocation?.latitude,
            userSelectedLocation?.longitude,
            userSelectedLocation?.radius,
            isUserLoggedIn,
        ],
        queryFn: fetchHomeData,
        keepPreviousData: true,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    })

    const [homePageData, setHomePageData] = useState(query.data ?? []);
    const [isLoading, setIsLoading] = useState(true);

    // Use refs to track previous values for comparison
    const prevLocationRef = useRef({
        latitude: userSelectedLocation?.latitude,
        longitude: userSelectedLocation?.longitude,
        radius: userSelectedLocation?.radius
    });
    const prevAuthStatusRef = useRef(isUserLoggedIn);
    const prevLanguageRef = useRef(languageCode);
    const dataFetchedRef = useRef(false);


    const mapQuery = useQuery({
        queryKey: ['homePageMap', userSelectedLocation?.latitude, userSelectedLocation?.longitude, userSelectedLocation?.radius],
        queryFn: async () => {
            const response = await api.getHomepagePropertiesOnMapSectionApi({
                // latitude: userSelectedLocation?.latitude,
                // longitude: userSelectedLocation?.longitude,
                // radius: userSelectedLocation?.radius
            });
            return response?.data?.data ?? [];
        },
        enabled: !!homePageData?.sections, // only run after base data exists
        keepPreviousData: true,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    const citiesQuery = useQuery({
        queryKey: ['homePageCities'],
        queryFn: async () => {
            const response = await api.getHomepagePropertyByCitiesSectionApi();
            return response?.data?.data ?? [];
        },
        enabled: !!homePageData?.sections,
        keepPreviousData: true,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });


    const mergedSections = homePageData?.sections?.map(section => {
        if (section.type === "properties_on_map_section") {
            return { ...section, data: mapQuery.data ?? [] };
        }
        if (section.type === "properties_by_cities_section") {
            return { ...section, data: citiesQuery.data ?? [] };
        }
        return section;
    });



    // Effect to fetch data when dependencies change
    // useEffect(() => {
    //     let isMounted = true;
    //     setIsLoading(true);

    //     const loadData = async () => {
    //         // Always fetch data when language changes or any other dependency changes
    //         // This ensures translated content is fetched properly
    //         const data = await fetchHomeData();
    //         if (isMounted && data) {
    //             setIsLoading(false);
    //         }
    //     };

    //     loadData();

    //     // Cleanup function
    //     return () => {
    //         isMounted = false;
    //     };
    // }, [fetchHomeData]);

    const getSectionInfo = (type) => {
        switch (type) {
            case "nearby_properties_section":
                return { Component: HomeNewSectionOne, style: null, buttonText: "exploreMoreListings" };
            case "most_viewed_properties_section":
                return { Component: HomeNewSectionTwo, style: null, label: "checkOutMostViewed" };
            case "most_liked_properties_section":
                return { Component: HomeNewSectionTwo, style: null, label: "seeMostLiked" };
            case "properties_by_cities_section":
                return { Component: HomeNewSectionTwo, style: "style_2", label: "exploreCities" };
            case "featured_projects_section":
                return { Component: PremiumPropertiesSection, style: "style_1", buttonLink: "/projects/featured-projects", buttonText: "browseFeaturedProjects" };
            case "user_recommendations_section":
                return { Component: HomeNewSectionOne, style: "style_1", buttonText: "exploreMoreListings" };
            case "categories_section":
                return { Component: HomeNewSectionOne, style: "style_1", buttonLink: "/all/categories", buttonText: "exploreCategories" };
            case "agents_list_section":
                return { Component: AgentSwiperSection, style: null };
            case "articles_section":
                return { Component: HomeNewSectionOne, style: "style_3", buttonLink: "/all/articles", buttonText: "readMoreInsights" };
            case "projects_section":
                return { Component: HomeNewSectionTwo, style: "style_4", label: "exploreProjects" };
            case "faqs_section":
                return { Component: Faqs, style: null };
            case "featured_properties_section":
                return { Component: HomeNewSectionFour, style: null, buttonText: "seeFeaturedProperties" };
            case "premium_properties_section":
                return { Component: PremiumPropertiesSection, style: null, buttonText: "seeAllPremiumProperties" };
            case "properties_on_map_section":
                return { Component: HomePropertiesOnMap, style: null, label: "exploreOnMap" };
            default:
                console.warn("Unknown section type:", type);
                return { Component: null, style: null };
        }
    };

    // --- Define a typical order for skeleton sections ---
    const SKELETON_SECTION_ORDER = [
        'featured_properties_section',
        'categories_section',
        'nearby_properties_section',
        'most_viewed_properties_section',
        'most_liked_properties_section',
        'properties_by_cities_section',
        'agents_list_section',
        'projects_section',
        'articles_section',
        'premium_properties_section',
        'user_recommendations_section',
        'featured_projects_section',
        'properties_on_map_section',
    ];

    // --- Helper to get the correct skeleton component based on type ---
    const getSkeletonForType = (type) => {
        switch (type) {
            case "nearby_properties_section":
                return NearbyPropertiesSkeleton;
            case "most_viewed_properties_section":
                return MostViewedSkeleton;
            case "most_liked_properties_section":
                return MostLikedSkeleton;
            case "featured_properties_section":
                return FeaturedPropertiesSkeleton;
            case "user_recommendations_section":
                return UserRecommendationSkeleton;
            case "properties_by_cities_section":
                return CitiesSkeleton;
            case "categories_section":
                return CircularItemsSkeleton;
            case "agents_list_section":
                return CircularItemsSkeleton;
            case "articles_section":
                return ArticleSectionSkeleton;
            case "projects_section":
                return ProjectsSkeleton;
            case "premium_properties_section":
                return PremiumPropertiesSkeleton;
            case "featured_projects_section":
                return FeaturedProjectsSkeleton;
            case "properties_on_map_section":
                return MapSkeleton;
            // FaqsSkeleton is handled separately at the end
            default:
                return PropertySectionSkeleton; // Fallback to a default skeleton
        }
    };

    // Using external skeleton components imported from @/components/skeletons/home

    return (
        <section className=''>
            {query?.isFetching || mapQuery.isFetching || citiesQuery.isFetching ? (
                // Skeleton UI during loading
                <>
                    <MainSwiperSkeleton />
                    <div className='flex flex-col'>
                        {SKELETON_SECTION_ORDER.map((type, index) => {
                            const SkeletonComponent = getSkeletonForType(type);
                            return <SkeletonComponent key={index} title={`Loading Section ${index + 1}...`} />;
                        })}
                    </div>
                    <FaqsSkeleton />
                </>
            ) : (
                // Actual content when data is loaded
                <>
                    <MainSwiper slides={homePageData?.slider_section} />
                    <div className='flex flex-col'>
                        {mergedSections?.map((apiSection, index) => {
                            const { Component, style, label, buttonLink, buttonText } = getSectionInfo(apiSection.type);
                            if (Component) {
                                // Special case for properties_nearby_cities which uses a different data source
                                const sectionData = apiSection.data;

                                // Make sure data is not empty or null before rendering
                                if (apiSection.type === 'faqs_section') {
                                    if (sectionData && Array.isArray(sectionData) && sectionData.length > 0) {
                                        return <Component translated_title={apiSection?.translated_title} faqs={sectionData} key={index} />;
                                    }
                                } else if (apiSection.type === 'featured_properties_section') {
                                    if (sectionData && Array.isArray(sectionData) && sectionData.length > 0) {
                                        return <Component translated_title={apiSection?.translated_title} title={apiSection.title} data={sectionData} key={index} index={index} name={apiSection.type} buttonLink={buttonLink} buttonText={buttonText} />;
                                    }
                                } else if (apiSection.type === 'properties_on_map_section') {
                                    return <Component translated_title={apiSection?.translated_title} title={apiSection.title} data={sectionData} key={index} index={index} name={apiSection.type} />;
                                } else if (sectionData && (!Array.isArray(sectionData) || sectionData.length > 0)) {
                                    return (
                                        <Component
                                            translated_title={apiSection?.translated_title}
                                            title={apiSection.title}
                                            data={sectionData}
                                            key={index}
                                            index={index}
                                            name={apiSection.type}
                                            label={label}
                                            type={apiSection.type}
                                            buttonLink={buttonLink}
                                            buttonText={buttonText}
                                        />
                                    );
                                }
                            }
                            return null; // Don't render if no component found or data is empty
                        })}
                    </div>
                </>
            )}
            {isLocationPopupOpen && (
                <LocationSearchWithRadius
                    isOpen={isLocationPopupOpen}
                    onClose={() => setIsLocationPopupOpen(false)}
                />
            )}
        </section>
    );
};

export default Home;