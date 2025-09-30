-- Proactive AI System: Context Snapshots, Discovery, and Memory

-- User Profile Extension (AI learns about you through questions)
CREATE TABLE user_discovery_profile (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Personal Context
  personality_traits JSONB DEFAULT '{}', -- introverted/extroverted, morning/night person, etc.
  communication_style TEXT, -- direct, encouraging, scientific, casual
  motivation_type TEXT, -- accountability, encouragement, data-driven, fear-based
  stress_triggers TEXT[],
  success_celebrations TEXT[], -- how you like to be celebrated

  -- Preferences
  preferred_check_in_times TEXT[], -- ['morning', 'afternoon', 'evening']
  notification_preferences JSONB DEFAULT '{}',
  topics_of_interest TEXT[], -- what you want to talk about most
  topics_to_avoid TEXT[], -- things you don't want mentioned

  -- Goals & Values
  life_priorities JSONB DEFAULT '{}', -- what matters most to you
  why_using_app TEXT, -- your core motivation
  biggest_challenges TEXT[],
  past_attempts JSONB DEFAULT '{}', -- what you've tried before and why it failed

  -- AI Learning
  learning_stage TEXT DEFAULT 'discovery' CHECK (learning_stage IN ('discovery', 'active', 'established')),
  questions_asked INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  last_discovery_session TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Context Snapshots (AI analyzes your day automatically)
CREATE TABLE daily_context_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  snapshot_date DATE UNIQUE NOT NULL,

  -- Activity Summary
  pain_summary JSONB DEFAULT '{}', -- morning/evening averages, trends
  exercise_summary JSONB DEFAULT '{}', -- did exercise, duration, effectiveness
  alcohol_summary JSONB DEFAULT '{}', -- units consumed, context
  spending_summary JSONB DEFAULT '{}', -- total spent, impulse purchases
  goal_progress JSONB DEFAULT '{}', -- time spent on goals

  -- AI Analysis
  overall_sentiment TEXT CHECK (overall_sentiment IN ('struggling', 'neutral', 'progressing', 'thriving')),
  key_observations TEXT[], -- what the AI noticed
  anomalies TEXT[], -- things that were different than usual
  patterns_detected TEXT[], -- patterns emerging

  -- Proactive Insights
  suggested_conversation_topics TEXT[], -- things AI wants to ask about
  proactive_advice TEXT[], -- advice AI wants to offer
  celebration_worthy TEXT[], -- wins to celebrate
  concerns TEXT[], -- things to check in about

  -- Engagement
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 10),
  last_interaction TIMESTAMPTZ,

  -- AI Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by TEXT DEFAULT 'auto_analyzer',
  tokens_used INTEGER,
  analysis_version TEXT DEFAULT 'v1'
);

-- Conversational Memory (AI remembers key facts about you)
CREATE TABLE ai_memory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Memory Content
  memory_type TEXT CHECK (memory_type IN ('fact', 'preference', 'goal', 'trigger', 'success', 'concern', 'relationship', 'insight')),
  category TEXT, -- health, finance, personal, etc.
  key_fact TEXT NOT NULL, -- "User works from home", "Sitting triggers pain"
  context TEXT, -- additional context or story
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1), -- how sure AI is

  -- Importance & Usage
  importance INTEGER CHECK (importance >= 1 AND importance <= 10),
  last_referenced_at TIMESTAMPTZ,
  reference_count INTEGER DEFAULT 0,

  -- Source
  learned_from TEXT CHECK (learned_from IN ('conversation', 'onboarding', 'data_analysis', 'pattern_detection', 'user_correction')),
  source_conversation_id UUID REFERENCES coach_conversations(id) ON DELETE SET NULL,

  -- Lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- for temporary facts
  is_active BOOLEAN DEFAULT TRUE,

  -- Validation
  user_confirmed BOOLEAN,
  user_corrected_at TIMESTAMPTZ,
  superseded_by UUID REFERENCES ai_memory(id) ON DELETE SET NULL
);

-- Discovery Questions (AI asks these to learn about you)
CREATE TABLE discovery_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Question Content
  category TEXT NOT NULL, -- onboarding, deep_dive, clarification, follow_up
  topic TEXT NOT NULL, -- health, goals, preferences, triggers, etc.
  question_text TEXT NOT NULL,
  follow_up_prompts TEXT[], -- based on user answer

  -- Logic
  ask_when JSONB DEFAULT '{}', -- conditions for when to ask
  priority INTEGER CHECK (priority >= 1 AND priority <= 10),
  unlocks_questions UUID[], -- which questions this unlocks

  -- Tracking
  times_asked INTEGER DEFAULT 0,
  times_answered INTEGER DEFAULT 0,
  average_tokens_in_response INTEGER,
  typical_answers TEXT[], -- common patterns in answers

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discovery Sessions (tracks when AI asks questions)
CREATE TABLE discovery_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  session_type TEXT CHECK (session_type IN ('initial_onboarding', 'topic_deep_dive', 'pattern_clarification', 'goal_refinement')),
  topic TEXT,

  -- Session Data
  questions_asked UUID[], -- references to discovery_questions
  questions_answered UUID[],
  memories_created UUID[], -- references to ai_memory

  -- Quality
  completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  user_engagement INTEGER CHECK (user_engagement >= 1 AND user_engagement <= 5),
  insights_gained INTEGER DEFAULT 0,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER
);

