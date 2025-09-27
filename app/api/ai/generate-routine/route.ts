import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion, MODELS } from '@/lib/ai/openai'
import { SYSTEM_PROMPTS, buildExercisePrompt } from '@/lib/ai/prompts'
import { z } from 'zod'

const requestSchema = z.object({
  painLevel: z.number().min(0).max(10),
  painLocation: z.string().optional(),
  energyLevel: z.number().min(0).max(10),
  preferences: z.object({
    duration: z.enum(['short', 'medium', 'long']).optional(),
    focus: z.enum(['pain_relief', 'mobility', 'strength', 'flexibility']).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const validatedData = requestSchema.parse(body)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const [exerciseHistory, goalsData] = await Promise.all([
      supabase
        .from('exercise_sessions')
        .select('*')
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: false })
        .limit(5),
      supabase
        .from('goals')
        .select('*')
        .lt('progress_percentage', 100)
        .order('priority', { ascending: false })
        .limit(3),
    ])

    const userPrompt = buildExercisePrompt({
      painLevel: validatedData.painLevel,
      painLocation: validatedData.painLocation,
      energyLevel: validatedData.energyLevel,
      recentExercises: exerciseHistory.data || [],
      goals: goalsData.data || [],
    })

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPTS.EXERCISE_GENERATOR },
      { role: 'user' as const, content: userPrompt },
    ]

    const result = await generateCompletion(messages, MODELS.GPT35, 0.7)

    if (!result.success) {
      throw new Error(result.error)
    }

    let routineData
    try {
      routineData = JSON.parse(result.content)
    } catch (parseError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse AI response',
          raw: result.content 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: routineData,
      usage: result.usage,
    })
  } catch (error) {
    console.error('Exercise generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate routine' },
      { status: 500 }
    )
  }
}