-- Create posture_analyses table for AI vision tracking
CREATE TABLE IF NOT EXISTS posture_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis JSONB NOT NULL,
  rating INTEGER CHECK (rating >= 0 AND rating <= 10),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE posture_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own posture analyses"
  ON posture_analyses FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own posture analyses"
  ON posture_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own posture analyses"
  ON posture_analyses FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own posture analyses"
  ON posture_analyses FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create index for faster queries
CREATE INDEX idx_posture_analyses_user_created ON posture_analyses(user_id, created_at DESC);
CREATE INDEX idx_posture_analyses_rating ON posture_analyses(rating);