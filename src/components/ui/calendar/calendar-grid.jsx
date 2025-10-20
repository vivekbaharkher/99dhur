import React from 'react';
import CalendarDate from './calendar-date';

const CalendarGrid = ({
    calendarDates = [],
    selectedDate,
    onEditSchedule,
    onViewAllSchedules,
    extraTimeSlots = [],
}) => {
    return (
        <div className="grid grid-cols-7">
            {calendarDates.map((dateData, index) => (
                <CalendarDate
                    key={index}
                    dateData={dateData}
                    dateObj={dateData.dateObj}
                    date={dateData.date}
                    isDisabled={dateData.isDisabled}
                    dateSchedule={dateData.dateSchedule}
                    extraTimeSlots={extraTimeSlots}
                    hasContent={dateData.hasContent}
                    weekSchedules={dateData.weekSchedules}
                    onEditSchedule={onEditSchedule}
                    onViewAllSchedules={onViewAllSchedules}
                    isSelected={selectedDate && dateData.date.toDateString() === selectedDate.toDateString()}
                />
            ))}
        </div>
    );
}

export default CalendarGrid;
