import React, { useEffect, useState } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api';
import { extractAddressComponents } from '@/utils/helperFunction';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/components/context/TranslationContext';
import { getMapDetailsApi } from '@/api/apiRoutes';

const Map = ({ onSelectLocation, latitude, longitude, showLabel = false, isDraggable = true }) => {
    const t = useTranslation()
    const webSettings = useSelector(state => state.WebSetting?.data)
    const [location, setLocation] = useState({
        lat: latitude ? parseFloat(latitude) : parseFloat(webSettings?.latitude),
        lng: longitude ? parseFloat(longitude) : parseFloat(webSettings?.longitude),
    });
    const [mapError, setMapError] = useState(null);
    const [selectedLocationAddress, setSelectedLocationAddress] = useState({
        city: "",
        state: "",
        country: "",
        formattedAddress: "",
        lat: latitude ? parseFloat(latitude) : parseFloat(webSettings?.latitude),
        lng: longitude ? parseFloat(longitude) : parseFloat(webSettings?.longitude),
    });

    useEffect(() => {
        // Update the location state when latitude or longitude changes
        // Use !== null and !== undefined to allow 0 coordinates
        if (latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined) {
            const newLat = parseFloat(latitude);
            const newLng = parseFloat(longitude);

            // Only update if the coordinates are valid numbers
            if (!isNaN(newLat) && !isNaN(newLng)) {
                setLocation({
                    lat: newLat,
                    lng: newLng,
                });
            }
        }
    }, [latitude, longitude]);

    const containerStyle = {
        width: "100%",
        height: "400px",
    };

    const handleMarkerDragEnd = async (e) => {
        const { lat, lng } = e.latLng;
        const newLat = lat();
        const newLng = lng();

        // Always update the location coordinates first
        const updatedLocation = {
            ...location,
            lat: newLat,
            lng: newLng,
        };
        setLocation(updatedLocation);

        // Try to get reverse geocoding data
        const reverseGeocodedData = await performReverseGeocoding(newLat, newLng);
        if (reverseGeocodedData) {
            const { city, country, state, formattedAddress } = reverseGeocodedData;
            const fullLocationData = {
                ...updatedLocation,
                city: city,
                country: country,
                state: state,
                formattedAddress,
            };

            // Update local state
            setSelectedLocationAddress({
                ...selectedLocationAddress,
                city: city,
                country: country,
                state: state,
                formattedAddress,
                lat: newLat,
                lng: newLng,
            });

            // Notify parent component
            onSelectLocation(fullLocationData);
        } else {
            // If reverse geocoding fails, still update coordinates
            console.warn("Reverse geocoding failed, updating coordinates only");
            const fallbackLocationData = {
                ...updatedLocation,
                city: "",
                country: "",
                state: "",
            };

            // Update local state
            setSelectedLocationAddress({
                ...selectedLocationAddress,
                lat: newLat,
                lng: newLng,
            });

            // Notify parent component
            onSelectLocation(fallbackLocationData);
        }
    };

    const performReverseGeocoding = async (lat, lng) => {
        try {
            // Use the API instead of Google Geocoder
            const response = await getMapDetailsApi({
                latitude: lat.toString(),
                longitude: lng.toString(),
                place_id: ""
            });
            if (response?.error === false && response?.data) {
                const placeDetails = response.data?.result;

                if (placeDetails) {
                    // Extract address components from the API response
                    const addressData = extractAddressComponents(placeDetails);

                    return {
                        city: addressData.city || "",
                        country: addressData.country || "",
                        state: addressData.state || "",
                        formattedAddress: addressData.formattedAddress || placeDetails.formatted_address || ""
                    };
                } else {
                    console.error("No place details in API response");
                    return null;
                }
            } else {
                console.error("API Error:", response?.message);
                return null;
            }
        } catch (error) {
            console.error("Error performing reverse geocoding via API:", error);
            return null;
        }
    };

    return (
        <div>
            {mapError ?
                <div>{mapError}</div>
                :
                <div className="relative">
                    {showLabel && (
                        <p className="secondaryTextColor font-medium">
                            {t("map")} <span className="text-red-500">*</span>
                        </p>
                    )}
                    <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={14}>
                        <Marker position={location} draggable={isDraggable} onDragEnd={handleMarkerDragEnd} />
                    </GoogleMap>
                </div>
            }
        </div>
    )
}

export default Map