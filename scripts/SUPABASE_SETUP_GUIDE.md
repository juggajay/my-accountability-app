# Supabase Setup Guide

Complete guide to setting up your Supabase database for the Personal Accountability App.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `my-accountability-app`
   - Database password: (save this securely!)
   - Region: Choose closest to you
4. Click "Create new project" (takes ~2 minutes)

### Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_KEY=eyJxxx...  (⚠️ Keep this secret!)
   ```

### Step 3: Run Database Migration

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **+ New Query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. ✅ You should see: "Success. No rows returned"

### Step 4: Create Storage Buckets

1. Go to **Storage** in the sidebar
2. Click **New bucket**
3. Create these 3 buckets:

   **Bucket 1: exercise-videos**
   - Name: `exercise-videos`
   - Public: ✅ Yes
   - Click "Create bucket"

   **Bucket 2: receipts**
   - Name: `receipts`
   - Public: ❌ No
   - Click "Create bucket"

   **Bucket 3: profile**
   - Name: `profile`
   - Public: ❌ No
   - Click "Create bucket"

### Step 5: Seed Sample Data (Optional but Recommended)

This adds sample data so you can see the app in action immediately!

1. Go back to **SQL Editor**
2. Open the file `scripts/seed-exercises.sql`
3. Copy all contents and run it
4. Then open `scripts/seed-sample-data.sql`
5. Copy all contents and run it

✅ **Done!** Your database is ready.

---

## 📊 What Was Created

### Tables (11 total)
- `health_profile` - User health information
- `daily_logs` - Daily pain, energy, mood tracking
- `exercises` - Exercise library (13 exercises seeded)
- `exercise_sessions` - Workout history
- `alcohol_logs` - Alcohol consumption tracking
- `spending_logs` - Financial tracking
- `goals` - Goal management
- `goal_sessions` - Work sessions on goals
- `patterns` - AI-discovered patterns
- `insights` - AI-generated recommendations
- `interventions` - Predictive alerts
- `coach_conversations` - AI coach chat history

### Indexes
- 10 indexes for optimized queries
- Covering date ranges, categories, and priorities

### Security
- Row Level Security (RLS) enabled on sensitive tables
- Personal use policies (allow all authenticated requests)
- Service key for backend operations only

### Triggers
- Auto-update `updated_at` timestamps
- On: `health_profile`, `daily_logs`, `goals`

---

## 🧪 Testing Your Setup

### Method 1: Use the App
```bash
npm run dev
```
Open http://localhost:3000 and check the dashboard!

### Method 2: Query the Database

In Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- See sample data
SELECT * FROM daily_logs ORDER BY log_date DESC LIMIT 5;
SELECT * FROM exercises LIMIT 5;
SELECT * FROM goals;

-- Check storage buckets
SELECT * FROM storage.buckets;
```

---

## 🔧 Troubleshooting

### Problem: "relation does not exist"
**Solution:** You haven't run the migration yet. Go to SQL Editor and run `001_initial_schema.sql`.

### Problem: "JWT expired" or auth errors
**Solution:** Check your environment variables. Make sure you're using the correct `SUPABASE_URL` and keys.

### Problem: Can't upload files
**Solution:** Make sure storage buckets are created. Check spelling matches exactly:
- `exercise-videos`
- `receipts`
- `profile`

### Problem: RLS policy errors
**Solution:** The migration includes permissive policies for personal use. If you still have issues, check:
```sql
-- View RLS policies
SELECT * FROM pg_policies WHERE tablename IN (
  'daily_logs', 'exercise_sessions', 'alcohol_logs', 
  'spending_logs', 'goals', 'patterns', 'insights'
);
```

---

## 🎯 Next Steps

### 1. Verify Data Shows in App
- Dashboard should show recovery score rings
- Sample goals should appear
- Recent insights should be visible

### 2. Add Your Own Data
- Log your morning pain level
- Complete an exercise session
- Set a personal goal

### 3. Explore the Database
- Browse tables in Supabase Table Editor
- See real-time updates
- Check storage for uploaded files

---

## 📖 SQL Scripts Reference

### Core Scripts
- `001_initial_schema.sql` - Main database structure (REQUIRED)
- `seed-exercises.sql` - 13 sciatica exercises (RECOMMENDED)
- `seed-sample-data.sql` - Sample logs and goals (OPTIONAL)

### Running Order
1. ✅ `001_initial_schema.sql` (MUST run first)
2. ✅ `seed-exercises.sql` (adds exercises to library)
3. ✅ `seed-sample-data.sql` (adds test data)

---

## 🔐 Security Best Practices

### ✅ DO:
- Use environment variables for all keys
- Keep `SUPABASE_SERVICE_KEY` secret (never commit to git)
- Use RLS policies for production
- Regularly rotate your service key

### ❌ DON'T:
- Commit `.env.local` to version control
- Share your service key
- Disable RLS in production
- Use anon key for backend operations

---

## 🆘 Need Help?

### Supabase Resources
- 📖 [Supabase Docs](https://supabase.com/docs)
- 💬 [Discord Community](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)

### This Project
- Check `README.md` for app setup
- See `QUICK_START.md` for 5-minute guide
- Review `PROJECT_SUMMARY.md` for overview

---

## 📊 Database Schema Diagram

```
health_profile (1 row - your info)
    ↓
daily_logs (ongoing - pain, energy, mood)
    ↓
exercise_sessions → exercises (library)
    ↓
patterns ← (AI analyzes all data)
    ↓
insights → (recommendations)
    ↓
interventions (proactive alerts)

alcohol_logs (ongoing - drinks)
spending_logs (ongoing - finances)
goals → goal_sessions (work tracking)
coach_conversations (AI chat)
```

---

## ✅ Setup Checklist

- [ ] Supabase project created
- [ ] Environment variables in `.env.local`
- [ ] Main migration (`001_initial_schema.sql`) run
- [ ] 3 storage buckets created
- [ ] Exercise seed data loaded (optional)
- [ ] Sample data loaded (optional)
- [ ] App runs successfully (`npm run dev`)
- [ ] Dashboard shows data
- [ ] Can log new data

---

**🎉 You're all set! Your database is ready to track your accountability journey.**

For the next steps, see `DEVELOPMENT_CHECKLIST.md` to continue building Phase 2 features.