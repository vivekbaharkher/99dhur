import { Switch } from "@/components/ui/switch";
import { FiMinus, FiPlus } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import TimePicker from '@/components/reusable-components/TimePicker';
import { useTranslation } from "@/components/context/TranslationContext";

// const parseTimeToMinutes = (timeString) => {
//     const [hours, minutes] = timeString.split(':').map(Number);
//     return hours * 60 + minutes;
// };

// COMMENTED OUT: Auto available time options generation
/*
const generateAvailableTimeOptions = (existingSlots = [], meetingDurationMinutes = 60, bufferMinutes = 15) => {
    const options = [];
    const interval = 15; // 15-minute intervals for precision
    const totalSlotDuration = meetingDurationMinutes + bufferMinutes;

    // Create occupied time blocks from existing slots
    const occupiedBlocks = existingSlots.map(slot => {
        const startMinutes = parseTimeToMinutes(slot.start);
        const endMinutes = parseTimeToMinutes(slot.end);
        return {
            start: startMinutes,
            end: endMinutes + bufferMinutes // Include buffer time after the meeting
        };
    }).sort((a, b) => a.start - b.start);

    // Check if a time slot would conflict with existing slots
    const isTimeSlotAvailable = (startMinutes) => {
        const endMinutes = startMinutes + meetingDurationMinutes;

        // Check if this slot would conflict with any existing slot (including buffer)
        return !occupiedBlocks.some(block => {
            // Check for overlap: new slot overlaps if it starts before existing ends or ends after existing starts
            return (startMinutes < block.end && endMinutes > block.start);
        });
    };

    // Generate available time options for 24 hours
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const timeMinutes = hour * 60 + minute;
            const endTimeMinutes = timeMinutes + meetingDurationMinutes;

            // Don't allow slots that would end after 11:59 PM
            if (endTimeMinutes >= 24 * 60) continue;

            // Check if this time slot is available
            if (isTimeSlotAvailable(timeMinutes)) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                const period = hour < 12 ? 'AM' : 'PM';
                const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;

                options.push({ value: timeString, label: displayTime });
            }
        }
    }

    return options;
};
*/

const formatTimeToAMPM = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Convert 12-hour format (e.g., "09:00 AM") to 24-hour format (e.g., "09:00")
const convertTo24Hour = (timeString) => {
    if (!timeString) return '';

    const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!timeMatch) return timeString; // Return as-is if it doesn't match expected format

    const [, hours, minutes, period] = timeMatch;
    let hour24 = parseInt(hours, 10);

    if (period.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
    } else if (period.toUpperCase() === 'PM' && hour24 !== 12) {
        hour24 += 12;
    }

    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

// Convert 24-hour format (e.g., "09:00") to 12-hour format (e.g., "09:00 AM")
const convertTo12Hour = (timeString) => {
    if (!timeString) return '';
    return formatTimeToAMPM(timeString);
};

