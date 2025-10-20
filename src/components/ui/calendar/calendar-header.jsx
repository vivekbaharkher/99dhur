import { useTranslation } from '@/components/context/TranslationContext';
import React from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

const CalendarHeader = ({
    currentMonth,
    currentYear,
    onPreviousMonth,
    onNextMonth
}) => {
    
    const t = useTranslation();
    const monthNames = [
        t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
        t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
    ];

    return (

        <div className="flex items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold brandColor">
                    {monthNames[currentMonth]} {currentYear}
                </h2>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={onPreviousMonth}
                    className="flex items-center justify-center p-3 rounded-lg border brandBorder hover:bg-gray-50 transition-colors"
                    aria-label="Previous month"
                >
                    <BsChevronLeft className="w-4 h-4 md:w-6 md:h-6 brandColor" />
                </button>
                <button
                    onClick={onNextMonth}
                    className="flex items-center justify-center p-3 rounded-lg border brandBorder hover:bg-gray-50 transition-colors"
                    aria-label="Next month"
                >
                    <BsChevronRight className="w-4 h-4 md:w-6 md:h-6 brandColor" />
                </button>
            </div>
        </div>
    );
};

export default CalendarHeader;
