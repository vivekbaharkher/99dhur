
"use client";

import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from '../context/TranslationContext';
import { toast } from 'react-hot-toast';
import { getAgentAppointmentBookingPreferencesApi, postAgentAppointmentBookingPreferencesApi } from '@/api/apiRoutes';

// Import the separated components
import BookingPreferences from './appointment/BookingPreferences';
import SetAvailability from './appointment/SetAvailability';
import AllSchedule from './appointment/AllSchedule';
import { useDispatch } from 'react-redux';
import CustomLink from '../context/CustomLink';

// Main skeleton component for loading state
const ConfigurationSkeleton = () => {
    return (
        <div className="w-full max-w-[1580px] mx-auto p-4 sm:p-7 space-y-4 sm:space-y-7">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-6 sm:h-7 w-36 sm:w-48" />
                    <Skeleton className="h-3 sm:h-4 w-56 sm:w-72" />
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="bg-white border-b newBorderColor overflow-x-auto">
                <div className="flex items-center gap-4 sm:gap-7 px-4 sm:px-7 min-w-max">
                    <div className="flex items-center px-2 sm:px-4 py-3 sm:py-4">
                        <Skeleton className="h-4 sm:h-5 w-28 sm:w-36" />
                    </div>
                    <div className="flex items-center px-2 sm:px-4 py-3 sm:py-4">
                        <Skeleton className="h-4 sm:h-5 w-20 sm:w-28" />
                    </div>
                    <div className="flex items-center px-2 sm:px-4 py-3 sm:py-4">
                        <Skeleton className="h-4 sm:h-5 w-18 sm:w-24" />
                    </div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="bg-white px-4 sm:px-7 py-4 sm:py-7">
                <div className="space-y-4 sm:space-y-6">
                    {Array.from({ length: 4 }, (_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
};

const UserAppointmentConfiguration = () => {
    const t = useTranslation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("booking-preferences");
    const [preferencesData, setPreferencesData] = useState(null);
    const [formData, setFormData] = useState({
        autoConfirm: false,
        bufferTime: '',
        defaultDuration: '',
        cancellationTime: '',
        minAdvanceBookingTime: '',
        cancelRescheduleBufferTime: '',
        cancellationMessage: '',
        maxBookingsPerDay: '',
        timezone: 'Asia/Kolkata',
        meetingTypes: {
            video: false,
            phone: false,
            inPerson: false
        }
    });
    const [saving, setSaving] = useState(false);
    const [isFormModified, setIsFormModified] = useState(false);
    const toastShownRef = useRef(false);

    // Fetch appointment preferences on component mount
    useEffect(() => {
        if (activeTab === 'booking-preferences') {
            fetchAppointmentPreferences();
        }
    }, [activeTab]);

    const fetchAppointmentPreferences = async () => {
        setLoading(true);
        try {
            const response = await getAgentAppointmentBookingPreferencesApi();
            if (response?.error === false && response?.data) {
                setPreferencesData(response.data);

                // Map API response to form data
                const data = response.data;
                const availabilityTypes = data.availability_types || '';
                const types = availabilityTypes.toLowerCase().split(',');

                setFormData({
                    autoConfirm: data.auto_confirm === 1,
                    bufferTime: data.buffer_time_minutes?.toString() || '',
                    defaultDuration: data.meeting_duration_minutes?.toString() || '',
                    cancellationTime: data.auto_cancel_after_minutes?.toString() || '',
                    cancelRescheduleBufferTime: data.cancel_reschedule_buffer_minutes?.toString() || '',
                    minAdvanceBookingTime: data.lead_time_minutes?.toString() || '',
                    cancellationMessage: data.auto_cancel_message || '',
                    maxBookingsPerDay: data.daily_booking_limit?.toString() || '',
                    timezone: data.timezone || 'Asia/Kolkata',
                    meetingTypes: {
                        video: types.includes('virtual'),
                        phone: types.includes('phone'),
                        inPerson: types.includes('in_person')
                    }
                });

                // Reset form modified state when data is fetched
                setIsFormModified(false);
            }
        } catch (error) {
            console.error('Error fetching appointment preferences:', error);
            toast.error('Failed to load appointment preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBookingPreferences = async () => {
        setSaving(true);
        try {
            // Collect missing fields
            const missingFields = [];
            if (!formData.bufferTime) missingFields.push('Buffer Time');
            if (!formData.defaultDuration) missingFields.push('Default Meeting Duration');
            if (!formData.minAdvanceBookingTime) missingFields.push('Minimum Advance Booking Time');

            // If any field is missing, show a single toast with all missing fields
            if (missingFields.length > 0) {
                toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
                setSaving(false);
                return;
            }

            // Map form data to API format
            const apiData = {
                meeting_duration_minutes: parseInt(formData.defaultDuration),
                lead_time_minutes: parseInt(formData.minAdvanceBookingTime),
                buffer_time_minutes: parseInt(formData.bufferTime),
                auto_confirm: formData.autoConfirm ? 1 : 0,
                auto_cancel_after_minutes: parseInt(formData.cancellationTime),
                cancel_reschedule_buffer_minutes: parseInt(formData.cancelRescheduleBufferTime), // Default value, you can make this configurable
                auto_cancel_message: formData.cancellationMessage,
                daily_booking_limit: parseInt(formData.maxBookingsPerDay),
                availability_types: Object.entries(formData.meetingTypes)
                    .filter(([key, value]) => value)
                    .map(([key]) => {
                        switch (key) {
                            case 'video': return 'virtual';
                            case 'phone': return 'phone';
                            case 'inPerson': return 'in_person';
                            default: return key;
                        }
                    })
                    .join(',') || "",
                anti_spam_enabled: 1, // Default value, you can make this configurable
                timezone: formData.timezone
            };

            const response = await postAgentAppointmentBookingPreferencesApi(apiData);

            if (response?.error === false) {
                toast.success('Booking preferences saved successfully!');
                // Move to next tab after successful save
                setActiveTab("set-availability");
                setPreferencesData(response.data);
                setIsFormModified(false); // Reset form modified state after successful save
                toastShownRef.current = false; // Reset toast flag
            } else {
                throw new Error(response?.message || 'Failed to save preferences');
            }
        } catch (error) {
            console.error('Error saving booking preferences:', error);
            toast.error(error.message || 'Failed to save booking preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleNavigateOnSave = async (tabToActivate) => {
        setActiveTab(tabToActivate);
        // Implement API call here
    };

    const handleTabChange = (nextTab) => {
        // If we're not changing away from booking-preferences, allow the tab change
        if (activeTab !== "booking-preferences" || nextTab === "booking-preferences") {
            setActiveTab(nextTab);
            return;
        }

        // Check if form is modified but not saved
        if (isFormModified) {
            if (!toastShownRef.current) {
                toast.error('Please save your changes before switching tabs');
                toastShownRef.current = true;
                // Reset the flag after 3 seconds
                setTimeout(() => {
                    toastShownRef.current = false;
                }, 3000);
            }
            return;
        }

        // Check if preferences are not set (no data loaded yet)
        if (!preferencesData) {
            if (!toastShownRef.current) {
                toast.error('Please set your booking preferences first');
                toastShownRef.current = true;
                // Reset the flag after 3 seconds
                setTimeout(() => {
                    toastShownRef.current = false;
                }, 3000);
            }
            return;
        }

        // For other tabs, just allow the change if we have saved preferences
        setActiveTab(nextTab);
    };

    const handleFormDataChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setIsFormModified(true);
    };

    const handleMeetingTypeChange = (type, checked) => {
        setFormData(prev => ({
            ...prev,
            meetingTypes: {
                ...prev.meetingTypes,
                [type]: checked
            }
        }));
        setIsFormModified(true);
    };

    if (loading) {
        return <ConfigurationSkeleton />;
    }

    return (
        <div className="w-full max-w-[1580px] mx-auto p-4 sm:p-7 space-y-4 sm:space-y-7">
            {/* Page Header */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold brandColor font-manrope">
                    {t("configuration")}
                </h1>
                {/* <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <CustomLink href={"/user/bookings"} className="brandColor font-medium">{t("myAppointment")}</CustomLink>
                    <span className="brandColor">/</span>
                    <span className="primaryColor font-semibold">{t("configuration")}</span>
                </div> */}
            </div>

            {/* Tabs Container */}
            <div className="bg-white border newBorderColor rounded-lg overflow-hidden">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    {/* Custom Tabs Header */}
                    <div className="border-b newBorderColor overflow-x-auto">
                        <TabsList className="w-full h-auto bg-transparent p-0 gap-7 rounded-none justify-start px-7">
                            <TabsTrigger
                                value="booking-preferences"
                                className="px-4 py-4 rounded-none border-b-2 border-transparent data-[state=active]:primaryBorderColor data-[state=active]:bg-transparent bg-transparent hover:bg-transparent transition-colors !shadow-none"
                            >
                                <span className={`text-sm sm:text-base font-manrope whitespace-nowrap ${activeTab === 'booking-preferences'
                                    ? 'font-bold primaryColor'
                                    : 'font-medium brandColor'
                                    }`}>
                                    {t("bookingPreferences")}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="set-availability"
                                className="px-4 py-4 rounded-none border-b-2 border-transparent data-[state=active]:primaryBorderColor data-[state=active]:bg-transparent bg-transparent hover:bg-transparent transition-colors !shadow-none"
                            >
                                <span className={`text-sm sm:text-base font-manrope whitespace-nowrap ${activeTab === 'set-availability'
                                    ? 'font-bold primaryColor'
                                    : 'font-medium brandColor'
                                    }`}>
                                    {t("setAvailability")}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="all-schedule"
                                className="px-4 py-4 rounded-none border-b-2 border-transparent data-[state=active]:primaryBorderColor data-[state=active]:bg-transparent bg-transparent hover:bg-transparent transition-colors !shadow-none"
                            >
                                <span className={`text-sm sm:text-base font-manrope whitespace-nowrap ${activeTab === 'all-schedule'
                                    ? 'font-bold primaryColor'
                                    : 'font-medium brandColor'
                                    }`}>
                                    {t("allSchedule")}
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab Content */}
                    <div className="px-4 sm:px-7 py-4 sm:py-6 !overflow-x-auto w-full">

                        <TabsContent value="booking-preferences" className="mt-0">
                            <BookingPreferences
                                loading={loading}
                                onSave={handleSaveBookingPreferences}
                                formData={formData}
                                saving={saving}
                                onFormDataChange={handleFormDataChange}
                                onMeetingTypeChange={handleMeetingTypeChange}
                            />
                        </TabsContent>

                        <TabsContent value="set-availability" className="mt-0">
                            <SetAvailability
                                preferencesData={preferencesData}
                                loading={loading}
                                onSave={handleNavigateOnSave}
                            />
                        </TabsContent>

                        <TabsContent value="all-schedule" className="mt-0">
                            <AllSchedule
                                preferencesData={preferencesData}
                                loading={loading}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default UserAppointmentConfiguration;