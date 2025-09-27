-- Sample Data Seed Script
-- Run this to populate the database with sample data for testing

-- Create a sample health profile
INSERT INTO health_profile (
  pain_areas,
  pain_triggers,
  severity_baseline,
  condition_duration,
  medical_history,
  exercise_preferences
) VALUES (
  '{"lower_back": "L5-S1 disc", "left_leg": "sciatic nerve", "left_glute": "piriformis"}',
  ARRAY['sitting too long', 'lifting heavy objects', 'poor posture', 'stress'],
  6,
  '6 months',
  '{"previous_injuries": ["lower back strain 2 years ago"], "surgeries": [], "medications": ["ibuprofen as needed"]}',
  '{"preferred_time": "morning", "duration": 15, "environment": "home", "experience_level": "beginner"}'
);

-- Sample daily logs (last 7 days)
INSERT INTO daily_logs (log_date, morning_pain, morning_energy, morning_mood, evening_pain, sleep_quality, notes) VALUES
  (CURRENT_DATE - INTERVAL '6 days', 7, 5, 6, 6, 6, 'Woke up stiff, improved after stretching'),
  (CURRENT_DATE - INTERVAL '5 days', 6, 6, 7, 5, 7, 'Better morning, did exercises'),
  (CURRENT_DATE - INTERVAL '4 days', 5, 7, 8, 4, 8, 'Best day so far this week'),
  (CURRENT_DATE - INTERVAL '3 days', 6, 6, 7, 5, 7, 'Slept well, moderate pain'),
  (CURRENT_DATE - INTERVAL '2 days', 8, 4, 5, 7, 5, 'Sat too long at desk, pain increased'),
  (CURRENT_DATE - INTERVAL '1 days', 7, 5, 6, 6, 6, 'Recovery day, took it easy'),
  (CURRENT_DATE, 5, 7, 8, NULL, NULL, 'Good morning, feeling optimistic');

-- Sample exercise sessions
INSERT INTO exercise_sessions (
  performed_at,
  completed_exercises,
  total_duration_minutes,
  pain_before,
  pain_after,
  energy_before,
  energy_after,
  effectiveness_rating,
  notes
) VALUES
  (
    CURRENT_DATE - INTERVAL '5 days',
    '[{"name": "Cat-Cow Stretch", "duration": 60}, {"name": "Knee to Chest Stretch", "duration": 90}]',
    15,
    7,
    5,
    6,
    7,
    4,
    'Felt good, reduced stiffness'
  ),
  (
    CURRENT_DATE - INTERVAL '4 days',
    '[{"name": "Child''s Pose", "duration": 60}, {"name": "Pelvic Tilt", "duration": 60}, {"name": "Glute Bridge", "duration": 90}]',
    20,
    6,
    4,
    7,
    8,
    5,
    'Excellent session, pain relief'
  ),
  (
    CURRENT_DATE - INTERVAL '3 days',
    '[{"name": "Piriformis Stretch", "duration": 120}, {"name": "Bird Dog", "duration": 90}]',
    18,
    6,
    5,
    6,
    7,
    4,
    'Good progress'
  ),
  (
    CURRENT_DATE - INTERVAL '1 days',
    '[{"name": "Cat-Cow Stretch", "duration": 60}, {"name": "Child''s Pose", "duration": 60}]',
    10,
    7,
    6,
    5,
    6,
    3,
    'Light recovery session'
  );

-- Sample alcohol logs
INSERT INTO alcohol_logs (logged_at, drink_type, units, context, location, cost, notes) VALUES
  (CURRENT_DATE - INTERVAL '6 days' + INTERVAL '19 hours', 'beer', 1.0, 'social', 'Friend''s house', 5.00, 'One beer with dinner'),
  (CURRENT_DATE - INTERVAL '5 days' + INTERVAL '20 hours', 'wine', 1.5, 'stress', 'Home', 12.00, 'Long day at work'),
  (CURRENT_DATE - INTERVAL '2 days' + INTERVAL '19 hours', 'wine', 1.5, 'celebration', 'Restaurant', 15.00, 'Weekend celebration');

-- Sample spending logs
INSERT INTO spending_logs (
  logged_at,
  amount,
  category,
  description,
  was_planned,
  was_impulse,
  emotion,
  necessity_score,
  notes
) VALUES
  (CURRENT_DATE - INTERVAL '6 days' + INTERVAL '12 hours', 45.99, 'food', 'Grocery shopping', true, false, 'neutral', 5, 'Weekly groceries'),
  (CURRENT_DATE - INTERVAL '5 days' + INTERVAL '18 hours', 12.50, 'food', 'Coffee shop', false, true, 'stressed', 2, 'Impulse coffee and pastry'),
  (CURRENT_DATE - INTERVAL '4 days' + INTERVAL '14 hours', 89.99, 'shopping', 'New running shoes', true, false, 'happy', 4, 'Needed for exercise'),
  (CURRENT_DATE - INTERVAL '3 days' + INTERVAL '19 hours', 35.00, 'entertainment', 'Movie tickets', false, false, 'happy', 2, 'Weekend entertainment'),
  (CURRENT_DATE - INTERVAL '2 days' + INTERVAL '13 hours', 15.99, 'subscriptions', 'Streaming service', true, false, 'neutral', 3, 'Monthly subscription'),
  (CURRENT_DATE - INTERVAL '1 days' + INTERVAL '16 hours', 23.45, 'food', 'Takeout dinner', false, true, 'bored', 2, 'Too tired to cook');

-- Sample goals
INSERT INTO goals (
  title,
  description,
  category,
  target_date,
  priority,
  progress_percentage,
  milestones,
  success_metrics
) VALUES
  (
    'Reduce pain to manageable levels',
    'Get daily pain levels consistently below 5/10 through regular exercise and good habits',
    'health',
    CURRENT_DATE + INTERVAL '90 days',
    5,
    35,
    '[
      {"title": "Complete 30 consecutive days of exercises", "completed": false, "due_date": "2025-11-15"},
      {"title": "Achieve pain level below 5 for 7 consecutive days", "completed": false, "due_date": "2025-12-01"},
      {"title": "Build 15-minute daily exercise habit", "completed": true, "due_date": "2025-10-15"}
    ]',
    '{"target_pain_level": 4, "exercise_frequency": "daily", "current_pain_average": 6.2}'
  ),
  (
    'Limit alcohol to 2 drinks per week',
    'Reduce alcohol consumption for better sleep and pain management',
    'health',
    CURRENT_DATE + INTERVAL '60 days',
    4,
    50,
    '[
      {"title": "Track every drink for 30 days", "completed": true, "due_date": "2025-10-30"},
      {"title": "Identify triggers and patterns", "completed": true, "due_date": "2025-11-05"},
      {"title": "Maintain 2 drinks/week for 4 weeks", "completed": false, "due_date": "2025-12-15"}
    ]',
    '{"target_drinks_per_week": 2, "current_average": 3, "longest_streak": 12}'
  ),
  (
    'Reduce impulse spending by 50%',
    'Better financial discipline by tracking emotions and planning purchases',
    'finance',
    CURRENT_DATE + INTERVAL '120 days',
    3,
    25,
    '[
      {"title": "Track all purchases for 30 days", "completed": true, "due_date": "2025-10-30"},
      {"title": "Identify emotional triggers", "completed": false, "due_date": "2025-11-20"},
      {"title": "Implement 24-hour rule for non-essentials", "completed": false, "due_date": "2025-12-01"}
    ]',
    '{"baseline_impulse_spending": 150, "target_monthly": 75, "savings_goal": 900}'
  );

-- Sample goal sessions
INSERT INTO goal_sessions (
  goal_id,
  started_at,
  ended_at,
  duration_minutes,
  focus_quality,
  progress_made,
  notes
) VALUES
  (
    (SELECT id FROM goals WHERE title = 'Reduce pain to manageable levels' LIMIT 1),
    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '15 hours',
    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '15 hours 20 minutes',
    20,
    4,
    'Completed full exercise routine',
    'Felt good, less pain after session'
  );

