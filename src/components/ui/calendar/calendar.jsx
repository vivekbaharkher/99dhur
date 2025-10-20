import React, { useState, useMemo } from 'react';
import CalendarHeader from './calendar-header';
import WeekHeader from './week-header';
import CalendarGrid from './calendar-grid';
import { useTranslation } from '@/components/context/TranslationContext';

const Calendar = ({
    currentDate,
    scheduleData = {},
    extraTimeSlots = [],
    onDateClick,
    onEditSchedule,
    onViewAllSchedules,
    className = "",
    handleNextMonth,
    handlePreviousMonth,
}) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const t = useTranslation();

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Generate calendar dates for the current month
    const calendarDates = useMemo(() => {
        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        // Adjust for Monday as first day (0 = Sunday, 1 = Monday, etc.)
        const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        const dates = [];

        // Add previous month's trailing dates
        const prevMonth = new Date(currentYear, currentMonth - 1, 0);
        const prevMonthDays = prevMonth.getDate();

        for (let i = adjustedFirstDay - 1; i >= 0; i--) {
            const date = prevMonthDays - i;
            const dateObj = {
                year: prevMonth.getFullYear(),
                month: prevMonth.getMonth() + 1,
                date: date
            }
            const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            dates.push({
                date: date,
                dateObj: dateObj,
                isDisabled: true,
                hasContent: false,
                weekSchedules: [],
                dateSchedule: null
            });
        }

        // Add current month's dates
        for (let date = 1; date <= daysInMonth; date++) {
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            const schedule = scheduleData[dateKey] || {};
            const dateObj = {
                year: currentYear,
                month: currentMonth + 1,
                date: date
            };

            // Check if the date is in the past
            const isPastDate = (currentYear < todayYear) ||
                (currentYear === todayYear && currentMonth < todayMonth) ||
                (currentYear === todayYear && currentMonth === todayMonth && date < todayDate);

            // A date is disabled if it's in the past OR if the schedule data marks it as disabled
            const isDisabledDate = isPastDate || schedule.isDisabled;

            dates.push({
                date: date,
                dateObj: dateObj,
                isDisabled: isDisabledDate,
                hasContent: schedule.hasContent || false,
                weekSchedules: schedule.weekSchedules || [],
                dateSchedule: schedule.dateSchedule || null
            });
        }

        // Add next month's leading dates to complete the grid (42 cells = 6 rows × 7 days)
        const remainingCells = 42 - dates.length;
        for (let date = 1; date <= remainingCells; date++) {
            const dateObj = {
                year: new Date(currentYear, currentMonth + 1, date).getFullYear(),
                month: new Date(currentYear, currentMonth + 1, date).getMonth() + 1,
                date: date
            }
            dates.push({
                date: date,
                dateObj: dateObj,
                isDisabled: true,
                hasContent: false,
                weekSchedules: [],
                dateSchedule: null
            });
        }

        return dates;
    }, [currentMonth, currentYear, scheduleData]);


    const handleDateClick = (date) => {
        // Only allow clicking on enabled dates
        const clickedDateData = calendarDates.find(d =>
            d.dateObj.year === date.year &&
            d.dateObj.month === date.month &&
            d.dateObj.date === date.date
        );

        if (clickedDateData && !clickedDateData.isDisabled) {
            setSelectedDate(date);
            if (onDateClick) {
                onDateClick(date.date, date.month - 1, date.year);
            }
        }
    };

    const handleEditSchedule = (date) => {
        if (onEditSchedule) {
            onEditSchedule(date, currentMonth + 1, currentYear);
        }
    };

    const handleViewAllSchedules = (date) => {
        if (onViewAllSchedules) {
            onViewAllSchedules(date, currentMonth + 1, currentYear);
        }
    };

    // Helper function to check if a date has content
    const hasDateContent = (date) => {
        const dateKey = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.date).padStart(2, '0')}`;
        return scheduleData[dateKey]?.hasContent || 
               extraTimeSlots.some(slot => {
                   const slotDate = new Date(slot.date);
                   return slotDate.getDate() === date.date && 
                          (slotDate.getMonth() + 1) === date.month && 
                          slotDate.getFullYear() === date.year;
               });
    };

    return (
        <div className={`cardBg rounded-lg ${className}`}>
            {/* Calendar Content */}
            <div className="w-full">
                {/* Header */}
                <CalendarHeader
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                />

                {/* Calendar */}
                <div className="space-y-0">
                    {/* Week Header - Hide on mobile */}
                    <div className="hidden md:block">
                        <WeekHeader />
                    </div>

                    {/* Mobile Week Header - Show abbreviated days */}
                    <div className="grid grid-cols-7 gap-0 text-center py-2 text-sm font-medium md:hidden">
                        {[
                            t('mon').charAt(0), 
                            t('tue').charAt(0), 
                            t('wed').charAt(0), 
                            t('thu').charAt(0), 
                            t('fri').charAt(0), 
                            t('sat').charAt(0), 
                            t('sun').charAt(0)
                        ].map((day, index) => (
                            <div key={index} className="text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="relative">
                        <CalendarGrid
                            calendarDates={calendarDates}
                            selectedDate={selectedDate}
                            onDateClick={handleDateClick}
                            onEditSchedule={handleEditSchedule}
                            onViewAllSchedules={handleViewAllSchedules}
                            extraTimeSlots={extraTimeSlots}
                            hasDateContent={hasDateContent}
                            className="grid grid-cols-7 gap-0 text-center"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
