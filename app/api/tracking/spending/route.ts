import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const spendingLogSchema = z.object({
  amount: z.number().min(0),
  category: z.string(),
  description: z.string().optional(),
  emotion: z.string(),
  was_impulse: z.boolean(),
  was_planned: z.boolean(),
  necessity_score: z.number().min(1).max(5),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const validatedData = spendingLogSchema.parse(body)
    
    const { data, error } = await supabase
      .from('spending_logs')
      .insert({
        logged_at: new Date().toISOString(),
        ...validatedData,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Purchase logged successfully',
    })
  } catch (error) {
    console.error('Spending logging error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to log purchase' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('spending_logs')
      .select('*')
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Fetch spending logs error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}