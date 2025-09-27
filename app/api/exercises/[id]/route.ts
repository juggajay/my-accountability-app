import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Fetch exercise error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercise' },
      { status: 500 }
    )
  }
}