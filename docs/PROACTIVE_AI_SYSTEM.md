# Proactive AI System

A comprehensive system that makes the AI coach more interactive and personalized by:
1. **Learning about you** through discovery questions
2. **Building context** from your daily activities
3. **Offering proactive advice** without being asked
4. **Remembering** what it learns about you

---

## Features

### 1. Discovery Questions (AI Learns About You)
The AI asks you questions to understand:
- Your motivations and goals
- Your communication preferences
- Your triggers and patterns
- Your challenges and past attempts
- What success looks like for you

**Learning Stages:**
- **Discovery** (0-5 questions answered): AI is actively learning about you
- **Active** (5-20 questions answered): AI knows the basics, asks clarifying questions
- **Established** (20+ questions answered): AI knows you well, only occasional deep dives

### 2. Daily Context Analysis
Every day, the AI automatically analyzes:
- Pain levels and trends
- Exercise consistency
- Alcohol consumption patterns
- Spending habits and emotional triggers
- Goal progress and blockers

**Outputs:**
- Overall sentiment (struggling → thriving)
- Key observations
- Anomalies (things different than usual)
- Patterns detected
- Suggested conversation topics

### 3. AI Memory System
The AI remembers important facts about you:
- **Facts**: "User works from home", "Sitting triggers pain"
- **Preferences**: "Prefers morning exercises", "Likes direct feedback"
- **Triggers**: "Stress leads to impulse spending"
- **Goals**: "Wants to reduce pain below 5/10"
- **Insights**: "Exercise reduces pain by 2 points on average"

Memories have:
- **Importance** (1-10): How critical is this fact?
- **Confidence** (0-1): How sure is the AI?
- **Context**: Additional nuance
- **Source**: Where did this come from?

### 4. Proactive Insights
AI generates unsolicited observations and suggestions:

**Categories:**
- 🎉 **Celebration**: "You've exercised 5 days straight!"
- 💡 **Suggestion**: "Try adding one new stretch this week"
- ⚠️ **Concern**: "Pain has been higher than usual - what's changed?"
- 🔍 **Observation**: "Exercise reduces your pain by 2 points on average"
- ❓ **Question**: "What were you feeling before that purchase?"
- 📈 **Pattern Alert**: "Sitting >2 hours increases pain by 25%"

**Priority Levels:**
- **8-10**: Urgent concerns, big wins, critical patterns
- **5-7**: Helpful suggestions, moderate concerns
- **1-4**: Nice-to-know observations, small wins

---

## Database Schema

### New Tables

#### `user_discovery_profile`
Stores what the AI learns about you through questions.

```sql
- personality_traits: JSONB (introverted/extroverted, etc.)
- communication_style: TEXT (direct, encouraging, scientific)
- motivation_type: TEXT (accountability, data-driven, etc.)
- stress_triggers: TEXT[]
- learning_stage: TEXT (discovery, active, established)
- questions_asked: INTEGER
- questions_answered: INTEGER
```

#### `daily_context_snapshots`
Daily AI analysis of your activities.

```sql
- snapshot_date: DATE (unique)
- pain_summary: JSONB
- exercise_summary: JSONB
- alcohol_summary: JSONB
- spending_summary: JSONB
- overall_sentiment: TEXT (struggling, neutral, progressing, thriving)
- key_observations: TEXT[]
- anomalies: TEXT[]
- patterns_detected: TEXT[]
- engagement_score: INTEGER (0-10)
```

#### `ai_memory`
Key facts the AI remembers about you.

```sql
- memory_type: TEXT (fact, preference, goal, trigger, success, concern)
- category: TEXT (health, finance, personal, goals, habits)
- key_fact: TEXT (the actual fact)
- context: TEXT (additional context)
- confidence: DECIMAL (0-1)
- importance: INTEGER (1-10)
- learned_from: TEXT (conversation, onboarding, data_analysis)
- reference_count: INTEGER (how often used)
```

#### `discovery_questions`
Questions the AI asks to learn about you.

```sql
- category: TEXT (onboarding, deep_dive, clarification, follow_up)
- topic: TEXT (health, goals, preferences, triggers)
- question_text: TEXT
- follow_up_prompts: TEXT[]
- priority: INTEGER (1-10)
- times_asked: INTEGER
```

#### `discovery_sessions`
Tracks when AI asks questions.

```sql
- session_type: TEXT (initial_onboarding, topic_deep_dive, etc.)
- questions_asked: UUID[]
- questions_answered: UUID[]
- memories_created: UUID[]
- completion_percentage: INTEGER (0-100)
- user_engagement: INTEGER (1-5)
```

#### `proactive_insights`
AI-generated advice offered without prompting.

