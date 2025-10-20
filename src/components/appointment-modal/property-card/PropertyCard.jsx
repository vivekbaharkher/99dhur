import ImageWithPlaceholder from "@/components/image-with-placeholder/ImageWithPlaceholder";
import { formatPriceAbbreviated, getDisplayValueForOption } from "@/utils/helperFunction";
import React from "react";
import { BsGeoAlt, BsCheck } from "react-icons/bs";
import { ReactSVG } from "react-svg";

const PropertyCard = ({
    property,
    isSelected = false,
    onSelect,
    showPrice = true,
    className = ""
}) => {

    const handleCardClick = () => {
        onSelect && onSelect(property);
    };

    const cardClasses = `
    relative bg-white newBorder rounded-2xl p-4 h-full lg:max-h-[148px] transition-all duration-200 hover:cursor-pointer outline-none
    ${isSelected ? 'border-2 !primaryBorderColor ' : ''}
    ${className}
  `.trim();
    const location = `${property?.city}${property?.city && property?.state ? ', ' : ''}${property?.state}${property?.state && property?.country ? ', ' : ''}${property?.country}`;

    return (
        <div className={cardClasses} onClick={handleCardClick} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
            aria-label={`Select ${property?.translated_title || property?.title}`}>
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Property Image */}
                <div className="w-28 h-28 flex-shrink-0">
                    <ImageWithPlaceholder
                        src={property?.title_image}
                        alt={property?.translated_title || property?.title || "Property Image"}
                        className="w-full h-full rounded-2xl object-fill"
                    />
                </div>

                {/* Property Details */}
                <div className="flex flex-col justify-between gap-2">
                    {/* Property Name and Check */}
                    <div className="flex items-start justify-between">
                        <h3 className="brandColor font-bold text-lg leading-tight flex-1 mr-2">{property?.translated_title || property?.title}</h3>
                        {isSelected && (
                            <div className="w-6 h-6 absolute right-3 top-3 primaryBg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <BsCheck className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2">
                        <BsGeoAlt className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-500">{location}</span>
                    </div>

                    {/* Facilities */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {property?.parameters?.length > 0 ? (
                            <>
                                {property?.parameters?.slice(0, 4)?.map((parameter, idx) => (
                                    <div
                                        key={parameter?.id}
                                        className="flex items-center gap-2 md:gap-3"
                                    >
                                        <ReactSVG
                                            src={parameter?.image}
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
                                            className="leadColor h-4 w-4 object-contain"
                                            alt={parameter?.translated_name || parameter?.name || 'facilites icon'}
                                        />

                                        <span className="text-sm truncate font-medium">
                                            {getDisplayValueForOption(parameter)}
                                        </span>
                                        {property?.parameters?.slice(0, 4)?.length - 1 !== idx && <span className="h-4 border-r" />}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div />
                        )}
                    </div>

                    {/* Price */}
                    {showPrice && (
                        <div className="">
                            <span className="brandColor font-bold text-lg">{formatPriceAbbreviated(property?.price)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;