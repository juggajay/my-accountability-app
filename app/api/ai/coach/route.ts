import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion, MODELS } from '@/lib/ai/openai'
import { SYSTEM_PROMPTS, buildCoachPrompt } from '@/lib/ai/prompts'
import { z } from 'zod'

const messageSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const validatedData = messageSchema.parse(body)

    const today = new Date().toISOString().split('T')[0]
    
    const [todayPain, recentGoals] = await Promise.all([
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
    ])

    const context = {
      recentPainLevel: todayPain.data?.morning_pain,
      goalsProgress: recentGoals.data || [],
      recentActivity: 'User is checking in',
    }

    const systemMessage = { role: 'system' as const, content: SYSTEM_PROMPTS.AI_COACH }
    
    const conversationMessages = validatedData.conversationHistory || []
    
    const userPrompt = buildCoachPrompt(validatedData.message, context)

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

    return NextResponse.json({
      success: true,
      response: result.content,
      usage: result.usage,
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