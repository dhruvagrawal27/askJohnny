import { useState, useEffect, useRef } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'

interface BusinessInfo {
  name: string
  address: string
  rating?: number
  phone?: string
  website?: string
  placeId: string
  types?: string[]
  reviews?: any[]
  businessDescription?: string
  openingHours?: {
    periods?: Array<{
      open: { day: number; time: string }
      close?: { day: number; time: string }
    }>
    weekday_text?: string[]
  }
  isOpen?: boolean
  priceLevel?: number
  photos?: any[]
  vicinity?: string
  userRatingsTotal?: number
  utcOffsetMinutes?: number
  location?: { lat: number; lng: number }
}

interface UserLocation {
  lat: number
  lng: number
  country?: string
  city?: string
}

interface Voice {
  id: string
  name: string
  gender: 'male' | 'female'
  accent: string
  description: string
}

const Step1_Company = () => {
  const { state, dispatch, nextStep } = useOnboarding()
  const [searchValue, setSearchValue] = useState(state.data.step1.businessName)
  const [suggestions, setSuggestions] = useState<BusinessInfo[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessInfo | null>(
    state.data.step1.businessDetails ? {
      placeId: 'selected',
      name: state.data.step1.businessDetails.name,
      address: state.data.step1.businessDetails.address,
      phone: state.data.step1.businessDetails.phone,
      website: '',
      openingHours: undefined
    } : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationStatus, setLocationStatus] = useState<
    "requesting" | "granted" | "denied"
  >("requesting")
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  
  // Voice demo states
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [speechSupported, setSpeechSupported] = useState(true)

  const autocompleteService = useRef<any>(null)
  const placesService = useRef<any>(null)
  const geocoder = useRef<any>(null)
  const speechSynthesis = useRef<SpeechSynthesis | null>(null)
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null)

  const voices: Voice[] = [
    {
      id: 'female-1',
      name: 'Sarah',
      gender: 'female',
      accent: 'American',
      description: 'Professional and friendly tone'
    },
    {
      id: 'male-1', 
      name: 'David',
      gender: 'male',
      accent: 'American',
      description: 'Warm and approachable voice'
    }
  ]

  useEffect(() => {
    const initializeServices = async () => {
      // Initialize Google Maps (existing code)
      const apiKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || ""
      
      if (!apiKey) {
        console.warn("Google Maps API key not found. Using mock data.")
        setLocationStatus("denied")
      } else {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        
        script.onload = () => {
          console.log("Google Maps loaded successfully")
          
          autocompleteService.current = new (window as any).google.maps.places.AutocompleteService()
          geocoder.current = new (window as any).google.maps.Geocoder()

          const dummyDiv = document.createElement("div")
          placesService.current = new (window as any).google.maps.places.PlacesService(dummyDiv)

          requestUserLocation()
        }

        script.onerror = () => {
          console.error("Failed to load Google Maps API")
          setLocationStatus("denied")
        }

        document.head.appendChild(script)
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.current = window.speechSynthesis
      } else {
        setSpeechSupported(false)
      }
    }

    initializeServices()

    return () => {
      if (currentUtterance.current) {
        speechSynthesis.current?.cancel()
      }
    }
  }, [])

  // ... (keep all your existing Google Maps functions: requestUserLocation, reverseGeocode, handleSearch, etc.)
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.")
      setLocationStatus("denied")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        try {
          const locationDetails = await reverseGeocode(lat, lng)
          setUserLocation({
            lat,
            lng,
            country: locationDetails.country,
            city: locationDetails.city,
          })
          setLocationStatus("granted")
        } catch (error) {
          console.error("Error getting location details:", error)
          setUserLocation({ lat, lng })
          setLocationStatus("granted")
        }
      },
      (error) => {
        console.error("Error getting user location:", error)
        setLocationStatus("denied")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }

  const reverseGeocode = async (
    lat: number,
    lng: number
  ): Promise<{ country?: string; city?: string }> => {
    return new Promise((resolve) => {
      if (!geocoder.current) {
        resolve({})
        return
      }

      geocoder.current.geocode(
        { location: { lat, lng } },
        (results: any, status: string) => {
          if (status === "OK" && results && results[0]) {
            const addressComponents = results[0].address_components
            let country = ""
            let city = ""

            addressComponents.forEach((component: any) => {
              if (component.types.includes("country")) {
                country = component.short_name
              }
              if (
                component.types.includes("locality") ||
                component.types.includes("administrative_area_level_1")
              ) {
                city = component.long_name
              }
            })

            resolve({ country, city })
          } else {
            resolve({})
          }
        }
      )
    })
  }

  const handleSearch = async (query: string) => {
    if (!autocompleteService.current || query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    try {
      const request: any = {
        input: query,
        types: ["establishment"],
      }

      if (userLocation) {
        request.location = new (window as any).google.maps.LatLng(
          userLocation.lat,
          userLocation.lng
        )
        request.radius = 50000

        if (userLocation.country) {
          request.componentRestrictions = {
            country: userLocation.country.toLowerCase(),
          }
        }
      }

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions: any, status: string) => {
          if (
            status === (window as any).google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            const businessPromises = predictions
              .slice(0, 5)
              .map((prediction: any) => {
                return new Promise<BusinessInfo>((resolve) => {
                  if (!placesService.current) {
                    resolve({
                      name: prediction.description,
                      address: prediction.structured_formatting.secondary_text || "",
                      placeId: prediction.place_id,
                    })
                    return
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
                        "geometry"
                      ],
                    },
                    (place: any, detailStatus: string) => {
                      if (
                        detailStatus === (window as any).google.maps.places.PlacesServiceStatus.OK &&
                        place
                      ) {
                        let isCurrentlyOpen: boolean | undefined
                        try {
                          if (
                            place.opening_hours &&
                            typeof (place.opening_hours as any).isOpen === "function"
                          ) {
                            isCurrentlyOpen = (place.opening_hours as any).isOpen()
                          }
                        } catch (error) {
                          console.log("Could not determine if business is open")
                          isCurrentlyOpen = undefined
                        }

                        resolve({
                          name: place.name || prediction.description,
                          address: place.formatted_address || "",
                          rating: place.rating,
                          phone: place.formatted_phone_number,
                          website: place.website,
                          placeId: prediction.place_id,
                          types: place.types,
                          reviews: place.reviews ? place.reviews.slice(0, 5) : [],
                          businessDescription: (place as any).editorial_summary?.overview || "",
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
                          utcOffsetMinutes: (place as any).utc_offset_minutes,
                          location: place.geometry?.location
                            ? { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
                            : undefined,
                        })
                      } else {
                        resolve({
                          name: prediction.description,
                          address: prediction.structured_formatting.secondary_text || "",
                          placeId: prediction.place_id,
                        })
                      }
                    }
                  )
                })
              })

            Promise.all(businessPromises).then((businesses) => {
              setSuggestions(businesses)
              setIsLoading(false)
            })
          } else {
            setSuggestions([])
            setIsLoading(false)
          }
        }
      )
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)

    if (locationStatus === "denied" && !showLocationPrompt) {
      setShowLocationPrompt(true)
    }

    handleSearch(value)
  }

  const handleInputFocus = () => {
    if (locationStatus === "denied" && !showLocationPrompt) {
      setShowLocationPrompt(true)
    }
  }

  const selectBusiness = (business: BusinessInfo) => {
    setSelectedBusiness(business)
    setSearchValue(business.name)
    setSuggestions([])
  }

  // Voice demo functions
  const getDemoText = (voiceId: string) => {
    const businessName = selectedBusiness?.name || 'your business'
    return `Hello! This is your AI agent for ${businessName}. I'm here to help your customers 24/7 with questions about your services, booking appointments, and providing information. I can handle multiple conversations at once and never take a break. How can I assist you today?`
  }

  const playVoice = async (voiceId: string) => {
    if (!speechSynthesis.current || !speechSupported) return

    if (currentUtterance.current) {
      speechSynthesis.current.cancel()
    }

    setIsPlaying(voiceId)

    const utterance = new SpeechSynthesisUtterance(getDemoText(voiceId))
    currentUtterance.current = utterance

    const availableVoices = speechSynthesis.current.getVoices()
    
    const voice = voices.find(v => v.id === voiceId)
    if (voice && availableVoices.length > 0) {
      const selectedSynthVoice = availableVoices.find(v => 
        v.lang.startsWith('en') && 
        (voice.gender === 'female' ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || !v.name.toLowerCase().includes('male') : 
         v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man'))
      ) || availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0]
      
      utterance.voice = selectedSynthVoice
    }

    utterance.rate = 0.9
    utterance.pitch = voice?.gender === 'female' ? 1.1 : 0.9
    utterance.volume = 1

    utterance.onend = () => {
      setIsPlaying(null)
      currentUtterance.current = null
    }

    utterance.onerror = () => {
      setIsPlaying(null)
      currentUtterance.current = null
    }

    speechSynthesis.current.speak(utterance)
  }

  const stopVoice = () => {
    if (speechSynthesis.current && currentUtterance.current) {
      speechSynthesis.current.cancel()
      setIsPlaying(null)
      currentUtterance.current = null
    }
  }

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId)
  }

  const handleNext = () => {
    if (selectedBusiness && selectedVoice) {
      dispatch({
        type: 'UPDATE_STEP_DATA',
        payload: {
          step: 'step1',
          data: {
            businessName: selectedBusiness.name,
            businessDetails: {
              name: selectedBusiness.name,
              address: selectedBusiness.address,
              phone: selectedBusiness.phone || '',
              hours: selectedBusiness.openingHours?.weekday_text?.join(', ') || '',
              placeId: selectedBusiness.placeId,
              website: selectedBusiness.website,
              rating: selectedBusiness.rating,
              types: selectedBusiness.types,
              reviews: selectedBusiness.reviews,
              businessDescription: selectedBusiness.businessDescription,
              openingHours: selectedBusiness.openingHours,
              isOpen: selectedBusiness.isOpen,
              priceLevel: selectedBusiness.priceLevel,
              photos: selectedBusiness.photos,
              vicinity: selectedBusiness.vicinity,
              userRatingsTotal: selectedBusiness.userRatingsTotal,
              utcOffsetMinutes: selectedBusiness.utcOffsetMinutes,
              location: selectedBusiness.location
            },
            selectedVoice: selectedVoice,
            voiceName: voices.find(v => v.id === selectedVoice)?.name || ''
          }
        }
      })
      nextStep()
    }
  }

  const getCurrentStatus = (isOpen?: boolean) => {
    if (isOpen === undefined) return "Hours not available"
    return isOpen ? "Open now" : "Closed now"
  }

  const getPriceLevelText = (priceLevel?: number) => {
    const levels = ["Free", "Inexpensive", "Moderate", "Expensive", "Very Expensive"]
    return priceLevel !== undefined ? levels[priceLevel] : "Not specified"
  }

  return (
    <div className="max-w-9xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg shadow-purple-200/50 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-3">
          Setup Your AI Business Agent
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Find your business and choose the perfect voice for your AI agent
        </p>
      </div>

      {/* Side-by-Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Search */}
        <div className="space-y-6">
          {/* Location Status Cards (existing code) */}
          {locationStatus === "requesting" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Requesting your location...</p>
                  <p className="text-blue-600 text-sm">This helps us find businesses near you</p>
                </div>
              </div>
            </div>
          )}

          {locationStatus === "denied" && showLocationPrompt && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-amber-700 font-medium">Enable location for better results</p>
                    <p className="text-amber-600 text-sm">We'll show businesses near you first</p>
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
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Search for your business
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  placeholder={
                    locationStatus === "granted"
                      ? `Search for businesses near ${userLocation?.city || "you"}...`
                      : "Search your business to get started"
                  }
                  className="w-full pl-12 pr-12 py-4 bg-white border border-purple-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 placeholder-slate-400 text-slate-700 shadow-sm hover:shadow-md hover:border-purple-300/70"
                  disabled={locationStatus === "requesting"}
                />
                {isLoading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Results */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Search Results
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {suggestions.map((business, index) => (
                  <button
                    key={business.placeId}
                    onClick={() => selectBusiness(business)}
                    className="w-full text-left p-4 bg-white border border-purple-100/60 rounded-xl hover:border-purple-300/70 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-white transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-purple-100/30 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors duration-200 mb-1">
                          {business.name}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center mb-2">
                          <svg className="h-3.5 w-3.5 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {business.address}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {business.rating && (
                            <div className="flex items-center space-x-1">
                              <svg className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              <span className="text-sm font-medium text-slate-700">{business.rating.toFixed(1)}</span>
                            </div>
                          )}
                          
                          {business.isOpen !== undefined && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              business.isOpen 
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/60' 
                                : 'bg-red-100 text-red-700 border border-red-200/60'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                business.isOpen ? 'bg-emerald-500' : 'bg-red-500'
                              }`}></div>
                              {business.isOpen ? "Open now" : "Closed"}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Selected Business & Voice Demo */}
        <div className="space-y-6">
          {selectedBusiness ? (
            <div className="sticky top-6 space-y-6">
              {/* Selected Business Details */}
              <div className="bg-gradient-to-r from-purple-50/80 to-purple-100/40 border border-purple-200/60 rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900">Selected Business</h3>
                </div>
                
                <div className="bg-white/70 rounded-lg p-4 space-y-3 border border-purple-100/50">
                  <div>
                    <span className="font-semibold text-purple-900 text-lg">{selectedBusiness.name}</span>
                  </div>
                  <div className="flex items-center text-slate-700 text-sm">
                    <svg className="h-4 w-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedBusiness.address}
                  </div>
                  
                  {selectedBusiness.phone && (
                    <div className="flex items-center text-slate-700 text-sm">
                      <svg className="h-4 w-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {selectedBusiness.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Selection */}
              <div className="bg-gradient-to-r from-indigo-50/80 to-blue-100/40 border border-indigo-200/60 rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-900">Choose AI Voice</h3>
                </div>

                {!speechSupported && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-red-700">Text-to-speech not supported in your browser.</p>
                  </div>
                )}

                <div className="space-y-3">
                  {voices.map((voice) => (
                    <div
                      key={voice.id}
                      className={`relative bg-white/70 border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedVoice === voice.id
                          ? 'border-indigo-500 bg-gradient-to-r from-indigo-50/50 to-white shadow-md'
                          : 'border-indigo-100/60 hover:border-indigo-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleVoiceSelect(voice.id)}
                    >
                      {selectedVoice === voice.id && (
                        <div className="absolute top-3 right-3">
                          <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          voice.gender === 'female' 
                            ? 'bg-gradient-to-r from-pink-100 to-purple-100' 
                            : 'bg-gradient-to-r from-blue-100 to-indigo-100'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            voice.gender === 'female' ? 'text-pink-600' : 'text-blue-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{voice.name}</h4>
                          <p className="text-xs text-slate-600">{voice.accent} • {voice.description}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 rounded p-3 mb-3 text-xs text-slate-600 leading-relaxed">
                        "Hello! This is your AI agent for {selectedBusiness.name}..."
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isPlaying === voice.id) {
                            stopVoice()
                          } else {
                            playVoice(voice.id)
                          }
                        }}
                        disabled={!speechSupported}
                        className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isPlaying === voice.id
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : selectedVoice === voice.id
                            ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isPlaying === voice.id ? (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9V10z" />
                            </svg>
                            Stop
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 002-2V9a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293L10.293 4.293A1 1 0 009.586 4H8a2 2 0 00-2 2v5a2 2 0 002 2z" />
                            </svg>
                            Play Demo
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <div>
                <button
                  onClick={handleNext}
                  disabled={!selectedBusiness || !selectedVoice}
                  className="w-full group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center">
                    Continue Setup
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                
                {(!selectedBusiness || !selectedVoice) && (
                  <p className="text-center text-sm text-slate-500 mt-2">
                    {!selectedBusiness ? "Select a business" : "Choose a voice"} to continue
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Business Selected</h3>
              <p className="text-slate-500">Search and select your business to continue</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #9333ea);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #7c3aed);
        }
      `}</style>
    </div>
  )
}

export default Step1_Company
