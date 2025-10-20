
// Utility functions for appointment scheduling

// Parse "HH:MM" time string to total minutes
const toMinutes = (time) => {
    const [h, m, s] = time.split(":").map(Number);
    return h * 60 + m;
};

// Convert minutes back to "HH:MM" format
const formatTime = (mins) => {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    return `${h}:${m}`;
};

// Convert time string "HH:MM" to total minutes
export const parseTimeToMinutes = (timeString) => {
    const [hours, minutes] = String(timeString)?.split(':')?.map(Number);
    return hours * 60 + minutes;
};


// Convert total minutes back to "HH:MM" format
export const formatMinutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Convert "HH:MM" to "H:MM AM/PM" format
export const formatTimeToAMPM = (timeString) => {
    const [hours, minutes] = String(timeString)?.split(':')?.map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes?.toString()?.padStart(2, '0')} ${period}`;
};

// NEW: Aggregate schedules by day without expansion - maintains original time ranges
export const aggregateSchedulesByDay = (rawSchedules) => {

    if (!rawSchedules || !Array.isArray(rawSchedules)) {
        console.error('No schedules provided or invalid format');
        return {};
    }

    // Group schedules by day
    const schedulesByDay = rawSchedules.reduce((acc, schedule) => {
        // Handle both 'day' and 'day_of_week' field names for consistency
        const day = schedule.day_of_week || schedule.day;

        if (!day) {
            console.warn('Schedule missing day information:', schedule);
            return acc;
        }

        if (!acc[day]) {
            acc[day] = [];
        }

        // Create slot object with original time ranges (no expansion)
        const slot = {
            id: schedule.id,
            start: schedule.start_time?.slice(0, 5) || schedule.start_time, // Remove seconds if present
            end: schedule.end_time?.slice(0, 5) || schedule.end_time // Remove seconds if present
        };

        acc[day].push(slot);
        return acc;
    }, {});

    // Sort slots within each day by start time
    Object.keys(schedulesByDay).forEach(day => {
        schedulesByDay[day].sort((a, b) => {
            const aMinutes = parseTimeToMinutes(a.start);
            const bMinutes = parseTimeToMinutes(b.start);
            return aMinutes - bMinutes;
        });
    });

    return schedulesByDay;
};


// COMMENTED OUT: Smart slot adjustment function that reorganizes all slots when one is changed
/*
export const adjustSlotsAfterChange = (allSlots, changedSlotIndex, newStartTime, meetingDurationMinutes, bufferTimeMinutes) => {
    const newStartMinutes = parseTimeToMinutes(newStartTime);
    const newEndMinutes = newStartMinutes + meetingDurationMinutes;

    // Update the changed slot, preserving its ID
    const updatedSlots = [...allSlots];
    updatedSlots[changedSlotIndex] = {
        ...updatedSlots[changedSlotIndex], // Preserve existing properties including ID
        start: newStartTime,
        end: formatMinutesToTime(newEndMinutes)
    };

    // Sort all slots by start time to maintain chronological order
    const sortedSlots = updatedSlots
        .map((slot, index) => ({ ...slot, originalIndex: index }))
        .sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));

    // Progressive adjustment: check each slot against all previous ones
    const adjustedSlots = [];
    const removedSlots = []; // Track slots that couldn't fit

    for (let i = 0; i < sortedSlots.length; i++) {
        const currentSlot = sortedSlots[i];
        let currentStartMinutes = parseTimeToMinutes(currentSlot.start);
        let currentEndMinutes = parseTimeToMinutes(currentSlot.end);

        // Check for conflicts with all previously placed slots
        let hasConflict = true;
        while (hasConflict && currentStartMinutes < 24 * 60) {
            hasConflict = false;

            // Check against all previously adjusted slots
            for (let j = 0; j < adjustedSlots.length; j++) {
                const prevSlotStart = parseTimeToMinutes(adjustedSlots[j].start);
                const prevSlotEndWithBuffer = parseTimeToMinutes(adjustedSlots[j].end) + bufferTimeMinutes;

                // Check for overlap: current slot overlaps if it starts before prev ends or ends after prev starts
                if (currentStartMinutes < prevSlotEndWithBuffer && currentEndMinutes > prevSlotStart) {
                    // Move current slot to start after the conflicting slot's buffer period
                    currentStartMinutes = prevSlotEndWithBuffer;
                    currentEndMinutes = currentStartMinutes + meetingDurationMinutes;
                    hasConflict = true;
                    break;
                }
            }
        }

        // Check if the adjusted slot would go beyond 24 hours
        if (currentEndMinutes >= 24 * 60) {
            // Cannot fit this slot, add to removed slots for tracking
            removedSlots.push(currentSlot);
            continue;
        }

        adjustedSlots.push({
            ...currentSlot, // Preserve all original properties including ID
            start: formatMinutesToTime(currentStartMinutes),
            end: formatMinutesToTime(currentEndMinutes)
        });
    }

    // Final sort by start time to ensure proper order
    const finalSlots = adjustedSlots.sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));

    // Return both adjusted slots and removed slots for tracking
    return {
        adjustedSlots: finalSlots,
        removedSlots: removedSlots
    };
};


// COMMENTED OUT: Generate available time options for adding new slots
/*
export const generateAvailableTimeOptions = (existingSlots, meetingDurationMinutes, bufferTimeMinutes) => {
    const options = [];
    const dayStartMinutes = 0; // 00:00
    const dayEndMinutes = 24 * 60; // 24:00
    // Create array of all occupied time ranges (slot + buffer)
    const occupiedRanges = existingSlots.map(slot => ({
        start: parseTimeToMinutes(slot.start),
        end: parseTimeToMinutes(slot.end) + bufferTimeMinutes
    })).sort((a, b) => a.start - b.start);

    // Check each 30-minute interval throughout the day
    for (let current = dayStartMinutes; current < dayEndMinutes; current += bufferTimeMinutes) {
        const slotEnd = current + meetingDurationMinutes;

        // Skip if slot would go beyond day end
        if (slotEnd > dayEndMinutes) break;

        // Check if this time slot conflicts with any existing slot
        const hasConflict = occupiedRanges.some(range =>
            (current < range.end && slotEnd > range.start)
        );

        if (!hasConflict) {
            options.push({
                value: formatMinutesToTime(current),
                label: `${formatTimeToAMPM(formatMinutesToTime(current))} - ${formatTimeToAMPM(formatMinutesToTime(slotEnd))}`
            });
        }
    }

    return options;
};
*/


// Transform API schedules into UI format - handle both individual slots and ranges
export const expandApiSchedules = (apiSchedules, meetingDurationMinutes, bufferTimeMinutes, dailyBookingLimit) => {
    const slotsByDay = {};

    apiSchedules.forEach(slot => {
        const { day_of_week, start_time, end_time, id } = slot;

        // Convert API day format (lowercase) to UI format (capitalized)
        const dayKey = day_of_week.toLowerCase();

        // Remove seconds from time format (HH:MM:SS -> HH:MM)
        const start = start_time.substring(0, 5); // "09:00:00" -> "09:00"
        const end = end_time.substring(0, 5);     // "09:30:00" -> "09:30"

        const startMinutes = toMinutes(start);
        const endMinutes = toMinutes(end);
        const duration = endMinutes - startMinutes;

        // Initialize day array if it doesn't exist
        if (!slotsByDay[dayKey]) {
            slotsByDay[dayKey] = [];
        }

        // Check if this is a single slot (meeting duration) or a range (longer than meeting duration)
        if (duration === meetingDurationMinutes) {
            // This is an individual slot, add it directly
            slotsByDay[dayKey].push({
                id: id ?? null,
                start: start,
                end: end
            });
        } else if (duration > meetingDurationMinutes) {
            // This is a range, expand it into individual slots
            let current = startMinutes;
            const rangeEnd = endMinutes;
            let slotCount = 0;

            while (current + meetingDurationMinutes <= rangeEnd && slotCount < dailyBookingLimit) {
                const slotStart = formatTime(current);
                const slotEnd = formatTime(current + meetingDurationMinutes);

                slotsByDay[dayKey].push({
                    id: id ?? null, // Only first slot gets the range ID
                    start: slotStart,
                    end: slotEnd
                });

                current += meetingDurationMinutes + bufferTimeMinutes;
                slotCount++;
            }
        } else {
            // Duration is less than meeting duration, add it anyway (might be legacy data)
            slotsByDay[dayKey].push({
                id: id ?? null,
                start: start,
                end: end
            });
        }
    });

    // Sort slots by start time for each day and remove duplicates
    Object.keys(slotsByDay).forEach(day => {
        // Sort by start time
        slotsByDay[day].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

        // Remove duplicate slots (same start and end time)
        const uniqueSlots = [];
        const seen = new Set();

        slotsByDay[day].forEach(slot => {
            const key = `${slot.start}-${slot.end}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueSlots.push(slot);
            }
        });

        slotsByDay[day] = uniqueSlots;
    });

    return slotsByDay;
};


// Get day of week from Date
export function getDayOfWeekFromDate(date) {
    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];
    return days[date.getDay()];
}

// Format Date to yyyy-MM-dd
export function formatDate(date) {
    return date.toISOString().split("T")[0];
}

// Get time schedules for a given date
export function getTimeSchedulesForDate(date, selectedDay, timeSchedules) {
    if (!selectedDay) return [];

    const dayOfWeek = getDayOfWeekFromDate(date);
    return timeSchedules.filter(
        (schedule) =>
            schedule.day_of_week.toLowerCase() === dayOfWeek &&
            schedule.is_active === 1
    );
}

// Get extra slots for a given date
export function getExtraSlotsForDate(date, selectedDay, extraSlots) {
    if (!selectedDay) return [];

    const dateString = formatDate(date);
    return extraSlots.filter((slot) => slot.date === dateString);
}




// Utility functions for handling extra time slots

/**
 * Filter extra time slots by specific date
 * @param {Array} extraTimeSlots - Array of extra time slot objects
 * @param {string} targetDate - Date in YYYY-MM-DD format
 * @returns {Array} - Filtered array of time slots for the target date
 */
export const filterExtraSlotsByDate = (extraTimeSlots, targetDate) => {
    if (!extraTimeSlots || !Array.isArray(extraTimeSlots) || !targetDate) {
        return [];
    }

    return extraTimeSlots.filter(slot => slot.date === targetDate);
};

/**
 * Format extra time slots display text based on the number of slots
 * @param {Array} dateSlots - Array of extra time slots for a specific date
 * @returns {string} - Formatted display text
 */
export const formatExtraTimeSlotsDisplay = (dateSlots) => {
    if (!dateSlots || dateSlots.length === 0) {
        return '';
    }

    if (dateSlots.length === 1) {
        // Single slot: show start_time to end_time
        const slot = dateSlots[0];
        const startTime = formatTimeToAMPM(slot.start_time);
        const endTime = formatTimeToAMPM(slot.end_time);
        return `${startTime} to ${endTime}`;
    } else {
        // Multiple slots: show earliest start_time to latest end_time
        const sortedSlots = [...dateSlots].sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
        );

        const earliestStart = formatTimeToAMPM(sortedSlots[0].start_time);
        const latestEnd = formatTimeToAMPM(
            sortedSlots.reduce((latest, slot) =>
                slot.end_time > latest ? slot.end_time : latest,
                sortedSlots[0].end_time
            )
        );

        return `${earliestStart} to ${latestEnd}`;
    }
};

/**
 * Check if a specific date has extra time slots
 * @param {Array} extraTimeSlots - Array of extra time slot objects  
 * @param {string} targetDate - Date in YYYY-MM-DD format
 * @returns {boolean} - True if date has extra time slots
 */
export const hasExtraTimeSlotsForDate = (extraTimeSlots, targetDate) => {
    const dateSlots = filterExtraSlotsByDate(extraTimeSlots, targetDate);
    return dateSlots.length > 0;
};

/**
 * Get formatted date string in YYYY-MM-DD format from dateData object
 * @param {Object} dateData - Object containing date, month, year
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const getFormattedDateString = (dateData) => {
    if (!dateData || !dateData.year || !dateData.month || !dateData.date) {
        return '';
    }

    // Ensure month and date are zero-padded
    const month = String(dateData.month).padStart(2, '0');
    const date = String(dateData.date).padStart(2, '0');

    return `${dateData.year}-${month}-${date}`;
};


/**
 * Utility functions for formatting appointment API response data
 */

/**
 * Formats the API response to extract available dates for the calendar
 * @param {Object} apiResponse - The API response containing days data
 * @returns {Array} - Array of available date numbers [14, 15, 16, ...]
 */
export const formatAvailableDates = (apiResponse) => {
    if (!apiResponse || !apiResponse.rawDaysData) {
        return [];
    }

    const availableDates = [];

    Object.entries(apiResponse.rawDaysData).forEach(([dateStr, timeSlots]) => {
        // Only include dates that have available time slots
        if (timeSlots && timeSlots.length > 0) {
            const date = new Date(dateStr);
            const dayNumber = date.getDate();
            availableDates.push(dayNumber);
        }
    });

    return availableDates.sort((a, b) => a - b);
};

/**
 * Formats time slots for a specific date to be used by SelectTimeSlotCard
 * @param {Array} timeSlots - Array of time slot objects from API
 * @returns {Array} - Formatted array with id, time, start_at, end_at
 */
export const formatTimeSlots = (timeSlots) => {
    if (!timeSlots || !Array.isArray(timeSlots)) {
        return [];
    }

    return timeSlots.map((slot, index) => ({
        id: `${slot.start_time}-${slot.end_time}-${index}`,
        time: formatTimeToAMPM(slot.start_time), // Convert to AM/PM format
        start_at: slot.start_at,
        end_at: slot.end_at,
        start_time: slot.start_time,
        end_time: slot.end_time,
        formattedTime: `${formatTimeToAMPM(slot.start_time)} - ${formatTimeToAMPM(slot.end_time)}`
    }));
};

/**
 * Gets formatted time slots for a specific date
 * @param {Object} apiResponse - The API response containing days data
 * @param {string} selectedDate - Selected date in format 'YYYY-MM-DD' or date number
 * @param {number} month - Current month (1-12)
 * @param {number} year - Current year
 * @returns {Array} - Formatted time slots for the selected date
 */
export const getTimeSlotsForDate = (apiResponse, selectedDate, month = 9, year = 2025) => {
    if (!apiResponse || !apiResponse.rawDaysData || !selectedDate) {
        return [];
    }

    // If selectedDate is a number (day), construct the full date string
    let dateKey;
    if (typeof selectedDate === 'number') {
        // Pad month and day with leading zeros
        const monthStr = month.toString().padStart(2, '0');
        const dayStr = selectedDate.toString().padStart(2, '0');
        dateKey = `${year}-${monthStr}-${dayStr}`;
    } else {
        dateKey = selectedDate;
    }

    const timeSlots = apiResponse.rawDaysData[dateKey] || [];
    return formatTimeSlots(timeSlots);
};

/**
 * Formats meeting types from API response
 * @param {Array} meetingTypes - Array of meeting type strings from API
 * @returns {Array} - Formatted meeting types with icons and labels
 */
export const formatMeetingTypes = (meetingTypes) => {
    const meetingTypeMap = {
        'virtual': {
            id: 'virtual',
            label: 'virtual', // Translation key from en.json
            icon: 'PiVideoCamera'
        },
        'phone': {
            id: 'phone',
            label: 'phone', // Translation key from en.json
            icon: 'BiPhoneCall'
        },
        'in_person': {
            id: 'in_person',
            label: 'in_person', // Translation key from en.json
            icon: 'BiUserPlus'
        }
    };

    if (!meetingTypes) {
        return [];
    }

    // Split comma-separated string into array
    const meetingTypeArray = meetingTypes.split(',');

    return meetingTypeArray.map(type => meetingTypeMap[type.trim()]).filter(Boolean);
};

/**
 * Gets the current month name from the API response
 * @param {Object} apiResponse - The API response
 * @returns {string} - Month name
 */
export const getCurrentMonthName = (apiResponse) => {
    if (!apiResponse || !apiResponse.month || !apiResponse.year) {
        return 'September';
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return monthNames[apiResponse.month - 1] || 'September';
};

/**
 * Complete formatting function that processes the entire API response
 * @param {Object} apiResponse - The complete API response
 * @returns {Object} - Formatted data object with all required fields
 */
export const formatAppointmentData = (apiResponse) => {
    return {
        availableDates: formatAvailableDates(apiResponse),
        availableMeetingTypes: formatMeetingTypes(apiResponse.availability_types),
        currentMonth: getCurrentMonthName(apiResponse),
        currentYear: apiResponse.year || 2025,
        currentMonthNumber: apiResponse.month || 9,
        agentId: apiResponse.agent_id,
        timezone: apiResponse.timezone,
        agentTimezone: apiResponse.agent_timezone,
        rawDaysData: apiResponse.days || {}
    };
};

/*** Get month name from month number 
 * @param {number} monthNumber - The month number (1-12)
 * @returns {string} - The name of the month
***/
export const getMonthFromNumber = (monthNumber, t = null) => {
    // If translation function is provided, use translations
    if (t) {
        const monthNames = [
            t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
            t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
        ];
        return monthNames[monthNumber - 1];
    }
    
    // Fallback to English names if no translation function provided
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNumber - 1];
}