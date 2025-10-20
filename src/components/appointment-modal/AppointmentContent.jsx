import { useState, useEffect } from 'react';
import SearchBar from './search-bar/SearchBar';
import PropertyCard from './property-card/PropertyCard';
import CalendarCard from './CalendarCard';
import SelectTimeSlotCard from './SelectTimeSlotCard';
import MeetingTypeCard from './MeetingTypeCard';
import { useTranslation } from '../context/TranslationContext';
import AgentAndPropertyCard from './confirmation-step/AgentAndPropertyCard';
import MeetingScheduleCard from './confirmation-step/MeetingScheduleCard';

const AppointmentContent = ({
    // Step management
    currentStep = 1,

    // Step 1 props - Property Selection
    displayProperties = [],
    selectedProperty = null,
    searchQuery = "",
    totalProperties = 0,
    handleSearch = () => { },
    handlePropertySelect = () => { },
    setSearchQuery = () => { },

    // API Response for appointment data
    appointmentData = {},
    timeSlots = [],

    // Step 2 props - Date & Meeting Preferences (now managed internally)
    selectedDate = null,
    calendarDate = new Date(),
    selectedTimeSlot = null,
    selectedMeetingType = null,
    onDateSelect = () => { },
    onTimeSlotSelect = () => { },
    onMeetingTypeSelect = () => { },
    onCalendarDateChange = () => { },

    // Step 3 props - Confirmation
    agentDetails = {},
    meetingNotes = "",
    onMeetingNotesChange = () => { },
    onResetAppointmentDetails = () => { },
    handleLoadMoreProperties = () => { },
    hasMore = false,
    isMobile = false,
}) => {
    const t = useTranslation();
    // Internal state for managing appointment data
    const [internalSelectedDate, setInternalSelectedDate] = useState(selectedDate);
    const [internalSelectedTimeSlot, setInternalSelectedTimeSlot] = useState(selectedTimeSlot);
    const [internalSelectedMeetingType, setInternalSelectedMeetingType] = useState(selectedMeetingType);



    // Handle date selection
    const handleDateSelect = (date) => {
        setInternalSelectedDate(date);
        setInternalSelectedTimeSlot(null); // Reset time slot when date changes
        onDateSelect(date);
    };

    const handleCalendarDateChange = (date) => {
        onCalendarDateChange(date);
    };

    // Handle time slot selection
    const handleTimeSlotSelect = (timeSlot) => {
        setInternalSelectedTimeSlot(timeSlot);
        onTimeSlotSelect(timeSlot);
    };

    // Handle meeting type selection
    const handleMeetingTypeSelect = (meetingType) => {
        setInternalSelectedMeetingType(meetingType);
        onMeetingTypeSelect(meetingType);
    };

    // Update internal state when props change
    useEffect(() => {
        setInternalSelectedDate(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        setInternalSelectedTimeSlot(selectedTimeSlot);
    }, [selectedTimeSlot]);

    useEffect(() => {
        setInternalSelectedMeetingType(selectedMeetingType);
    }, [selectedMeetingType]);


    // Step 1: Property Selection
    const renderStep1 = () => (
        <>
            {/* Search Section */}
            <section className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-white newBorder rounded-2xl p-3 sm:p-4" >
                <p className="text-nowrap brandColor font-bold text-sm sm:text-base" role="status" aria-live="polite">
                    {t("showing")} {displayProperties?.length} {t("of")} {totalProperties} {t("properties")}
                </p>
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={handleSearch}
                    totalProperties={totalProperties}
                    placeholder="searchProperties"
                />
            </section>

            {/* Properties List */}
            <section className="flex gap-4 sm:gap-6 h-full" aria-label="Property selection" >
                <div className="flex flex-col w-full overflow-y-auto gap-4 sm:gap-6 max-h-[250px] sm:max-h-[300px] md:max-h-[400px] lg:max-h-[500px] xl:max-h-[600px]" role="list">
                    {displayProperties.map((property) => (
                        <div key={property.id} role="listitem">
                            <PropertyCard
                                property={property}
                                isSelected={selectedProperty?.id === property?.id}
                                onSelect={handlePropertySelect}
                                isMobile={isMobile}
                            />
                        </div>
                    ))}

                    {displayProperties?.length === 0 && (
                        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-500" role="status">
                            <p className="text-sm sm:text-base">{t("noPropertiesFoundMatchingSearch")}</p>
                        </div>
                    )}
                    {hasMore && displayProperties.length > 0 && (
                        <div className="flex items-center justify-center mt-4">
                            <button
                                onClick={handleLoadMoreProperties}
                                className="px-3 sm:px-4 py-2 border brandBorder brandColor rounded-lg text-sm sm:text-base"
                            >
                                {t("loadMore")} {t("properties")}
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );

    // Step 2: Pick Date & Meeting Preferences
    const renderStep2 = () => (
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 w-full">
            {/* Left Column - Calendar */}
            <div className="flex flex-col w-full xl:w-2/3 gap-3 sm:gap-4">
                <CalendarCard
                    availableDates={appointmentData.availableDates}
                    selectedDate={internalSelectedDate}
                    onDateSelect={handleDateSelect}
                    date={calendarDate}
                    onCalendarDateChange={handleCalendarDateChange}
                />
                <MeetingTypeCard
                    meetingTypes={appointmentData.availableMeetingTypes}
                    selectedType={internalSelectedMeetingType}
                    onSelectMeetingType={handleMeetingTypeSelect}
                />
            </div>

            {/* Right Column - Time Slot */}
            <div className="flex flex-col w-full xl:w-1/3 gap-4 sm:gap-6">
                <SelectTimeSlotCard
                    selectedDate={internalSelectedDate}
                    timeSlots={timeSlots}
                    selectedTimeSlot={internalSelectedTimeSlot}
                    onSelectTimeSlot={handleTimeSlotSelect}
                />
            </div>
        </div>
    );

    // Step 3: Confirmation
    const renderStep3 = () => (
        <div className={`flex flex-col gap-4 sm:gap-6 h-full ${isMobile ? 'max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2' : ''}`}>
            <AgentAndPropertyCard 
                selectedProperty={selectedProperty} 
                agentDetails={agentDetails}
                isMobile={isMobile} 
            />
            <MeetingScheduleCard
                date={selectedDate}
                time={selectedTimeSlot?.time}
                meetingType={selectedMeetingType}
                onChangeClick={onResetAppointmentDetails}
                isMobile={isMobile}
            />
            <div className='newBorder rounded-2xl bg-white p-3 sm:p-4'>
                <h3 className='brandColor font-medium text-sm sm:text-base pb-3 sm:pb-4'>
                    {t("message")}
                    <span className="leadColor font-medium text-xs sm:text-sm ml-2">
                        {t("optional")}
                    </span>
                </h3>
                <textarea
                    id="meetingMessage"
                    type="textarea"
                    value={meetingNotes}
                    onChange={(e) => onMeetingNotesChange(e.target.value)}
                    placeholder={t("enterMeetingMessage")}
                    className={`w-full newBorder p-3 sm:p-4 h-16 sm:h-20 md:h-24 primaryBackgroundBg leadColor resize-none outline-none rounded-lg text-sm sm:text-base`}
                />
            </div>
        </div>
    );

    // Render appropriate step
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            default:
                return renderStep1();
        }
    };

    return renderCurrentStep();
};

export default AppointmentContent;