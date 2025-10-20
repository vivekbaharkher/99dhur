import ImageWithPlaceholder from '@/components/image-with-placeholder/ImageWithPlaceholder';
import { useTranslation } from '@/components/context/TranslationContext';
import { formatPriceAbbreviated, getDisplayValueForOption, truncate } from '@/utils/helperFunction';
import { SlLocationPin } from 'react-icons/sl';
import { ReactSVG } from 'react-svg';

const AppointmentPropertyCard = ({
    propertyData = {},
    className = ""
}) => {
    const t = useTranslation();
    const location = `${propertyData?.city}${propertyData?.city && propertyData?.state ? ', ' : ''}${propertyData?.state}${propertyData?.state && propertyData?.country ? ', ' : ''}${propertyData?.country}`;
    const formattedPrice = formatPriceAbbreviated(propertyData?.price);

    return (
        <div className={className}>
            {/* Property Card */}
            <div className="primaryBackgroundBg rounded-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-4">
                    {/* Property Image */}
                    <div className="w-full md:max-w-[215px] h-[180px] md:h-[140px] flex-shrink-0">
                        <ImageWithPlaceholder
                            src={propertyData?.title_image}
                            alt={"Property Image"}
                            className="w-full h-full rounded-lg object-cover"
                        />
                    </div>

                    {/* Property Details */}
                    <div className="flex flex-col justify-between bg-white rounded-2xl w-full p-3 md:p-4">
                        {/* Property Title and Price */}
                        <div>
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-1 md:gap-0 mb-2">
                                <h4 className="text-base md:text-xl font-bold brandColor md:max-w-[200px] truncate line-clamp-2 flex-1 md:mr-4">
                                    {propertyData?.translated_title || propertyData?.title}
                                </h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-lg md:text-xl font-bold primaryColor">
                                        {formattedPrice}
                                    </span>
                                </div>
                            </div>

                            {/* Location */}
                            <p className="text-xs md:text-sm font-medium leadColor mb-2 md:mb-3 flex items-center gap-1 truncate">
                                <SlLocationPin className='w-3.5 h-3.5 md:w-4 md:h-4 leadColor flex-shrink-0' />
                                <span className="truncate">{location}</span>
                            </p>
                        </div>

                        {/* Property Features */}
                        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 md:gap-4 text-xs md:text-sm leadColor border-t-[1.5px] newBorderColor pt-2 md:pt-3">
                            <div className='flex flex-wrap md:flex-nowrap items-center gap-2 flex-1'>
                                {propertyData?.parameters?.length > 0 ? (
                                    <>
                                        {propertyData?.parameters?.slice(0, 4)?.map((parameter, idx) => (
                                            <div
                                                key={parameter?.id}
                                                className="flex items-center gap-1.5 md:gap-2"
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
                                                    className="leadColor h-3.5 w-3.5 md:h-4 md:w-4 object-contain flex-shrink-0"
                                                    alt={parameter?.translated_name || parameter?.name || 'facilites icon'}
                                                />

                                                <span className="text-xs md:text-sm truncate font-medium">
                                                    {truncate(getDisplayValueForOption(parameter), 12)}
                                                </span>
                                                {propertyData?.parameters?.length - 1 !== idx && idx < 3 && (
                                                    <span className="h-3 md:h-4 border-r hidden md:block" />
                                                )}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div />
                                )}
                            </div>

                            {propertyData?.property_type && (
                                <div className={`py-0.5 px-2 w-14 md:w-16 flex justify-center gap-1 rounded-full flex-shrink-0 ${propertyData?.property_type === "rent" ? 'primaryRentBg primaryRentText ' : 'primarySellBg primarySellText'}`}>
                                    <span className="text-xs md:text-sm">{propertyData?.property_type === "rent" ? t("rent") : t("sell")}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentPropertyCard;