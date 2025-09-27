-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Health Profile (single row for personal use)
CREATE TABLE health_profile (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pain_areas JSONB DEFAULT '{}',
  pain_triggers TEXT[] DEFAULT '{}',
  severity_baseline INTEGER CHECK (severity_baseline >= 0 AND severity_baseline <= 10),
  condition_duration TEXT,
  medical_history JSONB DEFAULT '{}',
  exercise_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Logs
CREATE TABLE daily_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  log_date DATE UNIQUE NOT NULL,
  morning_pain INTEGER CHECK (morning_pain >= 0 AND morning_pain <= 10),
  morning_energy INTEGER CHECK (morning_energy >= 0 AND morning_energy <= 10),
  morning_mood INTEGER CHECK (morning_mood >= 0 AND morning_mood <= 10),
  evening_pain INTEGER CHECK (evening_pain >= 0 AND evening_pain <= 10),
  evening_reflection TEXT,
  sleep_quality INTEGER CHECK (sleep_quality >= 0 AND sleep_quality <= 10),
  notes TEXT,
  weather JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Library
CREATE TABLE exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  duration_seconds INTEGER,
  instructions TEXT[],
  benefits TEXT[],
  contraindications TEXT[],
  video_url TEXT,
  thumbnail_url TEXT,
  equipment_needed TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Sessions
CREATE TABLE exercise_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  planned_exercises JSONB DEFAULT '[]',
  completed_exercises JSONB DEFAULT '[]',
  total_duration_minutes INTEGER,
  pain_before INTEGER CHECK (pain_before >= 0 AND pain_before <= 10),
  pain_during INTEGER CHECK (pain_during >= 0 AND pain_during <= 10),
  pain_after INTEGER CHECK (pain_after >= 0 AND pain_after <= 10),
  energy_before INTEGER CHECK (energy_before >= 0 AND energy_before <= 10),
  energy_after INTEGER CHECK (energy_after >= 0 AND energy_after <= 10),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  notes TEXT,
  skipped_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alcohol Tracking
CREATE TABLE alcohol_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  drink_type TEXT NOT NULL,
  units DECIMAL(3,1),
  alcohol_percentage DECIMAL(3,1),
  volume_ml INTEGER,
  context TEXT CHECK (context IN ('social', 'stress', 'celebration', 'habit', 'other')),
  location TEXT,
  trigger TEXT,
  cost DECIMAL(10,2),
  notes TEXT,
  next_day_effects JSONB DEFAULT '{}'
);

-- Financial Tracking
CREATE TABLE spending_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  merchant TEXT,
  payment_method TEXT,
  was_planned BOOLEAN DEFAULT FALSE,
  was_impulse BOOLEAN DEFAULT FALSE,
  emotion TEXT CHECK (emotion IN ('happy', 'sad', 'stressed', 'bored', 'anxious', 'neutral', 'other')),
  necessity_score INTEGER CHECK (necessity_score >= 1 AND necessity_score <= 5),
  receipt_url TEXT,
  notes TEXT
);

-- Goals Management
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('health', 'career', 'personal', 'finance', 'learning', 'other')),
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  milestones JSONB DEFAULT '[]',
  success_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal Work Sessions
CREATE TABLE goal_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  focus_quality INTEGER CHECK (focus_quality >= 1 AND focus_quality <= 5),
  progress_made TEXT,
  blockers TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patterns & Insights (AI-discovered)
CREATE TABLE patterns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pattern_type TEXT NOT NULL,
  category TEXT CHECK (category IN ('correlation', 'trigger', 'success', 'warning', 'prediction')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
  data JSONB DEFAULT '{}',
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  user_feedback TEXT CHECK (user_feedback IN ('helpful', 'not_helpful', 'neutral'))
);

-- AI Insights & Recommendations
CREATE TABLE insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  insight_type TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_items JSONB DEFAULT '[]',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  related_patterns UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  was_helpful BOOLEAN,
  resulted_in_action BOOLEAN
);

-- Interventions (Predictive AI actions)
CREATE TABLE interventions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trigger_type TEXT NOT NULL,
  risk_score DECIMAL(3,2) CHECK (risk_score >= 0 AND risk_score <= 1),
  intervention_text TEXT NOT NULL,
  alternative_action TEXT,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_method TEXT CHECK (delivery_method IN ('notification', 'in_app', 'email', 'sms')),
  user_response TEXT CHECK (user_response IN ('accepted', 'dismissed', 'snoozed', 'ignored')),
  response_time_seconds INTEGER,
  was_effective BOOLEAN,
  outcome_notes TEXT
);

-- Chat History with AI Coach
CREATE TABLE coach_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_role TEXT CHECK (message_role IN ('user', 'assistant', 'system')),
  message_content TEXT NOT NULL,
  message_metadata JSONB DEFAULT '{}',
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_daily_logs_date ON daily_logs(log_date DESC);
CREATE INDEX idx_exercise_sessions_date ON exercise_sessions(performed_at DESC);
CREATE INDEX idx_alcohol_logs_date ON alcohol_logs(logged_at DESC);
CREATE INDEX idx_spending_logs_date ON spending_logs(logged_at DESC);
CREATE INDEX idx_spending_logs_category ON spending_logs(category);
CREATE INDEX idx_goal_sessions_goal ON goal_sessions(goal_id);
CREATE INDEX idx_patterns_type ON patterns(pattern_type);
CREATE INDEX idx_patterns_active ON patterns(is_active);
CREATE INDEX idx_insights_priority ON insights(priority);
CREATE INDEX idx_insights_created ON insights(created_at DESC);

-- Enable Row Level Security (good practice even for personal use)
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alcohol_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create update trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_profile_updated_at BEFORE UPDATE ON health_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies (for personal use, allow all)
CREATE POLICY "Allow all for personal use on daily_logs" ON daily_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for personal use on exercise_sessions" ON exercise_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for personal use on alcohol_logs" ON alcohol_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for personal use on spending_logs" ON spending_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for personal use on goals" ON goals
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for personal use on patterns" ON patterns
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for personal use on insights" ON insights
  FOR ALL USING (true) WITH CHECK (true);