-- Proactive Insights (AI-generated advice offered without asking)
CREATE TABLE proactive_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Insight Content
  insight_category TEXT CHECK (insight_category IN ('observation', 'suggestion', 'concern', 'celebration', 'question', 'pattern_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  detailed_reasoning TEXT, -- why AI is bringing this up

  -- Context
  triggered_by TEXT, -- what data/pattern triggered this
  related_context_snapshot UUID REFERENCES daily_context_snapshots(id) ON DELETE SET NULL,
  related_memories UUID[], -- references to ai_memory

  -- Delivery
  priority INTEGER CHECK (priority >= 1 AND priority <= 10),
  best_delivery_time TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_method TEXT CHECK (delivery_method IN ('dashboard_widget', 'conversation_starter', 'notification', 'weekly_summary')),

  -- User Response
  user_viewed_at TIMESTAMPTZ,
  user_engaged BOOLEAN DEFAULT FALSE,
  user_feedback TEXT CHECK (user_feedback IN ('helpful', 'not_helpful', 'neutral', 'annoying')),
  resulted_in_conversation BOOLEAN DEFAULT FALSE,
  conversation_id UUID REFERENCES coach_conversations(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_daily_context_date ON daily_context_snapshots(snapshot_date DESC);
CREATE INDEX idx_daily_context_sentiment ON daily_context_snapshots(overall_sentiment);
CREATE INDEX idx_ai_memory_type ON ai_memory(memory_type);
CREATE INDEX idx_ai_memory_active ON ai_memory(is_active);
CREATE INDEX idx_ai_memory_importance ON ai_memory(importance DESC);
CREATE INDEX idx_discovery_questions_priority ON discovery_questions(priority DESC);
CREATE INDEX idx_proactive_insights_delivered ON proactive_insights(delivered_at);
CREATE INDEX idx_proactive_insights_priority ON proactive_insights(priority DESC);

-- Enable Row Level Security
ALTER TABLE user_discovery_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for personal use)
CREATE POLICY "Allow all on user_discovery_profile" ON user_discovery_profile
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on daily_context_snapshots" ON daily_context_snapshots
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on ai_memory" ON ai_memory
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on discovery_questions" ON discovery_questions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on discovery_sessions" ON discovery_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on proactive_insights" ON proactive_insights
  FOR ALL USING (true) WITH CHECK (true);

-- Update triggers
CREATE TRIGGER update_user_discovery_profile_updated_at BEFORE UPDATE ON user_discovery_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_memory_updated_at BEFORE UPDATE ON ai_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial discovery questions
INSERT INTO discovery_questions (category, topic, question_text, priority, follow_up_prompts) VALUES
  -- Core Onboarding
  ('onboarding', 'motivation', 'What made you start using this app? What are you hoping to achieve?', 10,
   ARRAY['What have you tried before?', 'What would success look like for you?', 'What''s been the biggest obstacle so far?']),

  ('onboarding', 'communication', 'How do you prefer to receive feedback? Direct and data-driven, or more encouraging and supportive?', 9,
   ARRAY['Do you prefer daily check-ins or only when something important comes up?', 'Are there topics you''d rather not discuss?']),

  ('onboarding', 'personality', 'Are you a morning person or night owl? When do you have the most energy and focus?', 8,
   ARRAY['When do you usually exercise?', 'What time do you prefer to reflect on your day?']),

  -- Health Deep Dive
  ('deep_dive', 'health', 'Tell me about your pain - when did it start, and what makes it better or worse?', 10,
   ARRAY['Have you seen doctors about this?', 'What treatments have you tried?', 'How does it affect your daily life?']),

  ('deep_dive', 'health', 'What does a "good pain day" look like for you? What about a bad one?', 8,
   ARRAY['What do you do differently on good days?', 'Can you predict when bad days will happen?']),

  -- Goals & Values
  ('deep_dive', 'goals', 'Beyond reducing pain, what else do you want to improve in your life?', 7,
   ARRAY['Why is that important to you?', 'What would achieving that goal mean for you?', 'What''s stopping you right now?']),

  ('deep_dive', 'values', 'What matters most to you right now - health, career, relationships, financial security?', 7,
   ARRAY['How do your current habits align with those priorities?', 'What would you be willing to sacrifice for better health?']),

  -- Triggers & Patterns
  ('clarification', 'triggers', 'I noticed you logged alcohol with "stress" as the context. What specifically was stressful that day?', 6,
   ARRAY['How often does that type of stress happen?', 'What else helps you cope with that?', 'Do you see a pattern?']),

  ('clarification', 'spending', 'You marked that purchase as impulse. What were you feeling right before you bought it?', 5,
   ARRAY['Does that feeling come up often?', 'What could you do instead next time?']),

  -- Celebrations & Wins
  ('follow_up', 'success', 'You''ve exercised 5 days in a row - that''s amazing! How does it feel?', 6,
   ARRAY['What helped you stay consistent?', 'What''s different this time compared to past attempts?']),

  -- Concerns
  ('follow_up', 'concern', 'Your pain has been higher than usual this week. What''s going on?', 8,
   ARRAY['Did something change in your routine?', 'Are you feeling discouraged?', 'What do you need right now?']),

  -- Meta Questions (about the app itself)
  ('follow_up', 'meta', 'How is this app working for you so far? What do you wish it did differently?', 5,
   ARRAY['What features do you use most?', 'What feels tedious or annoying?', 'What would make this more valuable?']);

COMMENT ON TABLE user_discovery_profile IS 'AI learns about user through discovery questions';
COMMENT ON TABLE daily_context_snapshots IS 'Daily analysis of all user activity for proactive insights';
COMMENT ON TABLE ai_memory IS 'Key facts and preferences the AI remembers about the user';
COMMENT ON TABLE discovery_questions IS 'Questions the AI asks to learn about the user';
COMMENT ON TABLE discovery_sessions IS 'Tracks when AI asks discovery questions';
COMMENT ON TABLE proactive_insights IS 'AI-generated advice and observations offered without prompting';