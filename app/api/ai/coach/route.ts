import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion, MODELS } from '@/lib/ai/openai'
import { SYSTEM_PROMPTS, buildCoachPrompt } from '@/lib/ai/prompts'
import { buildDailyContext, getUserMemories } from '@/lib/ai/context-builder'
import { shouldAskDiscoveryQuestion, getNextDiscoveryQuestion } from '@/lib/ai/discovery-engine'
import { getUserContext, generateContextSummary } from '@/lib/ai/context-engine'
import { z } from 'zod'

const messageSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
})

/**
 * Builds an enhanced prompt with full daily context and memories
 */
function buildEnhancedCoachPrompt(userMessage: string, context: any): string {
  let prompt = `User message: "${userMessage}"\n\n`

  // Add daily context if available
  if (context.dailyContext) {
    prompt += `DAILY CONTEXT:\n`
    prompt += `- Overall sentiment: ${context.dailyContext.sentiment}\n`
    prompt += `- Pain trend: ${context.dailyContext.painTrend}\n`

    if (context.dailyContext.exerciseStreak) {
      prompt += `- Exercised today ✓\n`
    } else if (context.dailyContext.skippedDays > 0) {
      prompt += `- No exercise for ${context.dailyContext.skippedDays} days\n`
    }

    if (context.dailyContext.keyObservations.length > 0) {
      prompt += `- Key observations: ${context.dailyContext.keyObservations.join('; ')}\n`
    }

    if (context.dailyContext.celebrations.length > 0) {
      prompt += `- Wins to celebrate: ${context.dailyContext.celebrations.join('; ')}\n`
    }

    if (context.dailyContext.concerns.length > 0) {
      prompt += `- Concerns: ${context.dailyContext.concerns.join('; ')}\n`
    }

    prompt += `\n`
  }

  // Add important memories about the user
  if (context.memories && context.memories.length > 0) {
    prompt += `WHAT I KNOW ABOUT YOU:\n`
    const topMemories = context.memories
      .filter((m: any) => m.importance >= 7)
      .slice(0, 5)

    topMemories.forEach((memory: any) => {
      prompt += `- ${memory.fact}`
      if (memory.context) {
        prompt += ` (${memory.context})`
      }
      prompt += `\n`
    })
    prompt += `\n`
  }

  // Add discovery question prompt if needed
  if (context.shouldAskDiscovery) {
    prompt += `GUIDANCE: ${context.discoveryReason}. Consider naturally working in a question to learn more about the user if appropriate for this conversation.\n\n`
  }

  // Add suggested conversation topics if available
  if (context.dailyContext?.suggestedTopics?.length > 0) {
    prompt += `SUGGESTED TOPICS (if relevant): ${context.dailyContext.suggestedTopics.join(', ')}\n\n`
  }

  prompt += `Respond naturally and conversationally. Use the context to personalize your response, but don't dump all the context back at the user. Be helpful, encouraging, and supportive.`

  return prompt
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const validatedData = messageSchema.parse(body)

    const today = new Date().toISOString().split('T')[0]

    // Fetch comprehensive context including daily analysis and memories
    const [todayPain, recentGoals, dailyContext, userMemories, discoveryCheck] = await Promise.all([
      supabase
        .from('pain_logs')
        .select('morning_pain, morning_energy')
        .eq('log_date', today)
        .single(),
      supabase
        .from('goals')
        .select('title, progress_percentage, target_date')
        .lt('progress_percentage', 100)
        .order('priority', { ascending: false })
        .limit(3),
      buildDailyContext().catch(() => null),
      getUserMemories(15).catch(() => []),
      shouldAskDiscoveryQuestion().catch(() => ({ should: false, reason: '' })),
    ])

    // Build enhanced context with AI analysis and memories
    const context = {
      recentPainLevel: todayPain.data?.morning_pain,
      goalsProgress: recentGoals.data || [],
      recentActivity: 'User is checking in',

      // Daily context analysis
      dailyContext: dailyContext ? {
        sentiment: dailyContext.overallSentiment,
        keyObservations: dailyContext.keyObservations,
        painTrend: dailyContext.painSummary.trend,
        exerciseStreak: dailyContext.exerciseSummary.didExercise,
        skippedDays: dailyContext.exerciseSummary.skippedDays,
        concerns: dailyContext.concerns,
        celebrations: dailyContext.celebrationWorthy,
        suggestedTopics: dailyContext.suggestedConversationTopics,
      } : null,

      // What AI knows about the user
      memories: userMemories.map(m => ({
        fact: m.keyFact,
        context: m.context,
        importance: m.importance,
      })),

      // Whether to ask discovery questions
      shouldAskDiscovery: discoveryCheck.should,
      discoveryReason: discoveryCheck.reason,
    }

    const systemMessage = { role: 'system' as const, content: SYSTEM_PROMPTS.AI_COACH }

    const conversationMessages = validatedData.conversationHistory || []

    // Enhanced prompt with full context
    const userPrompt = buildEnhancedCoachPrompt(validatedData.message, context)

    const messages = [
      systemMessage,
      ...conversationMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: userPrompt },
    ]

    const result = await generateCompletion(messages, MODELS.GPT35, 0.8)

    if (!result.success) {
      throw new Error(result.error)
    }

    // Save conversation to database
    await supabase.from('coach_conversations').insert([
      {
        message_role: 'user',
        message_content: validatedData.message,
        tokens_used: result.usage?.prompt_tokens || 0,
      },
      {
        message_role: 'assistant',
        message_content: result.content || '',
        tokens_used: result.usage?.completion_tokens || 0,
      },
    ])

    return NextResponse.json({
      success: true,
      response: result.content,
      usage: result.usage,
      context: {
        sentiment: context.dailyContext?.sentiment,
        hasMemories: userMemories.length > 0,
        shouldAskDiscovery: context.shouldAskDiscovery,
      },
    })
  } catch (error) {
    console.error('AI coach error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid message data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get coach response' },
      { status: 500 }
    )
  }
}