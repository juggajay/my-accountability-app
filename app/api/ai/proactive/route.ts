/**
 * Proactive AI API
 * Generates context-aware insights and suggestions without user prompting
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildDailyContext, saveDailyContext, getProactiveInsights } from '@/lib/ai/context-builder'
import { shouldAskDiscoveryQuestion, generateDiscoveryConversationStarter } from '@/lib/ai/discovery-engine'
import { getUserContext, generateContextSummary } from '@/lib/ai/context-engine'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * POST /api/ai/proactive
 * Generates daily context and proactive insights
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'generate_context':
        return await generateDailyContext()

      case 'generate_insights':
        return await generateProactiveInsights()

      case 'check_discovery':
        return await checkDiscoveryStatus()

      case 'get_conversation_starter':
        return await getConversationStarter()

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Proactive AI error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/proactive
 * Gets current proactive insights
 */
export async function GET() {
  try {
    const insights = await getProactiveInsights(5)

    return NextResponse.json({
      success: true,
      data: { insights },
    })
  } catch (error: any) {
    console.error('Error fetching proactive insights:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Generates and saves daily context
 */
async function generateDailyContext() {
  const context = await buildDailyContext()
  await saveDailyContext(context)

  return NextResponse.json({
    success: true,
    data: { context },
  })
}

/**
 * Generates proactive insights based on daily context
 */
async function generateProactiveInsights() {
  const supabase = await createClient()

  // Get today's context
  const context = await buildDailyContext()

  // Generate AI insights
  const insights = await generateInsightsFromContext(context)

  // Save insights
  const savedInsights = []
  for (const insight of insights) {
    const { data } = await supabase
      .from('proactive_insights')
      .insert({
        insight_category: insight.category,
        title: insight.title,
        message: insight.message,
        detailed_reasoning: insight.reasoning,
        priority: insight.priority,
        triggered_by: insight.triggeredBy,
        delivery_method: 'dashboard_widget',
      })
      .select()
      .single()

    if (data) {
      savedInsights.push(data)
    }
  }

  return NextResponse.json({
    success: true,
    data: { insights: savedInsights },
  })
}

/**
 * Uses AI to generate contextual insights
 */
async function generateInsightsFromContext(context: any): Promise<Array<{
  category: string
  title: string
  message: string
  reasoning: string
  priority: number
  triggeredBy: string
}>> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a proactive AI health coach analyzing a user's daily context to generate helpful, timely insights.

Context:
${JSON.stringify(context, null, 2)}

Generate 2-4 proactive insights based on the context. Each insight should be:
1. Timely and relevant to what's happening now
2. Actionable - something the user can do
3. Supportive and encouraging (not judgmental)
4. Specific to their data (not generic advice)

Categories:
- "observation": Neutral observation about patterns
- "suggestion": Helpful recommendation
- "concern": Something to check in about (gentle, not alarming)
- "celebration": Wins to acknowledge
- "question": Clarifying question to understand better
- "pattern_alert": Notable pattern detected

Priority (1-10):
- 8-10: Urgent concerns, big wins, critical patterns
- 5-7: Helpful suggestions, moderate concerns
- 1-4: Nice-to-know observations, small wins

Return JSON:
{
  "insights": [
    {
      "category": "celebration|suggestion|concern|observation|question|pattern_alert",
      "title": "Short, engaging title",
      "message": "1-2 sentence message for the user",
      "reasoning": "Why this insight matters (internal)",
      "priority": 1-10,
      "triggeredBy": "What data/pattern triggered this"
    }
  ]
}

Examples:

If user exercised and pain decreased:
{
  "category": "celebration",
  "title": "Exercise is working!",
  "message": "Your exercise session reduced your pain by 2 points today. That's exactly what we want to see - keep it up!",
  "reasoning": "Positive reinforcement for effective pain management strategy",
  "priority": 7,
  "triggeredBy": "exercise_pain_reduction"
}

If user skipped exercise for 3 days:
{
  "category": "concern",
  "title": "Missing your routine",
  "message": "It's been 3 days since your last exercise. What's making it tough right now? Even 5 minutes can help.",
  "reasoning": "Exercise consistency is key for sciatica management, user may need support",
  "priority": 8,
  "triggeredBy": "exercise_skip_streak"
}

If impulse spending with stress trigger:
{
  "category": "question",
  "title": "Stress spending pattern",
  "message": "I noticed you made an impulse purchase when feeling stressed. What was going on? Let's talk about other ways to handle that stress.",
  "reasoning": "Identify emotional triggers for spending to develop coping strategies",
  "priority": 6,
  "triggeredBy": "impulse_spending_stress"
}`,
        },
        {
          role: 'user',
          content: 'Generate proactive insights from this context',
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) return []

    const parsed = JSON.parse(content)
    return parsed.insights || []
  } catch (error) {
    console.error('Error generating insights:', error)
    return []
  }
}

/**
 * Checks if it's a good time to ask discovery questions
 */
async function checkDiscoveryStatus() {
  const shouldAsk = await shouldAskDiscoveryQuestion()

  return NextResponse.json({
    success: true,
    data: shouldAsk,
  })
}

/**
 * Gets an AI-generated conversation starter
 */
async function getConversationStarter() {
  const starter = await generateDiscoveryConversationStarter()

  return NextResponse.json({
    success: true,
    data: { starter },
  })
}