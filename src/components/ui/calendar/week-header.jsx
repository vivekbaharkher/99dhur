import React from 'react';
import { useTranslation } from '@/components/context/TranslationContext';

const WeekHeader = () => {
    const t = useTranslation();
    
    // Use translation keys for day names
    const weekDays = [
        { key: 'mon', label: t('mon') },
        { key: 'tue', label: t('tue') },
        { key: 'wed', label: t('wed') },
        { key: 'thu', label: t('thu') },
        { key: 'fri', label: t('fri') },
        { key: 'sat', label: t('sat') },
        { key: 'sun', label: t('sun') }
    ];

    return (
        <div className="grid grid-cols-7">
            {weekDays.map((day) => (
                <div
                    key={day.key}
                    className="flex justify-center items-center p-3 border newBorder primaryBackgroundBg"
                >
                    <span className="text-base font-bold leadColor">
                        {day.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default WeekHeader;
