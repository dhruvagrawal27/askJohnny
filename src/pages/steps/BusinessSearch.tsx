// components/onboarding/steps/BusinessSearch.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { BusinessData } from "../../types/onboarding";
import { Search, Loader2, Store, MapPin, Star, Phone, Clock, Map, Layout, ArrowLeft, Check } from 'lucide-react';

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
  onBack?: () => void;
}

const BusinessSearch: React.FC<BusinessSearchProps> = ({ onDone, onBack }) => {
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
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const hasAutoSearchedRef = useRef(false);

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
          setIsGoogleMapsReady(true);
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

  // Auto-fill input and trigger search if business name was passed from landing page
  useEffect(() => {
    if (defaultBusinessName && isGoogleMapsReady && !hasAutoSearchedRef.current) {
      console.log('🔍 Auto-triggering search for:', defaultBusinessName);
      hasAutoSearchedRef.current = true;

      // Add a small delay to ensure Google Maps services are fully initialized
      const timer = setTimeout(() => {
        if (defaultBusinessName.length >= 2) {
          console.log('🚀 Executing auto-search now...');
          handleSearch(defaultBusinessName);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [defaultBusinessName, isGoogleMapsReady]);

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
    if (!autocompleteService.current || query.length < 2) {
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
    // Keep suggestions visible after selection
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
    <div className="w-full h-screen flex flex-col px-6 md:px-8 lg:px-10 py-4 overflow-hidden">
      {/* Step Header with inline Location Status */}
      <div className="mb-3 w-full flex justify-between items-start gap-4 shrink-0">
        <div className="text-left flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[9px] font-bold uppercase tracking-wide mb-2">
            Step 01
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Find Your Business</h2>
          <p className="text-xs text-gray-500 leading-relaxed">Search for your business to automatically import details.</p>
        </div>

        {/* Right side: Location Status & Back Button */}
        <div className="flex-shrink-0 flex items-start gap-2">
          {locationStatus === "requesting" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <div>
                  <p className="text-blue-700 font-medium text-xs">Requesting location...</p>
                </div>
              </div>
            </div>
          )}

          {locationStatus === "denied" && showLocationPrompt && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
                  <MapPin size={12} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-amber-700 font-medium text-xs">Enable location</p>
                </div>
                <button
                  onClick={requestUserLocation}
                  className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded text-[10px] font-medium transition-all"
                >
                  Allow
                </button>
              </div>
            </div>
          )}

          {locationStatus === "granted" && userLocation && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-emerald-700 font-medium text-xs">
                    {userLocation.city || "Location detected"}
                    {userLocation.country && `, ${userLocation.country}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
              title="Go back"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Split View: Search & Preview */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Left Col: Search & Results - 40% width */}
        <div className="flex-none lg:w-[40%] flex flex-col min-h-0">
          <div className="relative mb-2 group flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isLoading ? <Loader2 className="animate-spin text-brand-600" size={16}/> : <Search className="text-gray-400" size={16}/>}
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={
                locationStatus === "granted"
                  ? `Search businesses near ${userLocation?.city || "you"}...`
                  : "e.g. Downtown Dental Care"
              }
              className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-gray-100 rounded-xl text-sm focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none shadow-sm transition-all placeholder:text-gray-300"
              autoFocus
              disabled={locationStatus === "requesting"}
            />
          </div>

          {/* Results List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5">
            {suggestions.length > 0 ? (
              suggestions.map((business) => (
                <div
                  key={business.placeId}
                  onClick={() => selectBusiness(business)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all border flex items-center gap-2.5 group ${
                    selectedBusiness?.placeId === business.placeId
                    ? 'bg-brand-50 border-brand-500 shadow-sm'
                    : 'bg-white border-gray-50 hover:border-brand-200 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedBusiness?.placeId === business.placeId ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-600'
                  }`}>
                    <Store size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-xs truncate">{business.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 truncate">{business.address}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {business.rating && (
                        <div className="flex items-center text-[9px] font-bold text-orange-500 bg-orange-50 px-1 py-0.5 rounded">
                          <Star size={7} className="fill-orange-500 mr-0.5" /> {business.rating.toFixed(1)}
                        </div>
                      )}
                      {business.types?.[0] && (
                        <div className="text-[9px] text-gray-400 font-medium truncate">• {business.types[0].replace(/_/g, ' ')}</div>
                      )}
                    </div>
                  </div>
                  {selectedBusiness?.placeId === business.placeId && (
                    <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white animate-zoom-in flex-shrink-0">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))
            ) : (
              searchValue.length > 0 && !isLoading && (
                <div className="text-center py-6 text-gray-400">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Search size={16} />
                  </div>
                  <p className="text-[10px]">No results found.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Col: Details Card (Preview) - 60% width */}
        <div className="flex-none lg:w-[60%] flex flex-col min-h-0">
          <div className="h-full bg-white rounded-2xl border border-gray-200 shadow-xl shadow-brand-900/5 overflow-hidden flex flex-col">
            {selectedBusiness ? (
              <div className="flex flex-col h-full animate-fade-in-up">
                {/* Map Placeholder */}
                <div className="h-20 bg-gray-100 relative w-full overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <Map size={20} className="text-gray-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center gap-1 text-white text-[9px] font-medium">
                      <MapPin size={9} className="fill-white flex-shrink-0" />
                      <span className="truncate">{selectedBusiness.address}</span>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">{selectedBusiness.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {selectedBusiness.types?.[0] && (
                        <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold text-[9px] capitalize">
                          {selectedBusiness.types[0].replace(/_/g, ' ')}
                        </span>
                      )}
                      {selectedBusiness.rating && (
                        <span className="flex items-center gap-1 text-orange-500 font-bold text-[9px]">
                          <Star size={8} className="fill-orange-500" />
                          {selectedBusiness.rating.toFixed(1)}
                          {selectedBusiness.userRatingsTotal && ` (${selectedBusiness.userRatingsTotal})`}
                        </span>
                      )}
                      {selectedBusiness.priceLevel && (
                        <span className="text-[9px] text-gray-600 font-medium">
                          {'$'.repeat(selectedBusiness.priceLevel)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Business Description */}
                  {selectedBusiness.businessDescription && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-[10px] text-gray-700 leading-relaxed">{selectedBusiness.businessDescription}</p>
                    </div>
                  )}

                  <div className="space-y-2 mb-3">
                    {selectedBusiness.phone && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                          <Phone size={11} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wide">Phone</div>
                          <div className="font-medium text-gray-900 text-[10px] truncate">{selectedBusiness.phone}</div>
                        </div>
                      </div>
                    )}

                    {selectedBusiness.website && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wide">Website</div>
                          <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 text-[10px] truncate hover:underline block">
                            {selectedBusiness.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedBusiness.isOpen !== undefined && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                          <Clock size={11} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wide">Status</div>
                          <div className={`font-medium text-[10px] truncate ${selectedBusiness.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedBusiness.isOpen ? 'Open now' : 'Closed'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Opening Hours Details */}
                  {selectedBusiness.openingHours?.weekday_text && selectedBusiness.openingHours.weekday_text.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">Opening Hours</div>
                      <div className="space-y-0.5 bg-gray-50 rounded-lg p-2 border border-gray-100">
                        {selectedBusiness.openingHours.weekday_text.slice(0, 7).map((day, idx) => (
                          <div key={idx} className="text-[9px] text-gray-700 leading-relaxed">
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews Summary */}
                  {selectedBusiness.reviews && selectedBusiness.reviews.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">Recent Reviews</div>
                      <div className="space-y-1.5">
                        {selectedBusiness.reviews.slice(0, 2).map((review: any, idx: number) => (
                          <div key={idx} className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-1 mb-0.5">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={7} className={i < review.rating ? 'fill-orange-500 text-orange-500' : 'text-gray-300'} />
                                ))}
                              </div>
                              <span className="text-[8px] text-gray-500 ml-1">{review.author_name}</span>
                            </div>
                            <p className="text-[9px] text-gray-600 leading-relaxed line-clamp-2">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Continue Button */}
                <div className="p-4 pt-2 border-t border-gray-100 flex-shrink-0">
                  <button
                    onClick={handleContinue}
                    className="w-full btn-primary-custom py-2.5 font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Confirm & Continue <ArrowLeft size={12} className="rotate-180" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50/50">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-2.5">
                  <Layout size={20} className="text-gray-300" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Business Details</h3>
                <p className="text-[10px] text-gray-500 max-w-[180px]">Select a business from the search results to preview details here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSearch;
