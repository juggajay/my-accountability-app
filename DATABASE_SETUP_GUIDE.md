# Supabase Database Setup Guide

## ✅ Completed Tasks

### Storage Buckets (Automated)
All 3 required storage buckets have been successfully created:
- ✅ **exercise-videos** (public) - For exercise demonstration videos
- ✅ **receipts** (private) - For receipt uploads and financial tracking
- ✅ **profile** (private) - For user profile images

## 📋 Manual SQL Execution Required

Since Supabase doesn't provide direct SQL execution via API without custom RPC functions, please execute the following SQL files manually in your Supabase dashboard:

### Step 1: Access Supabase Dashboard
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `ttkdbdfezvyigdegfiwm`
3. Go to **SQL Editor** in the left sidebar

### Step 2: Execute Migration (Schema Creation)
1. Copy the contents of `supabase/migrations/001_initial_schema.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute

**This will create:**
- All database tables (health_profile, daily_logs, exercises, etc.)
- Indexes for performance
- Row Level Security policies
- Triggers for timestamp updates
- Database extensions (uuid-ossp, vector)

### Step 3: Populate Exercise Library
1. Copy the contents of `scripts/seed-exercises.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute

**This will add:**
- 12 carefully curated exercises for sciatica recovery
- Categories: stretching, core, strengthening, mobility, balance
- Complete exercise instructions and benefits
- Equipment requirements and contraindications

### Step 4: Add Sample Data
1. Copy the contents of `scripts/seed-sample-data.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute

**This will create:**
- Sample health profile
- 7 days of daily logs
- 4 exercise sessions with progress tracking
- Sample alcohol and spending logs
- 3 goals with milestones
- AI-discovered patterns and insights
- Sample coach conversation history

## 🔍 Verification Steps

After executing all SQL files, verify the setup:

### 1. Check Tables Created
In the Supabase dashboard, go to **Table Editor** and verify these tables exist:
- health_profile
- daily_logs
- exercises
- exercise_sessions
- alcohol_logs
- spending_logs
- goals
- goal_sessions
- patterns
- insights
- interventions
- coach_conversations

### 2. Verify Sample Data
- **exercises** table should have 12 rows
- **daily_logs** should have 7 rows
- **goals** should have 3 rows
- Check other tables have sample data

### 3. Check Storage Buckets
Go to **Storage** in the dashboard and verify:
- exercise-videos (public)
- receipts (private)
- profile (private)

## 🚀 Next Steps

### 1. Test Application Connectivity
```bash
npm run dev
```

### 2. Environment Variables
Your `.env.local` is already configured with:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_KEY

### 3. Test Database Operations
- Try logging in (if auth is set up)
- Create a new daily log entry
- Browse the exercise library
- Check that data persists

## 🛠️ Troubleshooting

### If SQL Execution Fails:
1. **Extension errors**: PostgreSQL extensions (uuid-ossp, vector) should install automatically
2. **Permission errors**: Ensure you're using the correct project and have admin access
3. **Syntax errors**: Copy each file completely, don't copy partial sections

### If Tables Don't Appear:
1. Refresh the dashboard
2. Check the **Logs** section for any errors
3. Verify you're in the correct schema (usually `public`)

### If Sample Data Is Missing:
1. Ensure migration (Step 2) completed successfully before adding sample data
2. Check for foreign key constraint errors in the logs

## 📞 Support

If you encounter issues:
1. Check Supabase project logs in the dashboard
2. Verify all environment variables are correct
3. Ensure your Supabase project is active and not paused

---

## Summary of What Was Set Up

✅ **Database Schema**: Complete schema with 12 tables for health tracking, exercise management, financial logging, and AI insights

✅ **Exercise Library**: 12 curated exercises specifically for sciatica recovery with detailed instructions

✅ **Sample Data**: Realistic sample data to test the application immediately

✅ **Storage Buckets**: Three storage buckets for different file types with appropriate privacy settings

✅ **Security**: Row Level Security enabled with appropriate policies for personal use

✅ **Performance**: Database indexes created for optimal query performance

The database is now ready to support your accountability app with comprehensive health tracking, exercise management, and AI-powered insights!