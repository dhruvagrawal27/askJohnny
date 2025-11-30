import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Store, Search, Loader2, Star, Check, MapPin, Phone, Clock, Map as MapIcon, Layout, Navigation } from 'lucide-react';
import { StepProps, SearchResult, BusinessDetails } from './types';
import { StepHeader, ContentContainer } from './SharedComponents';

const StepOne: React.FC<StepProps> = ({ state, setState, handleNext, handleBack }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load Google Maps Script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing');
      return;
    }

    // Check if script already loaded
    if (window.google?.maps?.places) {
      initializeServices();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      initializeServices();
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [GOOGLE_MAPS_API_KEY]);

  const initializeServices = () => {
    if (window.google?.maps?.places) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
      console.log('Google Places services initialized');
    }
  };

  // Request user location on mount
  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
        setIsLoadingLocation(false);
        console.log('Location obtained:', position.coords);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError(error.message);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Real Google Places search
  useEffect(() => {
    if (state.businessName.length > 2 && !state.businessDetails && autocompleteServiceRef.current) {
      setIsSearching(true);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search
      searchTimeoutRef.current = setTimeout(() => {
        const request: google.maps.places.AutocompletionRequest = {
          input: state.businessName,
          types: ['establishment'],
          ...(userLocation && {
            location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
            radius: 50000 // 50km radius
          })
        };

        autocompleteServiceRef.current!.getPlacePredictions(
          request,
          (predictions, status) => {
            setIsSearching(false);
            
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              // Fetch details for each prediction
              const detailPromises = predictions.slice(0, 5).map(prediction => 
                fetchPlaceDetails(prediction.place_id)
              );
              
              Promise.all(detailPromises).then(results => {
                const validResults = results.filter(r => r !== null) as SearchResult[];
                setSearchResults(validResults);
              });
            } else {
              console.log('No predictions found:', status);
              setSearchResults([]);
            }
          }
        );
      }, 500); // 500ms debounce
    } else {
      if (!state.businessDetails) {
        setSearchResults([]);
      }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [state.businessName, state.businessDetails, userLocation]);

  const fetchPlaceDetails = (placeId: string): Promise<SearchResult | null> => {
    return new Promise((resolve) => {
      if (!placesServiceRef.current) {
        resolve(null);
        return;
      }

      const request = {
        placeId: placeId,
        fields: [
          // Basic Info
          'place_id', 'name', 'business_status', 'types',
          // Contact
          'formatted_phone_number', 'international_phone_number', 'website',
          // Location
          'formatted_address', 'address_components', 'geometry', 'vicinity', 'url',
          // Ratings & Reviews
          'rating', 'user_ratings_total', 'reviews',
          // Hours
          'opening_hours', 'utc_offset_minutes',
          // Pricing
          'price_level',
          // Photos
          'photos',
          // Attributes
          'wheelchair_accessible_entrance',
          'delivery', 'dine_in', 'takeout',
          'serves_breakfast', 'serves_lunch', 'serves_dinner',
          'serves_beer', 'serves_wine',
          'reservable',
          // Description
          'editorial_summary'
        ]
      };

      placesServiceRef.current.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          // For display in search results
          const result: SearchResult = {
            id: place.place_id || placeId,
            name: place.name || 'Unknown Business',
            address: place.formatted_address || 'Address not available',
            rating: place.rating || 0,
            reviews: place.user_ratings_total || 0,
            type: place.types?.[0]?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Business',
            phone: place.formatted_phone_number || 'Phone not available',
            hours: place.opening_hours?.isOpen?.() 
              ? `Open ${place.opening_hours.weekday_text?.[new Date().getDay()] || ''}` 
              : 'Hours not available'
          };
          
          console.log('✅ Fetched business data for display:', result);
          resolve(result);
        } else {
          console.error('Place details error:', status);
          resolve(null);
        }
      });
    });
  };

  const transformToBusinessDetails = async (business: SearchResult): Promise<void> => {
    // Fetch full details again to get complete data
    if (!placesServiceRef.current) return;

    const request = {
      placeId: business.id,
      fields: [
        'place_id', 'name', 'business_status', 'types',
        'formatted_phone_number', 'international_phone_number', 'website',
        'formatted_address', 'address_components', 'geometry', 'vicinity', 'url',
        'rating', 'user_ratings_total', 'reviews',
        'opening_hours', 'utc_offset_minutes',
        'price_level', 'photos',
        'wheelchair_accessible_entrance',
        'delivery', 'dine_in', 'takeout',
        'serves_breakfast', 'serves_lunch', 'serves_dinner',
        'serves_beer', 'serves_wine', 'reservable',
        'editorial_summary'
      ]
    };

    placesServiceRef.current.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        // Transform to BusinessDetails format
        const businessDetails: BusinessDetails = {
          name: place.name || business.name,
          phone: place.formatted_phone_number || business.phone,
          types: place.types || [],
          isOpen: place.opening_hours?.isOpen?.() || false,
          photos: place.photos?.slice(0, 5).map(photo => ({
            width: 800,
            height: 600,
            html_attributions: photo.html_attributions || []
          })) || [],
          rating: place.rating || business.rating,
          reviews: place.reviews?.slice(0, 5).map(review => ({
            text: review.text || '',
            time: review.time || 0,
            rating: review.rating || 0,
            language: review.language || 'en',
            author_url: (review as any).author_url || '',
            translated: false,
            author_name: review.author_name || 'Anonymous',
            original_language: review.language || 'en',
            profile_photo_url: (review as any).profile_photo_url || '',
            relative_time_description: review.relative_time_description || ''
          })) || [],
          website: place.website,
          geometry: {
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }
          },
          location: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0
          },
          place_id: place.place_id || business.id,
          vicinity: place.vicinity || '',
          openingHours: place.opening_hours ? {
            periods: (place.opening_hours.periods || []).map((period: any) => ({
              open: {
                day: period.open?.day || 0,
                time: period.open?.time || '',
                hours: period.open?.hours || 0,
                minutes: period.open?.minutes || 0,
                nextDate: 0
              },
              close: {
                day: period.close?.day || 0,
                time: period.close?.time || '',
                hours: period.close?.hours || 0,
                minutes: period.close?.minutes || 0,
                nextDate: 0
              }
            })),
            weekday_text: place.opening_hours.weekday_text || []
          } : undefined,
          userRatingsTotal: place.user_ratings_total || business.reviews,
          utcOffsetMinutes: place.utc_offset_minutes || 0,
          formatted_address: place.formatted_address || business.address,
          businessDescription: (place as any).editorial_summary?.overview || ''
        };

        console.log('✅ Transformed to BusinessDetails format:', businessDetails);

        setState(prev => ({
          ...prev,
          businessName: businessDetails.name,
          businessAddress: businessDetails.formatted_address,
          businessDetails: businessDetails
        }));
      }
    });
  };

  const handleBusinessSelect = (business: SearchResult) => {
    console.log('Business selected:', business);
    transformToBusinessDetails(business);
    // Don't clear search results - keep them visible
    // setSearchResults([business]);
  };

  // Debug: Log when businessDetails changes
  useEffect(() => {
    console.log('Business details updated:', state.businessDetails);
  }, [state.businessDetails]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden px-6 md:px-8 py-6">
      <StepHeader 
        step="01" 
        title="Find Your Business" 
        subtitle="Search for your business to automatically import details." 
        showBack={false}
      />

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Col: Search & Results (Scrollable List) */}
        <div className="flex-1 flex flex-col min-h-0 max-w-[45%]">
          {/* Location Status Banner */}
          {!GOOGLE_MAPS_API_KEY && (
            <div className="mb-3 bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
              ⚠️ Google Maps API key is missing. Please add it to enable business search.
            </div>
          )}
          
          {locationError && !userLocation && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-blue-600" />
                <span className="text-xs text-blue-700">Enable location for better search results</span>
              </div>
              <button 
                onClick={requestUserLocation}
                disabled={isLoadingLocation}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
              >
                {isLoadingLocation ? 'Loading...' : 'Enable'}
              </button>
            </div>
          )}

          {userLocation && (
            <div className="mb-3 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
              <Navigation size={16} className="text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                ✓ Location enabled - showing nearby businesses
              </span>
            </div>
          )}

          <div className="relative mb-3 group flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {isSearching ? <Loader2 className="animate-spin text-brand-600" size={18}/> : <Search className="text-gray-400" size={18}/>}
            </div>
            <input
              type="text"
              value={state.businessName}
              onChange={(e) => {
                setState({...state, businessName: e.target.value});
                if(e.target.value.length < 3) setState(prev => ({...prev, businessDetails: null}));
              }}
              placeholder="e.g. Downtown Dental Care"
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-base focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none shadow-sm transition-all placeholder:text-gray-300"
              autoFocus
            />
          </div>

          {/* Scrollable Results List - Independent Scroll */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div 
                  key={result.id} 
                  onClick={() => handleBusinessSelect(result)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border flex items-center gap-3 group ${
                    state.businessDetails?.place_id === result.id 
                    ? 'bg-brand-50 border-brand-500 shadow-sm' 
                    : 'bg-white border-gray-50 hover:border-brand-200 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    state.businessDetails?.place_id === result.id ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-600'
                  }`}>
                    <Store size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{result.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{result.address}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                        <Star size={8} className="fill-orange-500 mr-1" /> {result.rating}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">• {result.type}</div>
                    </div>
                  </div>
                  {state.businessDetails?.place_id === result.id && (
                    <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white animate-zoom-in">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))
            ) : (
              state.businessName.length > 0 && !isSearching && (
                <div className="text-center py-8 text-gray-400">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Search size={18} />
                  </div>
                  <p className="text-xs mb-2">No results found.</p>
                  <p className="text-[10px] text-gray-500 mb-2">Try:</p>
                  <ul className="text-[10px] text-gray-500 space-y-1 mb-3">
                    <li>• Different search terms</li>
                    <li>• Enabling location services</li>
                    <li>• Checking spelling</li>
                  </ul>
                  <button 
                    onClick={() => {
                      // Allow manual entry by setting a placeholder business
                      const manualBusiness: SearchResult = {
                        id: 'manual-' + Date.now(),
                        name: state.businessName,
                        address: 'Address to be added',
                        rating: 0,
                        reviews: 0,
                        type: 'Business',
                        phone: 'Phone to be added',
                        hours: 'Hours to be added'
                      };
                      handleBusinessSelect(manualBusiness);
                    }}
                    className="text-brand-600 font-bold text-xs mt-1 hover:underline"
                  >
                    Continue with "{state.businessName}"
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Col: Details Card (Preview) - Fits Viewport */}
        <div className="flex-1 flex flex-col min-h-0 max-w-[45%]">
          <div className="h-full max-h-[600px] bg-white rounded-3xl border border-gray-200 shadow-xl shadow-brand-900/5 overflow-hidden flex flex-col">
            {state.businessDetails ? (
              <div className="flex flex-col h-full animate-fade-in-up">
                {/* Map Placeholder */}
                <div className="h-28 bg-gray-100 relative w-full overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <MapIcon size={24} className="text-gray-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center gap-1.5 text-white text-[10px] font-medium">
                      <MapPin size={10} className="fill-white" /> 
                      <span className="truncate">{state.businessDetails.formatted_address}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{state.businessDetails.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 flex-wrap">
                      <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold text-[10px]">{state.businessDetails.types?.[0]?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Business'}</span>
                      <span className="flex items-center gap-1 text-orange-500 font-bold text-[10px]">
                        {state.businessDetails.rating} <Star size={8} className="fill-orange-500" /> ({state.businessDetails.userRatingsTotal} reviews)
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${state.businessDetails.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {state.businessDetails.isOpen ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {/* Phone */}
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                        <Phone size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Phone</div>
                        <div className="font-medium text-gray-900 text-xs truncate">{state.businessDetails.phone}</div>
                      </div>
                    </div>

                    {/* Website */}
                    {state.businessDetails.website && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Website</div>
                          <a href={state.businessDetails.website} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 text-xs truncate block hover:underline">{state.businessDetails.website}</a>
                        </div>
                      </div>
                    )}

                    {/* Today's Hours */}
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                        <Clock size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Today's Hours</div>
                        <div className="font-medium text-gray-900 text-xs truncate">{state.businessDetails.openingHours?.weekday_text?.[new Date().getDay()] || 'Hours not available'}</div>
                      </div>
                    </div>

                    {/* All Week Hours */}
                    {state.businessDetails.openingHours?.weekday_text && (
                      <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">Weekly Schedule</div>
                        <div className="space-y-0.5">
                          {state.businessDetails.openingHours.weekday_text.map((hours, idx) => (
                            <div key={idx} className="text-[10px] text-gray-700 font-medium">
                              {hours}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customer Reviews */}
                    {state.businessDetails.reviews && state.businessDetails.reviews.length > 0 && (
                      <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mb-2">Recent Reviews</div>
                        <div className="space-y-2">
                          {state.businessDetails.reviews.slice(0, 3).map((review, idx) => (
                            <div key={idx} className="bg-white p-2 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <img src={review.profile_photo_url} alt={review.author_name} className="w-5 h-5 rounded-full" />
                                <span className="text-[10px] font-bold text-gray-900">{review.author_name}</span>
                                <span className="flex items-center gap-0.5 text-orange-500 text-[9px] ml-auto">
                                  {review.rating} <Star size={8} className="fill-orange-500" />
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-600 line-clamp-2">{review.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-3 sticky bottom-0 bg-white border-t border-gray-100">
                    <button 
                      onClick={handleNext}
                      className="w-full btn-primary-custom py-2.5 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      Confirm & Continue <ArrowLeft size={14} className="rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50/50">
                <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-3">
                  <Layout size={24} className="text-gray-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">Business Details</h3>
                <p className="text-xs text-gray-500 max-w-[180px]">Select a business from the search results to preview details here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOne;
