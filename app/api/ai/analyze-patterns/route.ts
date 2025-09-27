import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion, MODELS } from '@/lib/ai/openai'
import { SYSTEM_PROMPTS, buildPatternAnalysisPrompt } from '@/lib/ai/prompts'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [painLogs, spendingLogs, alcoholLogs, exerciseSessions] = await Promise.all([
      supabase
        .from('pain_logs')
        .select('*')
        .gte('log_date', startDate.toISOString())
        .order('log_date', { ascending: false }),
      supabase
        .from('spending_logs')
        .select('*')
        .gte('logged_at', startDate.toISOString())
        .order('logged_at', { ascending: false }),
      supabase
        .from('alcohol_logs')
        .select('*')
        .gte('logged_at', startDate.toISOString())
        .order('logged_at', { ascending: false }),
      supabase
        .from('exercise_sessions')
        .select('*')
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: false }),
    ])

    const analysisPrompt = buildPatternAnalysisPrompt({
      painLogs: painLogs.data || [],
      spendingLogs: spendingLogs.data || [],
      alcoholLogs: alcoholLogs.data || [],
      exerciseSessions: exerciseSessions.data || [],
    })

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPTS.PATTERN_ANALYZER },
      { role: 'user' as const, content: analysisPrompt },
    ]

    const result = await generateCompletion(messages, MODELS.GPT35, 0.7)

    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({
      success: true,
      insights: result.content,
      dataPoints: {
        painLogs: painLogs.data?.length || 0,
        spendingLogs: spendingLogs.data?.length || 0,
        alcoholLogs: alcoholLogs.data?.length || 0,
        exerciseSessions: exerciseSessions.data?.length || 0,
      },
      usage: result.usage,
    })
  } catch (error) {
    console.error('Pattern analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze patterns' },
      { status: 500 }
    )
  }
}