```sql
- insight_category: TEXT (observation, suggestion, concern, celebration, question, pattern_alert)
- title: TEXT
- message: TEXT
- detailed_reasoning: TEXT (why AI is bringing this up)
- priority: INTEGER (1-10)
- delivered_at: TIMESTAMPTZ
- user_feedback: TEXT (helpful, not_helpful, neutral, annoying)
```

---

## API Endpoints

### Generate Daily Context
```bash
POST /api/ai/proactive
Body: { "action": "generate_context" }
```
Analyzes today's activities and saves context snapshot.

### Generate Proactive Insights
```bash
POST /api/ai/proactive
Body: { "action": "generate_insights" }
```
Uses AI to generate personalized insights based on context.

### Get Proactive Insights
```bash
GET /api/ai/proactive
```
Returns undelivered proactive insights.

### Check Discovery Status
```bash
POST /api/ai/proactive
Body: { "action": "check_discovery" }
```
Checks if it's a good time to ask discovery questions.

### Get Conversation Starter
```bash
POST /api/ai/proactive
Body: { "action": "get_conversation_starter" }
```
AI generates a natural opener that includes a discovery question.

### Mark Insight as Viewed
```bash
POST /api/ai/proactive/[id]/view
Body: { "feedback": "helpful" | "not_helpful" | "neutral" }
```
Records user interaction with an insight.

---

## Usage

### 1. Run Database Migration
```bash
# Apply the new schema
psql your_database < supabase/migrations/004_proactive_ai_system.sql
```

### 2. Generate Daily Context (Run daily via cron)
```javascript
// In your cron job or serverless function
await fetch('https://your-app.com/api/ai/proactive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'generate_context' }),
})

// Then generate insights
await fetch('https://your-app.com/api/ai/proactive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'generate_insights' }),
})
```

### 3. Display Proactive Insights on Dashboard
```tsx
import { ProactiveInsights } from '@/components/ai/ProactiveInsights'

export default function Dashboard() {
  return (
    <div>
      {/* Other dashboard widgets */}
      <ProactiveInsights />
    </div>
  )
}
```

### 4. Enhanced Coach Conversations
The coach now automatically:
- Loads daily context and memories
- References your patterns and trends
- Asks discovery questions when appropriate
- Celebrates wins and checks in on concerns

No changes needed - it works automatically!

---

## How It Works

### Discovery Flow

1. **User opens app**
   - System checks: `shouldAskDiscoveryQuestion()`
   - Returns: `{ should: true, reason: "Initial onboarding needed" }`

2. **Coach greets user**
   - System calls: `generateDiscoveryConversationStarter()`
   - Returns: "Hey! I'm here to help you manage your health. What made you start using this app?"

3. **User responds**
   - System calls: `recordQuestionAnswered()`
   - AI extracts memories: "User has sciatica for 6 months"
   - Saves to `ai_memory` table

4. **Next time user chats**
   - Coach loads memories: `getUserMemories(15)`
   - References them naturally: "I know sitting triggers your pain - how's that been today?"

### Context Analysis Flow

1. **Daily cron job runs**
   - Calls: `buildDailyContext()`
   - Analyzes all activity for the day
   - Calculates sentiment, observations, anomalies

2. **Save snapshot**
   - Calls: `saveDailyContext(context)`
   - Stores in `daily_context_snapshots`

3. **Generate insights**
   - AI analyzes context
   - Creates 2-4 proactive insights
   - Saves to `proactive_insights`

4. **User opens dashboard**
   - `ProactiveInsights` component fetches insights
   - Displays top 3 by priority
   - User can give feedback (helpful/not helpful)

### Memory Reference Flow

1. **User chats with coach**
   - System loads top 15 memories
   - Filters by importance >= 7
   - Injects into prompt context

2. **Coach references memory**
   - "I remember you mentioned stress triggers impulse spending"
   - System calls: `referenceMemory(memoryId)`
   - Increments `reference_count`

3. **Memory ranking**
   - Frequently referenced memories surface more
   - Unused memories fade into background
   - Can manually correct or expire memories

---

## Configuration

### Seeded Discovery Questions (12 initial questions)

See `004_proactive_ai_system.sql` for full list. Categories:
- **Onboarding**: Motivation, communication style, personality
- **Deep Dive**: Health history, goals, values
- **Clarification**: Triggers, patterns, specific incidents
- **Follow-up**: Wins, concerns, app feedback

You can add more questions directly in the database:

```sql
INSERT INTO discovery_questions (category, topic, question_text, priority) VALUES
  ('deep_dive', 'sleep', 'How does your sleep quality affect your pain the next day?', 7);
```

### Adjusting AI Behavior

**In `discovery-engine.ts`:**
- `shouldAskDiscoveryQuestion()`: Controls frequency of questions
  - Discovery stage: Ask often
  - Active stage: Every 2+ days
  - Established stage: Weekly

