import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const alcoholLogSchema = z.object({
  drink_type: z.string(),
  units: z.number().min(0).max(10),
  context: z.string(),
  location: z.string().optional(),
  cost: z.number().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const validatedData = alcoholLogSchema.parse(body)
    
    const { data, error } = await supabase
      .from('alcohol_logs')
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
      message: 'Drink logged successfully',
    })
  } catch (error) {
    console.error('Alcohol logging error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to log drink' },
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
      .from('alcohol_logs')
      .select('*')
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Fetch alcohol logs error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}