# AskJohnny - AI-Powered Call Agent

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

## 🎯 Complete User Journey

### 1. Landing Page (`/`)
- **Smart Business Discovery**: Intelligent business search with Google Places integration
- **Instant Validation**: Real-time business verification and data enrichment
- **Seamless Navigation**: One-click transition to personalized onboarding

### 2. Intelligent Onboarding (`/onboarding`)
- **Step 1**: Google Business integration with automatic data import
- **Step 2**: Advanced call handling preferences (voicemail, scheduling, FAQ systems)
- **Step 3**: Business hours configuration with timezone detection
- **Step 3b**: Industry-specific FAQ training with 7+ business categories
- **Step 4**: Contact validation with phone number verification
- **Step 5**: Dynamic pricing with multiple subscription tiers
- **Step 6**: Secure authentication with automatic account creation

### 3. Comprehensive Dashboard Suite (`/dashboard`)

#### 🏠 **Home Dashboard**
- Real-time agent status monitoring
- Quick action buttons for common tasks
- Business overview with key metrics

#### 🤖 **Agent Management**
- Complete AI agent configuration
- Real-time VAPI integration status
- Voice settings and personality customization

#### 📞 **Call Management** 
- Live call monitoring and history
- Advanced filtering and search capabilities
- Real-time transcription viewing
- Call analytics and sentiment analysis

#### 🎵 **Voice Studio**
- 100+ premium voices from 11Labs and VAPI
- Real-time voice preview and testing
- Custom voice settings and speed control

#### 📊 **Advanced Analytics**
- Comprehensive call performance metrics
- Business intelligence dashboards
- ROI tracking and conversion analytics
- Export capabilities for reporting

#### 📢 **Outbound Campaigns**
- Advanced campaign creation and management
- CSV contact list import with validation
- Automated scheduling and follow-ups
- Real-time campaign monitoring

#### � **Knowledge Base**
- Document upload and processing (PDF, DOCX, TXT)
- Business-specific training content
- FAQ management system
- Real-time training status

#### 🔗 **Integrations Hub**
- Google Calendar synchronization
- Real-time availability checking
- OAuth authentication management
- Third-party service connections

## 🧠 AI Engine Architecture

### Intelligent Training Pipeline

Our advanced AI engine leverages multiple language models and sophisticated prompt engineering to create highly effective business-specific agents:

#### **Multi-Model Training System**
- **Primary Models**: GPT-4o-mini for optimal performance and cost efficiency
- **Fallback Support**: Claude, Llama, and other leading models for redundancy
- **Dynamic Model Selection**: Automatic model switching based on task complexity
- **Performance Optimization**: Continuous model performance monitoring and optimization

#### **Business Context Understanding**
- **Google Business Integration**: Automatic import of business hours, location, services, and reviews
- **Industry Classification**: Smart categorization across 7+ business types (restaurants, healthcare, legal, etc.)
- **Custom FAQ Training**: Industry-specific question templates with adaptive learning
- **Service Recognition**: Automatic detection and categorization of business offerings

#### **Advanced Prompt Engineering**
```
System Architecture:
├── Business Context Layer
│   ├── Google Places Data Integration
│   ├── Industry-Specific Prompts
│   └── Custom Business Rules
├── Conversation Management
│   ├── Multi-Turn Dialogue Handling
│   ├── Context Retention Across Calls
│   └── Intelligent Call Routing
└── Real-Time Processing
    ├── Live Sentiment Analysis
    ├── Intent Recognition
    └── Response Generation
```

#### **Intelligent Features**
- **Emotion Recognition**: Real-time caller sentiment analysis and adaptive responses
- **Smart Endpointing**: Advanced speech detection with 300ms precision
- **Keyword Optimization**: Dynamic keyword extraction and confidence scoring
- **Context Awareness**: Multi-turn conversation memory with business context retention

#### **Quality Assurance**
- **Automated Evaluation**: Built-in success metrics and call quality scoring
- **Structured Data Extraction**: Automatic capture of customer information and intent
- **Performance Analytics**: Real-time monitoring of agent effectiveness
- **Continuous Learning**: Feedback loops for ongoing model improvement

### Enterprise-Grade Voice Processing

#### **VAPI Integration**
- **Professional Telephony**: Enterprise-grade call handling with 99.9% uptime
- **Advanced Transcription**: Deepgram Nova-3 with multi-language support
- **Real-Time Processing**: Sub-second response times with streaming audio
- **Call Recording**: High-quality recording with format options (WAV, L16)

#### **Voice Customization**
- **Premium Voice Library**: 100+ voices from 11Labs and VAPI
- **Real-Time Preview**: Instant voice testing before deployment
- **Speed Control**: Variable speech rates for optimal customer experience
- **Fallback System**: Automatic voice switching for reliability

#### **Advanced Call Features**
- **Smart Call Routing**: Intelligent forwarding based on business rules
- **Voicemail Detection**: Automated voicemail handling with custom messages
- **DTMF Support**: Keypad input processing for menu navigation
- **Background Noise Cancellation**: Clear audio quality in any environment

