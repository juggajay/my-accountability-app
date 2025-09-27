# Personal Accountability & Wellness App

AI-powered accountability app to manage sciatica recovery, reduce alcohol consumption, improve financial discipline, and achieve personal goals. Built with Next.js 14, Supabase, and OpenAI GPT-4.

## 🎯 Features

- **Smart Pain Tracking**: Track sciatica pain with AI-powered exercise recommendations
- **AI Exercise Generation**: Personalized routines based on pain levels and progress
- **Pattern Recognition**: GPT-4 powered insight discovery across all behaviors
- **Alcohol Monitoring**: Track consumption with pattern analysis
- **Financial Tracking**: Control impulse spending with emotion and context logging
- **Goal Management**: Stay accountable with intelligent reminders
- **Predictive Interventions**: Proactive support before problems occur
- **Premium UI**: Inspired by Whoop, Oura, Headspace, and Strava

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS 4.0, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 API
- **State**: Zustand, TanStack Query
- **Charts**: Recharts, react-circular-progressbar
- **Forms**: React Hook Form + Zod
- **Testing**: Playwright
- **Deployment**: Docker, Vercel

## 📁 Project Structure

```
my-accountability-app/
├── app/                      # Next.js app router
│   ├── dashboard/            # Main dashboard
│   ├── exercises/            # Exercise module
│   ├── track/                # Tracking pages (pain, alcohol, spending, goals)
│   ├── insights/             # AI insights page
│   ├── coach/                # AI coach chat
│   └── api/                  # API routes & cron jobs
├── components/               
│   ├── ui/                   # Reusable UI components
│   ├── dashboard/            # Dashboard-specific components
│   ├── exercises/            # Exercise components
│   ├── tracking/             # Tracking components
│   ├── charts/               # Data visualization
│   └── ai/                   # AI-related components
├── lib/                      
│   ├── supabase/             # Supabase client & queries
│   ├── ai/                   # OpenAI integration
│   ├── utils.ts              # Utility functions
│   ├── constants.ts          # App constants
│   └── types.ts              # TypeScript types
├── hooks/                    # Custom React hooks
├── stores/                   # Zustand stores
└── supabase/
    └── migrations/           # Database migrations

```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- OpenAI API key
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my-accountability-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   OPENAI_API_KEY=your-openai-api-key
   CRON_SECRET=your-secure-secret
   ```

4. **Set up Supabase database**
   
   📖 **Detailed guide**: See `scripts/SUPABASE_SETUP_GUIDE.md`
   
   Quick steps:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the migration: `supabase/migrations/001_initial_schema.sql` in SQL Editor
   - Create storage buckets: `exercise-videos` (public), `receipts` (private), `profile` (private)
   - Optional: Seed exercises with `scripts/seed-exercises.sql`
   - Optional: Add sample data with `scripts/seed-sample-data.sql`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

### Using Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Run Playwright tests**
   ```bash
   docker-compose exec playwright npx playwright test
   ```

## 🧪 Testing

### Unit & Integration Tests
```bash
npm run test
```

### E2E Tests with Playwright
```bash
# Install browsers
npx playwright install

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test tests/dashboard.spec.ts
```

## 📊 Database Schema

The app uses 11 main tables:

- `health_profile` - User health information
- `daily_logs` - Daily pain, energy, mood tracking
- `exercises` - Exercise library
- `exercise_sessions` - Workout tracking
- `alcohol_logs` - Alcohol consumption tracking
- `spending_logs` - Financial tracking
- `goals` - Goal management
- `goal_sessions` - Work sessions on goals
- `patterns` - AI-discovered patterns
- `insights` - AI-generated insights
- `interventions` - Predictive interventions
- `coach_conversations` - AI coach chat history

See `supabase/migrations/001_initial_schema.sql` for complete schema.

## 🎨 Design System

### Color Palette

- **Primary**: Premium blue (#0ea5e9) - inspired by Oura
- **Success**: Soft green (#22c55e) - positive metrics
- **Warning**: Warm amber (#eab308) - moderate alerts
- **Danger**: Soft red (#ef4444) - urgent attention
- **Neutral**: Premium grays - UI elements

### Typography

- **Sans**: Inter var - body text
- **Display**: Cal Sans - headings
- **Mono**: JetBrains Mono - metrics & data

### Components

- **PremiumCard**: 4 variants (default, glass, gradient, metric)
- **MetricDisplay**: Data visualization with trends
- **ProgressRing**: Oura-style circular progress
- **Custom animations**: slide, fade, pulse, shimmer

## 🤖 AI Features

### Exercise Generation
Personalized routines based on:
- Current pain level
- Energy level
- Time available
- Recent exercise history

### Pattern Recognition
Analyzes correlations between:
- Exercise → Pain levels
- Alcohol → Sleep quality  
- Spending → Mood
- Time patterns (day/week)

### AI Coach
Conversational support with:
- Context-aware responses
- Pattern references
- Actionable recommendations
- Chat history

### Predictive Interventions
Proactive alerts for:
- Pain spike risk
- Alcohol excess patterns
- Exercise skip likelihood
- Impulse spending triggers

## 📈 Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup
- [x] Database schema
- [x] Core UI components
- [x] Dashboard page

### Phase 2: Core Tracking (In Progress)
- [ ] Pain tracking module
- [ ] Exercise player
- [ ] Alcohol logging
- [ ] Spending tracker
- [ ] Goal management

### Phase 3: AI Integration
- [ ] OpenAI setup
- [ ] Exercise generation
- [ ] Pattern analysis
- [ ] AI coach chat
- [ ] Predictive interventions

### Phase 4: Polish
- [ ] Charts & visualizations
- [ ] Animations
- [ ] PWA configuration
- [ ] Performance optimization

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Set up cron jobs** using `vercel.json`

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

```bash
docker build -t accountability-app .
docker run -p 3000:3000 accountability-app
```

## 💰 Cost Analysis

### Minimal Setup (~$5-10/month)
- Vercel: Free tier
- Supabase: Free tier
- OpenAI: ~$5-10/month

### Comfortable Setup (~$30-35/month)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- OpenAI: ~$5-10/month

## 📝 License

MIT

## 🙏 Acknowledgments

Design inspired by:
- **Whoop**: Data visualization
- **Oura**: Progress indicators
- **Headspace**: Animations
- **Strava**: Achievement focus

---

Built with ❤️ for personal accountability and wellness