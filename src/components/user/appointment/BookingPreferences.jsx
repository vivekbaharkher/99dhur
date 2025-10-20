"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import timezones from "@/utils/timezones.json";
import { useTranslation } from '@/components/context/TranslationContext';
import toast from 'react-hot-toast';
import { HelpCircle } from 'lucide-react';

// Help Icon Component with Shadcn Tooltip
const HelpIcon = ({ tooltip }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
};

// Skeleton component for loading state
const BookingPreferencesSkeleton = () => {
    return (
        <div className="space-y-[30px]">
            {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="border newBorderColor rounded-2xl p-4 space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-full" />
                        {i === 4 && <Skeleton className="h-4 w-3/4" />}
                    </div>
                    <Skeleton className={`h-[44px] w-full ${i === 4 ? 'h-[146px]' : ''}`} />
                </div>
            ))}
        </div>
    );
};

const BookingPreferences = ({ loading = false, onSave, formData, saving, onFormDataChange, onMeetingTypeChange }) => {
    const t = useTranslation();

    const handleInputChange = (field, value) => {
        if (value < 0) {
            return;
        }
        onFormDataChange(field, value);
    };

    const validateForm = () => {
        const errors = [];

        // Check Buffer Time (0-120 minutes)
        if (!formData.bufferTime || formData.bufferTime < 0) {
            errors.push(t("bufferTimeRequired"));
        } else if (formData.bufferTime < 0 || formData.bufferTime > 120) {
            errors.push(t("bufferTimeRange"));
        }

        // Check Default Meeting Duration (15-480 minutes)
        if (!formData.defaultDuration || formData.defaultDuration <= 0) {
            errors.push(t("defaultDurationRequired"));
        } else if (formData.defaultDuration < 15 || formData.defaultDuration > 480) {
            errors.push(t("defaultDurationRange"));
        }

        // Check Automatic Cancellation Time (0-10080 minutes)
        if (!formData.cancellationTime || formData.cancellationTime < 0) {
            errors.push(t("cancellationTimeRequired"));
        } else if (formData.cancellationTime < 0 || formData.cancellationTime > 10080) {
            errors.push(t("cancellationTimeRange"));
        }

        // Check Minimum Advance Booking Time (0-10080 minutes)
        if (!formData.minAdvanceBookingTime || formData.minAdvanceBookingTime < 0) {
            errors.push(t("minAdvanceBookingTimeRequired"));
        } else if (formData.minAdvanceBookingTime < 0 || formData.minAdvanceBookingTime > 10080) {
            errors.push(t("minAdvanceBookingTimeRange"));
        }

        // Check Cancel/Reschedule Buffer Time (0-1440 minutes)
        if (!formData.cancelRescheduleBufferTime || formData.cancelRescheduleBufferTime < 0) {
            errors.push(t("cancelRescheduleBufferTimeRequired"));
        } else if (formData.cancelRescheduleBufferTime < 0 || formData.cancelRescheduleBufferTime > 1440) {
            errors.push(t("cancelRescheduleBufferTimeRange"));
        }

        // Check Max Bookings Per Day (1-100)
        if (formData.maxBookingsPerDay && (formData.maxBookingsPerDay < 1 || formData.maxBookingsPerDay > 100)) {
            errors.push(t("maxBookingsPerDayRange"));
        }

        // Check Meeting Types (at least one should be selected)
        const { video, phone, inPerson } = formData.meetingTypes;
        if (!video && !phone && !inPerson) {
            errors.push(t("selectAtLeastOneMeetingType"));
        }

        return errors;
    };

    const handleSave = () => {
        const errors = validateForm();
        if (errors.length > 0) {
            // Show errors in toast - as list if multiple, direct message if single error
            toast.error(
                errors.length > 1 ? (
                    <div className="space-y-2">
                        <p className="font-medium">{t("pleaseFixFollowingErrors")}:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            {errors.map((error, index) => (
                                <li key={index} className="text-sm">{error}</li>
                            ))}
                        </ul>
                    </div>
                ) : errors[0]
            );
            return;
        }

        if (onSave) {
            onSave();
        }
    };

    if (loading) {
        return <BookingPreferencesSkeleton />;
    }

    return (
        <TooltipProvider>
            <div className="space-y-[30px]">
                {/* Auto Confirm */}
                <div className="border newBorderColor rounded-2xl flex">
                    <div className="flex-1 space-y-2 border-r newBorderColor p-4">
                        <h3 className="text-base font-bold blackTextColor">
                            {t("autoConfirmBookings")}
                        </h3>
                        <p className="text-sm font-medium blackTextColor opacity-75">
                            {t("autoConfirmBookingsDescription")}
                        </p>
                    </div>
                    <div className="flex justify-center items-center p-4 md:p-8">
                        <Switch
                            checked={formData.autoConfirm}
                            onCheckedChange={(checked) => handleInputChange('autoConfirm', checked)}
                            className="data-[state=checked]:primaryBg data-[state=unchecked]:bg-[#E7E7E7] h-[30px] w-[60px] [&>span]:data-[state=checked]:!translate-x-8"
                        />
                    </div>
                </div>

                {/* Row 1: Buffer Time & Meeting Duration */}
                <div className="flex flex-col md:flex-row gap-[30px]">
                    {/* Buffer Time */}
                    <div className="flex-1 border newBorderColor rounded-2xl p-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold blackTextColor isRequired">
                                    {t("setBufferTime")}
                                </h3>
                                <HelpIcon tooltip="Time between consecutive appointments (0-120 minutes)" />
                            </div>
                            <p className="text-sm font-medium blackTextColor opacity-75">
                                {t("setBufferTimeDescription")}
                            </p>
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={formData.bufferTime}
                                onChange={(e) => handleInputChange('bufferTime', e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.target.value <= 0) {
                                        handleInputChange('bufferTime', "");
                                    }
                                }}
                                placeholder={t("enterTimeInMinutes")}
                                className="h-[44px] primaryBackgroundBg newBorderColor border-[1.5px] rounded-lg px-4 py-3 leadColor font-medium"
                            />
                        </div>
                    </div>

                    {/* Default Meeting Duration */}
                    <div className="flex-1 border newBorderColor rounded-2xl p-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold blackTextColor isRequired">
                                    {t("defaultMeetingDuration")}
                                </h3>
                                <HelpIcon tooltip="Duration of each appointment slot (15-480 minutes)" />
                            </div>
                            <p className="text-sm font-medium blackTextColor opacity-75">
                                {t("defaultMeetingDurationDescription")}
                            </p>
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={formData.defaultDuration}
                                onChange={(e) => handleInputChange('defaultDuration', e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.target.value <= 0) {
                                        handleInputChange('defaultDuration', "");
                                    }
                                }}
                                placeholder={t("enterTimeInMinutes")}
                                className="h-[44px] primaryBackgroundBg newBorderColor border-[1.5px] rounded-lg px-4 py-3 leadColor font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Row 2: Automatic Cancellation Time & Minimum Advance Booking Time */}
                <div className="flex flex-col md:flex-row gap-[30px]">
                    {/* Automatic Cancellation Time */}
                    <div className="flex-1 border newBorderColor rounded-2xl p-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold blackTextColor isRequired">
                                    {t("automaticCancellationTime")}
                                </h3>
                                <HelpIcon tooltip="Auto-cancel if not confirmed within this time (0-10080 minutes)" />
                            </div>
                            <p className="text-sm font-medium blackTextColor opacity-75">
                                {t("automaticCancellationTimeDescription")}
                            </p>
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={formData.cancellationTime}
                                onChange={(e) => handleInputChange('cancellationTime', e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.target.value <= 0) {
                                        handleInputChange('cancellationTime', "");
                                    }
                                }}
                                placeholder={t("enterTimeInMinutes")}
                                className="h-[44px] primaryBackgroundBg newBorderColor border-[1.5px] rounded-lg px-4 py-3 leadColor font-medium"
                            />
                        </div>
                    </div>

                    {/* Minimum Advance Booking Time */}
                    <div className="flex-1 border newBorderColor rounded-2xl p-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold blackTextColor isRequired">
                                    {t("minimumAdvanceBookingTime")}
                                </h3>
                                <HelpIcon tooltip="Minimum time required before booking (0-10080 minutes)" />
                            </div>
                            <p className="text-sm font-medium blackTextColor opacity-75">
                                {t("minimumAdvanceBookingTimeDescription")}
                            </p>
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={formData.minAdvanceBookingTime}
                                onChange={(e) => handleInputChange('minAdvanceBookingTime', e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.target.value <= 0) {
                                        handleInputChange('minAdvanceBookingTime', "");
                                    }
                                }}
                                placeholder={t("enterTimeInMinutes")}
                                className="h-[44px] primaryBackgroundBg newBorderColor border-[1.5px] rounded-lg px-4 py-3 leadColor font-medium"
                            />
                        </div>
                    </div>

                    {/* Cancel/Reschedule Buffer Time */}
                    <div className="flex-1 border newBorderColor rounded-2xl p-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold blackTextColor isRequired">
                                    {t("cancelRescheduleBufferTime")}
                                </h3>
                                <HelpIcon tooltip="Minimum time before appointment to cancel/reschedule (0-1440 minutes)" />
                            </div>
                            <p className="text-sm font-medium blackTextColor opacity-75">
                                {t("cancelRescheduleBufferTimeDescription")}
                            </p>
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={formData.cancelRescheduleBufferTime}
                                onChange={(e) => handleInputChange('cancelRescheduleBufferTime', e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.target.value <= 0) {
                                        handleInputChange('cancelRescheduleBufferTime', "");
                                    }
                                }}
                                placeholder={t("enterTimeInMinutes")}
                                className="h-[44px] primaryBackgroundBg newBorderColor border-[1.5px] rounded-lg px-4 py-3 leadColor font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Row 3: Max Booking Per Day & Select Meeting Type */}
                <div className="flex flex-col md:flex-row gap-[30px]">
                    {/* Max Booking Per Day */}
                    <div className="flex-1 border newBorderColor rounded-2xl p-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold blackTextColor">
                                    {t("maxBookingsPerDay")}
                                </h3>
                                <HelpIcon tooltip="Maximum appointments per day (1-100)" />
                            </div>
                            <p className="text-sm font-medium blackTextColor opacity-75">
                                {t("maxBookingsPerDayDescription")}
                            </p>
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={formData.maxBookingsPerDay}
                                onChange={(e) => handleInputChange('maxBookingsPerDay', e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.target.value <= 0) {
                                        handleInputChange('maxBookingsPerDay', "");
                                    }
                                }}
                                placeholder={t("enterMaxLimit")}
                                className="h-[44px] primaryBackgroundBg newBorderColor border-[1.5px] rounded-lg px-4 py-3 leadColor font-medium"
                            />
                        </div>
                    </div>

                    {/* Select Meeting Type */}
                    <div className="flex-1 border newBorderColor rounded-2xl p-4 space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-base font-bold blackTextColor isRequired">
                                {t("selectMeetingType")}
                            </h3>
                            <p className="text-sm font-medium blackTextColor opacity-75">
                                {t("selectMeetingTypeDescription")}
                            </p>
                        </div>
                        <div className="flex flex-col md:flex-row  gap-4">
                            <Label
                                htmlFor="video"
                                className="text-sm font-medium blackTextColor cursor-pointer flex items-center gap-3"
                            >
                                <Input
                                    type="checkbox"
                                    id="video"
                                    checked={formData.meetingTypes.video}
                                    onChange={(e) => onMeetingTypeChange('video', e.target.checked)}
                                    className="h-5 w-5 border-[1.5px] blackTextColor border-black primaryCheckbox rounded-sm hover:cursor-pointer"
                                />
                                {t("video")}
                            </Label>
                            <Label
                                htmlFor="phone"
                                className="flex items-center gap-3 text-sm font-medium blackTextColor cursor-pointer"
                            >
                                <Input
                                    type="checkbox"
                                    id="phone"
                                    checked={formData.meetingTypes.phone}
                                    onChange={(e) => onMeetingTypeChange('phone', e.target.checked)}
                                    className="h-5 w-5 border-[1.5px] border-black rounded-sm primaryCheckbox hover:cursor-pointer"
                                />
                                {t("phone")}
                            </Label>
                            <Label htmlFor="inPerson" className="flex items-center gap-3 text-sm font-medium blackTextColor cursor-pointer">
                                <Input
                                    type="checkbox"
                                    id="inPerson"
                                    checked={formData.meetingTypes.inPerson}
                                    onChange={(e) => onMeetingTypeChange('inPerson', e.target.checked)}
                                    className="h-5 w-5 border-[1.5px] border-black rounded-sm primaryCheckbox hover:cursor-pointer"
                                />
                                {t("inPerson")}
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Cancellation Message */}
                <div className="border newBorderColor rounded-2xl p-4 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-base font-bold blackTextColor">
                            {t("cancellationMessage")}
                        </h3>
                        <p className="text-sm font-medium blackTextColor opacity-75">
                            {t("cancellationMessageDescription")}
                        </p>
                    </div>
                    <div>
                        <Textarea
                            value={formData.cancellationMessage}
                            onChange={(e) => handleInputChange('cancellationMessage', e.target.value)}
                            placeholder='eg. "Please note that your upcoming appointment has been canceled. We apologize for any inconvenience this may cause. We look forward to rescheduling with you soon."'
                            className="h-[146px] primaryBackgroundBg newBorderColor border-[1.5px] rounded-lg px-4 py-3 leadColor font-medium resize-none"
                        />
                    </div>
                </div>

                {/* Timezone */}
                <div className="border newBorderColor rounded-2xl p-4 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-base font-bold blackTextColor">
                            {t("timeZone")}
                        </h3>
                        <p className="text-sm font-medium blackTextColor opacity-75">
                            {t("timeZoneDescription")}
                        </p>
                    </div>
                    <div className="w-full max-w-[400px]">
                        <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                            <SelectTrigger className="h-[44px] primaryBackgroundBg newBorderColor border-[1.5px] rounded-lg px-4 py-3 focus:!ring-0">
                                <SelectValue placeholder={t("selectTimezone")} className="leadColor font-medium" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {timezones.map((timezone) => (
                                    <SelectItem key={timezone} value={timezone}>
                                        {timezone}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end items-center">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-12 px-4 py-3 brandBg primaryTextColor font-medium rounded-lg hover:brandBg/90 disabled:opacity-50 text-base"
                    >
                        {saving ? t("saving") : t("savePreferences")}
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default BookingPreferences;
