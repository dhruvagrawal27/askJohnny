// types/onboarding.ts
export interface BusinessData {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  phone?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  address?: string;
  hours?: string;
  isOpen?: boolean;
  priceLevel?: number;
  photos?: any[];
  vicinity?: string;
  userRatingsTotal?: number;
  utcOffsetMinutes?: number;
  location?: { lat: number; lng: number };
}

export interface ServicePreference {
  id: 'voicemail' | 'scheduling' | 'faq';
  title: string;
  description: string;
}

export interface FAQData {
  category: string;
  answers: string[];
}

export interface OnboardingState {
  business: BusinessData | null;
  servicePreference: string | null;
  faqData: FAQData | null;
  contactInfo?: any;
  completed: boolean;
}