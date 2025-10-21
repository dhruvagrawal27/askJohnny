// src/types.ts

/** =========================
 * Onboarding (app-level shape)
 * ========================== */
export interface OnboardingData {
  step1: {
    businessName: string;
    businessDetails?: {
      name: string;
      address: string;
      phone: string;
      hours: string;
      placeId?: string;
      website?: string;
      rating?: number;
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
    };
  };
  step2: {
    voicemail: boolean;
    scheduling: boolean;
    faq: boolean;
  };
  step3: {
    scheduleType: "business_hours" | "24_7" | "custom";
    customSchedule?: any;
  };
  // New step inserted after schedule (UI step 4)
  // We store it as step3b to avoid renaming existing keys
  step3b: {
    categoryId: string; // e.g., "restaurants", "healthcare", etc.
    categoryLabel: string; // human-readable label
    answers: Record<string, string>; // question -> answer
  };
  step4: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    termsAccepted: boolean;
  };
  step5: {
    selectedPlan: string;
  };
  step6: {
    tempUserId?: string;
  };
}

/** =======================================
 * Onboarding (DB row JSON: *_data columns)
 * ======================================= */
export interface OnboardingJson {
  step1_data?: OnboardingData["step1"];
  step2_data?: OnboardingData["step2"];
  step3_data?: OnboardingData["step3"];
  step3b_data?: OnboardingData["step3b"];
  step4_data?: OnboardingData["step4"];
  step5_data?: OnboardingData["step5"];
  // step6 not persisted in your table, but keep optional for forward-compat
  step6_data?: OnboardingData["step6"];
}

/** =========================
 * Child tables (one-to-one)
 * ========================== */
export interface BusinessProfile {
  business_name?: string | null;
  address?: string | null;
  phone?: string | null;
  hours?: string | null;
  business_category?: string | null;
  category_answers?: any;
}

export interface Subscription {
  plan_name?: string | null;
  price?: number | null;
  start_date?: string | null; // ISO string from Supabase
}

export interface CallPreferences {
  voicemail?: boolean | null;
  scheduling?: boolean | null;
  faq?: boolean | null;
  schedule_type?: "business_hours" | "24_7" | "custom" | null;
  custom_schedule?: any;
}

/** =========================
 * Users table (joined view)
 * ========================== */
export interface UserData {
  // users
  email: string;
  agent_id?: number | null;
  agent_name?: string | null;
  agent_status?: string | null;
  phone_id?: string | null;
  phone_number?: string | null;

  // derived / convenience
  business_name: string;

  // joined one-to-one children (each may be null if not created yet)
  business_profile?: BusinessProfile | null;
  subscription?: Subscription | null;
  call_preferences?: CallPreferences | null;
  onboarding_data?: OnboardingJson | null;
}

/** =========================
 * Webhook agent response
 * ========================== */
export interface AgentResponse {
  id: number;
  name?: string;
  status?: string;
  // n8n may also return telephony:
  phone_id?: string;
  phone_number?: string;
}

/** =========================
 * UI helpers (unchanged)
 * ========================== */
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface CompanyOption {
  name: string;
  address: string;
  phone: string;
  hours: string;
}
