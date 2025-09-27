import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const sessionSchema = z.object({
  exercise_id: z.string().uuid().optional(),
  completed_exercises: z.array(z.any()),
  duration_minutes: z.number().min(1).max(240),
  pain_before: z.number().min(0).max(10),
  pain_after: z.number().min(0).max(10),
  energy_before: z.number().min(0).max(10),
  energy_after: z.number().min(0).max(10),
  effectiveness_rating: z.number().min(1).max(5),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const validatedData = sessionSchema.parse(body)
    
    const { data, error } = await supabase
      .from('exercise_sessions')
      .insert({
        performed_at: new Date().toISOString(),
        total_duration_minutes: validatedData.duration_minutes,
        completed_exercises: validatedData.completed_exercises,
        pain_before: validatedData.pain_before,
        pain_after: validatedData.pain_after,
        energy_before: validatedData.energy_before,
        energy_after: validatedData.energy_after,
        effectiveness_rating: validatedData.effectiveness_rating,
        notes: validatedData.notes,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Exercise session recorded',
    })
  } catch (error) {
    console.error('Save session error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to save session' },
      { status: 500 }
    )
  }
}