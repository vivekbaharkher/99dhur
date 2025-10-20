import { useRef, useState } from "react";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { formatPriceAbbreviated, isRTL, generateBase64FilterUrl } from "@/utils/helperFunction";
import { useRouter } from "next/router";
import { useTranslation } from "../context/TranslationContext";
import { FaArrowRight } from "react-icons/fa";
import CustomLink from "../context/CustomLink";
import SearchBox from "./SearchBox";
import { ReactSVG } from "react-svg";
import { premiumIcon } from "@/assets/svg";

const MainSwiper = ({ slides }) => {
  const router = useRouter();
  const t = useTranslation();
  const locale = router?.query?.locale;

  const images = slides;

  const isRtl = isRTL();

  // SearchBox state management for home page - using flat structure
  const [propertyType, setPropertyType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [postedSince, setPostedSince] = useState('anytime');
  const [amenities, setAmenities] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleImageClick = (image) => {
    if (image?.property?.id) {
      router.push(`/${locale}/property-details/${image.property.slug_id}`);
    } else if (image?.slider_type === "4") {
      window.open(`${image?.link}`, '_blank');
    } else if (image?.slider_type === "2") {
      router?.push(`/${locale}/properties/category/${image?.category?.slug_id}`)
    }
  };

  // SearchBox handlers for home page - using flat structure
  const handlePropertyTypeChange = (value) => {
    setPropertyType(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleKeywordsChange = (value) => {
    setKeywords(value);
  };

  const handleCityChange = (value) => {
    setCity(value);
  };

  const handleStateChange = (value) => {
    setState(value);
  };

  const handleCountryChange = (value) => {
    setCountry(value);
  };

  const handleMinPriceChange = (value) => {
    setMinPrice(value);
  };

  const handleMaxPriceChange = (value) => {
    setMaxPrice(value);
  };

  const handlePostedSinceChange = (value) => {
    setPostedSince(value);
  };

  const handleAmenitiesChange = (value) => {
    setAmenities(value);
  };

  const handleNearbyPlacesChange = (value) => {
    setNearbyPlaces(value);
  };

  const handleShowAdvancedFiltersChange = (value) => {
    setShowAdvancedFilters(value);
  };

  const handleApplyFilters = () => {
    // Build filters object in the same format as PropertyList.jsx
    const filters = {
      property_type: propertyType === 'All' ? '' : propertyType,
      category_id: selectedCategory || '',
      keywords: keywords || '',
      city: city || '',
      state: state || '',
      country: country || '',
      min_price: minPrice || '',
      max_price: maxPrice || '',
      posted_since: postedSince === 'anytime' ? '' : postedSince,
      promoted: false,
      is_premium: false,
      amenities: amenities || [],
      nearbyPlaces: nearbyPlaces || [],
      latitude: undefined,
      longitude: undefined,
      range: undefined,
    };

    // Use generateBase64FilterUrl from helperFunction.js
    const options = {
      isCityPage: false,
      citySlug: '',
      sortBy: '',
      isCategoryPage: false,
      categorySlug: ''
    };

    const encodedFilters = encodeURIComponent(generateBase64FilterUrl(filters, options));

    // Navigate to search page with base64 encoded filters
    router.push(`/${locale}/search?filters=${encodedFilters}`);
    setShowAdvancedFilters(false);
  };

  const handleClearFilters = () => {
    setPropertyType('All');
    setSelectedCategory('');
    setKeywords('');
    setCity('');
    setState('');
    setCountry('');
    setMinPrice('');
    setMaxPrice('');
    setPostedSince('anytime');
    setAmenities([]);
    setNearbyPlaces([]);
    setShowAdvancedFilters(false);
  };

  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: false })
  );

  if (!images || images.length === 0) {
    return null;
  }


  console.log(slides)

  return (
    <div className="relative w-full h-[500px] md:h-[690px] lg:h-[680px] 3xl:h-[780px] pb-40">
      <Carousel
        plugins={images?.length > 1 ? [autoplayPlugin.current] : []}
        opts={{
          loop: images.length > 1,
          direction: isRtl ? "rtl" : "ltr",
        }}
        onMouseEnter={images.length > 1 ? autoplayPlugin.current.stop : undefined}
        onMouseLeave={images.length > 1 ? autoplayPlugin.current.play : undefined}
        onTouchStart={images.length > 1 ? autoplayPlugin.current.stop : undefined}
        onTouchEnd={images.length > 1 ? () => setTimeout(() => autoplayPlugin.current.play, 3000) : undefined}
        className="w-full h-full relative"
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className={`relative w-full h-[320px] md:h-[500px] lg:h-[600px] 3xl:h-[700px] ${image?.slider_type === "4" || image?.slider_type === "2" ? "cursor-pointer" : ""}`} onClick={() => handleImageClick(image)} >
                <ImageWithPlaceholder
                  src={image?.web_image}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full"
                  imageClassName="object-cover"
                  priority={index === 0}
                />
                {image?.property && image?.show_property_details && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="container mx-auto h-full relative">
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10 pl-9 lg:pl-9 xl:pl-0">
                        <div className="flex flex-col items-start p-2 sm:p-4 md:p-5 bg-white w-[214px] md:w-[400px] lg:w-[550px] shadow-lg pointer-events-auto gap-1 md:gap-2">
                          <div class="flex w-full justify-between">
                            <h2 className="text-base line-clamp-2 sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                              {image.property.translated_title || image.property.title}
                            </h2>
                            <div className="flex items-center gap-1">
                              {image.property.property_type && (
                                <span
                                  className={`mt-0.5 shrink-0 flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${image.property.property_type === "sell" ? "primarySellBg primarySellText" : "primaryRentBg primaryRentText"}`}
                                >
                                  {t(image.property.property_type)}
                                </span>
                              )}
                              {image.property.is_premium == 1 ? (
                                <span className="flex items-center gap-1 rounded-full bg-[#F9EDD7] py-1 px-2 text-sm font-semibold capitalize">
                                  {premiumIcon()}
                                  <span class="hidden md:block">{t("premium")}</span>
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ReactSVG
                              src={image?.category?.image}
                              beforeInjection={(svg) => {
                                svg.setAttribute(
                                  "style",
                                  `height: 100%; width: 100%;`,
                                );
                                svg.querySelectorAll("path").forEach((path) => {
                                  path.setAttribute(
                                    "style",
                                    `fill: var(--facilities-icon-color);`,
                                  );
                                });
                              }}
                              className="w-4 h-4 flex items-center justify-center object-contain shrink-0"
                              alt={image?.property?.translated_title || image?.property?.name || 'parameter icon'}
                            />
                            <span class="text-gray-500">{image?.category?.translated_name || image?.category?.name}</span>
                          </div>
                          <div className="p-1 md:p-2 text-sm text-gray-500 font-medium">
                            {image?.property?.city ? `${image?.property?.city}, ` : ""}{image?.property?.state ? `${image?.property?.state}, ` : ""}{image?.property?.country}
                          </div>

                          {/* Display parameters */}
                          <p className="flex flex-wrap gap-1 md:gap-3 border-y p-1 md:p-2 w-full text-sm text-gray-500 font-medium">
                            {image?.property?.parameters?.slice(0, 4).map((p) => (
                              <div key={p.id} className="flex flex-row items-center justify-center gap-1 border-r last:border-r-0 pr-2 ">
                                <ReactSVG
                                  src={p.image}
                                  beforeInjection={(svg) => {
                                    svg.setAttribute(
                                      "style",
                                      `height: 100%; width: 100%;`,
                                    );
                                    svg.querySelectorAll("path").forEach((path) => {
                                      path.setAttribute(
                                        "style",
                                        `fill: var(--facilities-icon-color);`,
                                      );
                                    });
                                  }}
                                  className="w-4 h-4 flex items-center justify-center object-contain shrink-0"
                                  alt={p.translated_name || p.name || 'parameter icon'}
                                />
                                {`${p.translated_name || p.name}: ${p.value}`}
                              </div>
                            ))}
                          </p>


                          {/* <hr className="w-full border-t border-gray-200 my-3 sm:my-4 md:my-6" /> */}

                          <div className="flex items-center justify-between w-full">
                            <div className="text-lg md:text-xl font-bold primaryColor">
                              {formatPriceAbbreviated(image.property.price)}
                            </div>
                            <CustomLink
                              href={`/property-details/${image.property.slug_id}`}
                              className="bg-gray-900 text-white px-2 py-1 md:px-3 md:py-2 rounded-md text-sm font-normal h-auto pointer-events-auto flex items-center gap-1"
                            >
                              <span className="hidden md:block">{t("viewDetails")}</span>
                              <FaArrowRight size={14} className={`flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
                            </CustomLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {images && images.length > 1 && (
          <>
            <CarouselPrevious className={" isabsolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-800 border-0 w-8 h-10 md:w-10 md:h-16 rounded-none"} />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-800 border-0 w-8 h-10 md:w-10 md:h-16 rounded-none" />
          </>
        )}
      </Carousel>

      {/* Search Box Container - Restore absolute positioning */}
      <div className="absolute bottom-0 md:bottom-16 left-0 right-0 z-20 px-4">
        <div className="container mx-auto shadow-[0px_14px_36px_3px_#ADB3B852]">
          <SearchBox
            propertyType={propertyType}
            selectedCategory={selectedCategory}
            keywords={keywords}
            city={city}
            state={state}
            country={country}
            minPrice={minPrice}
            maxPrice={maxPrice}
            postedSince={postedSince}
            amenities={amenities}
            nearbyPlaces={nearbyPlaces}
            showAdvancedFilters={showAdvancedFilters}
            onPropertyTypeChange={handlePropertyTypeChange}
            onCategoryChange={handleCategoryChange}
            onKeywordsChange={handleKeywordsChange}
            onCityChange={handleCityChange}
            onStateChange={handleStateChange}
            onCountryChange={handleCountryChange}
            onMinPriceChange={handleMinPriceChange}
            onMaxPriceChange={handleMaxPriceChange}
            onPostedSinceChange={handlePostedSinceChange}
            onAmenitiesChange={handleAmenitiesChange}
            onNearbyPlacesChange={handleNearbyPlacesChange}
            onShowAdvancedFiltersChange={handleShowAdvancedFiltersChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default MainSwiper;
