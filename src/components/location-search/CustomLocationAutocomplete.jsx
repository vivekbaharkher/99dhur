"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { getMapPlacesListApi, getMapDetailsApi } from "@/api/apiRoutes";
import { useTranslation } from "@/components/context/TranslationContext";
import { IoLocationOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const CustomLocationAutocomplete = ({
    value = "",
    onChange,
    onPlaceSelect,
    placeholder,
    className = "",
    disabled = false,
    debounceMs = 1000,
    maxResults = 10,
    inputProps = {},
    isPropertyOrProjectOperation = false
}) => {
    const t = useTranslation();

    const webSettings = useSelector((state) => state.WebSetting?.data)

    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [inputValue, setInputValue] = useState(value);

    const inputRef = useRef(null);
    const suggestionRefs = useRef([]);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    // Update input value when prop changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Debounced search function
    const debouncedSearch = useCallback(
        async (searchInput) => {
            if (!searchInput.trim() || searchInput.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await getMapPlacesListApi({ input: searchInput.trim() });

                if (response?.error === false && response?.data?.predictions) {
                    let results = Array.isArray(response.data.predictions) ? response.data.predictions : [];

                    // // Limit results
                    // if (maxResults > 0) {
                    //     results = results.slice(0, maxResults);
                    // }

                    setSuggestions(results);
                    setShowSuggestions(results.length > 0);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch (error) {
                console.error("Error fetching place suggestions:", error);
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setIsLoading(false);
            }
        },
        [maxResults]
    );

    // Handle input change with debouncing
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setSelectedIndex(-1);

        // Call onChange prop
        if (onChange) {
            onChange(e);
        }

        // Clear previous timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set new timeout for debounced search
        debounceRef.current = setTimeout(() => {
            debouncedSearch(newValue);
        }, debounceMs);
    };

    // Handle place selection
    const handlePlaceSelect = async (suggestion) => {
        setIsLoading(true);
        try {
            // Get detailed place information
            const detailResponse = await getMapDetailsApi({
                place_id: suggestion.place_id,
                latitude: "",
                longitude: ""
            });

            if (detailResponse?.error === false && detailResponse?.data) {
                const placeDetails = detailResponse.data?.result;

                // Update input value
                setInputValue(!isPropertyOrProjectOperation ? suggestion.description || suggestion.formatted_address || "" : suggestion.structured_formatting?.main_text || suggestion.formatted_address || "");
                setShowSuggestions(false);
                setSelectedIndex(-1);

                // Create a place object similar to Google Maps format
                const placeData = {
                    place_id: suggestion.place_id,
                    formatted_address: suggestion.description || suggestion.formatted_address || "",
                    latitude: parseFloat(placeDetails?.geometry?.location?.lat),
                    longitude: parseFloat(placeDetails?.geometry?.location?.lng),
                    // Try to extract address components if available, otherwise create from suggestion
                    address_components: placeDetails.address_components || [],
                    // Additional data from suggestion
                    types: suggestion.types || [],
                    place_id: suggestion.place_id
                };

                // Call onPlaceSelect callback
                if (onPlaceSelect) {
                    onPlaceSelect(placeData, placeDetails);
                }
            } else {
                // Fallback: use suggestion data without detailed info
                setInputValue(suggestion.description || "");
                setShowSuggestions(false);
                setSelectedIndex(-1);

                if (onPlaceSelect) {
                    const fallbackPlaceData = {
                        place_id: suggestion.place_id,
                        formatted_address: suggestion.description || "",
                        geometry: {
                            location: {
                                lat: () => webSettings?.latitude,
                                lng: () => webSettings?.longitude
                            }
                        },
                        types: suggestion.types || [],
                        place_id: suggestion.place_id
                    };
                    onPlaceSelect(fallbackPlaceData, {});
                }

                toast.error(t("errorFetchingPlaceDetails"));
            }
        } catch (error) {
            console.error("Error fetching place details:", error);

            // Fallback: still set the input value and call callback
            setInputValue(suggestion.description || "");
            setShowSuggestions(false);
            setSelectedIndex(-1);

            if (onPlaceSelect) {
                const fallbackPlaceData = {
                    place_id: suggestion.place_id,
                    formatted_address: suggestion.description || "",
                    geometry: {
                        location: {
                            lat: () => 0,
                            lng: () => 0
                        }
                    },
                    types: suggestion.types || [],
                    place_id: suggestion.place_id
                };
                onPlaceSelect(fallbackPlaceData, {});
            }

            toast.error(t("errorFetchingPlaceDetails") || "Could not fetch place details");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handlePlaceSelect(suggestions[selectedIndex]);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle input focus
    const handleInputFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    placeholder={placeholder || t("enterLocation")}
                    className={`w-full  ${className}`}
                    disabled={disabled || isLoading}
                    autoComplete="off"
                    {...inputProps}
                />

                {/* Loading indicator */}
                {isLoading && (
                    <div className="absolute right-10 flex items-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                    </div>
                )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <ul className="py-1">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.place_id || index}
                                ref={el => suggestionRefs.current[index] = el}
                                className={`px-4 py-3 cursor-pointer flex items-start space-x-3 hover:bg-gray-50 transition-colors ${selectedIndex === index ? "bg-gray-100" : ""
                                    }`}
                                onClick={() => handlePlaceSelect(suggestion)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <IoLocationOutline className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {suggestion.structured_formatting?.main_text || suggestion.description}
                                    </div>
                                    {suggestion.structured_formatting?.secondary_text && (
                                        <div className="text-xs text-gray-500 truncate">
                                            {suggestion.structured_formatting.secondary_text}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomLocationAutocomplete;
