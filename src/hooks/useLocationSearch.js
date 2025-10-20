import { useState, useRef, useCallback } from "react";
import { getMapPlacesListApi, getMapDetailsApi } from "@/api/apiRoutes";

export const useLocationSearch = ({
    debounceMs = 300,
    maxResults = 5,
    minLength = 2
} = {}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const debounceRef = useRef(null);

    // Search for places with debouncing
    const searchPlaces = useCallback(
        async (input) => {
            // Clear any existing timeout
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            // Return early if input is too short
            if (!input || input.trim().length < minLength) {
                setSuggestions([]);
                setError(null);
                return;
            }

            // Set up debounced search
            debounceRef.current = setTimeout(async () => {
                setIsLoading(true);
                setError(null);

                try {
                    const response = await getMapPlacesListApi({
                        input: input.trim()
                    });

                    if (response?.error === false && response?.data?.predictions) {
                        let results = Array.isArray(response.data.predictions) ? response.data.predictions : [];

                        // Limit results if specified
                        if (maxResults > 0) {
                            results = results.slice(0, maxResults);
                        }

                        setSuggestions(results);
                    } else {
                        setSuggestions([]);
                        setError(response?.message || "Failed to fetch places");
                    }
                } catch (err) {
                    console.error("Error searching places:", err);
                    setSuggestions([]);
                    setError(err.message || "Failed to search places");
                } finally {
                    setIsLoading(false);
                }
            }, debounceMs);
        },
        [debounceMs, maxResults, minLength]
    );

    // Get place details
    const getPlaceDetails = useCallback(async (placeId, latitude = "", longitude = "") => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getMapDetailsApi({
                place_id: placeId,
                latitude,
                longitude
            });

            if (response?.error === false && response?.data) {
                return response.data;
            } else {
                throw new Error(response?.message || "Failed to fetch place details");
            }
        } catch (err) {
            console.error("Error fetching place details:", err);
            setError(err.message || "Failed to fetch place details");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get place details by coordinates
    const getPlaceByCoordinates = useCallback(async (latitude, longitude) => {
        return getPlaceDetails("", latitude.toString(), longitude.toString());
    }, [getPlaceDetails]);

    // Clear suggestions
    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
        setError(null);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
    }, []);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
    }, []);

    return {
        suggestions,
        isLoading,
        error,
        searchPlaces,
        getPlaceDetails,
        getPlaceByCoordinates,
        clearSuggestions,
        cleanup
    };
};

export default useLocationSearch;
