# Quick Start Guide

Get your Personal Accountability & Wellness App running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- A Supabase account (free tier works!)
- An OpenAI API key

## Step 1: Environment Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project (free tier is fine)
   - Go to Settings → API
   - Copy `URL` and `anon public` key

3. Get your OpenAI API key:
   - Go to [platform.openai.com](https://platform.openai.com)
   - Navigate to API keys
   - Create a new secret key

4. Update `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_KEY=your-service-key-here
   OPENAI_API_KEY=sk-your-openai-key-here
   CRON_SECRET=any-random-string-here
   ```

## Step 2: Database Setup

1. In Supabase dashboard, go to SQL Editor

2. Copy the entire content of `supabase/migrations/001_initial_schema.sql`

3. Paste and run it in the SQL Editor

4. Go to Storage → Create 3 new buckets:
   - `exercise-videos` (public)
   - `receipts` (private)
   - `profile` (private)

That's it! Your database is ready. 🎉

## Step 3: Install & Run

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the dashboard! 🚀

## What You'll See

### Dashboard
- Premium gradient header
- Recovery score rings (will show 0% initially)
- Pain level and exercise streak metrics
- Welcome message (since no data yet)

### To Test It Out

The dashboard will show placeholder data initially. To see it in action:

1. **Add a daily log** (coming in Phase 2):
   - Will track your morning pain and energy
   - Updates recovery score

2. **Log an exercise** (coming in Phase 2):
   - Updates exercise streak
   - Tracks pain before/after

3. **Check insights** (coming in Phase 3):
   - AI will analyze patterns
   - Shows personalized recommendations

## Using Docker (Alternative)

If you prefer Docker:

```bash
# Build and start
npm run docker:up

# Stop
npm run docker:down
```

## Testing

Run the included Playwright tests:

```bash
# Run tests
npm run test

# Run with UI (recommended for first time)
npm run test:ui
```

## Common Issues

### "Cannot connect to database"
- Check your Supabase URL and keys in `.env.local`
- Make sure you ran the migration SQL
- Verify your Supabase project is active

### "OpenAI API error"
- Verify your API key starts with `sk-`
- Check you have credits in your OpenAI account
- OpenAI features won't work without valid key (dashboard will still work)

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

## Next Steps

### Phase 2: Add Tracking Features
1. Pain tracking module
2. Exercise player
3. Alcohol logging
4. Spending tracker

See `PROJECT_SUMMARY.md` for the full roadmap!

### Customize It
- Update colors in `app/globals.css`
- Modify components in `components/ui/`
- Add your own exercises to the database

### Deploy It
See `README.md` for Vercel deployment instructions.

## Need Help?

- 📖 Read the full [README.md](./README.md)
- 📋 Check [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- 🎯 Review the [PRD](../prd.md) for specifications

---

**You're all set! Happy building! 🎉**

The foundation is solid and ready for you to add the tracking features next.