-- Sample patterns (AI would discover these)
INSERT INTO patterns (
  pattern_type,
  category,
  title,
  description,
  confidence_score,
  impact_score,
  data,
  is_active
) VALUES
  (
    'correlation',
    'correlation',
    'Exercise timing and pain reduction',
    'Morning exercises result in 30% lower evening pain levels compared to days without exercise',
    0.85,
    8,
    '{"correlation": 0.72, "sample_size": 45, "pain_reduction_average": 2.1}',
    true
  ),
  (
    'trigger',
    'trigger',
    'Prolonged sitting increases pain',
    'Sitting for more than 2 hours without breaks correlates with 25% higher pain levels',
    0.78,
    7,
    '{"threshold_minutes": 120, "pain_increase_percentage": 25, "occurrences": 12}',
    true
  ),
  (
    'success',
    'success',
    'Consistent sleep improves recovery',
    'Sleep quality above 7/10 consistently leads to better morning energy and lower pain',
    0.82,
    9,
    '{"sleep_threshold": 7, "energy_improvement": 1.5, "pain_reduction": 1.2}',
    true
  );

-- Sample insights
INSERT INTO insights (
  insight_type,
  category,
  title,
  description,
  action_items,
  priority,
  related_patterns
) VALUES
  (
    'weekly_summary',
    'progress',
    'Great progress this week!',
    'Your pain levels have decreased by 20% compared to last week. Your exercise consistency is paying off!',
    '[
      {"action": "Continue daily exercises", "completed": false},
      {"action": "Try adding one new stretch", "completed": false}
    ]',
    'medium',
    ARRAY[(SELECT id FROM patterns WHERE title = 'Exercise timing and pain reduction' LIMIT 1)]
  ),
  (
    'pattern_alert',
    'warning',
    'Sitting duration needs attention',
    'We''ve noticed your pain increases on days when you sit for extended periods. Consider setting hourly movement reminders.',
    '[
      {"action": "Set up hourly movement reminders", "completed": false},
      {"action": "Try standing desk for 2 hours daily", "completed": false},
      {"action": "Do desk stretches every hour", "completed": false}
    ]',
    'high',
    ARRAY[(SELECT id FROM patterns WHERE title = 'Prolonged sitting increases pain' LIMIT 1)]
  );

-- Add some sample interventions (would be generated by AI)
INSERT INTO interventions (
  trigger_type,
  risk_score,
  intervention_text,
  alternative_action,
  delivery_method
) VALUES
  (
    'exercise_skip',
    0.75,
    'You haven''t exercised in 2 days. Your pain levels tend to increase when you skip your routine. Ready for a quick 10-minute session?',
    'Try a gentle 5-minute stretch instead',
    'in_app'
  );

-- Create some sample coach conversations
INSERT INTO coach_conversations (message_role, message_content, tokens_used) VALUES
  ('user', 'How can I reduce my morning stiffness?', 12),
  ('assistant', 'Morning stiffness is common with sciatica. Based on your data, I see you have the best results when you do gentle stretches within 30 minutes of waking up. Try the Cat-Cow stretch and Child''s Pose for 5 minutes before getting out of bed. Your data shows this reduces your pain by an average of 2 points. Would you like me to create a custom morning routine?', 78),
  ('user', 'Yes, that would be helpful', 6),
  ('assistant', 'Perfect! I''ve noticed you have the most energy between 7-8am and your pain is typically lowest then. I recommend a 10-minute routine: Start with Cat-Cow (1 min), then Knee to Chest stretches (3 min), Child''s Pose (2 min), and finish with gentle Pelvic Tilts (4 min). This combination has shown the best results for your specific pain patterns. Shall I save this as your default morning routine?', 92);

-- Add comments to document the sample data
COMMENT ON TABLE health_profile IS 'Contains sample health profile for testing';
COMMENT ON TABLE daily_logs IS 'Contains 7 days of sample daily tracking data';
COMMENT ON TABLE exercise_sessions IS 'Contains 4 sample exercise sessions';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Sample data seeded successfully!';
  RAISE NOTICE '📊 Created:';
  RAISE NOTICE '   - 1 health profile';
  RAISE NOTICE '   - 7 daily logs';
  RAISE NOTICE '   - 4 exercise sessions';
  RAISE NOTICE '   - 3 alcohol logs';
  RAISE NOTICE '   - 6 spending logs';
  RAISE NOTICE '   - 3 goals with milestones';
  RAISE NOTICE '   - 3 patterns';
  RAISE NOTICE '   - 2 insights';
  RAISE NOTICE '   - Sample coach conversation';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your dashboard should now show data!';
END $$;