**In `context-builder.ts`:**
- `analyzeOverallContext()`: Determines sentiment and engagement score
- Adjust thresholds for positive/negative signals
- Customize pattern detection logic

**In `proactive/route.ts`:**
- `generateInsightsFromContext()`: AI prompt for insight generation
- Adjust tone, priority levels, categories

---

## Best Practices

### 1. Run Context Generation Daily
Set up a cron job to run every evening:
```bash
0 20 * * * curl -X POST https://your-app.com/api/ai/proactive \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_context"}'

5 20 * * * curl -X POST https://your-app.com/api/ai/proactive \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_insights"}'
```

### 2. Monitor User Feedback
Track which insights users find helpful:
```sql
SELECT
  insight_category,
  AVG(CASE WHEN user_feedback = 'helpful' THEN 1.0 ELSE 0.0 END) as helpful_rate,
  COUNT(*) as total_delivered
FROM proactive_insights
WHERE delivered_at IS NOT NULL
GROUP BY insight_category
ORDER BY helpful_rate DESC;
```

### 3. Prune Old Memories
Set expiration dates for temporary facts:
```sql
UPDATE ai_memory
SET is_active = false
WHERE last_referenced_at < NOW() - INTERVAL '90 days'
  AND importance < 5;
```

### 4. Balance Question Frequency
Don't overwhelm users with questions. Use engagement score to adjust:
- High engagement (8-10): More questions okay
- Low engagement (0-4): Back off, focus on value

### 5. Personalize Insights
The AI uses your data to generate insights. The more you log:
- Pain levels
- Exercise sessions
- Alcohol
- Spending
- Goals

...the better the insights become!

---

## Troubleshooting

### "No insights showing"
1. Check if context has been generated:
   ```sql
   SELECT * FROM daily_context_snapshots
   ORDER BY snapshot_date DESC LIMIT 1;
   ```

2. Manually trigger insight generation:
   ```bash
   curl -X POST http://localhost:3000/api/ai/proactive \
     -H "Content-Type: application/json" \
     -d '{"action":"generate_insights"}'
   ```

### "AI not asking questions"
1. Check learning stage:
   ```sql
   SELECT learning_stage, questions_answered
   FROM user_discovery_profile;
   ```

2. Check last discovery session:
   ```sql
   SELECT * FROM discovery_sessions
   ORDER BY started_at DESC LIMIT 1;
   ```

3. Manually trigger check:
   ```bash
   curl -X POST http://localhost:3000/api/ai/proactive \
     -H "Content-Type: application/json" \
     -d '{"action":"check_discovery"}'
   ```

### "Coach not using context"
The coach automatically loads context. Verify it's working:
1. Send a message to the coach
2. Check the response includes contextual references
3. Look for phrases like "I noticed..." or "Based on your recent..."

If not working:
- Check `buildDailyContext()` returns data
- Verify `getUserMemories()` returns memories
- Check OpenAI API key is set

---

## Future Enhancements

### Potential Additions
1. **Notification System**: Push proactive insights via web push
2. **Voice Assistant**: Ask discovery questions via voice interface
3. **Pattern Prediction**: "Based on your patterns, you're likely to skip exercise tomorrow"
4. **Memory Correction UI**: Let users edit/correct AI memories
5. **Multi-Modal Discovery**: Ask questions via photos, voice, or text
6. **Collaborative Goals**: AI co-creates goals with you through conversation
7. **Weekly Summaries**: AI generates comprehensive weekly reports
8. **Comparative Analysis**: "Your pain is 30% better than this time last month"

### Technical Improvements
1. **Vector Embeddings**: Use pgvector for semantic memory search
2. **Fine-Tuned Model**: Train custom model on your conversation style
3. **Real-Time Context**: WebSocket updates for live context changes
4. **A/B Testing**: Test different insight styles and frequencies
5. **Privacy Controls**: Let users control what AI remembers

---

## Summary

You now have a **proactive, personalized AI system** that:

✅ **Learns about you** through natural discovery questions
✅ **Analyzes your day** automatically to find patterns
✅ **Offers unsolicited advice** based on your data
✅ **Remembers key facts** about your preferences and triggers
✅ **Gets smarter over time** as it learns more about you

The AI is now **interactive** and **context-aware**, not just reactive to your questions!

---

## Questions?

Check:
- `lib/ai/context-builder.ts` - Daily context analysis logic
- `lib/ai/discovery-engine.ts` - Discovery question system
- `app/api/ai/proactive/route.ts` - Proactive insight API
- `components/ai/ProactiveInsights.tsx` - UI widget

Enjoy your smarter, more proactive AI coach! 🚀