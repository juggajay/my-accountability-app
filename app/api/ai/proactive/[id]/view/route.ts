/**
 * Mark proactive insight as viewed/delivered with feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()
    const { feedback } = body

    // Update the insight
    const { error } = await supabase
      .from('proactive_insights')
      .update({
        delivered_at: new Date().toISOString(),
        user_viewed_at: new Date().toISOString(),
        user_engaged: true,
        user_feedback: feedback,
      })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error marking insight as viewed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}