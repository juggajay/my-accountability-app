# 🚀 Proactive AI System - Quick Start

Your AI coach is now **proactive, personalized, and learns about you**!

---

## What's New?

### ✨ AI Now Does This Automatically:

1. **Asks You Questions** to understand your goals, preferences, and triggers
2. **Analyzes Your Day** automatically (pain, exercise, spending patterns)
3. **Offers Advice** without being asked ("I noticed your pain is up...")
4. **Remembers You** (stores key facts and references them naturally)
5. **Gets Smarter** over time as it learns more

---

## 🎯 Quick Setup (5 Minutes)

### 1. Run Database Migration

```bash
# Option A: psql
psql "your_supabase_connection_string" -f supabase/migrations/004_proactive_ai_system.sql
psql "your_supabase_connection_string" -f scripts/setup-proactive-ai.sql

# Option B: Supabase Dashboard
# Go to SQL Editor → New Query → Paste file contents → Run
```

### 2. Generate Your First Insights

```bash
# Generate today's context
curl -X POST http://localhost:3000/api/ai/proactive \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_context"}'

# Create insights from your data
curl -X POST http://localhost:3000/api/ai/proactive \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_insights"}'
```

### 3. Add Widget to Dashboard

In `app/dashboard/page.tsx`:

```tsx
import { ProactiveInsights } from '@/components/ai/ProactiveInsights'

export default async function DashboardPage() {
  return (
    <div>
      {/* Your existing dashboard content */}

      {/* Add this anywhere */}
      <ProactiveInsights />
    </div>
  )
}
```

### 4. Talk to Your AI Coach

Just open the coach and say "hey" - it now knows your context!

---

## 📊 What You'll See

### Proactive Insights Widget

Shows 3 insights at a time:

- 🎉 **Celebration**: "You've exercised 5 days straight!"
- 💡 **Suggestion**: "Try adding one new stretch this week"
- ⚠️ **Concern**: "Pain has been higher - what's changed?"
- 🔍 **Observation**: "Exercise reduces your pain by 2 points"
- ❓ **Question**: "What were you feeling before that purchase?"
- 📈 **Pattern Alert**: "Sitting >2 hours increases pain"

### Enhanced Coach Conversations

**Before:**
> User: "hey"
> Coach: "Hello! How can I help you today?"

**After:**
> User: "hey"
> Coach: "Hey! I noticed your pain has been trending down this week - your exercise routine is working! How are you feeling today?"

The coach now references:
- Your recent pain trends
- Exercise streak
- Recent wins or concerns
- Personal preferences it's learned

---

## 🧠 How It Works

### Daily Analysis (Runs automatically)

Every day, AI analyzes:
- Pain levels vs. 7-day average
- Exercise consistency and effectiveness
- Alcohol consumption patterns
- Spending habits and triggers
- Goal progress and blockers

**Output:** Context snapshot with sentiment, observations, and suggested topics

### Discovery System

AI asks questions naturally during conversations:
- **Discovery Stage** (0-5 answers): Frequent onboarding questions
- **Active Stage** (5-20 answers): Occasional clarifications
- **Established Stage** (20+ answers): Rare deep dives

**Questions include:**
- "What made you start using this app?"
- "How do you prefer to receive feedback?"
- "Tell me about your pain - when did it start?"
- "What does a good pain day look like?"

### Memory System

AI remembers important facts:
- **Facts**: "User works from home"
- **Preferences**: "Prefers morning exercises"
- **Triggers**: "Stress leads to impulse spending"
- **Goals**: "Wants to reduce pain below 5/10"

Memories have **importance** (1-10) and **confidence** (0-1) scores.

### Proactive Insights

AI generates 2-4 insights daily based on your context:
- **Priority 8-10**: Urgent concerns, big wins
- **Priority 5-7**: Helpful suggestions
- **Priority 1-4**: Observations

---

## 🛠️ Files Created

### Database Schema
- `supabase/migrations/004_proactive_ai_system.sql` - 6 new tables
- `scripts/setup-proactive-ai.sql` - Initial setup with sample data

### AI Services
- `lib/ai/context-builder.ts` - Analyzes daily activity
- `lib/ai/discovery-engine.ts` - Manages discovery questions
- `app/api/ai/proactive/route.ts` - API for insights

### UI Components
- `components/ai/ProactiveInsights.tsx` - Dashboard widget
- Enhanced: `app/api/ai/coach/route.ts` - Now context-aware

### Documentation
- `docs/PROACTIVE_AI_SYSTEM.md` - Complete technical docs
- `docs/INTEGRATION_GUIDE.md` - Step-by-step integration
- `PROACTIVE_AI_QUICKSTART.md` - This file!

---

## 📅 Set Up Daily Generation (Optional)

For production, run context generation daily:

### Option 1: Vercel Cron

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/daily-ai",
    "schedule": "0 20 * * *"
  }]
}
```

### Option 2: External Cron Service

Use Cron-Job.org or EasyCron:
- URL: `https://your-app.com/api/ai/proactive`
- Method: POST
- Body: `{"action":"generate_context"}`
- Schedule: Daily at 8:00 PM

Then 5 minutes later:
- Body: `{"action":"generate_insights"}`

---

## 🧪 Test It Out

### 1. Check AI Memories

```sql
SELECT memory_type, key_fact, importance
FROM ai_memory
WHERE is_active = true
ORDER BY importance DESC;
```

Should show 5+ memories about you.

### 2. Generate Context

```bash
curl -X POST http://localhost:3000/api/ai/proactive \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_context"}'
```

Should return your daily sentiment, observations, patterns.

### 3. View Insights on Dashboard

Open your app → Should see "AI Insights" card with 1-3 observations

### 4. Chat with Coach

Say anything → Coach should reference your context naturally

---

## 💡 Pro Tips

1. **Log More Data**: More data = better insights
2. **Give Feedback**: Click 👍/👎 on insights to train the system
3. **Answer Questions**: When AI asks, answer thoughtfully
4. **Customize Memories**: Edit `ai_memory` table to add personal facts
5. **Adjust Frequency**: Edit `discovery-engine.ts` to control question frequency

---

## 🐛 Troubleshooting

### No insights showing?
```bash
# Make sure you have data logged, then:
curl -X POST http://localhost:3000/api/ai/proactive \
  -d '{"action":"generate_context"}' -H "Content-Type: application/json"

curl -X POST http://localhost:3000/api/ai/proactive \
  -d '{"action":"generate_insights"}' -H "Content-Type: application/json"
```

### Coach not using context?
- Check: OpenAI API key is set (`OPENAI_API_KEY`)
- Check: Browser console for errors
- Check: Server logs show context loading

### Database errors?
```bash
# Re-run migrations
psql "connection_string" -f supabase/migrations/004_proactive_ai_system.sql
psql "connection_string" -f scripts/setup-proactive-ai.sql
```

---

## 📚 Learn More

- **Technical Details**: `docs/PROACTIVE_AI_SYSTEM.md`
- **Integration Steps**: `docs/INTEGRATION_GUIDE.md`
- **Code Examples**: `lib/ai/` directory

---

## 🎉 What's Next?

Your AI coach now:
- ✅ Learns about you automatically
- ✅ Analyzes your daily patterns
- ✅ Offers proactive advice
- ✅ Remembers important facts
- ✅ Gets smarter over time

**Just use the app normally** - the AI will learn about you, spot patterns, and offer timely advice without you asking!

---

## Questions?

The system is fully documented:
1. Read `PROACTIVE_AI_SYSTEM.md` for deep technical details
2. Read `INTEGRATION_GUIDE.md` for step-by-step setup
3. Check code comments in `lib/ai/` files

Enjoy your smarter AI coach! 🚀🧠