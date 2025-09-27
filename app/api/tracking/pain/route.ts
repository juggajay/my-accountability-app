import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const painLogSchema = z.object({
  morning_pain: z.number().min(0).max(10).optional(),
  morning_energy: z.number().min(0).max(10).optional(),
  morning_mood: z.number().min(0).max(10).optional(),
  evening_pain: z.number().min(0).max(10).optional(),
  evening_reflection: z.string().optional(),
  sleep_quality: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
  log_date: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const validatedData = painLogSchema.parse(body)
    
    const logDate = validatedData.log_date || new Date().toISOString().split('T')[0]
    
    const { data: existingLog, error: fetchError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('log_date', logDate)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    let result
    if (existingLog) {
      const { data, error } = await supabase
        .from('daily_logs')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('log_date', logDate)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      const { data, error } = await supabase
        .from('daily_logs')
        .insert({
          log_date: logDate,
          ...validatedData,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: existingLog ? 'Daily log updated' : 'Daily log created',
    })
  } catch (error) {
    console.error('Pain tracking error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to save pain log' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .gte('log_date', startDate.toISOString().split('T')[0])
      .order('log_date', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Fetch pain logs error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pain logs' },
      { status: 500 }
    )
  }
}