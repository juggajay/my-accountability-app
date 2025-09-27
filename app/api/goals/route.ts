import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const goalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  target_date: z.string(),
  priority: z.number().min(1).max(5),
  progress_percentage: z.number().min(0).max(100).default(0),
  milestones: z.array(z.any()).optional(),
  success_metrics: z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const validatedData = goalSchema.parse(body)
    
    const { data, error } = await supabase
      .from('goals')
      .insert(validatedData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Goal created successfully',
    })
  } catch (error) {
    console.error('Goal creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('priority', { ascending: false })
      .order('target_date', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Fetch goals error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}