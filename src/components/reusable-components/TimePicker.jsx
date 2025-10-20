import React, { useState, useEffect, useRef, useCallback } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Simple Select Component with fixed height
const TimeSelect = ({ options, selectedValue, onSelect, label, className, disabledTimes, period, type }) => {
    const isTimeDisabled = (time) => {
        if (!disabledTimes) return false;

        // For hours and minutes, we need to construct the full time string to check
        let timeToCheck;
        if (type === 'hours') {
            timeToCheck = `${time}:00 ${period}`; // Use current period
        } else if (type === 'minutes') {
            timeToCheck = `${selectedValue}:${time} ${period}`; // Use selected hour and current period
        } else {
            // For period selection, check both possible times
            const hour = selectedValue.padStart(2, '0');
            timeToCheck = `${hour}:00 ${time}`;
        }

        return disabledTimes(timeToCheck);
    };

    return (
        <div className={cn("flex-1", className)}>
            <select
                name="time"
                value={selectedValue}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full h-40 text-center text-sm border-0 focus-within:ring-0 focus:outline-none overflow-y-auto"
                size={10}
            >
                {options.map((option, index) => {
                    const disabled = isTimeDisabled(option);
                    return (
                        <option
                            key={index}
                            value={option}
                            disabled={disabled}
                            className={cn(
                                "py-2 px-1 text-center hover:cursor-pointer",
                                disabled ? "text-gray-300 bg-gray-100" : "checked:primaryBg checked:text-white"
                            )}
                        >
                            {option}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

const TimePicker = ({
    value,
    onChange,
    className,
    placeholder = "Select time",
    disabled = false,
    format12Hour = true,
    id,
    name,
    required = false,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    ...props
}) => {
    const [hours, setHours] = useState("");
    const [minutes, setMinutes] = useState("");
    const [period, setPeriod] = useState("AM");
    const [isOpen, setIsOpen] = useState(false);

    // Temporary state for selections before confirming
    const [tempHours, setTempHours] = useState("");
    const [tempMinutes, setTempMinutes] = useState("");
    const [tempPeriod, setTempPeriod] = useState("AM");

    const containerRef = useRef(null);

    // Generate options for wheels
    const hourOptions = format12Hour
        ? Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
        : Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

    const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const periodOptions = ['AM', 'PM'];

    // Initialize state from value prop
    useEffect(() => {
        if (value) {
            const timeMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (timeMatch) {
                const [, h, m, p] = timeMatch;
                const formattedHours = h.padStart(2, '0');
                const formattedMinutes = m;
                const formattedPeriod = format12Hour && p ? p.toUpperCase() : "AM";

                setHours(formattedHours);
                setMinutes(formattedMinutes);
                setPeriod(formattedPeriod);

                // Also set temp values
                setTempHours(formattedHours);
                setTempMinutes(formattedMinutes);
                setTempPeriod(formattedPeriod);
            }
        }
    }, [value, format12Hour]);

    // Initialize temp values when picker opens
    useEffect(() => {
        if (isOpen) {
            setTempHours(hours || (format12Hour ? "01" : "00"));
            setTempMinutes(minutes || "00");
            setTempPeriod(period || "AM");
        }
    }, [isOpen, hours, minutes, period, format12Hour]);

    // Handle wheel selections
    const handleTempHoursChange = (newHours) => {
        setTempHours(newHours);
    };

    const handleTempMinutesChange = (newMinutes) => {
        setTempMinutes(newMinutes);
    };

    const handleTempPeriodChange = (newPeriod) => {
        setTempPeriod(newPeriod);
    };

    // Handle OK button click - confirm selections and update parent
    const handleOK = useCallback(() => {
        if (tempHours && tempMinutes) {
            setHours(tempHours);
            setMinutes(tempMinutes);
            setPeriod(tempPeriod);

            const timeString = format12Hour
                ? `${tempHours}:${tempMinutes} ${tempPeriod}`
                : `${tempHours}:${tempMinutes}`;
            onChange?.(timeString);
        }
        setIsOpen(false);
    }, [tempHours, tempMinutes, tempPeriod, format12Hour, onChange]);

    // Handle Cancel button click - revert temp selections  
    const handleCancel = useCallback(() => {
        setTempHours(hours || (format12Hour ? "01" : "00"));
        setTempMinutes(minutes || "00");
        setTempPeriod(period || "AM");
        setIsOpen(false);
    }, [hours, minutes, period, format12Hour]);

    const displayValue = useCallback(() => {
        if (!hours || !minutes) return placeholder;
        return format12Hour ? `${hours}:${minutes} ${period}` : `${hours}:${minutes}`;
    }, [hours, minutes, period, format12Hour, placeholder]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen(!isOpen);
        } else if (event.key === 'Escape' && isOpen) {
            handleCancel();
        }
    }, [isOpen, handleCancel]);

    // Handle click outside to close (cancel changes)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Don't close if clicking within our time picker container
            if (containerRef.current && containerRef.current.contains(event.target)) {
                return;
            }

            handleCancel();
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, handleCancel]);

    const timePickerId = id || `time-picker-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div
            ref={containerRef}
            className={cn("relative", className)}
            {...props}
        >
            {/* Main time display trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                aria-label={ariaLabel || `Time picker. Current time: ${displayValue()}`}
                aria-describedby={ariaDescribedBy}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                aria-required={required}
                id={timePickerId}
                name={name}
                className={cn(
                    "flex h-full w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-none focus:ring-1 focus:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-colors"
                )}
            >
                <div className="flex items-center justify-between w-full">
                    <span
                        className={cn(
                            "flex flex-col w-full text-left",
                            (!hours || !minutes) && "text-muted-foreground"
                        )}
                    >
                        {displayValue()}
                    </span>
                    <Clock
                        className="h-4 w-4 brandColor flex-shrink-0 ml-2"
                        aria-hidden="true"
                    />
                </div>
            </button>

            {/* Scrollable Time Wheel Picker - shown when open */}
            {isOpen && (
                <div
                    className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-white shadow-lg animate-in fade-in-0 zoom-in-95"
                    role="dialog"
                    aria-labelledby={timePickerId}
                    aria-modal="false"
                    data-time-picker-panel="true"
                >

                    {/* Time Select Container */}
                    <div className="flex bg-white">
                        {/* Hours Select */}
                        <TimeSelect
                            options={hourOptions}
                            selectedValue={tempHours}
                            onSelect={handleTempHoursChange}
                            label="Hours"
                            className="border-r border-gray-200"
                            disabledTimes={props.disabledTimes}
                            period={tempPeriod}
                            type="hours"
                        />

                        {/* Minutes Select */}
                        <TimeSelect
                            options={minuteOptions}
                            selectedValue={tempMinutes}
                            onSelect={handleTempMinutesChange}
                            label="Minutes"
                            className={format12Hour ? "border-r border-gray-200" : ""}
                            disabledTimes={props.disabledTimes}
                            period={tempPeriod}
                            type="minutes"
                        />

                        {/* AM/PM Select for 12-hour format */}
                        {format12Hour && (
                            <TimeSelect
                                options={periodOptions}
                                selectedValue={tempPeriod}
                                onSelect={handleTempPeriodChange}
                                label="Period"
                                className="w-8"
                                disabledTimes={props.disabledTimes}
                                period={tempPeriod}
                                type="period"
                            />
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50 rounded-b-lg">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            className="h-8 px-3 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleOK}
                            disabled={!tempHours || !tempMinutes}
                            className="h-8 px-3 text-xs primaryBg hover:primaryBg/90"
                        >
                            OK
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;