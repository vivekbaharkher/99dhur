import { useTranslation } from '../context/TranslationContext';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { getMonthFromNumber } from '@/utils/appointmentHelper';

const CalendarCard = ({
    availableDates = [],
    selectedDate = null,
    onDateSelect = () => { },
    date = new Date(),
    onCalendarDateChange = () => { }
}) => {
    const t = useTranslation();

    // Days of week for header - using translations
    const daysOfWeek = [
        t('sun'), 
        t('mon'), 
        t('tue'), 
        t('wed'), 
        t('thu'), 
        t('fri'), 
        t('sat')
    ];

    // Generate proper calendar data based on current month and year
    const generateCalendarData = () => {
        const year = date.getFullYear();
        const month = date.getMonth();

        // Get first day of the month and what day of week it starts on
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Get last day of current month
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

        // Get last day of previous month
        const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

        const calendarDays = [];

        // Add previous month's trailing days
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            calendarDays.push({
                day: lastDayOfPrevMonth - i,
                isCurrentMonth: false,
                isAvailable: false
            });
        }

        // Add current month's days
        for (let day = 1; day <= lastDayOfMonth; day++) {
            calendarDays.push({
                day: day,
                isCurrentMonth: true,
                isAvailable: availableDates.includes(day)
            });
        }

        // Add next month's leading days to complete the grid (we want 6 weeks max)
        const totalCells = Math.ceil(calendarDays.length / 7) * 7;
        const remainingDays = totalCells - calendarDays.length;

        for (let day = 1; day <= remainingDays && calendarDays.length < 42; day++) {
            calendarDays.push({
                day: day,
                isCurrentMonth: false,
                isAvailable: false
            });
        }

        return calendarDays;
    };

    const calendarData = generateCalendarData();

    const handleDateClick = (day) => {
        if (day.isAvailable && day.isCurrentMonth) {
            const newDate = new Date(date.getFullYear(), date.getMonth(), day.day);
            onDateSelect(newDate); // Pass full Date object
        }
    };

    // Get selected day number for comparison (only if same month/year)
    const selectedDayNumber = selectedDate &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear()
        ? selectedDate.getDate()
        : null;

    const handlePrevMonth = () => {
        const currentDay = date.getDate();
        const prevMonthYear = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();
        const prevMonthNum = date.getMonth() === 0 ? 11 : date.getMonth() - 1;

        // Get the last day of previous month to handle cases where current day doesn't exist
        const lastDayOfPrevMonth = new Date(prevMonthYear, prevMonthNum + 1, 0).getDate();
        const dayToUse = Math.min(currentDay, lastDayOfPrevMonth);

        const prevMonth = new Date(prevMonthYear, prevMonthNum, dayToUse);
        onCalendarDateChange(prevMonth);
    };

    const handleNextMonth = () => {
        const currentDay = date.getDate();
        const nextMonthYear = date.getMonth() === 11 ? date.getFullYear() + 1 : date.getFullYear();
        const nextMonthNum = date.getMonth() === 11 ? 0 : date.getMonth() + 1;

        // Get the last day of next month to handle cases where current day doesn't exist
        const lastDayOfNextMonth = new Date(nextMonthYear, nextMonthNum + 1, 0).getDate();
        const dayToUse = Math.min(currentDay, lastDayOfNextMonth);

        const nextMonth = new Date(nextMonthYear, nextMonthNum, dayToUse);
        onCalendarDateChange(nextMonth);
    };

    return (
        <div className="newBorder rounded-2xl overflow-hidden bg-white">
            {/* Calendar Header */}
            <div className="flex flex-col gap-4 p-4 border-b newBorderColor">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm md:text-base font-semibold brandColor">{t("chooseDate")}</h2>
                        <span className="flex items-center gap-1 primaryBgLight12 py-1.5 md:py-2 px-2 md:px-3 rounded-sm">
                            <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full primaryBg"></div>
                            <span className="text-xs brandColor opacity-75">{t("availableDates")}</span>
                        </span>
                    </div>
                    {/* Month Navigation */}
                    <div className="flex justify-between items-center gap-2">
                        <h3 className="text-sm md:text-base font-extrabold brandColor">{getMonthFromNumber(date.getMonth() + 1, t)} {date?.getFullYear()}</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevMonth}
                                disabled={date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center primaryBackgroundBg disabled:opacity-70"
                                aria-label="Previous month"
                            >
                                <FaArrowLeft className="w-4 h-4 md:w-5 md:h-5 secondryTextColor" />
                            </button>
                            <button
                                onClick={handleNextMonth}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center primaryBackgroundBg"
                                aria-label="Next month"
                            >
                                <FaArrowRight className="w-4 h-4 md:w-5 md:h-5 secondryTextColor" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-2 md:gap-4 p-2 pb-2">
                {daysOfWeek.map((day, index) => (
                    <div key={index} className="text-xs md:text-base font-bold text-center brandColor">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-y-4 md:gap-y-6 py-2 md:py-4">
                {calendarData.map((day, index) => (
                    <div key={index} className="text-center relative">
                        <span
                            className={`
                inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 text-sm md:text-base rounded-full
                ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                ${day.isAvailable && day.isCurrentMonth ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed'}
                ${selectedDayNumber === day.day && day.isCurrentMonth ? 'primaryBg !text-white' : ''}
              `}
                            onClick={() => handleDateClick(day)}
                            role={day.isAvailable && day.isCurrentMonth ? "button" : undefined}
                            tabIndex={day.isAvailable && day.isCurrentMonth ? 0 : -1}
                            onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === ' ') && day.isAvailable && day.isCurrentMonth) {
                                    handleDateClick(day);
                                }
                            }}
                            aria-selected={selectedDayNumber === day.day && day.isCurrentMonth}
                        >
                            {day.day}
                        </span>
                        {day.isAvailable && day.isCurrentMonth && selectedDayNumber !== day.day && (
                            <div className="absolute w-1 h-1 md:w-1.5 md:h-1.5 rounded-full primaryBg -bottom-1 md:-bottom-2 left-1/2 transform -translate-x-1/2"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarCard;