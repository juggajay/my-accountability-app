-- Seed Script: Sample Exercises for Sciatica Recovery
-- Run this in Supabase SQL Editor after running the main migration

-- Stretching Exercises
INSERT INTO exercises (name, category, difficulty, duration_seconds, instructions, benefits, contraindications, equipment_needed) VALUES
(
  'Cat-Cow Stretch',
  'stretching',
  1,
  60,
  ARRAY[
    'Start on your hands and knees in a tabletop position',
    'Arch your back up like a cat, tucking your chin to your chest',
    'Then drop your belly down, lifting your head and tailbone up like a cow',
    'Move slowly between positions, breathing deeply',
    'Repeat for 60 seconds'
  ],
  ARRAY[
    'Improves spinal flexibility',
    'Relieves tension in lower back',
    'Gentle warm-up for the spine',
    'Promotes better posture'
  ],
  ARRAY[
    'Skip if you have acute back injury',
    'Avoid if you have severe neck pain'
  ],
  ARRAY['Yoga mat']
),
(
  'Knee to Chest Stretch',
  'stretching',
  1,
  90,
  ARRAY[
    'Lie on your back with knees bent',
    'Bring one knee up to your chest',
    'Hold behind the thigh and gently pull',
    'Hold for 30 seconds',
    'Switch sides and repeat',
    'Do 3 reps per side'
  ],
  ARRAY[
    'Stretches lower back and glutes',
    'Reduces sciatic nerve pressure',
    'Easy to perform anywhere',
    'Immediate pain relief'
  ],
  ARRAY[
    'Stop if you feel sharp pain',
    'Don''t force the stretch'
  ],
  ARRAY['Yoga mat', 'Comfortable surface']
),
(
  'Piriformis Stretch',
  'stretching',
  2,
  120,
  ARRAY[
    'Lie on your back with both knees bent',
    'Cross your right ankle over your left knee',
    'Pull your left thigh toward your chest',
    'Hold for 30 seconds',
    'You should feel a stretch in your right glute',
    'Switch sides and repeat'
  ],
  ARRAY[
    'Directly targets piriformis muscle',
    'Relieves sciatic nerve compression',
    'Improves hip flexibility',
    'Reduces referred leg pain'
  ],
  ARRAY[
    'Avoid if you have hip replacement',
    'Stop if you feel numbness'
  ],
  ARRAY['Yoga mat']
),
(
  'Child''s Pose',
  'stretching',
  1,
  60,
  ARRAY[
    'Start on your hands and knees',
    'Sit back on your heels',
    'Extend your arms forward on the ground',
    'Rest your forehead on the mat',
    'Breathe deeply and hold for 60 seconds'
  ],
  ARRAY[
    'Gently stretches lower back',
    'Promotes relaxation',
    'Reduces stress and anxiety',
    'Safe restorative position'
  ],
  ARRAY[
    'Avoid if pregnant',
    'Skip if you have knee injuries'
  ],
  ARRAY['Yoga mat']
);

-- Core Strengthening
INSERT INTO exercises (name, category, difficulty, duration_seconds, instructions, benefits, contraindications, equipment_needed) VALUES
(
  'Pelvic Tilt',
  'core',
  1,
  60,
  ARRAY[
    'Lie on your back with knees bent',
    'Flatten your lower back against the floor',
    'Engage your core muscles',
    'Hold for 5 seconds',
    'Release and repeat for 60 seconds'
  ],
  ARRAY[
    'Strengthens core muscles',
    'Stabilizes lower back',
    'Improves pelvic alignment',
    'Foundation for other exercises'
  ],
  ARRAY[
    'Stop if you feel sharp pain'
  ],
  ARRAY['Yoga mat']
),
(
  'Bird Dog',
  'core',
  2,
  90,
  ARRAY[
    'Start on hands and knees',
    'Extend your right arm forward and left leg back',
    'Keep your back straight and core engaged',
    'Hold for 5 seconds',
    'Return to start and switch sides',
    'Alternate for 90 seconds'
  ],
  ARRAY[
    'Strengthens core and back',
    'Improves balance and coordination',
    'Stabilizes spine',
    'Prevents future injuries'
  ],
  ARRAY[
    'Avoid if you have severe balance issues',
    'Start with modifications if needed'
  ],
  ARRAY['Yoga mat']
),
(
  'Dead Bug',
  'core',
  2,
  90,
  ARRAY[
    'Lie on your back with arms up and knees bent at 90°',
    'Lower your right arm overhead and straighten left leg',
    'Keep your lower back pressed to the floor',
    'Return to start and switch sides',
    'Alternate for 90 seconds'
  ],
  ARRAY[
    'Core stability',
    'Coordination improvement',
    'Safe for lower back',
    'Progressive difficulty'
  ],
  ARRAY[
    'Stop if lower back arches',
    'Modify if needed'
  ],
  ARRAY['Yoga mat']
);

