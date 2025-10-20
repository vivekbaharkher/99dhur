"use client";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Layout from "../layout/Layout";
import PropertySideFilter from "./PropertySideFilter";
import PropertyListing from "./PropertyListing";
import { useTranslation } from "@/components/context/TranslationContext";
import { getPropertyListApi } from "@/api/apiRoutes";
// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import NewBreadcrumb from "../breadcrumb/NewBreadCrumb";
import { useRouter } from "next/router";
import { VerticlePropertyCardSkeleton } from "../skeletons";
import FilterTopBarSkeleton from "../skeletons/FilterTopBarSkeleton";
import FilterTopBar from "../reusable-components/FilterTopBar";
import { getPostedSince, isRTL, generateBase64FilterUrl, decodeBase64FilterUrl } from "@/utils/helperFunction";


const PropertyList = ({ isCategoryPage, isCityPage }) => {
  const t = useTranslation();
  const router = useRouter();
  const { locale, slug } = router?.query || {};
  const isRtl = isRTL();

  // Get location data from Redux store
  const locationData = useSelector((state) => state.location);

  const citySlug = slug;
  const categorySlug = slug;
  // --- Local State for Data & UI ---
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [viewType, setViewType] = useState("grid");
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const limit = 9;
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [prevFilters, setPrevFilters] = useState(null); // Track previous filters to prevent duplicate fetches

  // Helper function to decode base64 filter URL
  const decodeBase64FilterUrl = (string) => {
    const decodedString = atob(string);
    return JSON.parse(decodedString);
  }

  // Helper function to initialize filters from router.query (replacing searchParams)
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
          city: decodedFilters.location?.city || citySlug || "",
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
      category_slug_id: isCategoryPage ? categorySlug || "" : "",
      city: isCityPage ? citySlug || "" : "",
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
  }, [router?.query, citySlug, categorySlug]);

  const [filters, setFilters] = useState(initializeFiltersFromQuery);
  // Sync filters with router.query changes
  useEffect(() => {
    if (router?.isReady) {
      const newFilters = initializeFiltersFromQuery();
      setFilters(newFilters);
      setOffset(0); // Reset offset when filters change from URL
    }
  }, [router?.isReady, initializeFiltersFromQuery]);

  // --- Breadcrumb Title State (Derived from props) ---
  const [breadcrumbTitle, setBreadcrumbTitle] = useState(() => {
    if (isCityPage)
      return `${t("propertiesIn")} ${citySlug?.charAt(0)?.toUpperCase() + citySlug?.slice(1)}`;
    if (isCategoryPage)
      return `${t("category")}: ${categorySlug?.charAt(0)?.toUpperCase() + categorySlug?.slice(1)}`;
    return t("allProperties");
  });

  // Update breadcrumb if props change after initial load
  useEffect(() => {
    if (isCityPage)
      setBreadcrumbTitle(
        `${t("propertiesIn")} ${citySlug?.charAt(0)?.toUpperCase() + citySlug?.slice(1)}`,
      );
    else if (isCategoryPage)
      setBreadcrumbTitle(
        `${categorySlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${t("properties")}`,
      );
    else setBreadcrumbTitle(t("allProperties"));
  }, [isCityPage, isCategoryPage, citySlug, categorySlug, t]);

  // Check if filters are active (excluding context-based filters)
  const hasActiveFilters = (() => {
    return (
      filters.keywords !== "" ||
      filters.property_type !== "" ||
      filters.category_id !== "" ||
      filters.min_price !== "" ||
      filters.max_price !== "" ||
      filters.posted_since !== "" ||
      filters.promoted ||
      (filters.amenities && filters.amenities.length > 0) ||
      (filters.city && filters.city !== citySlug) ||
      filters.state !== "" ||
      filters.country !== "" ||
      filters.is_premium ||
      (filters.latitude !== undefined && filters.latitude !== locationData?.latitude) ||
      (filters.longitude !== undefined && filters.longitude !== locationData?.longitude) ||
      (filters.range !== undefined && filters.range !== (locationData?.radius ? parseInt(locationData.radius) : undefined))
    );
  })();

  // Helper function to check if two filter objects are equivalent
  const areFiltersEqual = (filters1, filters2) => {
    if (!filters1 || !filters2) return false;

    // Compare basic properties
    const basicProps = [
      'property_type', 'category_id', 'category_slug_id', 'city',
      'state', 'country', 'min_price', 'max_price', 'posted_since',
      'promoted', 'keywords', 'is_premium', 'latitude', 'longitude', 'range'
    ];

    for (const prop of basicProps) {
      if (filters1[prop] !== filters2[prop]) return false;
    }

    // Compare amenities arrays
    const amenities1 = filters1.amenities || [];
    const amenities2 = filters2.amenities || [];

    if (amenities1.length !== amenities2.length) return false;

    // Check if arrays contain the same elements (order doesn't matter)
    const sortedAmenities1 = [...amenities1].sort();
    const sortedAmenities2 = [...amenities2].sort();

    for (let i = 0; i < sortedAmenities1.length; i++) {
      if (sortedAmenities1[i] !== sortedAmenities2[i]) return false;
    }

    return true;
  };

  // Fetch data function
  const fetchData = useCallback(
    async (isLoadMore = false, isFilterChange = false) => {
      try {
        // Skip fetch if filters haven't changed and it's not a load more request
        if (!isLoadMore && !isFilterChange && areFiltersEqual(filters, prevFilters)) {
          return;
        }

        isLoadMore ? setLoadingMore(true) : setLoading(true);

        // If it's a filter change, reset the offset
        if (isFilterChange && !isLoadMore) {
          setOffset(0);
        }

        // Use the current offset value from state for API call
        const currentOffset = isLoadMore ? offset + limit : offset;

        /**
         * NEW API FORMAT - Structured object approach
         * {
         *   property_type: 0|1, // 0 = Sell, 1 = Rent
         *   category_id: number,
         *   category_slug_id: string,
         *   parameters: [{ id: number, value: string }],
         *   nearby_places: [{ id: number, value: number }],
         *   location: { country, state, city, place_id, latitude, longitude, range },
         *   price: { min_price: number, max_price: number },
         *   posted_since: 0|1|2|3|4,
         *   search: string,
         *   flags: { promoted: 0|1, get_all_premium_properties: 0|1, most_views: 0|1, most_liked: 0|1 }
         * }
         */

        // Build parameters array from amenities - just using IDs for now
        // You may need to fetch facility details separately if names are needed
        const parameters = filters?.amenities || [];

        // Build nearby_places array (currently empty, implement based on requirements)
        const nearby_places = filters?.nearby_places?.map((place) => ({
          id: parseInt(place.id),
          value: parseInt(place.distance || place.value)
        })) || [];

        // Build location object using filters and Redux location data
        const location = {
          country: filters.country || "",
          state: filters.state || "",
          city: isCityPage ? citySlug || filters.city || "" : filters.city || "",
          place_id: "", // This might need to be stored in Redux or passed from somewhere else
          latitude: filters.latitude || undefined,
          longitude: filters.longitude || undefined,
          range: filters.range || undefined
        };

        // Build price object
        const price = {
          min_price: filters.min_price ? parseInt(filters.min_price) : 0,
          max_price: filters.max_price ? parseInt(filters.max_price) : 0
        };

        // Build flags object
        const flags = {
          promoted: filters.promoted ? 1 : 0,
          get_all_premium_properties: filters.is_premium ? 1 : 0,
          most_views: sortBy === "most_viewed" ? 1 : 0,
          most_liked: sortBy === "most_liked" ? 1 : 0
        };

        const apiParams = {
          property_type: filters.property_type === "Sell" ? 0 : filters.property_type === "Rent" ? 1 : "",
          category_id: filters.category_id ? parseInt(filters.category_id) : "",
          category_slug_id: isCategoryPage ? categorySlug || filters.category_slug_id || "" : filters.category_slug_id || "",
          parameters: parameters,
          nearby_places,
          location: location,
          price: price,
          posted_since: parseInt(getPostedSince(filters.posted_since)) || 0,
          search: filters.keywords || "",
          flags: flags,
          limit: limit.toString(),
          offset: currentOffset.toString()
        };

        const res = await getPropertyListApi(apiParams);

        if (!res?.error) {
          if (isLoadMore) {
            setFilteredProperties((prevProperties) => [
              ...prevProperties,
              ...res?.data,
            ]);
            // Only update offset after successful load more
            setOffset(currentOffset);
          } else {
            setFilteredProperties(res?.data || []);
            // When filter changes, reset offset
            if (isFilterChange) {
              setOffset(0);
            }
          }

          setTotalCount(res?.total || 0);
          setHasMore(res?.total > currentOffset + (res?.data?.length || 0));

          // Store current filters to prevent duplicate fetches
          setPrevFilters({ ...filters });
        } else {
          console.error("API returned an error:", res?.error);
        }
      } catch (error) {
        console.error("Error fetching property data:", error);
        // Set empty data to avoid UI issues when error occurs
        if (!isLoadMore) {
          setFilteredProperties([]);
          setTotalCount(0);
          setHasMore(false);
        }
      } finally {
        isLoadMore ? setLoadingMore(false) : setLoading(false);
      }
    },
    [filters, offset, categorySlug, citySlug, sortBy, limit, prevFilters],
  );

  useEffect(() => {
    if (router?.isReady) {
      // Only fetch data for initial load or filter changes, not for loadMore
      // The offset state is intentionally excluded from dependencies
      fetchData(false, true);
    }
  }, [filters, router?.isReady, sortBy]);



  // Helper function to check if filters have any active values (excluding context-based defaults)
  const hasActiveFiltersForUrl = (filters) => {
    return (
      filters.keywords !== "" ||
      filters.property_type !== "" ||
      filters.category_id !== "" ||
      filters.min_price !== "" ||
      filters.max_price !== "" ||
      filters.posted_since !== "" ||
      filters.promoted ||
      (filters.amenities && filters.amenities.length > 0) ||
      (filters.city && filters.city !== citySlug) ||
      filters.state !== "" ||
      filters.country !== "" ||
      filters.is_premium ||
      (filters.latitude !== undefined && filters.latitude !== locationData?.latitude) ||
      (filters.longitude !== undefined && filters.longitude !== locationData?.longitude) ||
      (filters.range !== undefined && filters.range !== (locationData?.radius ? parseInt(locationData.radius) : undefined))
    );
  };

  // Handle filter apply
  const handleFilterApply = (newFilters) => {
    // Set the filters state with the actual filter object
    setFilters(newFilters);

    if (isFilterSheetOpen) {
      setIsFilterSheetOpen(false);
    }

    const options = {
      isCityPage,
      citySlug,
      sortBy,
      isCategoryPage,
      categorySlug
    };
    const encodedFilters = encodeURIComponent(generateBase64FilterUrl(newFilters, options));
    // Update URL with new filters
    try {
      router?.push(
        {
          pathname: `/${locale}/properties/`,
          query: { filters: encodedFilters }
        },
        `/${locale}/properties/?filters=${encodedFilters}`
      );
    } catch (error) {
      console.error("Error updating URL with filters:", error);
    }
  };

  const handleClearFilter = useCallback(() => {
    // Reset filters to empty state but keep context filters
    const clearedFilters = {
      property_type: "",
      category_id: "",
      category_slug_id: categorySlug || "",
      city: citySlug || "",
      state: "",
      country: "",
      min_price: "",
      max_price: "",
      posted_since: "",
      promoted: false,
      keywords: "",
      amenities: [],
      is_premium: false,
      latitude: undefined,
      longitude: undefined,
      range: undefined,
    };

    // Check if filters are already cleared to prevent unnecessary updates
    if (areFiltersEqual(filters, clearedFilters)) {
      return;
    }

    setFilters(clearedFilters);

    // if (isFilterSheetOpen) {
    setIsFilterSheetOpen(false);
    // }

    // Navigate to clean URL
    try {
      router?.push(
        {
          pathname: `/${locale}/properties/`
        },
        `/${locale}/properties/`
      );
    } catch (error) {
      console.error("Error updating URL after clearing filters:", error);
    }
  }, [router, citySlug, categorySlug, filters, locale, isCityPage, isCategoryPage, generateBase64FilterUrl]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchData(true);
  };

  const handleLoadMore = () => {
    loadMore();
  };

  const handleSetViewType = (newViewType) => {
    setViewType(newViewType);
  };


  // --- JSX Return ---
  return (
    <Layout>
      <NewBreadcrumb
        title={breadcrumbTitle}
        items={[
          {
            href: `/${citySlug ? citySlug : router?.asPath?.split("/")[1] || ""}`,
            label: breadcrumbTitle,
          },
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        {/* <NewBreadcrumb title={breadcrumbTitle} /> */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Mobile Filter Button - Only visible on mobile */}
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetContent
              side={isRtl ? "left" : "right"}
              className="flex h-full w-full flex-col !p-0 [&>button]:hidden"
            >
              <div className="overflow-y-auto no-scrollbar h-full p-2">
                <PropertySideFilter
                  showBorder={false}
                  onFilterApply={handleFilterApply}
                  handleClearFilter={handleClearFilter}
                  currentFilters={filters}
                  isMobileSheet={true}
                  setIsFilterSheetOpen={setIsFilterSheetOpen}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Side Filter - Hidden on mobile */}
          <div className="hidden xl:block xl:col-span-3">
            <div className="sticky top-24">
              <PropertySideFilter
                onFilterApply={handleFilterApply}
                handleClearFilter={handleClearFilter}
                currentFilters={filters}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 xl:col-span-9">
            {/* Filter Top Bar */}
            {loading ? (
              <FilterTopBarSkeleton />
            ) : (
              <FilterTopBar
                itemCount={filteredProperties.length}
                totalItems={totalCount}
                viewType={viewType}
                setViewType={handleSetViewType}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onOpenFilters={() => setIsFilterSheetOpen(true)}
                showFilterButton={true}
                showSortBy={false}
              />
            )}

            {/* Property Listings */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {[...Array(9)].map((_, index) => (
                  <VerticlePropertyCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <PropertyListing
                properties={filteredProperties}
                setFilteredProperties={setFilteredProperties}
                totalCount={totalCount}
                onOpenFilters={() => setIsFilterSheetOpen(true)}
                hasActiveFilters={hasActiveFilters}
                viewType={viewType}
                setViewType={handleSetViewType}
              />
            )}

            {/* Load More Button */}
            {hasMore && !loading && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="brandColor brandBorder hover:border-transparent hover:primaryBg hover:text-white my-5 rounded-lg border bg-transparent px-4 py-3"
                >
                  {loadingMore ? t("loadingMore") : t("loadMore")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyList;