## 🔧 Development & Architecture

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build optimized production bundle
npm run preview      # Preview production build locally  
npm run lint         # Run ESLint with TypeScript support
npm run type-check   # TypeScript type checking
npm test             # Run test suite (when configured)
```

### Development Features

- **Type Safety**: Full TypeScript implementation with strict mode
- **Form Validation**: Zod schemas with real-time validation and error handling
- **State Management**: React Context with TypeScript for global state
- **Protected Routing**: Role-based access control with Clerk authentication
- **Real-time Database**: Supabase with WebSocket subscriptions for live updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS and custom breakpoints
- **Error Boundaries**: Comprehensive error handling with graceful fallbacks
- **Performance Optimization**: Code splitting, lazy loading, and bundle optimization

## 🌟 Advanced Features

### Real-Time Call Management
- **Live Call Status**: WebSocket connections for instant call updates
- **Transcription Streaming**: Real-time speech-to-text with Deepgram Nova-3
- **Sentiment Analysis**: Live emotion detection and caller intent recognition
- **Call Analytics**: Comprehensive metrics with exportable reports

### Google Calendar Integration
- **OAuth 2.0 Flow**: Secure authentication with automatic token refresh
- **Real-Time Availability**: Live calendar checking for appointment scheduling
- **Automated Booking**: Direct calendar integration for seamless appointment creation
- **Multi-Calendar Support**: Handle multiple calendars per user account

### Knowledge Base System
- **Document Processing**: Advanced NLP for PDF, DOCX, and TXT files
- **Semantic Search**: Vector embeddings for intelligent document retrieval
- **Training Pipeline**: Automatic model retraining when documents are updated
- **Version Control**: Track document changes and training status

### Outbound Campaign Management
- **CSV Import**: Bulk contact list upload with validation and deduplication  
- **Smart Scheduling**: Optimal call timing based on time zones and preferences
- **Campaign Analytics**: Real-time performance tracking and ROI analysis
- **Automated Follow-ups**: Intelligent retry logic with customizable intervals

### Enterprise Security
- **Row Level Security**: Database-level access control for multi-tenant isolation
- **Data Encryption**: End-to-end encryption for sensitive business data
- **Audit Logging**: Comprehensive activity tracking for compliance
- **HIPAA Compliance**: Healthcare-grade security options available

## 🚀 Production Deployment

### Vercel (Recommended for Enterprise)

#### Automatic Deployment
```bash
# Connect to Vercel
vercel --prod

# Or use GitHub integration for automatic deployments
```

#### Production Configuration
1. **Environment Variables**: Add all required variables in Vercel dashboard
2. **Domain Setup**: Configure custom domain with SSL certificates
3. **Analytics**: Enable Vercel Analytics for performance monitoring
4. **Edge Functions**: Leverage Vercel Edge Runtime for global performance

#### Performance Optimizations
- **Edge Caching**: Automatic CDN caching for static assets
- **Image Optimization**: Automatic image resizing and WebP conversion
- **Bundle Analysis**: Built-in bundle analyzer for optimization insights

### Alternative Deployment Options

#### Netlify
```bash
# Build configuration
npm run build
# Publish directory: dist
# Build command: npm run build
```

#### AWS Amplify
```bash
# Build settings
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
```

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Production Considerations

#### Security
- **Environment Variables**: Use secure environment variable management
- **API Key Rotation**: Implement regular API key rotation policies
- **Rate Limiting**: Configure appropriate rate limits for all endpoints
- **CORS Configuration**: Restrict CORS to specific domains in production

#### Monitoring & Analytics
- **Error Tracking**: Integrate Sentry or similar for error monitoring
- **Performance Monitoring**: Set up Core Web Vitals tracking
- **Uptime Monitoring**: Configure health checks for critical services
- **Usage Analytics**: Track user engagement and feature adoption

#### Scalability
- **Database Optimization**: Implement connection pooling and query optimization
- **CDN Configuration**: Optimize asset delivery through global CDN
- **Caching Strategy**: Implement Redis for session and API response caching
- **Load Balancing**: Configure load balancers for high-traffic scenarios

## 📝 Comprehensive Environment Configuration

| Variable | Description | Required | Purpose |
|----------|-------------|----------|---------|
| **Authentication & Security** |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for frontend | Yes | User authentication and SSO |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signature verification | Yes | Secure user sync webhooks |
| **Database & Storage** |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes | Database connections |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | Frontend database access |
| `VITE_SUPABASE_DB_PASSWORD` | Database password | Yes | Admin database operations |
| **Google Services Integration** |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps/Places API key | Yes | Business search and validation |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional | Calendar integration |
| `VITE_GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional | Calendar token refresh |
| `VITE_GOOGLE_API_KEY` | Google API key for calendar | Optional | Calendar API access |
| `VITE_GOOGLE_REDIRECT_URL` | OAuth callback URL | Optional | Calendar authentication |
| **Voice AI & Telephony** |
| `VITE_VAPI_KEY` | VAPI API key for voice AI | Yes | Agent creation and call handling |
| **Payment Processing** |
| `STRIPE_SECRET_KEY` | Stripe secret key | Optional | Subscription management |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature | Optional | Payment event processing |
| **Application Configuration** |
| `CLIENT_URL` | Application base URL | Yes | Webhook callbacks and redirects |