-- Strengthening
INSERT INTO exercises (name, category, difficulty, duration_seconds, instructions, benefits, contraindications, equipment_needed) VALUES
(
  'Glute Bridge',
  'strengthening',
  2,
  90,
  ARRAY[
    'Lie on your back with knees bent',
    'Press through your heels to lift hips',
    'Squeeze your glutes at the top',
    'Hold for 3 seconds',
    'Lower slowly and repeat',
    'Do 15 reps'
  ],
  ARRAY[
    'Strengthens glutes and hamstrings',
    'Stabilizes pelvis',
    'Reduces lower back strain',
    'Improves posture'
  ],
  ARRAY[
    'Avoid if you have severe back pain',
    'Don''t arch your back excessively'
  ],
  ARRAY['Yoga mat']
),
(
  'Clamshell',
  'strengthening',
  2,
  90,
  ARRAY[
    'Lie on your side with knees bent',
    'Keep feet together',
    'Lift your top knee while keeping feet touching',
    'Hold for 2 seconds',
    'Lower slowly',
    'Do 15 reps per side'
  ],
  ARRAY[
    'Strengthens hip abductors',
    'Stabilizes pelvis',
    'Reduces IT band issues',
    'Improves hip mobility'
  ],
  ARRAY[
    'Stop if you feel hip pain'
  ],
  ARRAY['Yoga mat']
);

-- Mobility
INSERT INTO exercises (name, category, difficulty, duration_seconds, instructions, benefits, contraindications, equipment_needed) VALUES
(
  'Hip Circles',
  'mobility',
  1,
  60,
  ARRAY[
    'Stand on one leg, holding onto a wall',
    'Lift your other knee to 90 degrees',
    'Make slow circles with your knee',
    'Do 10 circles each direction',
    'Switch legs'
  ],
  ARRAY[
    'Improves hip mobility',
    'Warms up hip joint',
    'Reduces stiffness',
    'Gentle and safe'
  ],
  ARRAY[
    'Hold onto support if needed',
    'Make circles smaller if uncomfortable'
  ],
  ARRAY['Wall or chair for support']
),
(
  'Spinal Rotation',
  'mobility',
  1,
  60,
  ARRAY[
    'Lie on your back with knees bent',
    'Drop both knees to one side',
    'Keep shoulders flat on the ground',
    'Hold for 15 seconds',
    'Switch sides',
    'Repeat 4 times'
  ],
  ARRAY[
    'Improves spinal rotation',
    'Releases tension',
    'Stretches obliques',
    'Gentle mobility work'
  ],
  ARRAY[
    'Don''t force the rotation',
    'Stop if you feel sharp pain'
  ],
  ARRAY['Yoga mat']
);

-- Balance
INSERT INTO exercises (name, category, difficulty, duration_seconds, instructions, benefits, contraindications, equipment_needed) VALUES
(
  'Single Leg Stand',
  'balance',
  2,
  60,
  ARRAY[
    'Stand near a wall for support',
    'Lift one foot off the ground',
    'Hold for 30 seconds',
    'Switch legs',
    'Repeat 2 times per leg'
  ],
  ARRAY[
    'Improves balance',
    'Strengthens stabilizer muscles',
    'Reduces fall risk',
    'Functional fitness'
  ],
  ARRAY[
    'Use wall support if needed',
    'Don''t lock your standing knee'
  ],
  ARRAY['Wall for support']
);

-- Add some metadata
COMMENT ON TABLE exercises IS 'Library of exercises for sciatica recovery and general wellness';

-- Create a view for beginner exercises
CREATE OR REPLACE VIEW beginner_exercises AS
SELECT * FROM exercises 
WHERE difficulty <= 2
ORDER BY category, name;