-- Universal AI Assistant: Food Tracking & Photo Archive
-- Extends the app to support food logging, nutrition tracking, and universal photo storage

-- Food & Nutrition Tracking
CREATE TABLE food_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  logged_at TIMESTAMPTZ DEFAULT NOW(),

  -- Meal Info
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
  description TEXT NOT NULL,
  photo_url TEXT,

  -- Nutrition (AI estimated or user provided)
  calories INTEGER,
  protein_g DECIMAL(5,1),
  carbs_g DECIMAL(5,1),
  fat_g DECIMAL(5,1),
  fiber_g DECIMAL(5,1),
  sugar_g DECIMAL(5,1),
  sodium_mg INTEGER,

  -- Metadata
  confidence DECIMAL(3,2), -- AI estimation confidence (0-1)
  estimation_source TEXT DEFAULT 'ai', -- ai, user, database, label
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 10),

  -- Context
  emotional_state TEXT, -- hungry, stressed, bored, celebrating, neutral
  location TEXT,
  with_others BOOLEAN DEFAULT FALSE,
  notes TEXT,

  -- User feedback
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  was_planned BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo Archive (universal photo storage and analysis)
CREATE TABLE photo_archive (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Storage
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size_kb INTEGER,

  -- Classification
  photo_type TEXT CHECK (photo_type IN (
    'meal', 'receipt', 'body', 'posture', 'exercise',
    'product', 'screenshot', 'document', 'other'
  )),

  -- AI Analysis Results
  analysis_results JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  searchable_text TEXT, -- extracted text from OCR
  confidence_score DECIMAL(3,2),

  -- Relationships
  related_log_type TEXT, -- food_logs, spending_logs, exercise_sessions, etc.
  related_log_id UUID, -- FK to related log entry

  -- User actions
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- General Activity Logs (anything not covered by existing tables)
CREATE TABLE activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  logged_at TIMESTAMPTZ DEFAULT NOW(),

  -- Activity Details
  activity_type TEXT NOT NULL, -- work, social, hobby, transport, meditation, reading, etc.
  description TEXT NOT NULL,
  duration_minutes INTEGER,

  -- Location & Social
  location TEXT,
  people_involved TEXT[],

  -- State Tracking
  mood_before TEXT,
  mood_after TEXT,
  energy_before INTEGER CHECK (energy_before >= 0 AND energy_before <= 10),
  energy_after INTEGER CHECK (energy_after >= 0 AND energy_after <= 10),
  stress_level INTEGER CHECK (stress_level >= 0 AND stress_level <= 10),

  -- Context
  was_productive BOOLEAN,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nutrition Goals (daily/weekly targets)
CREATE TABLE nutrition_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Daily Targets
  daily_calories_target INTEGER,
  daily_protein_target_g DECIMAL(5,1),
  daily_carbs_target_g DECIMAL(5,1),
  daily_fat_target_g DECIMAL(5,1),
  daily_fiber_target_g DECIMAL(5,1),
  daily_water_target_ml INTEGER DEFAULT 2000,

  -- Dietary Preferences
  dietary_restrictions TEXT[], -- vegetarian, vegan, gluten-free, dairy-free, etc.
  allergies TEXT[],
  disliked_foods TEXT[],
  favorite_meals TEXT[],

  -- Meal Planning
  meals_per_day INTEGER DEFAULT 3,
  snacks_per_day INTEGER DEFAULT 2,
  typical_meal_times JSONB DEFAULT '{}', -- {"breakfast": "07:00", "lunch": "12:00", "dinner": "18:00"}

  -- Goals
  goal_type TEXT CHECK (goal_type IN ('maintain', 'lose_weight', 'gain_weight', 'muscle_gain', 'health')),
  target_weight_lbs DECIMAL(5,1),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Nutrition Summary (aggregated view)
CREATE TABLE daily_nutrition_summary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  summary_date DATE UNIQUE NOT NULL,

  -- Totals
  total_calories INTEGER DEFAULT 0,
  total_protein_g DECIMAL(5,1) DEFAULT 0,
  total_carbs_g DECIMAL(5,1) DEFAULT 0,
  total_fat_g DECIMAL(5,1) DEFAULT 0,
  total_fiber_g DECIMAL(5,1) DEFAULT 0,

  -- Meals logged
  meals_logged INTEGER DEFAULT 0,
  breakfast_logged BOOLEAN DEFAULT FALSE,
  lunch_logged BOOLEAN DEFAULT FALSE,
  dinner_logged BOOLEAN DEFAULT FALSE,
  snacks_count INTEGER DEFAULT 0,

  -- Progress
  calories_goal_met BOOLEAN DEFAULT FALSE,
  protein_goal_met BOOLEAN DEFAULT FALSE,
  healthy_eating_score INTEGER CHECK (healthy_eating_score >= 0 AND healthy_eating_score <= 10),

  -- Insights
  meal_variety_score DECIMAL(3,2), -- 0-1, based on food diversity
  processed_food_count INTEGER DEFAULT 0,
  home_cooked_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_food_logs_date ON food_logs(logged_at DESC);
CREATE INDEX idx_food_logs_meal_type ON food_logs(meal_type);
CREATE INDEX idx_photo_archive_type ON photo_archive(photo_type);
CREATE INDEX idx_photo_archive_date ON photo_archive(uploaded_at DESC);
CREATE INDEX idx_photo_archive_related ON photo_archive(related_log_type, related_log_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(logged_at DESC);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX idx_daily_nutrition_date ON daily_nutrition_summary(summary_date DESC);

-- Full-text search on photo archive
CREATE INDEX idx_photo_archive_searchable ON photo_archive USING gin(to_tsvector('english', searchable_text));

-- Enable Row Level Security
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for personal use)
CREATE POLICY "Allow all on food_logs" ON food_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on photo_archive" ON photo_archive
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on activity_logs" ON activity_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on nutrition_goals" ON nutrition_goals
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on daily_nutrition_summary" ON daily_nutrition_summary
  FOR ALL USING (true) WITH CHECK (true);

-- Update triggers
CREATE TRIGGER update_food_logs_updated_at BEFORE UPDATE ON food_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_goals_updated_at BEFORE UPDATE ON nutrition_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update daily nutrition summary
CREATE OR REPLACE FUNCTION update_daily_nutrition_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update daily summary
  INSERT INTO daily_nutrition_summary (
    summary_date,
    total_calories,
    total_protein_g,
    total_carbs_g,
    total_fat_g,
    total_fiber_g,
    meals_logged,
    breakfast_logged,
    lunch_logged,
    dinner_logged,
    snacks_count
  )
  SELECT
    DATE(logged_at),
    SUM(calories),
    SUM(protein_g),
    SUM(carbs_g),
    SUM(fat_g),
    SUM(fiber_g),
    COUNT(*),
    BOOL_OR(meal_type = 'breakfast'),
    BOOL_OR(meal_type = 'lunch'),
    BOOL_OR(meal_type = 'dinner'),
    COUNT(*) FILTER (WHERE meal_type = 'snack')
  FROM food_logs
  WHERE DATE(logged_at) = DATE(NEW.logged_at)
  GROUP BY DATE(logged_at)
  ON CONFLICT (summary_date) DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g = EXCLUDED.total_carbs_g,
    total_fat_g = EXCLUDED.total_fat_g,
    total_fiber_g = EXCLUDED.total_fiber_g,
    meals_logged = EXCLUDED.meals_logged,
    breakfast_logged = EXCLUDED.breakfast_logged,
    lunch_logged = EXCLUDED.lunch_logged,
    dinner_logged = EXCLUDED.dinner_logged,
    snacks_count = EXCLUDED.snacks_count;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update daily nutrition summary when food is logged
CREATE TRIGGER update_nutrition_summary_on_food_log
AFTER INSERT OR UPDATE OR DELETE ON food_logs
FOR EACH ROW EXECUTE FUNCTION update_daily_nutrition_summary();

-- Sample nutrition goal (can be customized by user)
INSERT INTO nutrition_goals (
  daily_calories_target,
  daily_protein_target_g,
  daily_carbs_target_g,
  daily_fat_target_g,
  daily_fiber_target_g,
  goal_type
) VALUES (
  2000,
  150,
  200,
  65,
  25,
  'maintain'
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE food_logs IS 'Food and nutrition tracking with AI estimation';
COMMENT ON TABLE photo_archive IS 'Universal photo storage with AI analysis results';
COMMENT ON TABLE activity_logs IS 'General life activity tracking';
COMMENT ON TABLE nutrition_goals IS 'Daily nutrition targets and dietary preferences';
COMMENT ON TABLE daily_nutrition_summary IS 'Aggregated daily nutrition data';