# Onboarding Flow Structure

This directory contains the refactored onboarding flow, organized into modular components for better maintainability.

## File Structure

```
Onboarding/
├── index.ts                  # Export barrel for easy imports
├── types.ts                  # Shared TypeScript interfaces and data
├── SharedComponents.tsx      # Reusable components (Sidebar, StepHeader, ContentContainer)
├── StepOne.tsx              # Business Search Step
├── StepOneB.tsx             # Voice Demo Preview Step (NEW)
├── StepTwo.tsx              # Plan Selection Step
├── StepThree.tsx            # AI Knowledge Setup Step
└── StepFour.tsx             # Account Creation Step
```

## Components

### types.ts
Contains all shared TypeScript interfaces and data:
- `Category` - Industry category interface
- `SearchResult` - Business search result interface
- `OnboardingState` - Main state interface
- `StepProps` - Props passed to each step component
- `categories` - Array of available industry categories

### SharedComponents.tsx
Reusable components used across steps:
- `Sidebar` - Left sidebar with progress indicator and live preview
- `StepHeader` - Header component for each step with title, subtitle, and back button
- `ContentContainer` - Wrapper component for consistent spacing and layout

### Step Components
Each step is a separate component that receives:
- `state` - Current onboarding state
- `setState` - Function to update state
- `handleNext` - Function to advance to next step
- `handleBack` - Function to go back to previous step

#### StepOne.tsx - Business Search
- Search input with live results
- Mock search functionality
- Business details preview card
- Auto-populated business information

#### StepOneB.tsx - Voice Demo Preview (NEW)
- Personalized voice demos with business name
- Interactive play/pause controls
- Visual waveform animations
- Two demo scenarios:
  - Welcome Message (10 seconds)
  - Business Information (15 seconds)
- Shows exactly how Johnny will sound to customers

#### StepTwo.tsx - Plan Selection
- Starter and Pro plan cards
- Interactive plan selection
- Auto-advance on selection (optional)

#### StepThree.tsx - AI Knowledge Setup
- Industry category selection grid
- Dynamic question form based on selected category
- Textarea inputs for detailed responses

#### StepFour.tsx - Account Creation
- Benefits showcase (desktop only)
- Email and password form
- Terms and privacy policy acceptance

## Usage

Import the main component from the parent directory:

```tsx
import newOnboarding from './pages/newOnboarding';
```

Or import individual components:

```tsx
import { StepOne, StepTwo, Sidebar } from './pages/Onboarding';
```

## State Management

The main `newOnboarding.tsx` file manages:
- Overall onboarding state
- Step navigation (next/back)
- State propagation to child components

Each step component is responsible for:
- Rendering its specific UI
- Updating relevant state properties
- Calling navigation functions when appropriate

## Benefits of This Structure

1. **Separation of Concerns** - Each step is isolated and easier to maintain
2. **Reusability** - Shared components can be used across steps
3. **Testability** - Individual steps can be tested in isolation
4. **Type Safety** - Centralized types ensure consistency
5. **Scalability** - Easy to add new steps or modify existing ones
6. **Code Navigation** - Clearer file structure makes finding code easier
