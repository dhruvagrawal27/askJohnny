// components/onboarding/steps/BusinessSearch.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { BusinessData } from "../../types/onboarding";

interface BusinessInfo {
  name: string;
  address: string;
  rating?: number;
  phone?: string;
  website?: string;
  placeId: string;
  types?: string[];
  reviews?: any[];
  businessDescription?: string;
  openingHours?: {
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
    weekday_text?: string[];
  };
  isOpen?: boolean;
  priceLevel?: number;
  photos?: any[];
  vicinity?: string;
  userRatingsTotal?: number;
  utcOffsetMinutes?: number;
  location?: { lat: number; lng: number };
}

interface UserLocation {
  lat: number;
  lng: number;
  country?: string;
  city?: string;
}

interface BusinessSearchProps {
  onDone: (business: BusinessData) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

const BusinessSearch: React.FC<BusinessSearchProps> = ({ onDone }) => {
  const location = useLocation();
  const { businessName: defaultBusinessName } =
    (location.state as { businessName?: string }) || {};

  // State for business search
  const [searchValue, setSearchValue] = useState(defaultBusinessName || "");
  const [suggestions, setSuggestions] = useState<BusinessInfo[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // State for location
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "requesting" | "granted" | "denied"
  >("requesting");
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Refs for Google Maps services
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const geocoder = useRef<any>(null);

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      // Get API key with proper TypeScript handling
      const apiKey =
        ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || "";

      if (!apiKey) {
        console.warn(
          "Google Maps API key not found. Location features disabled."
        );
        setLocationStatus("denied");
        return;
      }

      // Function to initialize services once Google Maps is ready
      const initializeServices = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log("Initializing Google Maps services...");
          autocompleteService.current =
            new window.google.maps.places.AutocompleteService();
          geocoder.current = new window.google.maps.Geocoder();
          const dummyDiv = document.createElement("div");
          placesService.current = new window.google.maps.places.PlacesService(
            dummyDiv
          );
          requestUserLocation();
        } else {
          console.error("Google Maps API not fully loaded");
          setLocationStatus("denied");
        }
      };

