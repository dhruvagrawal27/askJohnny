export interface Category {
  id: string;
  label: string;
  description: string;
  questions: string[];
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  type: string;
  phone: string;
  hours: string;
}

export interface BusinessDetails {
  name: string;
  phone: string;
  types: string[];
  isOpen: boolean;
  photos: Array<{
    width: number;
    height: number;
    html_attributions: string[];
  }>;
  rating: number;
  reviews: Array<{
    text: string;
    time: number;
    rating: number;
    language: string;
    author_url: string;
    translated: boolean;
    author_name: string;
    original_language: string;
    profile_photo_url: string;
    relative_time_description: string;
  }>;
  website?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  location: {
    lat: number;
    lng: number;
  };
  place_id: string;
  vicinity: string;
  openingHours?: {
    periods: Array<{
      open: {
        day: number;
        time: string;
        hours: number;
        minutes: number;
        nextDate: number;
      };
      close: {
        day: number;
        time: string;
        hours: number;
        minutes: number;
        nextDate: number;
      };
    }>;
    weekday_text: string[];
  };
  userRatingsTotal: number;
  utcOffsetMinutes: number;
  formatted_address: string;
  businessDescription: string;
}

export interface DaySchedule {
  enabled: boolean;
  openTime: string;
  closeTime: string;
}

export interface CustomSchedule {
  [key: string]: DaySchedule;
}

export interface OnboardingState {
  step: number;
  businessName: string;
  businessAddress: string;
  businessDetails: BusinessDetails | null;
  callHandling?: string[];
  callSchedule?: string;
  customSchedule?: CustomSchedule;
  plan: 'starter' | 'pro' | null;
  category: string | null;
  answers: Record<number, string>;
  email: string;
  password: string;
}

export interface StepProps {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  handleNext: () => void;
  handleBack: () => void;
}

export const categories: Category[] = [
  {
    id: "restaurants",
    label: "Restaurants & Food",
    description: "Dining, cafes, bars, and service",
    questions: [
      "Is your restaurant vegetarian, non-vegetarian, or both? What cuisines do you specialize in?",
      "Do you offer specials like discounts, live music, big screen, outdoor seating, or happy hours?",
      "What type of establishment are you (cafe, casual, fine dining, bar)? Do you serve alcohol?",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare & Medical",
    description: "Clinics, dental, urgent care",
    questions: [
      "What type of practice (general, dental, specialty, urgent care) and primary services?",
      "Do you accept insurance, offer payment plans, and what are after-hours procedures?",
      "Do you need confirmations, prescription refills, or telehealth support?",
    ],
  },
  {
    id: "legal",
    label: "Legal & Law Firms",
    description: "Intake, scheduling, confidential",
    questions: [
      "What areas of law (injury, family, criminal, corporate)? Any emergency cases?",
      "Do you offer free consults, payment plans, or contingency fees?",
      "What is your intake process? Need document collection or case management support?",
    ],
  },
  {
    id: "real_estate",
    label: "Real Estate",
    description: "Leads, showings, inquiries",
    questions: [
      "Residential, commercial, or rentals? What areas do you serve?",
      "Services: buying, selling, property management, investments?",
      "Need lead qualification, showings, or follow-ups?",
    ],
  },
  {
    id: "automotive",
    label: "Automotive Services",
    description: "Repair shops and dealerships",
    questions: [
      "What services (repairs, maintenance, inspections, sales)? Specialize in types/brands?",
      "Do you offer emergency services, towing, rentals, or warranty work?",
      "Typical appointment duration? Provide estimates or parts ordering?",
    ],
  },
  {
    id: "fitness",
    label: "Fitness & Wellness",
    description: "Gyms, yoga, personal training",
    questions: [
      "What type (gym, yoga, PT, dance) and what classes/services?",
      "Membership packages, PT, groups, or programs (seniors/beginners)?",
      "Peak hours, cancellation policies, equipment rentals or nutrition counseling?",
    ],
  },
  {
    id: "others",
    label: "Other Business",
    description: "Retail, consulting, services",
    questions: [
      "What type of business and primary products/services customers ask about?",
      "Most popular products/services and pricing ranges? Any packages or promotions?",
      "What info do callers usually want (availability, delivery, rates, service areas, fees, booking)?",
    ],
  },
];
