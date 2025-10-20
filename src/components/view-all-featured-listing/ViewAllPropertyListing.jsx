import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "../context/TranslationContext";
import dynamic from "next/dynamic";
import { getCountbyCityApi, getPropertyListApi } from "@/api/apiRoutes";
import PropertyVerticalCard from "../cards/PropertyVerticalCard";
import PropertyHorizontalCard from "../cards/PropertyHorizontalCard";
import NewBreadcrumb from "../breadcrumb/NewBreadCrumb";
import PropertySideFilter from "../pagescomponents/PropertySideFilter";
import VerticlePropertyCardSkeleton from "../skeletons/VerticlePropertyCardSkeleton";
import PropertySideFilterSkeleton from "../skeletons/PropertySideFilterSkeleton";
import NewBreadcrumbSkeleton from "../skeletons/NewBreadcrumbSkeleton";
import { Sheet, SheetContent } from "../ui/sheet";
import FilterTopBarSkeleton from "../skeletons/FilterTopBarSkeleton";
import FilterTopBar from "../reusable-components/FilterTopBar";
import { useSelector } from "react-redux";
import { getPostedSince, isRTL, generateBase64FilterUrl, decodeBase64FilterUrl } from "@/utils/helperFunction";
import NoDataFound from "../no-data-found/NoDataFound";

const PropertyCityCard = dynamic(() => import("../cards/PropertyCityCard"), {
  ssr: false,
});

