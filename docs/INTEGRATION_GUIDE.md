# Integration Guide: Adding Proactive AI to Your Dashboard

Quick guide to integrate the Proactive AI system into your existing app.

---

## Step 1: Run Database Migration

```bash
# Connect to your Supabase database
psql "your_connection_string"

# Run the migration
\i supabase/migrations/004_proactive_ai_system.sql

# Run the setup script
\i scripts/setup-proactive-ai.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of `004_proactive_ai_system.sql`
3. Run
4. Then paste and run `setup-proactive-ai.sql`

---

## Step 2: Add ProactiveInsights Widget to Dashboard

In `app/dashboard/page.tsx`, add the component:

```tsx
// Add this import at the top
import { ProactiveInsights } from '@/components/ai/ProactiveInsights'

// Then add it to your dashboard layout, for example after your main metrics:
export default async function DashboardPage() {
  // ... existing code ...

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Existing dashboard content */}

      <div className="px-6 pb-8 space-y-6">
        {/* Your existing cards */}

        {/* Add the Proactive Insights widget */}
        <ProactiveInsights />

        {/* Rest of your dashboard */}
      </div>
    </div>
  )
}
```

**Note:** Since `ProactiveInsights` is a client component (`'use client'`), you can place it anywhere in your server-rendered dashboard.

---

## Step 3: Generate Initial Context and Insights

You have two options:

### Option A: Manual API Calls (for testing)

```bash
# Generate today's context
curl -X POST http://localhost:3000/api/ai/proactive \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_context"}'

# Generate insights from the context
curl -X POST http://localhost:3000/api/ai/proactive \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_insights"}'

# Check if AI wants to ask discovery questions
curl -X POST http://localhost:3000/api/ai/proactive \
  -H "Content-Type: application/json" \
  -d '{"action":"check_discovery"}'

# Get a conversation starter
curl -X POST http://localhost:3000/api/ai/proactive \
  -H "Content-Type: application/json" \
  -d '{"action":"get_conversation_starter"}'
```

### Option B: Set Up Daily Cron Job (for production)

#### Using Vercel Cron Jobs

Create `app/api/cron/daily-ai/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { buildDailyContext, saveDailyContext } from '@/lib/ai/context-builder'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Generate context
    const context = await buildDailyContext()
    await saveDailyContext(context)

    // Generate insights (you can add this later)
    // await generateProactiveInsights()

    return NextResponse.json({ success: true, context })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

Then in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/daily-ai",
    "schedule": "0 20 * * *"
  }]
}
```

#### Using External Cron Service

Use a service like Cron-Job.org or EasyCron:

```
URL: https://your-app.com/api/ai/proactive
Method: POST
Body: {"action":"generate_context"}
Schedule: Daily at 8:00 PM

URL: https://your-app.com/api/ai/proactive
Method: POST
Body: {"action":"generate_insights"}
Schedule: Daily at 8:05 PM
```

---

## Step 4: Test the AI Coach

The coach now automatically uses context and memories!

1. Open the AI Coach page (e.g., `/coach` or `/ai/coach`)
2. Send any message like "hey" or "how am I doing?"
3. The coach should respond with personalized context

**Behind the scenes, the coach now:**
- ✅ Loads your daily context (pain trends, exercise streak, etc.)
- ✅ References memories about you
- ✅ Suggests conversation topics based on patterns
- ✅ Asks discovery questions when appropriate
- ✅ Celebrates wins and checks in on concerns

---

## Step 5: Customize AI Memories (Optional)

Add your own memories about yourself in the database:

```sql
INSERT INTO ai_memory (
  memory_type,
  category,
  key_fact,
  context,
  confidence,
  importance,
  learned_from
) VALUES
  (
    'preference',
    'communication',
    'User prefers direct, no-nonsense feedback',
    'Likes data and facts over emotional encouragement',
    1.0,
    8,
    'conversation'
  ),
  (
    'trigger',
    'health',
    'Stress at work increases pain levels',
    'Desk job with tight deadlines',
    0.9,
    9,
    'pattern_detection'
  ),
  (
    'goal',
    'health',
    'User wants to run a 5K without pain',
    'Long-term goal, currently focused on basic exercises',
    1.0,
    7,
    'onboarding'
  );
