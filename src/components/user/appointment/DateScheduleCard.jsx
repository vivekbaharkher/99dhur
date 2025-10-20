import ImageWithPlaceholder from "@/components/image-with-placeholder/ImageWithPlaceholder";
import { Button } from "@/components/ui/button";
import { IoTimeOutline } from "react-icons/io5";
import calendarIcon from '@/assets/calendarIcon.svg'
import { useTranslation } from "@/components/context/TranslationContext";

const DateScheduleCard = ({ date, timeSlot, onViewSchedule, totalSlots = 1, firstTimeSlot }) => {
    const t = useTranslation();
    return (
        <div className="space-y-1.5 sm:space-y-2">
            <div className="text-[10px] sm:text-sm font-semibold brandColor opacity-80">
                {date}
            </div>
            <div className="primaryBackgroundBg newBorder rounded-lg sm:rounded-xl p-2 sm:p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <div className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] flex items-center justify-center shrink-0">
                            <IoTimeOutline className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] brandColor" />
                        </div>
                        <span className="text-[10px] sm:text-sm font-medium brandColor truncate">
                            {firstTimeSlot || timeSlot}
                        </span>
                    </div>
                    {totalSlots > 1 && (
                        <Button
                            onClick={onViewSchedule}
                            className="w-full sm:w-fit primaryBgLight08 primaryTextColor px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-1.5 hover:!primaryBgLight08 rounded !shadow-none"
                        >
                            <ImageWithPlaceholder src={calendarIcon} className='w-3 h-3 sm:w-4 sm:h-4' alt="Calendar Icon" />
                            <span className="primaryColor font-medium text-[10px] sm:text-sm flex items-center gap-1">
                                {t("viewSchedule")} 
                            </span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DateScheduleCard