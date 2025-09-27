-- Enhanced Vision Tracking Schema
-- Supports 9 photo types with detailed metrics and correlation tracking

-- Add photo_type enum
CREATE TYPE photo_type AS ENUM (
  'posture',
  'face',
  'left_eye',
  'right_eye',
  'side_profile',
  'back_view',
  'seated_posture',
  'hands',
  'forward_bend'
);

-- Enhance posture_analyses table
ALTER TABLE posture_analyses
ADD COLUMN IF NOT EXISTS photo_type photo_type DEFAULT 'posture',
ADD COLUMN IF NOT EXISTS detailed_metrics JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS raw_vision_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS health_scores JSONB DEFAULT '{}';

-- Create weekly_snapshots table for week-over-week tracking
CREATE TABLE IF NOT EXISTS weekly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  overall_health_score INTEGER CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
  posture_score INTEGER CHECK (posture_score >= 0 AND posture_score <= 100),
  inflammation_score INTEGER CHECK (inflammation_score >= 0 AND inflammation_score <= 100),
  emotional_wellness_score INTEGER CHECK (emotional_wellness_score >= 0 AND emotional_wellness_score <= 100),
  flexibility_score INTEGER CHECK (flexibility_score >= 0 AND flexibility_score <= 100),
  photo_analyses JSONB NOT NULL DEFAULT '{}',
  correlations JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Create health_correlations table for pattern tracking
CREATE TABLE IF NOT EXISTS health_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  correlation_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('none', 'mild', 'moderate', 'severe')),
  primary_issue TEXT NOT NULL,
  related_issues JSONB DEFAULT '[]',
  affected_areas JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for weekly_snapshots
ALTER TABLE weekly_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly snapshots"
  ON weekly_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly snapshots"
  ON weekly_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly snapshots"
  ON weekly_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly snapshots"
  ON weekly_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for health_correlations
ALTER TABLE health_correlations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health correlations"
  ON health_correlations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health correlations"
  ON health_correlations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health correlations"
  ON health_correlations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health correlations"
  ON health_correlations FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_posture_analyses_photo_type ON posture_analyses(photo_type);
CREATE INDEX idx_posture_analyses_user_photo_type ON posture_analyses(user_id, photo_type, created_at DESC);
CREATE INDEX idx_weekly_snapshots_user_date ON weekly_snapshots(user_id, week_start_date DESC);
CREATE INDEX idx_weekly_snapshots_scores ON weekly_snapshots(user_id, overall_health_score);
CREATE INDEX idx_health_correlations_user_type ON health_correlations(user_id, correlation_type, detected_at DESC);
CREATE INDEX idx_health_correlations_severity ON health_correlations(severity) WHERE resolved_at IS NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_posture_analyses_updated_at BEFORE UPDATE ON posture_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_snapshots_updated_at BEFORE UPDATE ON weekly_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_correlations_updated_at BEFORE UPDATE ON health_correlations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();