```

---

## Step 6: Verify Everything Works

### Check Database Tables

```sql
-- Check memories
SELECT memory_type, key_fact, importance
FROM ai_memory
WHERE is_active = true
ORDER BY importance DESC;

-- Check context snapshots
SELECT snapshot_date, overall_sentiment, key_observations
FROM daily_context_snapshots
ORDER BY snapshot_date DESC
LIMIT 3;

-- Check discovery questions
SELECT category, topic, question_text, priority
FROM discovery_questions
ORDER BY priority DESC
LIMIT 5;

-- Check proactive insights
SELECT insight_category, title, message, priority
FROM proactive_insights
WHERE delivered_at IS NULL
ORDER BY priority DESC;
```

### Check API Endpoints

```bash
# Get proactive insights
curl http://localhost:3000/api/ai/proactive

# Expected response:
# {
#   "success": true,
#   "data": {
#     "insights": [...]
#   }
# }
```

### Check Dashboard

1. Open your app dashboard
2. You should see the "AI Insights" card
3. If you have data, you should see 1-3 insights
4. If no data yet, you'll see: "Keep logging your activities..."

---

## Troubleshooting

### "No insights showing"

**Cause:** No data logged yet, or context not generated.

**Fix:**
1. Log some data (pain, exercise, spending, etc.)
2. Manually trigger context generation:
   ```bash
   curl -X POST http://localhost:3000/api/ai/proactive \
     -H "Content-Type: application/json" \
     -d '{"action":"generate_context"}'

   curl -X POST http://localhost:3000/api/ai/proactive \
     -H "Content-Type: application/json" \
     -d '{"action":"generate_insights"}'
   ```

### "Coach not using context"

**Cause:** Missing imports or API error.

**Fix:**
1. Check browser console for errors
2. Verify OpenAI API key is set: `OPENAI_API_KEY=sk-...`
3. Check server logs for context-builder errors

### "Discovery questions not working"

**Cause:** User profile not initialized.

**Fix:**
```sql
-- Check if profile exists
SELECT * FROM user_discovery_profile;

-- If empty, run setup script
\i scripts/setup-proactive-ai.sql
```

### "Database errors"

**Cause:** Migration not applied or missing functions.

**Fix:**
1. Re-run migration: `004_proactive_ai_system.sql`
2. Re-run setup: `setup-proactive-ai.sql`
3. Check for conflicts with existing tables

---

## Next Steps

Now that the system is set up:

1. **Log More Data**: The more you track, the better the insights
2. **Chat with AI**: Talk to the coach daily, it's learning about you
3. **Review Insights**: Give feedback (👍 helpful / 👎 not helpful)
4. **Customize Questions**: Add your own discovery questions
5. **Adjust Frequency**: Tweak how often AI asks questions in `discovery-engine.ts`

---

## Advanced: Add More Features

### 1. Weekly Summary Email

Create an API route that generates a weekly summary:

```typescript
// app/api/ai/weekly-summary/route.ts
import { buildDailyContext } from '@/lib/ai/context-builder'

export async function GET() {
  // Get last 7 days of context
  // Generate summary with AI
  // Send email
}
```

### 2. Push Notifications for Insights

Use web push to notify users of high-priority insights:

```typescript
// When creating insight with priority >= 8
if (insight.priority >= 8) {
  await sendPushNotification({
    title: insight.title,
    body: insight.message,
  })
}
```

### 3. Voice Assistant Integration

Let users talk to the AI coach:

```typescript
// Use Web Speech API
const recognition = new webkitSpeechRecognition()
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  // Send to coach API
}
```

### 4. Discovery Question UI

Create a dedicated onboarding flow:

```tsx
// components/ai/DiscoveryFlow.tsx
export function DiscoveryFlow() {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answers, setAnswers] = useState([])

  // Load next question from API
  // Display with nice animation
  // Save answers and extract memories
}
```

---

## Summary

You've now integrated a **fully functional proactive AI system**! 🎉

✅ Database tables created
✅ AI memories seeded
✅ Discovery questions ready
✅ Context builder analyzing daily data
✅ Proactive insights widget on dashboard
✅ Enhanced coach with context awareness

**The AI now:**
- Learns about you through questions
- Analyzes your patterns daily
- Offers unsolicited advice
- Remembers what matters to you
- Gets smarter over time

Enjoy your smarter AI coach!