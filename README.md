# AskJohnny - AI-Powered Call Agents

A modern, full-stack web application where customers can create their own AI-powered calling agent with a 6-step onboarding process.

## 🚀 Features

- **6-Step Onboarding Wizard**: Guided setup process for creating AI call agents
- **AI Model Training**: Webhook integration for training AI models with business data
- **Agent Management**: Unique agent ID assignment and status tracking
- **Modern UI**: Clean, minimal design inspired by Supabase
- **Authentication**: Secure user management with Clerk
- **Database**: PostgreSQL backend with Supabase
- **Form Validation**: React Hook Form with Zod schema validation
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Smooth animations with Framer Motion

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Backend | Supabase (PostgreSQL) |
| Authentication | Clerk |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Navigation | React Router DOM |
| Animation | Framer Motion |
| Deployment | Vercel / Netlify |

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── Onboarding/     # 6-step onboarding components
│   │   ├── Step1_Company.tsx
│   │   ├── Step2_CallHandling.tsx
│   │   ├── Step3_Schedule.tsx
│   │   ├── Step4_ContactInfo.tsx
│   │   ├── Step5_Pricing.tsx
│   │   └── Step6_Auth.tsx
│   └── Dashboard.tsx
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # External service configurations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx
└── main.tsx
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account

### 1. Clone and Install

```bash
git clone <repository-url>
cd AskJohnny
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Update `.env.local` with your actual credentials:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Maps API (for business search)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the following SQL to create the required tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  agent_id INTEGER, -- Agent ID received from webhook response
  agent_name TEXT, -- Agent name received from webhook response
  agent_status TEXT, -- Agent status received from webhook response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business profiles table
CREATE TABLE business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call preferences table
CREATE TABLE call_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  voicemail BOOLEAN DEFAULT false,
  scheduling BOOLEAN DEFAULT false,
  faq BOOLEAN DEFAULT false,
  schedule_type TEXT CHECK (schedule_type IN ('business_hours', '24_7', 'custom')),
  custom_schedule JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  plan_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified for Clerk authentication)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

CREATE POLICY "Users can view own business profiles" ON business_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own business profiles" ON business_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own business profiles" ON business_profiles FOR UPDATE USING (true);

CREATE POLICY "Users can view own call preferences" ON call_preferences FOR SELECT USING (true);
CREATE POLICY "Users can insert own call preferences" ON call_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own call preferences" ON call_preferences FOR UPDATE USING (true);

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_call_preferences_user_id ON call_preferences(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

### 4. Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
   - Maps JavaScript API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Copy your API key to the environment variables

### 5. Clerk Setup

1. Create a new Clerk application
2. Configure your authentication settings
3. Add your domain to allowed origins
4. Copy your publishable key to the environment variables

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your application.

## 🎯 User Flow

### 1. Landing Page (`/`)
- Minimal, centered layout with hero section
- Business name input with debounced navigation to onboarding

### 2. Onboarding Process (`/onboarding`)
- **Step 1**: Company selection via search
- **Step 2**: Call handling preferences (voicemail, scheduling, FAQ)
- **Step 3**: Schedule setup (business hours, 24/7, custom)
- **Step 4**: Contact information with validation
- **Step 5**: Pricing plan selection
- **Step 6**: Clerk authentication and data saving

### 3. Dashboard (`/dashboard`)
- Protected route requiring authentication
- Shows setup progress and user data
- AI model training initiation
- Agent ID display and status tracking
- Sidebar navigation for future features

## 🔧 Development

### Webhook Integration

The application integrates with an external AI training service via webhooks:

1. **Training Initiation**: Users can start AI model training from the dashboard
2. **Data Submission**: Business data is sent to the webhook endpoint
3. **Agent Creation**: The service responds with agent information including:
   - `id`: Unique agent identifier
   - `name`: Agent name
   - `status`: Current agent status
4. **Data Persistence**: Agent information is stored in Supabase and displayed on the dashboard

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Key Features

- **Form Validation**: Uses Zod schemas for type-safe validation
- **State Management**: React Context for onboarding state
- **Protected Routes**: Clerk integration for authentication
- **Database Integration**: Supabase for data persistence
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key for business search | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