      if (window.google && window.google.maps && window.google.maps.places) {
        // Services already loaded
        console.log("Google Maps already loaded");
        initializeServices();
      } else {
        // Check if script is already being loaded
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
        if (existingScript) {
          console.log("Google Maps script already exists, waiting for it to load...");
          
          // Define global callback
          (window as any).initGoogleMaps = () => {
            console.log("Google Maps callback triggered");
            initializeServices();
          };
          
          // Check periodically if it's loaded
          const checkInterval = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
              clearInterval(checkInterval);
              initializeServices();
            }
          }, 100);
          
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!autocompleteService.current) {
              console.error("Google Maps failed to load within timeout");
              setLocationStatus("denied");
            }
          }, 10000);
          return;
        }
        
        // Define global callback before loading script
        (window as any).initGoogleMaps = () => {
          console.log("Google Maps loaded via callback");
          initializeServices();
        };
        
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
          console.error("Failed to load Google Maps API");
          setLocationStatus("denied");
        };

        document.head.appendChild(script);
      }
    };

    initializeGoogleMaps();
  }, []);

  // Auto-fill input if business name was passed from landing page
  useEffect(() => {
    if (defaultBusinessName) {
      handleSearch(defaultBusinessName);
    }
  }, [defaultBusinessName]);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      setLocationStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const locationDetails = await reverseGeocode(lat, lng);
          setUserLocation({
            lat,
            lng,
            country: locationDetails.country,
            city: locationDetails.city,
          });
          setLocationStatus("granted");
        } catch (error) {
          console.error("Error getting location details:", error);
          setUserLocation({ lat, lng });
          setLocationStatus("granted");
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
        setLocationStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const reverseGeocode = async (
    lat: number,
    lng: number
  ): Promise<{ country?: string; city?: string }> => {
    return new Promise((resolve) => {
      if (!geocoder.current) {
        resolve({});
        return;
      }

      geocoder.current.geocode(
        { location: { lat, lng } },
        (results: any, status: string) => {
          if (status === "OK" && results && results[0]) {
            const addressComponents = results[0].address_components;
            let country = "";
            let city = "";

            addressComponents.forEach((component: any) => {
              if (component.types.includes("country")) {
                country = component.short_name;
              }
              if (
                component.types.includes("locality") ||
                component.types.includes("administrative_area_level_1")
              ) {
                city = component.long_name;
              }
            });

            resolve({ country, city });
          } else {
            resolve({});
          }
        }
      );
    });
  };

  const handleSearch = async (query: string) => {
    if (!autocompleteService.current || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const request: any = {
        input: query,
        types: ["establishment"],
      };

      if (userLocation) {
        request.location = new window.google.maps.LatLng(
          userLocation.lat,
          userLocation.lng
        );
        request.radius = 50000;

        if (userLocation.country) {
          request.componentRestrictions = {
            country: userLocation.country.toLowerCase(),
          };
        }
      }

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions: any, status: string) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            const businessPromises = predictions
              .slice(0, 5)
              .map((prediction: any) => {
                return new Promise<BusinessInfo>((resolve) => {
                  if (!placesService.current) {
                    resolve({
                      name: prediction.description,
                      address:
                        prediction.structured_formatting.secondary_text || "",
                      placeId: prediction.place_id,
                    });
                    return;
                  }

                  placesService.current.getDetails(
                    {
                      placeId: prediction.place_id,
                      fields: [
                        "name",
                        "formatted_address",
                        "rating",
                        "formatted_phone_number",
                        "website",
                        "types",
                        "reviews",
                        "editorial_summary",
                        "opening_hours",
                        "price_level",
                        "photos",
                        "vicinity",
                        "user_ratings_total",
                        "utc_offset_minutes",
                        "geometry",
                      ],
                    },
                    (place: any, detailStatus: string) => {
                      if (
                        detailStatus ===
                          window.google.maps.places.PlacesServiceStatus.OK &&
                        place
                      ) {
                        let isCurrentlyOpen: boolean | undefined;
                        try {
                          if (
                            place.opening_hours &&
                            typeof place.opening_hours.isOpen === "function"
                          ) {
                            isCurrentlyOpen = place.opening_hours.isOpen();
                          }
                        } catch (error) {
                          console.log(
                            "Could not determine if business is open"
                          );
                          isCurrentlyOpen = undefined;
                        }

                        resolve({
                          name: place.name || prediction.description,
                          address: place.formatted_address || "",
                          rating: place.rating,
                          phone: place.formatted_phone_number,
                          website: place.website,
                          placeId: prediction.place_id,
                          types: place.types,
                          reviews: place.reviews
                            ? place.reviews.slice(0, 5)
                            : [],
                          businessDescription:
                            place.editorial_summary?.overview || "",
                          openingHours: place.opening_hours
                            ? {
                                periods: place.opening_hours.periods,
                                weekday_text: place.opening_hours.weekday_text,
                              }
                            : undefined,
                          isOpen: isCurrentlyOpen,
                          priceLevel: place.price_level,
                          photos: place.photos ? place.photos.slice(0, 3) : [],
                          vicinity: place.vicinity,
                          userRatingsTotal: place.user_ratings_total,
                          utcOffsetMinutes: place.utc_offset_minutes,
                          location: place.geometry?.location
                            ? {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng(),
                              }
                            : undefined,
                        });
                      } else {
                        resolve({
                          name: prediction.description,
                          address:
                            prediction.structured_formatting.secondary_text ||
                            "",
                          placeId: prediction.place_id,
                        });
                      }
                    }
                  );
                });
              });

            Promise.all(businessPromises).then((businesses) => {
              setSuggestions(businesses);
              setIsLoading(false);
            });
          } else {
            setSuggestions([]);
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (locationStatus === "denied" && !showLocationPrompt) {
      setShowLocationPrompt(true);
    }

    handleSearch(value);
  };

  const handleInputFocus = () => {
    if (locationStatus === "denied" && !showLocationPrompt) {
      setShowLocationPrompt(true);
    }
  };

  const selectBusiness = (business: BusinessInfo) => {
    setSelectedBusiness(business);
    setSearchValue(business.name);
    setSuggestions([]);
  };

  const handleContinue = () => {
    if (selectedBusiness) {
      // Save all available data from selectedBusiness
      const businessData = {
        place_id: selectedBusiness.placeId,
        name: selectedBusiness.name,
        formatted_address: selectedBusiness.address,
        geometry: selectedBusiness.location
          ? { location: selectedBusiness.location }
          : { location: { lat: 0, lng: 0 } },
        types: selectedBusiness.types || [],
        rating: selectedBusiness.rating,
        phone: selectedBusiness.phone,
        website: selectedBusiness.website,
        reviews: selectedBusiness.reviews,
        businessDescription: selectedBusiness.businessDescription,
        openingHours: selectedBusiness.openingHours,
        isOpen: selectedBusiness.isOpen,
        priceLevel: selectedBusiness.priceLevel,
        photos: selectedBusiness.photos,
        vicinity: selectedBusiness.vicinity,
        userRatingsTotal: selectedBusiness.userRatingsTotal,
        utcOffsetMinutes: selectedBusiness.utcOffsetMinutes,
        location: selectedBusiness.location,
      };

      // Save to localStorage for backup
      localStorage.setItem("onboarding_business", JSON.stringify(businessData));

      // Call parent callback to move to next step
      onDone(businessData);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
        Find Your Business
      </h2>

      <p className="text-slate-600 mb-6 text-center">
        Search for your business using Google Places to get accurate
        information.
      </p>

      {/* Location Status Cards */}
      {locationStatus === "requesting" && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            </div>
            <div>
              <p className="text-blue-700 font-medium">
                Requesting your location...
              </p>
              <p className="text-blue-600 text-sm">
                This helps us find businesses near you
              </p>
            </div>
          </div>
        </div>
      )}

      {locationStatus === "denied" && showLocationPrompt && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-amber-700 font-medium">
                  Enable location for better results
                </p>
                <p className="text-amber-600 text-sm">
                  We'll show businesses near you first
                </p>
              </div>
            </div>
            <button
              onClick={requestUserLocation}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Allow Location
            </button>
          </div>
        </div>
      )}

      {locationStatus === "granted" && userLocation && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-emerald-700 font-medium">Location detected</p>
              <p className="text-emerald-600 text-sm">
                Searching near {userLocation.city || "your location"}
                {userLocation.country && `, ${userLocation.country}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Business Name or Address
        </label>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={
              locationStatus === "granted"
                ? `Search for businesses near ${userLocation?.city || "you"}...`
                : "Start typing your business name..."
            }
            className="w-full pl-12 pr-12 py-4 border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:shadow-md"
            disabled={locationStatus === "requesting"}
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Select your business from the dropdown suggestions
        </p>
      </div>

      {/* Search Results */}
      {suggestions.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Search Results
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.map((business) => (
              <button
                key={business.placeId}
                onClick={() => selectBusiness(business)}
                className="w-full text-left p-4 bg-white border border-purple-100/60 rounded-xl hover:border-purple-300/70 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-white transition-all duration-200 shadow-sm hover:shadow-lg group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors duration-200 mb-1">
                      {business.name}
                    </div>
                    <div className="text-sm text-slate-600 flex items-center mb-2">
                      <svg
                        className="h-3.5 w-3.5 mr-1.5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {business.address}
                    </div>

                    <div className="flex items-center space-x-4">
                      {business.rating && (
                        <div className="flex items-center space-x-1">
                          <svg
                            className="h-4 w-4 text-amber-400 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-sm font-medium text-slate-700">
                            {business.rating.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {business.isOpen !== undefined && (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            business.isOpen
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200/60"
                              : "bg-red-100 text-red-700 border border-red-200/60"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              business.isOpen ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          ></div>
                          {business.isOpen ? "Open now" : "Closed"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg
                      className="w-5 h-5 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Business */}
      {selectedBusiness && (
        <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-green-800 mb-1">
                ✓ Selected Business:
              </div>
              <div className="text-green-700 font-medium">
                {selectedBusiness.name}
              </div>
              <div className="text-sm text-green-600">
                {selectedBusiness.address}
              </div>
              {selectedBusiness.phone && (
                <div className="text-sm text-green-600">
                  {selectedBusiness.phone}
                </div>
              )}
              <div className="text-xs text-green-500 mt-1">
                Place ID: {selectedBusiness.placeId}
              </div>
            </div>
            <button
              className="ml-4 text-sm text-purple-600 underline hover:text-purple-700"
              onClick={() => setSelectedBusiness(null)}
            >
              Change
            </button>
          </div>
        </div>
      )}

      <button
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        disabled={!selectedBusiness}
        onClick={handleContinue}
      >
        {selectedBusiness
          ? "Continue with This Business"
          : "Please Select Your Business"}
      </button>

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Why do we need this?
            </p>
            <p className="text-sm text-blue-700 mt-1">
              We use your business information to provide accurate details to
              callers and integrate with your existing online presence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSearch;

// // components/onboarding/steps/BusinessSearch.tsx
// import React, { useEffect, useRef, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { BusinessData } from "../../types/onboarding";

// interface BusinessInfo {
//   name: string;
//   address: string;
//   rating?: number;
//   phone?: string;
//   website?: string;
//   placeId: string;
//   types?: string[];
//   reviews?: any[];
//   businessDescription?: string;
//   openingHours?: {
//     periods?: Array<{
//       open: { day: number; time: string };
//       close?: { day: number; time: string };
//     }>;
//     weekday_text?: string[];
//   };
//   isOpen?: boolean;
//   priceLevel?: number;
//   photos?: any[];
//   vicinity?: string;
//   userRatingsTotal?: number;
//   utcOffsetMinutes?: number;
//   location?: { lat: number; lng: number };
// }

// interface UserLocation {
//   lat: number;
//   lng: number;
//   country?: string;
//   city?: string;
// }

// interface BusinessSearchProps {
//   onDone: (business: BusinessData) => void;
// }

// declare global {
//   interface Window {
//     google: any;
//   }
// }

// const BusinessSearch: React.FC<BusinessSearchProps> = ({ onDone }) => {
//   const location = useLocation();
//   const { businessName: defaultBusinessName } =
//     (location.state as { businessName?: string }) || {};

//   // State for business search
//   const [searchValue, setSearchValue] = useState(defaultBusinessName || "");
//   const [suggestions, setSuggestions] = useState<BusinessInfo[]>([]);
//   const [selectedBusiness, setSelectedBusiness] = useState<BusinessInfo | null>(
//     null
//   );
//   const [isLoading, setIsLoading] = useState(false);

//   // State for location
//   const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
//   const [locationStatus, setLocationStatus] = useState<
//     "requesting" | "granted" | "denied"
//   >("requesting");
//   const [showLocationPrompt, setShowLocationPrompt] = useState(false);

//   // Refs for Google Maps services
//   const autocompleteService = useRef<any>(null);
//   const placesService = useRef<any>(null);
//   const geocoder = useRef<any>(null);

//   useEffect(() => {
//     const initializeGoogleMaps = async () => {
//       // Get API key with proper TypeScript handling
//       const apiKey =
//         ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || "";

//       if (!apiKey) {
//         console.warn(
//           "Google Maps API key not found. Location features disabled."
//         );
//         setLocationStatus("denied");
//         return;
//       }

//       if (!window.google) {
//         const script = document.createElement("script");
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
//         script.async = true;
//         script.defer = true;

//         script.onload = () => {
//           console.log("Google Maps loaded successfully");

//           // Initialize Google Maps services
//           autocompleteService.current =
//             new window.google.maps.places.AutocompleteService();
//           geocoder.current = new window.google.maps.Geocoder();
//           const dummyDiv = document.createElement("div");
//           placesService.current = new window.google.maps.places.PlacesService(
//             dummyDiv
//           );

//           requestUserLocation();
//         };

//         script.onerror = () => {
//           console.error("Failed to load Google Maps API");
//           setLocationStatus("denied");
//         };

//         document.head.appendChild(script);
//       } else {
//         // Services already loaded
//         autocompleteService.current =
//           new window.google.maps.places.AutocompleteService();
//         geocoder.current = new window.google.maps.Geocoder();
//         const dummyDiv = document.createElement("div");
//         placesService.current = new window.google.maps.places.PlacesService(
//           dummyDiv
//         );
//         requestUserLocation();
//       }
//     };

//     initializeGoogleMaps();
//   }, []);

//   // Auto-fill input if business name was passed from landing page
//   useEffect(() => {
//     if (defaultBusinessName) {
//       handleSearch(defaultBusinessName);
//     }
//   }, [defaultBusinessName]);

//   const requestUserLocation = () => {
//     if (!navigator.geolocation) {
//       console.error("Geolocation is not supported by this browser.");
//       setLocationStatus("denied");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const lat = position.coords.latitude;
//         const lng = position.coords.longitude;

//         try {
//           const locationDetails = await reverseGeocode(lat, lng);
//           setUserLocation({
//             lat,
//             lng,
//             country: locationDetails.country,
//             city: locationDetails.city,
//           });
//           setLocationStatus("granted");
//         } catch (error) {
//           console.error("Error getting location details:", error);
//           setUserLocation({ lat, lng });
//           setLocationStatus("granted");
//         }
//       },
//       (error) => {
//         console.error("Error getting user location:", error);
//         setLocationStatus("denied");
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 300000,
//       }
//     );
//   };

//   const reverseGeocode = async (
//     lat: number,
//     lng: number
//   ): Promise<{ country?: string; city?: string }> => {
//     return new Promise((resolve) => {
//       if (!geocoder.current) {
//         resolve({});
//         return;
//       }

//       geocoder.current.geocode(
//         { location: { lat, lng } },
//         (results: any, status: string) => {
//           if (status === "OK" && results && results[0]) {
//             const addressComponents = results[0].address_components;
//             let country = "";
//             let city = "";

//             addressComponents.forEach((component: any) => {
//               if (component.types.includes("country")) {
//                 country = component.short_name;
//               }
//               if (
//                 component.types.includes("locality") ||
//                 component.types.includes("administrative_area_level_1")
//               ) {
//                 city = component.long_name;
//               }
//             });

//             resolve({ country, city });
//           } else {
//             resolve({});
//           }
//         }
//       );
//     });
//   };

//   const handleSearch = async (query: string) => {
//     if (!autocompleteService.current || query.length < 3) {
//       setSuggestions([]);
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const request: any = {
//         input: query,
//         types: ["establishment"],
//       };

//       if (userLocation) {
//         request.location = new window.google.maps.LatLng(
//           userLocation.lat,
//           userLocation.lng
//         );
//         request.radius = 50000;

//         if (userLocation.country) {
//           request.componentRestrictions = {
//             country: userLocation.country.toLowerCase(),
//           };
//         }
//       }

//       autocompleteService.current.getPlacePredictions(
//         request,
//         (predictions: any, status: string) => {
//           if (
//             status === window.google.maps.places.PlacesServiceStatus.OK &&
//             predictions
//           ) {
//             const businessPromises = predictions
//               .slice(0, 5)
//               .map((prediction: any) => {
//                 return new Promise<BusinessInfo>((resolve) => {
//                   if (!placesService.current) {
//                     resolve({
//                       name: prediction.description,
//                       address:
//                         prediction.structured_formatting.secondary_text || "",
//                       placeId: prediction.place_id,
//                     });
//                     return;
//                   }

//                   placesService.current.getDetails(
//                     {
//                       placeId: prediction.place_id,
//                       fields: [
//                         "name",
//                         "formatted_address",
//                         "rating",
//                         "formatted_phone_number",
//                         "website",
//                         "types",
//                         "reviews",
//                         "editorial_summary",
//                         "opening_hours",
//                         "price_level",
//                         "photos",
//                         "vicinity",
//                         "user_ratings_total",
//                         "utc_offset_minutes",
//                         "geometry",
//                       ],
//                     },
//                     (place: any, detailStatus: string) => {
//                       if (
//                         detailStatus ===
//                           window.google.maps.places.PlacesServiceStatus.OK &&
//                         place
//                       ) {
//                         let isCurrentlyOpen: boolean | undefined;
//                         try {
//                           if (
//                             place.opening_hours &&
//                             typeof place.opening_hours.isOpen === "function"
//                           ) {
//                             isCurrentlyOpen = place.opening_hours.isOpen();
//                           }
//                         } catch (error) {
//                           console.log(
//                             "Could not determine if business is open"
//                           );
//                           isCurrentlyOpen = undefined;
//                         }

//                         resolve({
//                           name: place.name || prediction.description,
//                           address: place.formatted_address || "",
//                           rating: place.rating,
//                           phone: place.formatted_phone_number,
//                           website: place.website,
//                           placeId: prediction.place_id,
//                           types: place.types,
//                           reviews: place.reviews
//                             ? place.reviews.slice(0, 5)
//                             : [],
//                           businessDescription:
//                             place.editorial_summary?.overview || "",
//                           openingHours: place.opening_hours
//                             ? {
//                                 periods: place.opening_hours.periods,
//                                 weekday_text: place.opening_hours.weekday_text,
//                               }
//                             : undefined,
//                           isOpen: isCurrentlyOpen,
//                           priceLevel: place.price_level,
//                           photos: place.photos ? place.photos.slice(0, 3) : [],
//                           vicinity: place.vicinity,
//                           userRatingsTotal: place.user_ratings_total,
//                           utcOffsetMinutes: place.utc_offset_minutes,
//                           location: place.geometry?.location
//                             ? {
//                                 lat: place.geometry.location.lat(),
//                                 lng: place.geometry.location.lng(),
//                               }
//                             : undefined,
//                         });
//                       } else {
//                         resolve({
//                           name: prediction.description,
//                           address:
//                             prediction.structured_formatting.secondary_text ||
//                             "",
//                           placeId: prediction.place_id,
//                         });
//                       }
//                     }
//                   );
//                 });
//               });

//             Promise.all(businessPromises).then((businesses) => {
//               setSuggestions(businesses);
//               setIsLoading(false);
//             });
//           } else {
//             setSuggestions([]);
//             setIsLoading(false);
//           }
//         }
//       );
//     } catch (error) {
//       console.error("Error fetching suggestions:", error);
//       setIsLoading(false);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setSearchValue(value);

//     if (locationStatus === "denied" && !showLocationPrompt) {
//       setShowLocationPrompt(true);
//     }

//     handleSearch(value);
//   };

//   const handleInputFocus = () => {
//     if (locationStatus === "denied" && !showLocationPrompt) {
//       setShowLocationPrompt(true);
//     }
//   };

//   const selectBusiness = (business: BusinessInfo) => {
//     setSelectedBusiness(business);
//     setSearchValue(business.name);
//     setSuggestions([]);
//   };

//   const handleContinue = () => {
//     if (selectedBusiness) {
//       // Save all available data from selectedBusiness
//       const businessData = {
//         place_id: selectedBusiness.placeId,
//         name: selectedBusiness.name,
//         formatted_address: selectedBusiness.address,
//         geometry: selectedBusiness.location
//           ? { location: selectedBusiness.location }
//           : { location: { lat: 0, lng: 0 } },
//         types: selectedBusiness.types || [],
//         rating: selectedBusiness.rating,
//         phone: selectedBusiness.phone,
//         website: selectedBusiness.website,
//         reviews: selectedBusiness.reviews,
//         businessDescription: selectedBusiness.businessDescription,
//         openingHours: selectedBusiness.openingHours,
//         isOpen: selectedBusiness.isOpen,
//         priceLevel: selectedBusiness.priceLevel,
//         photos: selectedBusiness.photos,
//         vicinity: selectedBusiness.vicinity,
//         userRatingsTotal: selectedBusiness.userRatingsTotal,
//         utcOffsetMinutes: selectedBusiness.utcOffsetMinutes,
//         location: selectedBusiness.location,
//       };

//       // Save to localStorage for backup
//       localStorage.setItem("onboarding_business", JSON.stringify(businessData));

//       // Call parent callback to move to next step
//       onDone(businessData);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
//         Find Your Business
//       </h2>

//       <p className="text-slate-600 mb-6 text-center">
//         Search for your business using Google Places to get accurate
//         information.
//       </p>

//       {/* Location Status Cards */}
//       {locationStatus === "requesting" && (
//         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl p-4 shadow-sm mb-6">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 flex items-center justify-center">
//               <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
//             </div>
//             <div>
//               <p className="text-blue-700 font-medium">
//                 Requesting your location...
//               </p>
//               <p className="text-blue-600 text-sm">
//                 This helps us find businesses near you
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {locationStatus === "denied" && showLocationPrompt && (
//         <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-4 shadow-sm mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
//                 <svg
//                   className="w-4 h-4 text-amber-600"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                   />
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-amber-700 font-medium">
//                   Enable location for better results
//                 </p>
//                 <p className="text-amber-600 text-sm">
//                   We'll show businesses near you first
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={requestUserLocation}
//               className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
//             >
//               Allow Location
//             </button>
//           </div>
//         </div>
//       )}

//       {locationStatus === "granted" && userLocation && (
//         <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-4 shadow-sm mb-6">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
//               <svg
//                 className="w-4 h-4 text-emerald-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//             </div>
//             <div>
//               <p className="text-emerald-700 font-medium">Location detected</p>
//               <p className="text-emerald-600 text-sm">
//                 Searching near {userLocation.city || "your location"}
//                 {userLocation.country && `, ${userLocation.country}`}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Search Input */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-slate-700 mb-2">
//           Business Name or Address
//         </label>
//         <div className="relative">
//           <svg
//             className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//             />
//           </svg>
//           <input
//             type="text"
//             value={searchValue}
//             onChange={handleInputChange}
//             onFocus={handleInputFocus}
//             placeholder={
//               locationStatus === "granted"
//                 ? `Search for businesses near ${userLocation?.city || "you"}...`
//                 : "Start typing your business name..."
//             }
//             className="w-full pl-12 pr-12 py-4 border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:shadow-md"
//             disabled={locationStatus === "requesting"}
//           />
//           {isLoading && (
//             <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
//               <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
//             </div>
//           )}
//         </div>
//         <p className="text-sm text-slate-500 mt-2">
//           Select your business from the dropdown suggestions
//         </p>
//       </div>

//       {/* Search Results */}
//       {suggestions.length > 0 && (
//         <div className="mb-6 space-y-3">
//           <h3 className="text-sm font-semibold text-slate-700 flex items-center">
//             <svg
//               className="w-4 h-4 mr-2 text-purple-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//               />
//             </svg>
//             Search Results
//           </h3>
//           <div className="space-y-3 max-h-96 overflow-y-auto">
//             {suggestions.map((business) => (
//               <button
//                 key={business.placeId}
//                 onClick={() => selectBusiness(business)}
//                 className="w-full text-left p-4 bg-white border border-purple-100/60 rounded-xl hover:border-purple-300/70 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-white transition-all duration-200 shadow-sm hover:shadow-lg group"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors duration-200 mb-1">
//                       {business.name}
//                     </div>
//                     <div className="text-sm text-slate-600 flex items-center mb-2">
//                       <svg
//                         className="h-3.5 w-3.5 mr-1.5 text-slate-400"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                         />
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                         />
//                       </svg>
//                       {business.address}
//                     </div>

//                     <div className="flex items-center space-x-4">
//                       {business.rating && (
//                         <div className="flex items-center space-x-1">
//                           <svg
//                             className="h-4 w-4 text-amber-400 fill-current"
//                             viewBox="0 0 24 24"
//                           >
//                             <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//                           </svg>
//                           <span className="text-sm font-medium text-slate-700">
//                             {business.rating.toFixed(1)}
//                           </span>
//                         </div>
//                       )}

//                       {business.isOpen !== undefined && (
//                         <span
//                           className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
//                             business.isOpen
//                               ? "bg-emerald-100 text-emerald-700 border border-emerald-200/60"
//                               : "bg-red-100 text-red-700 border border-red-200/60"
//                           }`}
//                         >
//                           <div
//                             className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
//                               business.isOpen ? "bg-emerald-500" : "bg-red-500"
//                             }`}
//                           ></div>
//                           {business.isOpen ? "Open now" : "Closed"}
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//                     <svg
//                       className="w-5 h-5 text-purple-500"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M9 5l7 7-7 7"
//                       />
//                     </svg>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Selected Business */}
//       {selectedBusiness && (
//         <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <div className="font-semibold text-green-800 mb-1">
//                 ✓ Selected Business:
//               </div>
//               <div className="text-green-700 font-medium">
//                 {selectedBusiness.name}
//               </div>
//               <div className="text-sm text-green-600">
//                 {selectedBusiness.address}
//               </div>
//               {selectedBusiness.phone && (
//                 <div className="text-sm text-green-600">
//                   {selectedBusiness.phone}
//                 </div>
//               )}
//               <div className="text-xs text-green-500 mt-1">
//                 Place ID: {selectedBusiness.placeId}
//               </div>
//             </div>
//             <button
//               className="ml-4 text-sm text-purple-600 underline hover:text-purple-700"
//               onClick={() => setSelectedBusiness(null)}
//             >
//               Change
//             </button>
//           </div>
//         </div>
//       )}

//       <button
//         className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//         disabled={!selectedBusiness}
//         onClick={handleContinue}
//       >
//         {selectedBusiness
//           ? "Continue with This Business"
//           : "Please Select Your Business"}
//       </button>

//       {/* Info box */}
//       <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//         <div className="flex items-start">
//           <svg
//             className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//             />
//           </svg>
//           <div>
//             <p className="text-sm text-blue-800 font-medium">
//               Why do we need this?
//             </p>
//             <p className="text-sm text-blue-700 mt-1">
//               We use your business information to provide accurate details to
//               callers and integrate with your existing online presence.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BusinessSearch;
