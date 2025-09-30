-- Quick Setup Script for Proactive AI System
-- Run this to test the system with your existing data

-- 1. Create a user discovery profile (if it doesn't exist)
INSERT INTO user_discovery_profile (
  learning_stage,
  questions_asked,
  questions_answered
) VALUES (
  'discovery',
  0,
  0
)
ON CONFLICT DO NOTHING;

-- 2. Create sample AI memories (you can customize these based on what you know about yourself)
INSERT INTO ai_memory (memory_type, category, key_fact, context, confidence, importance, learned_from) VALUES
  ('fact', 'health', 'User has sciatica', 'Pain management is primary focus', 1.0, 10, 'onboarding'),
  ('preference', 'habits', 'Prefers morning exercises', 'Has more energy in the morning', 0.9, 7, 'data_analysis'),
  ('trigger', 'health', 'Prolonged sitting triggers pain', 'Works from home, sits at desk', 0.95, 9, 'pattern_detection'),
  ('goal', 'health', 'Wants to reduce pain below 5/10', 'Currently averaging 6-7/10', 1.0, 10, 'onboarding'),
  ('preference', 'communication', 'Appreciates data-driven feedback', 'Likes to see numbers and trends', 0.8, 6, 'conversation')
ON CONFLICT DO NOTHING;

-- 3. Helper function to increment memory reference count
CREATE OR REPLACE FUNCTION increment_memory_reference(memory_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ai_memory
  SET
    reference_count = reference_count + 1,
    last_referenced_at = NOW()
  WHERE id = memory_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Helper function to increment question asked count
CREATE OR REPLACE FUNCTION increment_question_asked(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE discovery_questions
  SET times_asked = times_asked + 1
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Generate a context snapshot for today (if you have data)
-- This will be done via the API, but here's a placeholder
DO $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Only insert if there's data for today
  IF EXISTS (
    SELECT 1 FROM daily_logs WHERE log_date = v_today
    UNION
    SELECT 1 FROM exercise_sessions WHERE DATE(performed_at) = v_today
    UNION
    SELECT 1 FROM alcohol_logs WHERE DATE(logged_at) = v_today
    UNION
    SELECT 1 FROM spending_logs WHERE DATE(logged_at) = v_today
  ) THEN
    INSERT INTO daily_context_snapshots (
      snapshot_date,
      overall_sentiment,
      key_observations,
      engagement_score,
      generated_by
    ) VALUES (
      v_today,
      'neutral',
      ARRAY['Manual setup - run API to generate full context'],
      5,
      'manual_setup'
    )
    ON CONFLICT (snapshot_date) DO NOTHING;

    RAISE NOTICE '✅ Created placeholder context snapshot for today';
  ELSE
    RAISE NOTICE '⚠️  No activity data for today yet - log some data first!';
  END IF;
END $$;

-- 6. View what was created
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '======================================';
  RAISE NOTICE 'PROACTIVE AI SYSTEM SETUP COMPLETE';
  RAISE NOTICE '======================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Discovery Profile:';
  RAISE NOTICE '  Stage: discovery (will evolve as AI learns)';
  RAISE NOTICE '';
  RAISE NOTICE 'AI Memories Created:';
  RAISE NOTICE '  - % memories about you', (SELECT COUNT(*) FROM ai_memory WHERE is_active = true);
  RAISE NOTICE '';
  RAISE NOTICE 'Discovery Questions Available:';
  RAISE NOTICE '  - % questions ready to ask', (SELECT COUNT(*) FROM discovery_questions);
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Generate today''s context:';
  RAISE NOTICE '     POST /api/ai/proactive { "action": "generate_context" }';
  RAISE NOTICE '';
  RAISE NOTICE '  2. Generate proactive insights:';
  RAISE NOTICE '     POST /api/ai/proactive { "action": "generate_insights" }';
  RAISE NOTICE '';
  RAISE NOTICE '  3. Check if AI wants to ask questions:';
  RAISE NOTICE '     POST /api/ai/proactive { "action": "check_discovery" }';
  RAISE NOTICE '';
  RAISE NOTICE '  4. Add ProactiveInsights widget to your dashboard';
  RAISE NOTICE '';
  RAISE NOTICE '  5. Chat with the AI coach - it now has context!';
  RAISE NOTICE '';
  RAISE NOTICE '📖 Full documentation: docs/PROACTIVE_AI_SYSTEM.md';
  RAISE NOTICE '';
END $$;

-- 7. Quick queries to check the system

-- View your AI memories
-- SELECT memory_type, category, key_fact, importance, confidence
-- FROM ai_memory
-- WHERE is_active = true
-- ORDER BY importance DESC, last_referenced_at DESC;

-- View available discovery questions
-- SELECT category, topic, question_text, priority
-- FROM discovery_questions
-- ORDER BY priority DESC
-- LIMIT 5;

-- View context snapshots
-- SELECT snapshot_date, overall_sentiment, key_observations, engagement_score
-- FROM daily_context_snapshots
-- ORDER BY snapshot_date DESC
-- LIMIT 7;