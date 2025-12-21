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
  const [isTrainingJohnny, setIsTrainingJohnny] = useState(false);
  const [trainingMessage, setTrainingMessage] = useState('');
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Training messages
  const trainingMessages = [
    "Teaching Johnny about your business",
    "Personalizing Johnny's responses for your industry",
    "Configuring Johnny's brain cells",
    "Training Johnny to sound professional",
    "Almost there... Johnny is 99% trained"
  ];

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle training Johnny
  const handleTrainJohnny = () => {
    setIsTrainingJohnny(true);
    let messageIndex = 0;
    setTrainingMessage(trainingMessages[0]);

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % trainingMessages.length;
      setTrainingMessage(trainingMessages[messageIndex]);
    }, 1600); // Change message every 1.6 seconds (5 messages in 8 seconds)

    // After 8 seconds, proceed to next step
    setTimeout(() => {
      clearInterval(messageInterval);
      setIsTrainingJohnny(false);
      handleNext();
    }, 8000);
  };

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
              : 'Hours not available',
            photo_url: place.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 400 })
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
          photo_urls: place.photos?.slice(0, 5).map(photo => photo.getUrl({ maxWidth: 800, maxHeight: 600 })) || [],
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
    <div className="w-full h-full flex flex-col px-4 lg:px-6 py-3 overflow-hidden">
      <StepHeader 
        step="01" 
        title="Find Your Business" 
        subtitle="Search for your business to automatically import details." 
        showBack={false}
      />

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Col: Search & Results (Scrollable List) */}
        <div className="flex-1 flex flex-col min-h-0 lg:w-[45%]">
          {/* Location Status Banner */}
          {!GOOGLE_MAPS_API_KEY && (
            <div className="mb-2 bg-orange-50 border border-orange-200 rounded-lg p-2 text-[10px] text-orange-700 flex items-start gap-1.5">
              <span>⚠️</span>
              <span>API key missing</span>
            </div>
          )}
          
          {locationError && !userLocation && (
            <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Navigation size={14} className="text-blue-600 shrink-0" />
                <span className="text-[10px] text-blue-700">Enable location</span>
              </div>
              <button 
                onClick={requestUserLocation}
                disabled={isLoadingLocation}
                className="text-[10px] font-bold text-blue-600 hover:underline disabled:opacity-50"
              >
                {isLoadingLocation ? 'Loading...' : 'Enable'}
              </button>
            </div>
          )}

          {userLocation && (
            <div className="mb-2 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-1.5">
              <Navigation size={14} className="text-green-600 shrink-0" />
              <span className="text-[10px] text-green-700 font-medium">✓ Location enabled</span>
            </div>
          )}

          <div className="relative mb-2 group flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              {isSearching ? <Loader2 className="animate-spin text-brand-600" size={16}/> : <Search className="text-gray-400" size={16}/>}
            </div>
            <input
              type="text"
              value={state.businessName}
              onChange={(e) => {
                setState({...state, businessName: e.target.value});
                if(e.target.value.length < 3) setState(prev => ({...prev, businessDetails: null}));
              }}
              placeholder="Search your business..."
              className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
              autoFocus
            />
          </div>

          {/* Scrollable Results List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar min-h-0">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div 
                  key={result.id} 
                  onClick={() => handleBusinessSelect(result)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all border flex items-center gap-2.5 ${
                    state.businessDetails?.place_id === result.id 
                    ? 'bg-brand-50 border-brand-400 ring-1 ring-brand-200' 
                    : 'bg-white border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors overflow-hidden ${
                    state.businessDetails?.place_id === result.id ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-600'
                  }`}>
                    {result.photo_url ? (
                      <img src={result.photo_url} alt={result.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={15} className={state.businessDetails?.place_id === result.id ? 'text-white' : 'text-brand-600'} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-xs leading-tight truncate">{result.name}</div>
                    <div className="text-[10px] text-gray-500 truncate mt-0.5">{result.address}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex items-center text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                        <Star size={8} className="fill-orange-500 mr-0.5" /> {result.rating}
                      </div>
                      <span className="text-[9px] text-gray-400">• {result.type}</span>
                    </div>
                  </div>
                  {state.businessDetails?.place_id === result.id && (
                    <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))
            ) : (
              state.businessName.length > 0 && !isSearching && (
                <div className="text-center py-6 text-gray-400">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Search size={16} />
                  </div>
                  <p className="text-xs font-medium mb-2">No results found</p>
                  <button 
                    onClick={() => {
                      const manualBusiness: SearchResult = {
                        id: 'manual-' + Date.now(),
                        name: state.businessName,
                        address: 'Address to be added',
                        rating: 0,
                        reviews: 0,
                        type: 'Business',
                        phone: 'Phone to be added',
                        hours: 'Hours to be added',
                        photo_url: undefined
                      };
                      handleBusinessSelect(manualBusiness);
                    }}
                    className="text-brand-600 font-bold text-xs hover:underline"
                  >
                    Continue with \"{state.businessName}\"
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Col: Details Card - Clean Preview */}
        <div className="flex-1 flex flex-col min-h-0 lg:w-[55%]">
          <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {state.businessDetails ? (
              <div className="flex flex-col h-full animate-fade-in-up overflow-hidden">
                {/* Business Image Header */}
                <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 relative w-full flex-shrink-0 overflow-hidden">
                  {state.businessDetails.photo_urls?.[0] ? (
                    <img 
                      src={state.businessDetails.photo_urls[0]} 
                      alt={state.businessDetails.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Store size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                  {/* Business Header */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-gray-900 leading-tight flex-1">{state.businessDetails.name}</h3>
                      {state.businessDetails.isOpen && (
                        <span className="px-2 py-1 rounded-md font-bold text-[10px] bg-green-50 text-green-700 shrink-0">
                          Operational
                        </span>
                      )}
                    </div>
                    {state.businessDetails.formatted_address && (
                      <div className="text-xs text-gray-500 mb-2">{state.businessDetails.formatted_address}</div>
                    )}
                    {(state.businessDetails.rating > 0 || state.businessDetails.userRatingsTotal > 0) && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < Math.round(state.businessDetails.rating) ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200'} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-900">{state.businessDetails.rating}</span>
                        <span className="text-xs text-gray-500">{state.businessDetails.userRatingsTotal} reviews</span>
                      </div>
                    )}
                  </div>

                  {/* Information Sections */}
                  <div className="space-y-3">
                    {/* Address Section */}
                    {state.businessDetails.formatted_address && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <MapPin size={16} className="text-brand-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Address</div>
                          <div className="text-xs text-gray-900 font-medium leading-relaxed">{state.businessDetails.formatted_address}</div>
                        </div>
                      </div>
                    )}

                    {/* Industry Section */}
                    {state.businessDetails.types && state.businessDetails.types.length > 0 && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Industry</div>
                          <div className="flex flex-wrap gap-1.5">
                            {state.businessDetails.types.slice(0, 3).map((type, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-medium">
                                {type.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hours Section */}
                    {state.businessDetails.openingHours?.weekday_text && state.businessDetails.openingHours.weekday_text.length > 0 && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <Clock size={16} className="text-brand-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Hours</div>
                          <div className="space-y-0.5">
                            {state.businessDetails.openingHours.weekday_text.map((hours, idx) => (
                              <div key={idx} className="text-[10px] text-gray-700 font-medium leading-relaxed">
                                {hours}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Phone Section */}
                    {state.businessDetails.phone && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <Phone size={16} className="text-brand-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Phone</div>
                          <div className="text-xs text-gray-900 font-semibold">{state.businessDetails.phone}</div>
                        </div>
                      </div>
                    )}

                    {/* Website Section */}
                    {state.businessDetails.website && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Website</div>
                          <a href={state.businessDetails.website} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 font-semibold truncate block hover:underline">
                            {state.businessDetails.website.replace(/^https?:\/\/(www\.)?/, '')}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Description Section */}
                    {state.businessDetails.businessDescription && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Description</div>
                          <div className="text-xs text-gray-700 leading-relaxed">{state.businessDetails.businessDescription}</div>
                        </div>
                      </div>
                    )}

                    {/* Google Places ID */}
                    {state.businessDetails.place_id && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Google Places ID</div>
                          <div className="text-[10px] text-gray-600 font-mono break-all">{state.businessDetails.place_id}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto pt-4">
                    <button 
                      onClick={handleTrainJohnny}
                      disabled={isTrainingJohnny}
                      className="w-full btn-primary-custom py-2.5 font-bold text-sm rounded-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTrainingJohnny ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Training Johnny...
                        </>
                      ) : (
                        <>
                          Let's Train Johnny 
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Training Overlay */}
                {isTrainingJohnny && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                    <div className="text-center px-6">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto">
                          <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-gray-200"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray="283"
                              strokeDashoffset="75"
                              strokeLinecap="round"
                              className="text-brand-600"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl">🤖</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-900">Training Johnny</h3>
                        <p className="text-sm text-gray-600 max-w-xs mx-auto animate-pulse">
                          {trainingMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg border border-gray-200 flex items-center justify-center mb-3">
                  <Layout size={22} className="text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Business Details</h3>
                <p className="text-xs text-gray-500 max-w-[180px]">Select a business to preview details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOne;
