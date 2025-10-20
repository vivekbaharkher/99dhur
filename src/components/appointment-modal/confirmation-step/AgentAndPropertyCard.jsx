import { useTranslation } from '@/components/context/TranslationContext';
import ImageWithPlaceholder from '@/components/image-with-placeholder/ImageWithPlaceholder';
import Link from 'next/link';
import React from 'react';
import { BiSolidEnvelope } from 'react-icons/bi';
import { BadgeSvg } from '@/utils/helperFunction';
import AppointmentPropertyCard from '@/components/reusable-components/appointment/AppointmentPropertyCard';

const AgentAndPropertyCard = ({
    selectedProperty = null,
    agentDetails = {}
}) => {
    const t = useTranslation();

    return (
        <div className="newBorder rounded-2xl bg-white">
            <div className="p-3 md:p-4 text-sm md:text-base font-semibold border-b newBorderColor">
                {t("agentAndProperty")}
            </div>

            <div className="p-3 md:p-4 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-4">
                    <div className="flex items-start md:items-center gap-3 md:gap-6">
                        <ImageWithPlaceholder
                            src={agentDetails?.profile}
                            alt={agentDetails?.name || "Agent Profile"}
                            className="w-[60px] h-[60px] md:w-[90px] md:h-[90px] rounded-full border-2 md:border-4 border-white shadow-md flex-shrink-0"
                            imageClassName='!object-fill'
                        />
                        <div className="flex flex-col gap-1 md:gap-2 min-w-0">
                            <div className='text-base md:text-xl font-bold brandColor truncate'>{agentDetails?.name}</div>
                            <div className="flex items-center gap-2 min-w-0">
                                <BiSolidEnvelope className='w-4 h-4 md:w-5 md:h-5 leadColor flex-shrink-0' />
                                <Link 
                                    className='leadColor text-sm md:text-base truncate' 
                                    href={`mailto:${agentDetails?.email || ""}`}
                                    title={agentDetails?.email}
                                >
                                    {agentDetails?.email}
                                </Link>
                            </div>
                        </div>
                    </div>
                    {agentDetails?.is_verified && (
                        <div className='flex items-start md:items-center flex-shrink-0'>
                            <div className="flex items-center gap-1 rounded-md w-fit h-fit px-2 py-1 bg-[#0186D8] [&>svg>path]:fill-[white]">
                                <BadgeSvg className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span className="text-white text-xs md:text-sm font-medium">
                                    {t("verified")}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                <AppointmentPropertyCard propertyData={selectedProperty} />
            </div>
        </div>
    );
};

export default AgentAndPropertyCard;