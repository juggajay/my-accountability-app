-- ============================================================================
-- AI-FIRST ACCOUNTABILITY APP - COMPLETE DATABASE MIGRATION
-- Run this script in your Supabase SQL Editor
-- ============================================================================

-- This migration includes all tables needed for the AI-first transformation:
-- 1. Food tracking and nutrition
-- 2. Photo archive for receipts and meals
-- 3. Activity logs
-- 4. Nutrition goals and daily summaries
-- All existing tables remain unchanged

-- ============================================================================
-- PHOTO ARCHIVE TABLE (Create first - referenced by food_logs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS photo_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('meal', 'receipt', 'exercise', 'posture', 'other')),
  photo_base64 TEXT,
  photo_url TEXT,
  analysis_result JSONB,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_photo_archive_user_type ON photo_archive(user_id, photo_type, created_at DESC);

-- Row Level Security
ALTER TABLE photo_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photos"
  ON photo_archive FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON photo_archive FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON photo_archive FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photo_archive FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FOOD LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein DECIMAL(10, 2) CHECK (protein >= 0),
  carbs DECIMAL(10, 2) CHECK (carbs >= 0),
  fat DECIMAL(10, 2) CHECK (fat >= 0),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  suggestions TEXT,
  confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  photo_id UUID REFERENCES photo_archive(id) ON DELETE SET NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type ON food_logs(meal_type);

-- Row Level Security
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food logs"
  ON food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON food_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ACTIVITY LOGS TABLE (General purpose activity tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  mood_before TEXT,
  mood_after TEXT,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  notes TEXT,
  metadata JSONB,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON activity_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);

-- Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity logs"
  ON activity_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity logs"
  ON activity_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NUTRITION GOALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calorie_goal INTEGER NOT NULL DEFAULT 2000 CHECK (daily_calorie_goal > 0),
  protein_goal DECIMAL(10, 2) NOT NULL DEFAULT 150 CHECK (protein_goal >= 0),
  carb_goal DECIMAL(10, 2) NOT NULL DEFAULT 200 CHECK (carb_goal >= 0),
  fat_goal DECIMAL(10, 2) NOT NULL DEFAULT 65 CHECK (fat_goal >= 0),
  water_goal INTEGER NOT NULL DEFAULT 8 CHECK (water_goal >= 0),
  dietary_preferences TEXT[],
  restrictions TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nutrition goals"
  ON nutrition_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition goals"
  ON nutrition_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition goals"
  ON nutrition_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition goals"
  ON nutrition_goals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- DAILY NUTRITION SUMMARY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_nutrition_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_protein DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_carbs DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_fat DECIMAL(10, 2) NOT NULL DEFAULT 0,
  meal_count INTEGER NOT NULL DEFAULT 0,
  water_intake INTEGER NOT NULL DEFAULT 0,
  average_health_score INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_date ON daily_nutrition_summary(user_id, date DESC);

-- Row Level Security
ALTER TABLE daily_nutrition_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nutrition summary"
  ON daily_nutrition_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition summary"
  ON daily_nutrition_summary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition summary"
  ON daily_nutrition_summary FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition summary"
  ON daily_nutrition_summary FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING DAILY NUTRITION SUMMARY
-- ============================================================================

-- Function to update daily nutrition summary when food is logged
CREATE OR REPLACE FUNCTION update_daily_nutrition_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_date DATE;
  v_user_id UUID;
BEGIN
  -- Extract date from logged_at timestamp
  v_date := DATE(COALESCE(NEW.logged_at, now()));
  v_user_id := NEW.user_id;

  -- Insert or update daily summary
  INSERT INTO daily_nutrition_summary (
    user_id,
    date,
    total_calories,
    total_protein,
    total_carbs,
    total_fat,
    meal_count,
    average_health_score,
    updated_at
  )
  SELECT
    v_user_id,
    v_date,
    COALESCE(SUM(calories), 0),
    COALESCE(SUM(protein), 0),
    COALESCE(SUM(carbs), 0),
    COALESCE(SUM(fat), 0),
    COUNT(*),
    ROUND(AVG(health_score)),
    now()
  FROM food_logs
  WHERE user_id = v_user_id
    AND DATE(logged_at) = v_date
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein = EXCLUDED.total_protein,
    total_carbs = EXCLUDED.total_carbs,
    total_fat = EXCLUDED.total_fat,
    meal_count = EXCLUDED.meal_count,
    average_health_score = EXCLUDED.average_health_score,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to food_logs table
DROP TRIGGER IF EXISTS trigger_update_daily_nutrition ON food_logs;
CREATE TRIGGER trigger_update_daily_nutrition
  AFTER INSERT OR UPDATE OR DELETE ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_nutrition_summary();

-- ============================================================================
-- SEED DEFAULT NUTRITION GOALS FOR EXISTING USERS
-- ============================================================================

-- Insert default nutrition goals for users who don't have them yet
INSERT INTO nutrition_goals (user_id, daily_calorie_goal, protein_goal, carb_goal, fat_goal, water_goal)
SELECT
  id,
  2000,
  150,
  200,
  65,
  8
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM nutrition_goals)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Database migration completed successfully!';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - photo_archive (universal photo storage)';
  RAISE NOTICE '  - food_logs (meal tracking with nutrition data)';
  RAISE NOTICE '  - activity_logs (general activity tracking)';
  RAISE NOTICE '  - nutrition_goals (user dietary targets)';
  RAISE NOTICE '  - daily_nutrition_summary (automated daily aggregation)';
  RAISE NOTICE '';
  RAISE NOTICE 'Your AI-first accountability app is ready!';
END $$;