const DaySchedule = ({
    day,
    schedule,
    onToggle,
    onTimeSlotChange,
    onAddTimeSlot,
    onRemoveTimeSlot,
}) => {
    const t = useTranslation();
    const { isEnabled, timeSlots } = schedule;
    // COMMENTED OUT: Auto time conflict checking
    /*
    // Check if a selected time conflicts with existing slots
    const isTimeAvailable = (selectedTime24Hour, currentSlotIndex = null) => {
        if (!selectedTime24Hour) return true;
        
        const selectedMinutes = parseTimeToMinutes(selectedTime24Hour);
        const selectedEndMinutes = selectedMinutes + meetingDurationMinutes;
        
        // Exclude the current slot being edited from conflict detection
        const otherSlots = currentSlotIndex !== null
            ? timeSlots.filter((_, index) => index !== currentSlotIndex)
            : timeSlots;
        
        // Check if the selected time conflicts with any existing slot (including buffer)
        return !otherSlots.some(slot => {
            const slotStartMinutes = parseTimeToMinutes(slot.start);
            const slotEndMinutes = parseTimeToMinutes(slot.end) + bufferTimeMinutes;
            
            // Check for overlap
            return (selectedMinutes < slotEndMinutes && selectedEndMinutes > slotStartMinutes);
        });
    };
    */

    // COMMENTED OUT: Auto time picker change handler with conflict checking
    /*
    // Handle time change from TimePicker
    const handleTimePickerChange = (index, newTime12Hour) => {
        const newTime24Hour = convertTo24Hour(newTime12Hour);
        
        // Validate the time doesn't conflict with other slots
        if (isTimeAvailable(newTime24Hour, index)) {
            onTimeSlotChange(index, "start", newTime24Hour);
        } else {
            // Could add toast notification here about time conflict
            console.warn('Selected time conflicts with existing slots');
        }
    };
    */

    return (
        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
            {/* Day Name and Toggle */}
            <div className="flex items-center w-full sm:w-[140px] md:w-[180px] order-1">
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => onToggle(day, checked)}
                        className="data-[state=checked]:primaryBg data-[state=unchecked]:bg-[#E7E7E7] h-[22px] w-[42px] sm:h-[26px] sm:w-[46px] [&>span]:data-[state=checked]:!translate-x-[22px] [&>span]:data-[state=unchecked]:!translate-x-0.5"
                    />
                    <div className="flex items-center gap-1">
                        <span className="text-sm sm:text-base font-semibold brandColor">
                            {day}
                        </span>
                        <span className="text-sm sm:text-base font-semibold brandColor">:</span>
                    </div>
                </div>
            </div>

            {/* Time Fields */}
            <div className="flex-1 order-2 w-full">
                {isEnabled ? (
                    <div className="space-y-2">
                        {timeSlots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {/* Time Pickers */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                                    {/* Start Time */}
                                    <div className="relative">

                                        <TimePicker
                                            value={convertTo12Hour(slot.start)}
                                            onChange={(newTime) => {
                                                const newTime24Hour = convertTo24Hour(newTime);
                                                onTimeSlotChange(index, "start", newTime24Hour);
                                            }}
                                            placeholder="Select start time"
                                            className="primaryBackgroundBg h-11 rounded text-xs"
                                            aria-label={`Select start time for ${day}`}
                                            format12Hour={true}
                                        />
                                    </div>

                                    {/* End Time */}
                                    <div className="relative">

                                        <TimePicker
                                            value={convertTo12Hour(slot.end)}
                                            onChange={(newTime) => {
                                                const newTime24Hour = convertTo24Hour(newTime);
                                                onTimeSlotChange(index, "end", newTime24Hour);
                                            }}
                                            placeholder="Select end time"
                                            className="primaryBackgroundBg h-11 rounded text-xs"
                                            aria-label={`Select end time for ${day}`}
                                            format12Hour={true}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1.5">
                                    {/* Remove Button */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onRemoveTimeSlot(index)}
                                        className="h-11 w-11 p-0 border-[1.5px] redColor border-red-200 hover:redBgLight12 hover:text-red-700 rounded"
                                        aria-label={`Remove time slot ${index + 1} for ${day}`}
                                    >
                                        <FiMinus className="h-5 w-5" />
                                    </Button>

                                    {/* Add Button - Only on first slot */}
                                    {index === 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={onAddTimeSlot}
                                            className="h-11 w-11 border-[1.5px] primaryBorderColor primaryColor hover:primaryBg hover:text-white rounded"
                                            aria-label={`Add new time slot for ${day}`}
                                        >
                                            <FiPlus className="h-5 w-5" />
                                        </Button>
                                    )}
                                    {index > 0 && <div className="w-11" aria-hidden="true" />}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="h-11 w-full primaryBackgroundBg newBorderColor border-[1.5px] rounded px-3 flex items-center">
                            <span className="leadColor font-medium text-xs">{t("closed")}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DaySchedule;