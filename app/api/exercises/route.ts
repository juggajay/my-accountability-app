import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    
    let query = supabase
      .from('exercises')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    if (difficulty) {
      query = query.eq('difficulty', parseInt(difficulty))
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Fetch exercises error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}