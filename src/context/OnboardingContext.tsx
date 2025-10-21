import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { OnboardingData } from "../types";

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  isLoading: boolean;
}

type OnboardingAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; payload: number }
  | {
      type: "UPDATE_STEP_DATA";
      payload: { step: keyof OnboardingData; data: any };
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

const initialState: OnboardingState = {
  currentStep: 1,
  data: {
    step1: {
      businessName: "",
      businessDetails: undefined,
    },
    step2: {
      voicemail: false,
      scheduling: false,
      faq: false,
    },
    step3: {
      scheduleType: "business_hours",
      customSchedule: undefined,
    },
    step3b: {
      categoryId: "",
      categoryLabel: "",
      answers: {},
    },
    step4: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      termsAccepted: false,
    },
    step5: {
      selectedPlan: "",
    },
    step6: {
      tempUserId: undefined,
    },
  },
  isLoading: false,
};

export const ONBOARDING_STORAGE_KEY = "askjohnny_onboarding_data";

const onboardingReducer = (
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState => {
  let newState: OnboardingState;
  switch (action.type) {
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 7),
      };
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };
    case "GO_TO_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };
    case "UPDATE_STEP_DATA":
      newState = {
        ...state,
        data: {
          ...state.data,
          [action.payload.step]: {
            ...(state.data[action.payload.step] || {}),
            ...action.payload.data,
          },
        },
      };
      // Save to localStorage
      localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify(newState.data)
      );
      return newState;
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "RESET":
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      return initialState;
    default:
      return state;
  }
};

interface OnboardingContextType {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  // Try to load from localStorage
  const storedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  const [state, dispatch] = useReducer(
    onboardingReducer,
    storedData
      ? { ...initialState, data: JSON.parse(storedData) }
      : initialState
  );

  const nextStep = () => dispatch({ type: "NEXT_STEP" });
  const prevStep = () => dispatch({ type: "PREV_STEP" });
  const goToStep = (step: number) =>
    dispatch({ type: "GO_TO_STEP", payload: step });

  return (
    <OnboardingContext.Provider
      value={{ state, dispatch, nextStep, prevStep, goToStep }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