const ViewAllPropertyListing = () => {
  const router = useRouter();
  const t = useTranslation();
  const { locale } = router?.query || {};
  const searchParams = router?.query || {};

  const slug = router?.query?.slug;
  const isRtl = isRTL();

  const initializeFiltersFromQuery = useCallback(() => {
    // Use router.query with fallbacks for when query params might be undefined
    const query = router?.query || {};
    // Check if we have a base64 encoded filters parameter
    if (query.filters) {
      try {
        const decodedFilters = decodeBase64FilterUrl(decodeURIComponent(query.filters));
        // Convert the decoded API format back to internal filter format
        return {
          property_type: decodedFilters.property_type === 0 ? "Sell" : decodedFilters.property_type === 1 ? "Rent" : "",
          category_id: decodedFilters.category_id || "",
          category_slug_id: decodedFilters.category_slug_id || "",
          city: decodedFilters.location?.city || "",
          state: decodedFilters.location?.state || "",
          country: decodedFilters.location?.country || "",
          min_price: decodedFilters.price?.min_price || "",
          max_price: decodedFilters.price?.max_price || "",
          posted_since: decodedFilters.posted_since || "",
          promoted: decodedFilters.flags?.promoted === 1,
          keywords: decodedFilters.search || "",
          amenities: decodedFilters.parameters || [],
          nearby_places: decodedFilters.nearby_places || [],
          is_premium: decodedFilters.flags?.get_all_premium_properties === 1,
          latitude: decodedFilters.location?.latitude || undefined,
          longitude: decodedFilters.location?.longitude || undefined,
          range: decodedFilters.location?.range || undefined,
        };
      } catch (error) {
        console.error("Error decoding filters from URL:", error);
        // Fall back to default filters if decoding fails
      }
    }

    // Return default filters with context-based values
    return {
      property_type: "",
      category_id: "",
      category_slug_id: "",
      city: "",
      state: "",
      country: "",
      min_price: "",
      max_price: "",
      posted_since: "",
      promoted: false,
      keywords: "",
      amenities: [],
      nearby_places: [],
      is_premium: false,
      latitude: undefined,
      longitude: undefined,
      range: undefined,
    };
  }, [router?.query]);

  const [propertyData, setPropertyData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [viewType, setViewType] = useState('grid');
  const [filters, setFilters] = useState(initializeFiltersFromQuery());
  // Helper function to initialize filters from base64 encoded URL parameter
  // const initializeFiltersFromQuery = useCallback(() => {
  //   const query = router?.query || {};

  //   // Check if we have a base64 encoded filters parameter
  //   if (query.filters) {
  //     try {
  //       const decodedFilters = decodeBase64FilterUrl(decodeURIComponent(query.filters));

  //       // Convert parameters array back to amenities array
  //       const amenities = Array.isArray(decodedFilters.parameters)
  //         ? decodedFilters.parameters.map(param => param.id || param.value).filter(id => id !== undefined)
  //         : [];

  //       // Convert the decoded API format back to internal filter format
  //       return {
  //         property_type: decodedFilters.property_type === 0 ? "Sell" : decodedFilters.property_type === 1 ? "Rent" : "All",
  //         category_id: decodedFilters.category_id || "",
  //         category_slug_id: decodedFilters.category_slug_id || "",
  //         city: decodedFilters.location?.city || "",
  //         state: decodedFilters.location?.state || "",
  //         country: decodedFilters.location?.country || "",
  //         min_price: decodedFilters.price?.min_price || "",
  //         max_price: decodedFilters.price?.max_price || "",
  //         posted_since: decodedFilters.posted_since || "",
  //         keywords: decodedFilters.search || "",
  //         amenities: amenities,
  //         is_premium: decodedFilters.flags?.get_all_premium_properties ? "1" : "",
  //         promoted: decodedFilters.flags?.promoted ? "1" : "",
  //         most_viewed: decodedFilters.flags?.most_views ? "1" : "",
  //         most_liked: decodedFilters.flags?.most_liked ? "1" : "",
  //         sortBy: "newest", // Default sort
  //         latitude: decodedFilters.location?.latitude,
  //         longitude: decodedFilters.location?.longitude,
  //         range: decodedFilters.location?.range,
  //         nearbyPlaces: decodedFilters.nearby_places || [],
  //       };
  //     } catch (error) {
  //       console.error("Error decoding base64 filters:", error);
  //       // Fall back to searchParams if base64 decoding fails
  //       return {
  //         keywords: searchParams?.keywords || "",
  //         property_type: searchParams?.property_type || "All",
  //         category_id: "",
  //         category_slug_id: "",
  //         city: "",
  //         state: "",
  //         country: "",
  //         min_price: "",
  //         max_price: "",
  //         posted_since: "",
  //         sortBy: "newest",
  //         most_viewed: "",
  //         most_liked: "",
  //         promoted: searchParams?.promoted,
  //         is_premium: searchParams?.is_premium || "",
  //         amenities: searchParams?.amenities ? searchParams?.amenities?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) : [],
  //       };
  //     }
  //   }

  //   // If no base64 filters, use searchParams as fallback
  //   return {
  //     keywords: searchParams?.keywords || "",
  //     property_type: searchParams?.property_type || "All",
  //     category_id: "",
  //     category_slug_id: "",
  //     city: "",
  //     state: "",
  //     country: "",
  //     min_price: "",
  //     max_price: "",
  //     posted_since: "",
  //     sortBy: "newest",
  //     most_viewed: "",
  //     most_liked: "",
  //     promoted: searchParams?.promoted,
  //     is_premium: searchParams?.is_premium || "",
  //     amenities: searchParams?.amenities ? searchParams?.amenities?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) : [],
  //   };
  // }, [router?.query, searchParams]);

  // Initialize filters with either base64 decoded values or searchParams
  useEffect(() => {
    if (router.isReady) {
      const initialFilters = initializeFiltersFromQuery();
      setFilters(initialFilters);
    }
  }, [router.isReady, initializeFiltersFromQuery]);

  const language = useSelector((state) => state?.LanguageSettings?.current_language);


  // Track if initial fetch has been done to prevent duplicate calls
  const hasInitialFetched = useRef(false);
  const prevFiltersRef = useRef();
  const prevSlugRef = useRef();

  const limit = 12;

  // Dedicated effect to handle slug changes
  useEffect(() => {
    if (!slug) return; // Skip if slug is not yet available

    // Reset pagination state when slug changes
    setPropertyData([]);
    setOffset(0);
    setHasMoreData(false);
    setTotalItems(0);
    setInitialLoading(true);

    // Reset the initial fetch tracker when slug changes
    hasInitialFetched.current = false;

    // Check if we have base64 filters in URL - if so, don't override with slug defaults
    const query = router?.query || {};
    const hasBase64Filters = query.filters;

    if (!hasBase64Filters) {
      // Only set slug-specific filters if there are no base64 filters in URL
      const updatedFilters = {
        ...filters,
        // Clear all slug-specific parameters
        most_viewed: "",
        most_liked: "",
        promoted: "",
      };

      // Set the appropriate filter based on the new slug
      if (slug === "most-viewed-properties") {
        updatedFilters.most_viewed = "1";
      } else if (slug === "most-favourite-properties") {
        updatedFilters.most_liked = "1";
      } else if (slug === "featured-properties") {
        updatedFilters.promoted = "1";
      }
      // Update filters state with the new values
      setFilters(updatedFilters);
    }

    // Store current slug for reference in future changes
    prevSlugRef.current = slug;
  }, [slug, router?.query?.filters]); // Also depend on filters query param

  // This effect handles pagination only
  useEffect(() => {
    // Skip initial render and only run when offset increases (Load More was clicked)
    if (offset > 0 && slug) {
      // Use current filters for load more functionality
      if (slug !== "properties-nearby-city") {
        // For property listings, use current filters
        const dataConfig = fetchDataHelper.find(
          (item) => item.slug === slug,
        );
        if (dataConfig) {
          // Merge current filters with the config data
          const mergedFilters = { ...dataConfig.data, ...filters };
          handleFetchData(mergedFilters, offset);
        }
      } else {
        // For city data, use the city API
        handleFetchCityData(offset);
      }
    }
  }, [offset]); // Only depends on offset

  const handleLoadMore = () => {
    if (hasMoreData) {
      setOffset((prev) => prev + limit);
    }
  };

  const handleFetchData = async (params, currentOffset) => {
    try {
      setIsLoading(true);

      // Transform internal filter format to API format
      const propertyType = params?.property_type === "Sell" ? 0 : params?.property_type === "Rent" ? 1 : "";

      // Transform amenities array to parameters format
      const parameters = Array.isArray(params?.amenities)
        ? params.amenities.map(amenityId => ({
          id: amenityId,
          value: amenityId.toString()
        }))
        : [];

      // Build location object
      const location = {
        country: params?.country || "",
        state: params?.state || "",
        city: params?.city || "",
        place_id: params?.place_id || "",
        latitude: params?.latitude || null,
        longitude: params?.longitude || null,
        range: params?.range || null
      };

      // Build price object
      const price = {
        min_price: params?.min_price ? parseInt(params.min_price) : null,
        max_price: params?.max_price ? parseInt(params.max_price) : null
      };

      // Build flags object
      const flags = {
        promoted: params?.promoted === "1" || params?.promoted === true ? 1 : 0,
        get_all_premium_properties: params?.is_premium === "1" || params?.is_premium === true ? 1 : 0,
        most_views: params?.most_viewed === "1" ? 1 : 0,
        most_liked: params?.most_liked === "1" ? 1 : 0
      };

      // Prepare API parameters in the new format
      const apiParams = {
        property_type: propertyType,
        category_id: params?.category_id ? parseInt(params.category_id) : "",
        category_slug_id: params?.category_slug_id || "",
        parameters: parameters,
        nearby_places: params?.nearbyPlaces || [],
        location: location,
        price: price,
        posted_since: getPostedSince(params?.posted_since) || 0,
        search: params?.keywords || "",
        flags: flags,
        limit: limit.toString(),
        offset: currentOffset.toString(),
      };

      const res = await getPropertyListApi(apiParams);
      if (!res?.error) {
        // If offset is 0, replace data; otherwise append
        if (currentOffset === 0) {
          setPropertyData(res?.data);
        } else {
          setPropertyData((prev) => [...prev, ...res?.data]);
        }
        // Evaluate if more data is available
        evaluateMoreData(
          res?.total || 0,
          currentOffset,
          res?.data?.length || 0,
        );
      }
      setIsLoading(false);
      setInitialLoading(false); // Set initial loading to false after first fetch
    } catch (err) {
      setIsLoading(false);
      setInitialLoading(false); // Set initial loading to false even on error
      setHasMoreData(false);
    }
  };

  const handleFetchCityData = async (currentOffset) => {
    try {
      setIsLoading(true);
      // Use the passed offset rather than the state value
      const params = {
        limit: limit.toString(),
        offset: currentOffset.toString(),
      };
      const res = await getCountbyCityApi(params);
      if (!res?.error) {
        // If offset is 0, replace data; otherwise append
        if (currentOffset === 0) {
          setPropertyData(res?.data);
        } else {
          setPropertyData((prev) => [...prev, ...res?.data]);
        }
        // Evaluate if more data is available
        evaluateMoreData(
          res?.total || 0,
          currentOffset,
          res?.data?.length || 0,
        );
      }
      setIsLoading(false);
      setInitialLoading(false); // Set initial loading to false after first fetch
    } catch (err) {
      console.error("Error fetching nearby cities:", err); // Fixed typo
      setIsLoading(false);
      setInitialLoading(false); // Set initial loading to false even on error
      setHasMoreData(false);
    }
  };

  // More data evaluation helper
  const evaluateMoreData = (total, currentOffset, loadedItems) => {
    // Store total for future reference
    setTotalItems(total);

    // Check if we've loaded all available items
    const hasMore = currentOffset + loadedItems < total;
    setHasMoreData(hasMore);

    return hasMore;
  };

  const fetchDataHelper = [
    {
      slug: "featured-properties",
      data: {
        promoted: "1",
      },
    },
    {
      slug: "most-viewed-properties",
      data: {
        most_viewed: "1",
      },
    },
    {
      slug: "most-favourite-properties",
      data: {
        most_liked: "1",
      },
    },
    {
      slug: "properties-nearby-city",
      data: {},
    },
  ];

  const featureSectionLists = [
    {
      name: "featuredProperties",
      data: propertyData,
      title: t("featuredProperties"),
    },
    {
      name: "mostViewedProperties",
      data: propertyData,
      title: t("mostViewedProperties"),
    },
    {
      name: "mostFavouriteProperties",
      data: propertyData,
      title: t("mostFavouriteProperties"),
    },
    {
      name: "propertiesNearbyCity",
      data: propertyData,
      title: t("propertiesNearbyCity"),
    },
  ];

  useEffect(() => {
    // Skip if no filters or slug
    if (!filters || !slug) return;

    // Skip this effect if it's triggered by the slug change effect
    // This prevents duplicate fetches when slug changes
    if (prevSlugRef.current !== slug) return;

    // Only run fetch if filters change (not on initial mount)
    if (hasInitialFetched.current) {
      // Reset data and pagination
      setPropertyData([]);
      setOffset(0);
      setHasMoreData(false);
      setTotalItems(0);

      // Fetch data based on current filters
      if (slug !== "properties-nearby-city") {
        const dataConfig = fetchDataHelper.find(
          (item) => item.slug === slug,
        );
        if (dataConfig) {
          const mergedFilters = { ...dataConfig.data, ...filters };
          handleFetchData(mergedFilters, 0);
        }
      } else {
        handleFetchCityData(0);
      }
    } else {
      // Initial fetch
      hasInitialFetched.current = true;

      if (slug !== "properties-nearby-city") {
        const dataConfig = fetchDataHelper.find(
          (item) => item.slug === slug,
        );
        if (dataConfig) {
          const mergedFilters = { ...dataConfig.data, ...filters };
          handleFetchData(mergedFilters, 0);
        }
      } else {
        handleFetchCityData(0);
      }
    }

    // Update filters ref for next comparison
    prevFiltersRef.current = filters;
  }, [filters, language]); // Only depend on filters changes

  const handleFilterApply = (newFilters) => {
    // Reset data and pagination state before applying new filters
    setPropertyData([]);
    setOffset(0);
    setHasMoreData(false);
    setTotalItems(0);

    // Reset the initial fetch tracker since this is an explicit filter change
    hasInitialFetched.current = false;

    // Find the data configuration for the current slug
    const dataConfig = fetchDataHelper.find((item) => item.slug === slug);

    // Prepare the merged filters, keeping slug-specific parameters
    const slugSpecificParams = {
      most_viewed: slug === "most-viewed-properties" ? "1" : "",
      most_liked: slug === "most-favourite-properties" ? "1" : "",
      promoted: slug === "featured-properties" ? "1" : newFilters?.promoted === true ? "1" : "",
    };

    // Merge new filters with slug-specific parameters
    const mergedFilters = {
      ...newFilters,
      ...slugSpecificParams
    };
    setFilters(mergedFilters);

    // Generate base64 encoded filters for URL
    const options = {
      isCityPage: false,
      citySlug: '',
      sortBy: mergedFilters.sortBy || 'newest',
      isCategoryPage: false,
      categorySlug: ''
    };

    const encodedFilters = encodeURIComponent(generateBase64FilterUrl(mergedFilters, options));

    // Set isReady flag to trigger data fetch
    setIsReady(true);
    if (isFilterSheetOpen) {
      setIsFilterSheetOpen(false);
    }

    // Navigate to URL with base64 encoded filters
    try {
      router?.push(
        {
          pathname: `/${locale}/properties/${slug}`,
          query: { filters: encodedFilters },
        },
        `/${locale}/properties/${slug}?filters=${encodedFilters}`
      );
    } catch (error) {
      console.error("Error updating URL with base64 filters:", error);
    }
  };

  const handleClearFilter = () => {
    // Reset data and pagination state before clearing filters
    setPropertyData([]);
    setOffset(0);
    setHasMoreData(false);
    setTotalItems(0);

    // Reset the initial fetch tracker since this is an explicit filter change
    hasInitialFetched.current = false;

    // Prepare slug-specific parameters
    const slugSpecificParams = {
      most_viewed: slug === "most-viewed-properties" ? "1" : "",
      most_liked: slug === "most-favourite-properties" ? "1" : "",
      promoted: slug === "featured-properties" ? "1" : "",
    };

    // Reset filters back to defaults but preserve slug-specific parameters
    const clearedFilters = {
      keywords: "",
      property_type: "All",
      category_id: "",
      category_slug_id: "",
      city: "",
      state: "",
      country: "",
      min_price: "",
      max_price: "",
      posted_since: "",
      sortBy: "newest",
      amenities: [],
      ...slugSpecificParams
    };

    if (isFilterSheetOpen) {
      setIsFilterSheetOpen(false);
    }
    setFilters(clearedFilters);

    // Navigate to clean URL without filters parameter for cleared filters
    router?.push(`/${locale}/properties/${slug}`);
  };

  return (
    <main className="">
      {/* Conditional Breadcrumb - show skeleton during initial loading */}
      {initialLoading ? (
        <NewBreadcrumbSkeleton />
      ) : (
        <NewBreadcrumb title={t(slug)} items={[{ label: t(slug), href: `/${slug}` }]} />
      )}

      <div className="container mx-auto py-10 md:py-[60px] px-4 md:px-2">
        {/* Conditional layout based on slug */}
        {slug === "properties-nearby-city" ? (
          // Normal grid layout for properties-nearby-city (no side filter)
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Loading skeletons for initial load */}
            {isLoading && propertyData.length === 0 && (
              <>
                {[...Array(12)].map((_, index) => (
                  <VerticlePropertyCardSkeleton key={`skeleton-${index}`} />
                ))}
              </>
            )}

            {!isLoading && propertyData.length === 0 && (
              <div className="col-span-12 flex items-center justify-center">
                <NoDataFound
                  title={t("noDataFound")}
                />
              </div>
            )}

            {/* Actual data */}
            {!isLoading || propertyData.length > 0 ? (
              featureSectionLists?.map((section, index) => {
                if (section.name === "propertiesNearbyCity") {
                  return section?.data?.map((data, index) => (
                    <PropertyCityCard property={data} key={data?.City} />
                  ));
                }
              })
            ) : null}

            {/* Load more skeletons */}
            {isLoading && propertyData.length > 0 && (
              <>
                {[...Array(4)].map((_, index) => (
                  <VerticlePropertyCardSkeleton key={`load-more-skeleton-${index}`} />
                ))}
              </>
            )}
          </div>
        ) : (
          // Layout with side filter for other slugs
          <div className="grid grid-cols-12 gap-4">

            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetContent
                side={isRtl ? "left" : "right"}
                className="flex h-full w-full flex-col place-content-center !p-0 [&>button]:hidden"
              >
                <div className="overflow-y-auto no-scrollbar h-full p-2">
                  <PropertySideFilter
                    showBorder={false}
                    onFilterApply={handleFilterApply}
                    handleClearFilter={handleClearFilter}
                    setIsFilterSheetOpen={setIsFilterSheetOpen}
                    isMobileSheet={true}
                    currentFilters={filters}
                    hideFilter={true}
                    hideFilterType={slug}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <div className="col-span-12 xl:col-span-3 sticky xl:top-[15vh] xl:self-start">


              {/* Conditional PropertySideFilter - show skeleton during initial loading */}
              <div className="hidden xl:block">
                {initialLoading ? (
                  <PropertySideFilterSkeleton />
                ) : (
                  <PropertySideFilter
                    onFilterApply={handleFilterApply}
                    handleClearFilter={handleClearFilter}
                    currentFilters={filters}
                    hideFilter={true}
                    hideFilterType={slug}
                  />
                )}
              </div>
            </div>
            <div className="col-span-12 h-fit xl:col-span-9">
              {/* Property Top Filter Bar */}
              {initialLoading ? (
                <FilterTopBarSkeleton />
              ) : (
                <FilterTopBar
                  itemCount={propertyData.length}
                  totalItems={totalItems}
                  viewType={viewType}
                  setViewType={setViewType}
                  sortBy={filters.sortBy || "newest"}
                  setSortBy={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  onOpenFilters={() => setIsFilterSheetOpen(true)}
                  showFilterButton={true}
                  showSortBy={false}
                />
              )}

              {/* Property Cards Grid/List */}
              <div className={`${viewType === 'grid' ? 'grid grid-cols-1 place-items-center gap-4 sm:grid-cols-2 md:grid-cols-3' : 'grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-1 place-items-center'}`}>
                {/* Loading skeletons for initial load */}
                {isLoading && propertyData.length === 0 && (
                  <>
                    {[...Array(12)].map((_, index) => (
                      <VerticlePropertyCardSkeleton key={`skeleton-${index}`} />
                    ))}
                  </>
                )}

                {/* No Data Found */}
                {!isLoading && propertyData.length === 0 && (
                  <div className="col-span-12 flex items-center justify-center">
                    <NoDataFound
                      title={t("noDataFound")}
                    />
                  </div>
                )}

                {/* Actual data */}
                {!isLoading || propertyData.length > 0 ? (
                  featureSectionLists?.map((section, index) => {
                    if (
                      section.name == "featuredProperties" &&
                      slug == "featured-properties"
                    ) {
                      return section?.data?.map((data) => (
                        viewType === 'list' ? (
                          <div key={data?.id} className='w-full'>
                            {/* Show vertical cards on small screens, horizontal on larger screens */}
                            <div className="block lg:hidden">
                              <PropertyVerticalCard property={data} />
                            </div>
                            <div className="hidden lg:block">
                              <PropertyHorizontalCard property={data} />
                            </div>
                          </div>
                        ) : (
                          <PropertyVerticalCard property={data} key={data?.id} />
                        )
                      ));
                    } else if (
                      section.name == "mostViewedProperties" &&
                      slug == "most-viewed-properties"
                    ) {
                      return section?.data?.map((data) => (
                        viewType === 'list' ? (
                          <div key={data?.id} className='w-full'>
                            {/* Show vertical cards on small screens, horizontal on larger screens */}
                            <div className="block lg:hidden">
                              <PropertyVerticalCard property={data} />
                            </div>
                            <div className="hidden lg:block">
                              <PropertyHorizontalCard property={data} />
                            </div>
                          </div>
                        ) : (
                          <PropertyVerticalCard property={data} key={data?.id} />
                        )
                      ));
                    } else if (
                      section.name === "mostFavouriteProperties" &&
                      slug === "most-favourite-properties"
                    ) {
                      return section?.data?.map((data) => (
                        viewType === 'list' ? (
                          <div key={data?.id} className='w-full'>
                            {/* Show vertical cards on small screens, horizontal on larger screens */}
                            <div className="block lg:hidden">
                              <PropertyVerticalCard property={data} />
                            </div>
                            <div className="hidden lg:block">
                              <PropertyHorizontalCard property={data} />
                            </div>
                          </div>
                        ) : (
                          <PropertyVerticalCard property={data} key={data?.id} />
                        )
                      ));
                    }
                  })
                ) : null}

                {/* Load more skeletons */}
                {isLoading && propertyData.length > 0 && (
                  <>
                    {[...Array(3)].map((_, index) => (
                      <VerticlePropertyCardSkeleton key={`load-more-skeleton-${index}`} />
                    ))}
                  </>
                )}
              </div>
              {/* Remove the old loading spinner and replace load more with skeleton-aware version */}
              {isLoading === false && hasMoreData ? (
                <div className="mt-5 flex w-full items-center justify-center text-center">
                  <button
                    className="brandText brandBorder hover:border-transparent hover:primaryBg hover:text-white my-5 rounded-lg border bg-transparent px-4 py-3"
                    onClick={handleLoadMore}
                  >
                    {t("loadMore")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default ViewAllPropertyListing;