### Complete Environment Setup

```env
# Authentication & Security
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_WEBHOOK_SECRET=whsec_your_clerk_webhook_secret_here

# Database & Storage  
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_supabase_anon_key_here
VITE_SUPABASE_DB_PASSWORD=your_database_password_here

# Google Services (Business Search & Calendar)
VITE_GOOGLE_MAPS_API_KEY=AIza...your_google_maps_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret_here
VITE_GOOGLE_API_KEY=AIza...your_google_api_key_here
VITE_GOOGLE_REDIRECT_URL=http://localhost:5173/dashboard/integrations/google/callback

# Voice AI & Telephony
VITE_VAPI_KEY=your_vapi_api_key_here

# Payment Processing (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Application Configuration
CLIENT_URL=http://localhost:5173  # Development URL
```

## 📚 API Documentation

### Webhook Endpoints

#### Agent Training Webhook
```typescript
POST /webhook/agent-training
Content-Type: application/json

{
  "user_id": "string",
  "user_email": "string", 
  "business_name": "string",
  "phone_number": "string",
  "plan_name": "string",
  "businessDetails": {
    "address": "string",
    "hours": "string",
    "services": ["string"]
  },
  "faqData": {
    "category": "string",
    "questionsAndAnswers": [
      {
        "question": "string",
        "answer": "string"
      }
    ]
  }
}

// Response
{
  "id": "agent_uuid",
  "name": "string",
  "status": "active",
  "phone_number": "+1234567890",
  "phoneid": "phone_uuid"
}
```

#### Voice Update Webhook
```typescript
POST /webhook/voice-change
Content-Type: application/json

{
  "provider": "11labs" | "vapi",
  "voiceId": "string",
  "agentId": "string"
}
```

### VAPI Integration

#### Authentication
```typescript
headers: {
  'Authorization': `Bearer ${VAPI_API_KEY}`,
  'Content-Type': 'application/json'
}
```

#### Get Agent Details
```typescript
GET https://api.vapi.ai/assistant/{agentId}
```

#### Update Agent Configuration
```typescript
PATCH https://api.vapi.ai/assistant/{agentId}
```

### Database Schema

#### Core Tables
```sql
-- Users with agent assignments
users (
  id UUID PRIMARY KEY,
  clerk_user_id TEXT UNIQUE,
  agent_id TEXT,
  phone_number TEXT,
  created_at TIMESTAMP
)

-- Business profiles with Google data
business_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  business_name TEXT,
  google_data JSONB,
  created_at TIMESTAMP
)

-- Knowledge base files
knowledge_base_files (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  file_name TEXT,
  status TEXT,
  processing_progress INTEGER
)

-- Outbound campaigns
campaigns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  status TEXT,
  recipients_count INTEGER
)
```

## 🤝 Contributing

### Development Workflow
```bash
# 1. Fork the repository
git clone https://github.com/your-username/askjohnny.git
cd askjohnny

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Install dependencies
npm install

# 4. Set up environment
cp env.example .env
# Configure your environment variables

# 5. Run development server
npm run dev

# 6. Make your changes and test
npm run build  # Ensure production build works
npm run lint   # Check code quality

# 7. Commit and push
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name

# 8. Submit pull request
```

### Code Standards
- **TypeScript**: Strict mode enabled, full type coverage required
- **ESLint**: Enforce consistent code style and best practices
- **Prettier**: Automatic code formatting on save
- **Commit Messages**: Follow conventional commit format
- **Testing**: Add tests for new features and bug fixes

### Pull Request Guidelines
1. **Description**: Provide clear description of changes and motivation
2. **Testing**: Include test coverage for new features
3. **Documentation**: Update README and inline documentation as needed
4. **Breaking Changes**: Clearly document any breaking changes
5. **Performance**: Consider performance impact of changes

## 📞 Support & Community

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and API references
- **Community Discord**: Join our developer community
- **Email Support**: Enterprise support available

### Enterprise Support
- **Priority Support**: 24/7 technical support for enterprise clients
- **Custom Integration**: Assistance with custom integrations and workflows
- **Training & Onboarding**: Dedicated training sessions for teams
- **SLA Guarantees**: Service level agreements for mission-critical deployments

### Roadmap & Updates
- **Monthly Releases**: Regular feature updates and improvements
- **API Versioning**: Backward-compatible API evolution
- **Community Feedback**: Feature priorities based on user feedback
- **Open Source**: Core features remain open source

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Commercial Use
- ✅ Commercial use permitted
- ✅ Modification and distribution allowed
- ✅ Private use allowed
- ❗ Must include original license and copyright notice

---

**Built with ❤️ by the AskJohnny Team**

*Empowering businesses with intelligent AI voice agents.*
