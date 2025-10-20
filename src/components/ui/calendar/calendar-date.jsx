import { BiEditAlt } from 'react-icons/bi';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { useTranslation } from '@/components/context/TranslationContext';
import {
    filterExtraSlotsByDate,
    formatExtraTimeSlotsDisplay,
    getFormattedDateString,
    hasExtraTimeSlotsForDate,
} from '@/utils/appointmentHelper';
import { FiPlus } from 'react-icons/fi';

const CalendarDate = ({
    date,
    dateObj,
    dateData,
    isDisabled = false,
    hasContent = false,
    weekSchedules = [],
    dateSchedule = null,
    extraTimeSlots = [],
    onEditSchedule,
    onViewAllSchedules,
    onSelectSchedule,
    className = ""
}) => {
    const t = useTranslation();
    // Get formatted date string for filtering extra time slots
    const formattedDateString = getFormattedDateString(dateObj);

    // Filter extra time slots for this specific date
    const currentDateExtraSlots = filterExtraSlotsByDate(extraTimeSlots, formattedDateString);

    // Check if this date has extra time slots
    const hasExtraSlots = hasExtraTimeSlotsForDate(extraTimeSlots, formattedDateString);

    // Get formatted display text for extra time slots
    const extraSlotsDisplayText = formatExtraTimeSlotsDisplay(currentDateExtraSlots);

    const handleEditClick = (e, date) => {
        e?.stopPropagation();
        onEditSchedule?.(date);
    };

    const handleViewAllClick = (e, date) => {
        e?.stopPropagation();
        onViewAllSchedules?.(date);
    };

    const handleSelectClick = (e) => {
        e?.stopPropagation();
        if (dateSchedule) onSelectSchedule?.(dateSchedule);
    };

    const isActive = hasExtraSlots;

    return (
        <div 
            className={`relative flex flex-col w-full newBorder overflow-visible
                ${isDisabled ? 'primaryBackgroundBg' : 'cardBg'}
                md:h-[223px] h-[70px] transition-all duration-300
            `}
            onClick={(e) => {
                // Only handle click if not disabled and has content
                if (!isDisabled && (hasContent || hasExtraSlots)) {
                    // Check if we're on mobile
                    const isMobile = window.innerWidth <= 768;
                    // On mobile, only trigger view all if we clicked the date cell (not the edit button)
                    if (isMobile) {
                        const editButton = e.target.closest('button');
                        if (!editButton) {
                            handleViewAllClick(e, dateData.date);
                        }
                    } else {
                        handleViewAllClick(e, dateData.date);
                    }
                }
            }}
        >
            {/* Desktop View - Show full content */}
            <div className="hidden md:flex flex-col h-full w-full">
                <div className='absolute top-0 w-full h-1 primaryBg' />
                {/* Calendar Date Header */}
                <div className='p-3 border-b newBorderColor flex justify-between items-center'>
                    <span>{date}</span>
                    {!isDisabled && (
                        <button 
                            className='w-8 h-8 flex items-center justify-center rounded-lg p-1.5 primaryBackgroundBg group relative'
                            onClick={(e) => handleEditClick(e, date, dateData.month, dateData.year)}
                            aria-label={hasExtraSlots ? t("editExtraSlots") : t("addExtraSlots")}
                        >
                            {hasExtraSlots ? (
                                <BiEditAlt className='brandColor' aria-hidden='true' />
                            ) : (
                                <FiPlus className='brandColor' aria-hidden='true' />
                            )}
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-black/75 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                {hasExtraSlots ? t("editExtraSlots") : t("addExtraSlots")}
                            </span>
                        </button>
                    )}
                </div>

                {/* Schedule Content */}
                <div className='flex flex-col flex-1'>
                    <div className='flex flex-col items-center justify-between gap-2 p-3 mt-2'>
                        {/* Only show schedule content if date is not disabled and has content */}
                        {!isDisabled && weekSchedules?.slice(0, 2).map((schedule) => (
                            <div key={schedule.id} className=''>
                                <span className='text-sm font-medium line-clamp-1'>{schedule.time}</span>
                            </div>
                        ))}
                        {!isDisabled && weekSchedules?.length < 2 && (
                            <div className='h-[52px]' />
                        )}
                        {!isDisabled && weekSchedules.length > 2 && (
                            <button
                                className='text-sm flex justify-center items-center'
                                onClick={(e) => handleViewAllClick(e, dateData.date)}
                            >
                                <FiPlus className='mr-1 primaryColor' />
                                <span className='text-sm primaryColor text-wrap 2xl:text-nowrap'>{t("viewAllSchedules")}</span>
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col mt-auto">
                        {!isDisabled && isActive && <div className='h-px newBorder' />}
                        {/* Upcoming Meeting Time - Show extra time slots only if not disabled */}
                        {!isDisabled && isActive && (
                            <div className="p-2">
                                <div className='brandBg p-1 rounded-sm gap-1 xl:gap-2 flex justify-center items-center'>
                                    <FaRegCalendarAlt className='text-white shrink-0' />
                                    <span className='ml-2 text-sm text-white line-clamp-1'>
                                        {hasExtraSlots ? extraSlotsDisplayText : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile View - Show minimal content */}
            <div className="md:hidden flex items-center justify-center h-full w-full relative">
                <span className={`text-lg font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                    {date}
                </span>
                {/* Indicator for dates with content */}
                {(hasContent || hasExtraSlots) && !isDisabled && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-[3px] primaryBg rounded-full z-10" />
                )}
                {/* Add/Edit button for non-disabled dates */}
                {!isDisabled && (
                    <button 
                        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center group"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(e, date, dateData.month, dateData.year);
                        }}
                        aria-label={hasExtraSlots ? t("editExtraSlots") : t("addExtraSlots")}
                    >
                        {hasExtraSlots ? (
                            <BiEditAlt className="w-3.5 h-3.5 brandColor" aria-hidden='true' />
                        ) : (
                            <FiPlus className="w-3.5 h-3.5 brandColor" aria-hidden='true' />
                        )}
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-black/75 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
                            {hasExtraSlots ? t("editExtraSlots") : t("addExtraSlots")}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CalendarDate;
