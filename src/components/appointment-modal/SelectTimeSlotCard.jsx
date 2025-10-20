import { useTranslation } from '../context/TranslationContext';
import { FaRegClock } from 'react-icons/fa';

/**
 * SelectTimeSlotCard component for displaying time slot selection in appointment flow
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedDate - The currently selected date
 * @param {Array} props.timeSlots - Array of available time slots for the selected date
 * @param {string} props.selectedTimeSlot - The currently selected time slot
 * @param {Function} props.onSelectTimeSlot - Handler function when a time slot is selected
 * @returns {JSX.Element} - SelectTimeSlotCard component
 */
const SelectTimeSlotCard = ({
    selectedDate = null,
    timeSlots = [],
    selectedTimeSlot = '',
    onSelectTimeSlot = () => { }
}) => {
    const t = useTranslation();
    return (
        <div className="newBorder rounded-2xl overflow-hidden h-full flex flex-col bg-white">
            {/* Card Header */}
            <div className="flex justify-between items-center p-4 border-b newBorderColor ">
                <h2 className="text-base font-semibold brandColor">{t("selectTimeSlot")}</h2>
            </div>

            {/* Card Content */}
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 max-h-[400px] md:max-h-[450px]">
                    {selectedDate ? (
                        timeSlots && timeSlots.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 min-h-min pb-2">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot.id}
                                        className={`
                                            p-3 rounded-lg text-center transition-all duration-200
                                            ${selectedTimeSlot?.id === slot.id
                                                ? 'primaryBg primaryTextColor'
                                                : 'newBorder hover:bg-gray-50'
                                            }
                                        `}
                                        onClick={() => onSelectTimeSlot(slot)}
                                        aria-pressed={selectedTimeSlot === slot.id}
                                    >
                                        <span className={`text-sm font-medium ${selectedTimeSlot?.id === slot.id ? 'primaryTextColor' : 'secondryTextColor'}`}>
                                            {slot.time}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <p className="text-base secondryTextColor mb-2">{t("noAvailableTimeSlots")}</p>
                                <p className="text-sm text-gray-500">{t("pleaseSelectAnotherDate")}</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center">
                            <p className="text-base brandColor mb-2">{t("pickDateForAvailability")}</p>
                        </div>
                    )}
                </div>

                {selectedTimeSlot && (
                    <div className='flex items-center gap-3 p-3 m-4 mt-0 rounded-lg primaryBgLight12'>
                        <div className='w-12 h-12 rounded-lg bg-white flex items-center justify-center'>
                            <FaRegClock className='w-6 h-6 primaryColor' />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <span className='text-sm brandColor font-semibold'>{t("appointmentDuration")}</span>
                            <span className='text-base primaryColor font-bold'>{selectedTimeSlot?.formattedTime}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectTimeSlotCard;