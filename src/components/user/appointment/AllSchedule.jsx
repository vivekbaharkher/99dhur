import { useEffect, useState } from 'react';
import Calendar from '@/components/ui/calendar/calendar';
import { useSelector } from 'react-redux';
import { deleteExtraTimeSlotsApi, getAgentTimeScheduleApi, postExtraTimeSlotsApi } from '@/api/apiRoutes';
import ViewAllSchedules from './modals/ViewAllSchedules';
import AddExtraTimeSlotModal from './modals/AddExtraTimeSlotModal';
import toast from 'react-hot-toast';
import { useTranslation } from '@/components/context/TranslationContext';

// Helper function to transform API response to calendar-friendly format
const transformApiResponse = (apiResponse, targetDate = new Date()) => {
    const transformedData = {};

    // Only handle array format (weekly schedule data)
    if (!Array.isArray(apiResponse)) {
        console.warn('Expected array format for schedule data');
        return transformedData;
    }

    // Days of the week mapping
    const daysOfWeek = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6
    };

    // Use target date for reference (for month navigation)
    const currentYear = targetDate.getFullYear();
    const currentMonth = targetDate.getMonth();

    // Group all schedules by day of week (both active and inactive)
    const schedulesByDay = {};
    apiResponse.forEach(schedule => {
        const dayName = schedule.day_of_week.toLowerCase();
        if (!schedulesByDay[dayName]) {
            schedulesByDay[dayName] = [];
        }
        schedulesByDay[dayName].push(schedule);
    });

    // Generate dates for target month that match the scheduled days
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Find the day name for this date
        const dayName = Object.keys(daysOfWeek).find(name => daysOfWeek[name] === dayOfWeek);

        // Format date string (YYYY-MM-DD)
        const formattedMonth = String(currentMonth + 1).padStart(2, '0');
        const formattedDate = String(day).padStart(2, '0');
        const dateKey = `${currentYear}-${formattedMonth}-${formattedDate}`;

        // Check if we have schedules for this day of the week
        if (schedulesByDay[dayName] && schedulesByDay[dayName].length > 0) {
            const daySchedules = schedulesByDay[dayName];

            // Check if there are any active schedules for this day
            const activeSchedules = daySchedules.filter(schedule => schedule.is_active === 1);
            const hasActiveSchedules = activeSchedules.length > 0;

            // Create a Set to track unique time slots and prevent duplicates
            const uniqueTimeSlots = new Map();

            // Only process active schedules for time slots
            activeSchedules.forEach(schedule => {
                // Create unique key based on start and end time
                const timeKey = `${schedule.start_time}-${schedule.end_time}`;

                // Only add if this time slot doesn't already exist
                if (!uniqueTimeSlots.has(timeKey)) {
                    // Convert 24h format to 12h format for display
                    const [startHour, startMinute] = schedule.start_time.split(':');
                    const [endHour, endMinute] = schedule.end_time.split(':');

                    const formattedStartTime = new Date(0, 0, 0, startHour, startMinute)
                        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                    const formattedEndTime = new Date(0, 0, 0, endHour, endMinute)
                        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                    uniqueTimeSlots.set(timeKey, {
                        id: schedule.id,
                        time: `${formattedStartTime} to ${formattedEndTime}`,
                        type: 'appointment',
                        count: schedule.appointment_count || 0,
                        agentId: schedule.agent_id,
                        isActive: schedule.is_active,
                        startTime: schedule.start_time,
                        endTime: schedule.end_time,
                        dayOfWeek: schedule.day_of_week
                    });
                }
            });

            // Convert Map values to array for weekSchedules
            const weekSchedules = Array.from(uniqueTimeSlots.values());

            // Add the transformed data to our object
            transformedData[dateKey] = {
                hasContent: hasActiveSchedules, // Only show content if there are active schedules
                isDisabled: !hasActiveSchedules, // Mark as disabled if no active schedules
                weekSchedules: hasActiveSchedules ? weekSchedules : [], // Only include schedules if active
                dateSchedule: {
                    date: day,
                    month: currentMonth,
                    year: currentYear
                }
            };
        }
    }

    return transformedData;
};
// Main AllSchedule Component
const AllSchedule = ({ preferencesData }) => {

    const t = useTranslation();
    const user = useSelector((state) => state.User?.data)

    const [currentDate, setCurrentDate] = useState(new Date());
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const [scheduleData, setScheduleData] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [viewAllDate, setViewAllDate] = useState(null);
    const [extraSlotModal, setExtraSlotModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [extraTimeSlots, setExtraTimeSlots] = useState([]);
    const [removeSlotIds, setRemoveSlotIds] = useState([]);



    useEffect(() => {
        // Fetch agent time schedules when the component mounts
        const fetchAgentTimeSchedules = async () => {
            try {
                const apiData = await getAgentTimeScheduleApi();

                // Check if we have schedule data in the expected format
                if (apiData?.data) {
                    // Transform the data using our helper function
                    // Handle both array format (weekly schedules) and object format (daily schedules)
                    const transformedData = transformApiResponse(apiData.data?.time_schedules, currentDate);
                    // Set the data in state
                    setScheduleData(transformedData);
                    setExtraTimeSlots(apiData.data?.extra_slots);
                } else {
                    console.warn('No schedule data received from API');
                    setScheduleData({});
                }

            } catch (error) {
                console.error('Error fetching schedules:', error);
                setScheduleData({}); // Clear data on error
            }
        };

        fetchAgentTimeSchedules();
    }, [currentMonth, currentYear, user?.id]);

    const handlePreviousMonth = () => {
        const newDate = new Date(currentYear, currentMonth - 1, 1);
        setCurrentDate(newDate);

        // Fetch data for the new month
        const fetchPreviousMonthData = async () => {
            try {
                // For agent schedules, we typically get the full schedule data
                // and then filter by month in the transform function
                const prevMonthData = await getAgentTimeScheduleApi();

                if (prevMonthData?.data) {
                    const transformedData = transformApiResponse(prevMonthData.data?.time_schedules, newDate);
                    setScheduleData(transformedData);
                    setExtraTimeSlots(prevMonthData.data?.extra_slots);
                } else {
                    setScheduleData({});
                }
            } catch (error) {
                console.error('Error fetching previous month data:', error);
                setScheduleData({});
            }
        };

        fetchPreviousMonthData();
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentYear, currentMonth + 1, 1);
        setCurrentDate(newDate);

        // Fetch data for the new month
        const fetchNextMonthData = async () => {
            try {
                // For agent schedules, we typically get the full schedule data
                // and then filter by month in the transform function
                const nextMonthData = await getAgentTimeScheduleApi();

                if (nextMonthData?.data) {
                    const transformedData = transformApiResponse(nextMonthData.data?.time_schedules, newDate);
                    setScheduleData(transformedData);
                    setExtraTimeSlots(nextMonthData.data?.extra_slots);
                } else {
                    setScheduleData({});
                }
            } catch (error) {
                console.error('Error fetching next month data:', error);
                setScheduleData({});
            }
        };

        fetchNextMonthData();
    };

    const handleDateClick = (date, month, year) => {
        // Format date string to match API format (YYYY-MM-DD)
        const formattedMonth = String(month + 1).padStart(2, '0');
        const formattedDate = String(date).padStart(2, '0');
        const dateKey = `${year}-${formattedMonth}-${formattedDate}`;
        const formattedDateForExtra = `${year}-${formattedMonth}-${formattedDate}`;

        // Check if we have weekly schedules for this date
        const daySchedules = scheduleData[dateKey];
        const weeklySchedules = daySchedules?.weekSchedules || [];
        const hasWeeklySchedules = weeklySchedules.length > 0;

        // Check if we have extra slots for this date
        const extraSlotsForDate = extraTimeSlots?.filter(slot => slot.date === formattedDateForExtra) || [];
        const hasExtraSlots = extraSlotsForDate.length > 0;

        // Only open modal if we have either weekly schedules or extra slots
        if (hasWeeklySchedules || hasExtraSlots) {
            setIsOpen(true);
            setViewAllDate({ date, month, year });
        }
    };

    const handleEditSchedule = (date, month, year) => {
        setExtraSlotModal(true);
        setSelectedDate(new Date(year, month - 1, date));
    };

    const handleViewAllSchedules = (date, month, year) => {
        setIsOpen(true);
        setViewAllDate({ date, month, year });
    };

    const handleSaveExtraTimeSlots = async (newExtraSlots, date) => {
        try {
            const formattedDate = `${date?.getFullYear()}-${String(date?.getMonth() + 1).padStart(2, '0')}-${String(date?.getDate()).padStart(2, '0')}`; // YYYY-MM-DD
            
            let operationType = "add"; // Default operation type

            // Only call delete API if we actually have slots to remove
            const slotsToRemove = removeSlotIds.filter(id => id && !id.toString().startsWith('new-'));
            if (slotsToRemove.length > 0) {
                operationType = "delete";
                const res = await deleteExtraTimeSlotsApi({ removeExtraTimeSlotIds: slotsToRemove });
                if (res?.error === true) {
                    throw new Error(res?.message || t("errorDeletingTimeSlots"));
                }
                setRemoveSlotIds([]);
            }

            // Only format and send slots if we're adding new ones
            const slotsToAdd = newExtraSlots.filter(slot => !removeSlotIds.includes(slot.id));
            if (slotsToAdd.length > 0) {
                const formattedSlots = slotsToAdd.map(slot => {
                    const isNewSlot = !slot.id || slot.id.toString().startsWith('new-');
                    return {
                        start_time: (slot.start_time || slot.startTime)?.slice(0, 5), // Ensure HH:MM format
                        end_time: (slot.end_time || slot.endTime)?.slice(0, 5),     // Ensure HH:MM format
                        reason: slot.reason || '',
                        ...(isNewSlot ? {} : { id: slot.id }) // Only include id for existing slots
                    };
                });

                operationType = slotsToRemove.length > 0 ? "both" : "add";
                const response = await postExtraTimeSlotsApi({ 
                    extraTimeSlots: formattedSlots, 
                    date: formattedDate 
                });
                
                if (response?.error === true) {
                    throw new Error(response?.message || t("errorAddingTimeSlots"));
                }
            }

            // If we get here, operations were successful
            // Refresh the schedule data
            const updatedData = await getAgentTimeScheduleApi();
            if (updatedData?.data) {
                const transformedData = transformApiResponse(updatedData.data?.time_schedules, currentDate);
                setScheduleData(transformedData);
                setExtraTimeSlots(updatedData.data?.extra_slots);

                // Show appropriate success message based on operation type
                if (operationType === "delete") {
                    toast.success(t("timeSlotDeletedSuccessfully"));
                } else if (operationType === "add") {
                    toast.success(t("timeSlotsAddedSuccessfully"));
                } else if (operationType === "both") {
                    toast.success(t("timeSlotUpdatedSuccessfully"));
                }

                return true; // Return success to close modal
            }

            return false; // Return false if refresh failed

        } catch (error) {
            // Handle specific error cases
            if (error?.message?.includes("You cannot add/update a time slot to a past time")) {
                toast.error(t("youCantAddSlotToPast"));
            } else {
                toast.error(error?.message || t("errorSavingTimeSlots"));
            }
            console.error("Error saving extra time slots:", error?.message);
            return false; // Return false to keep modal open
        }
    }

    return (
        <>
            <Calendar
                currentDate={currentDate}
                scheduleData={scheduleData}
                onDateClick={handleDateClick}
                onEditSchedule={handleEditSchedule}
                onViewAllSchedules={handleViewAllSchedules}
                handleNextMonth={handleNextMonth}
                handlePreviousMonth={handlePreviousMonth}
                extraTimeSlots={extraTimeSlots}
            />
            <ViewAllSchedules
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                viewAllDate={viewAllDate}
                showExtraTimeSlots={true}
            />
            <AddExtraTimeSlotModal
                isOpen={extraSlotModal}
                onClose={() => setExtraSlotModal(false)}
                date={selectedDate}
                timeSlots={extraTimeSlots}
                preferencesData={preferencesData}
                scheduleData={scheduleData}
                onSave={handleSaveExtraTimeSlots}
                removeSlotIds={removeSlotIds}
                setRemoveSlotIds={setRemoveSlotIds}
            />
        </>
    );
};

export default AllSchedule;