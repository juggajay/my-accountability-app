/**
 * Conversation History API
 * Loads today's conversation history for persistence across sessions
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // Get today's conversation messages
    const { data: conversations, error } = await supabase
      .from('coach_conversations')
      .select('message_role, message_content, created_at')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Convert to message format
    const messages = (conversations || []).map(conv => ({
      role: conv.message_role as 'user' | 'assistant',
      content: conv.message_content,
    }))

    return NextResponse.json({
      success: true,
      data: { messages },
    })
  } catch (error: any) {
    console.error('Error loading conversation history:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}