/**
 * Context Builder
 * Analyzes all user data to build a comprehensive context for AI interactions
 */

import { createClient } from '@/lib/supabase/server'

export interface DailyContext {
  date: string

  // Activity summaries
  painSummary: {
    morningPain: number | null
    eveningPain: number | null
    trend: 'improving' | 'stable' | 'worsening' | 'unknown'
    comparedToAverage: number // difference from 7-day average
  }

  exerciseSummary: {
    didExercise: boolean
    sessionCount: number
    totalMinutes: number
    painReduction: number | null // pain_before - pain_after
    effectiveness: number | null
    skippedDays: number // consecutive days without exercise
  }

  alcoholSummary: {
    unitsConsumed: number
    contexts: string[]
    triggers: string[]
    weeklyTotal: number
    isAboveGoal: boolean
  }

  spendingSummary: {
    totalSpent: number
    impulseCount: number
    impulseTotalSpent: number
    emotionalTriggers: string[]
    weeklyTotal: number
  }

  goalProgress: {
    activeGoals: number
    timeSpentMinutes: number
    progressMade: boolean
    blockers: string[]
  }

  // AI Analysis
  overallSentiment: 'struggling' | 'neutral' | 'progressing' | 'thriving'
  keyObservations: string[]
  anomalies: string[]
  patternsDetected: string[]

  // Proactive suggestions
  suggestedConversationTopics: string[]
  proactiveAdvice: string[]
  celebrationWorthy: string[]
  concerns: string[]

  engagementScore: number // 0-10
  lastInteraction: string | null
}

export interface UserMemory {
  id: string
  memoryType: string
  category: string
  keyFact: string
  context: string | null
  confidence: number
  importance: number
  lastReferencedAt: string | null
  referenceCount: number
  createdAt: string
}

export interface ProactiveInsight {
  id: string
  category: string
  title: string
  message: string
  detailedReasoning: string | null
  priority: number
  createdAt: string
  delivered: boolean
}

/**
 * Builds a comprehensive daily context by analyzing all user data
 */
export async function buildDailyContext(date: Date = new Date()): Promise<DailyContext> {
  const supabase = await createClient()
  const dateStr = date.toISOString().split('T')[0]

  // Fetch all relevant data in parallel
  const [
    todayLog,
    weekLogs,
    todayExercises,
    recentExercises,
    todayAlcohol,
    weekAlcohol,
    todaySpending,
    weekSpending,
    activeGoals,
    todayGoalSessions,
    lastInteraction,
  ] = await Promise.all([
    // Today's daily log
    supabase.from('daily_logs').select('*').eq('log_date', dateStr).single(),

    // Last 7 days of logs for averages
    supabase.from('daily_logs').select('*').gte('log_date', new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).lte('log_date', dateStr).order('log_date', { ascending: false }),

    // Today's exercises
    supabase.from('exercise_sessions').select('*').gte('performed_at', `${dateStr}T00:00:00`).lte('performed_at', `${dateStr}T23:59:59`),

    // Recent exercises for streak calculation
    supabase.from('exercise_sessions').select('performed_at').gte('performed_at', new Date(date.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()).order('performed_at', { ascending: false }).limit(20),

    // Today's alcohol
    supabase.from('alcohol_logs').select('*').gte('logged_at', `${dateStr}T00:00:00`).lte('logged_at', `${dateStr}T23:59:59`),

    // Week's alcohol
    supabase.from('alcohol_logs').select('*').gte('logged_at', new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()),

    // Today's spending
    supabase.from('spending_logs').select('*').gte('logged_at', `${dateStr}T00:00:00`).lte('logged_at', `${dateStr}T23:59:59`),

    // Week's spending
    supabase.from('spending_logs').select('*').gte('logged_at', new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()),

    // Active goals
    supabase.from('goals').select('*').eq('status', 'active'),

    // Today's goal sessions
    supabase.from('goal_sessions').select('*').gte('started_at', `${dateStr}T00:00:00`).lte('started_at', `${dateStr}T23:59:59`),

    // Last coach interaction
    supabase.from('coach_conversations').select('created_at').order('created_at', { ascending: false }).limit(1).single(),
  ])

  // Calculate pain summary
  const painSummary = calculatePainSummary(todayLog.data, weekLogs.data || [])

  // Calculate exercise summary
  const exerciseSummary = calculateExerciseSummary(todayExercises.data || [], recentExercises.data || [])

  // Calculate alcohol summary
  const alcoholSummary = calculateAlcoholSummary(todayAlcohol.data || [], weekAlcohol.data || [])

  // Calculate spending summary
  const spendingSummary = calculateSpendingSummary(todaySpending.data || [], weekSpending.data || [])

  // Calculate goal progress
  const goalProgress = calculateGoalProgress(activeGoals.data || [], todayGoalSessions.data || [])

  // AI Analysis
  const analysis = analyzeOverallContext({
    painSummary,
    exerciseSummary,
    alcoholSummary,
    spendingSummary,
    goalProgress,
  })

  return {
    date: dateStr,
    painSummary,
    exerciseSummary,
    alcoholSummary,
    spendingSummary,
    goalProgress,
    ...analysis,
    lastInteraction: lastInteraction.data?.created_at || null,
  }
}

function calculatePainSummary(todayLog: any, weekLogs: any[]): DailyContext['painSummary'] {
  const morningPain = todayLog?.morning_pain ?? null
  const eveningPain = todayLog?.evening_pain ?? null

  // Calculate 7-day average
  const validMorningPains = weekLogs.filter(log => log.morning_pain !== null).map(log => log.morning_pain)
  const avgMorningPain = validMorningPains.length > 0
    ? validMorningPains.reduce((a, b) => a + b, 0) / validMorningPains.length
    : null

  const comparedToAverage = morningPain && avgMorningPain
    ? Number((morningPain - avgMorningPain).toFixed(1))
    : 0

  // Determine trend from last 3 days
  const recentLogs = weekLogs.slice(0, 3).filter(log => log.morning_pain !== null)
  let trend: 'improving' | 'stable' | 'worsening' | 'unknown' = 'unknown'

  if (recentLogs.length >= 2) {
    const avgRecent = recentLogs.reduce((a, b) => a + b.morning_pain, 0) / recentLogs.length
    const diff = avgRecent - (avgMorningPain || 0)
    if (diff < -0.5) trend = 'improving'
    else if (diff > 0.5) trend = 'worsening'
    else trend = 'stable'
  }

  return {
    morningPain,
    eveningPain,
    trend,
    comparedToAverage,
  }
}

function calculateExerciseSummary(todayExercises: any[], recentExercises: any[]): DailyContext['exerciseSummary'] {
  const didExercise = todayExercises.length > 0
  const sessionCount = todayExercises.length
  const totalMinutes = todayExercises.reduce((sum, session) => sum + (session.total_duration_minutes || 0), 0)

  const painReduction = todayExercises.length > 0
    ? todayExercises.reduce((sum, session) => {
        const before = session.pain_before ?? 0
        const after = session.pain_after ?? 0
        return sum + (before - after)
      }, 0) / todayExercises.length
    : null

  const effectiveness = todayExercises.length > 0
    ? todayExercises.reduce((sum, session) => sum + (session.effectiveness_rating || 0), 0) / todayExercises.length
    : null

  // Calculate consecutive days without exercise
  let skippedDays = 0
  if (!didExercise && recentExercises.length > 0) {
    const sortedDates = recentExercises
      .map(ex => new Date(ex.performed_at).toISOString().split('T')[0])
      .sort((a, b) => b.localeCompare(a))

    const today = new Date().toISOString().split('T')[0]
    let checkDate = new Date()

    while (skippedDays < 14) {
      checkDate.setDate(checkDate.getDate() - 1)
      const dateStr = checkDate.toISOString().split('T')[0]
      if (sortedDates.includes(dateStr)) break
      skippedDays++
    }
  }

  return {
    didExercise,
    sessionCount,
    totalMinutes,
    painReduction: painReduction !== null ? Number(painReduction.toFixed(1)) : null,
    effectiveness: effectiveness !== null ? Number(effectiveness.toFixed(1)) : null,
    skippedDays,
  }
}

function calculateAlcoholSummary(todayAlcohol: any[], weekAlcohol: any[]): DailyContext['alcoholSummary'] {
  const unitsConsumed = todayAlcohol.reduce((sum, log) => sum + (log.units || 0), 0)
  const contexts = [...new Set(todayAlcohol.map(log => log.context).filter(Boolean))]
  const triggers = [...new Set(todayAlcohol.map(log => log.trigger).filter(Boolean))]
  const weeklyTotal = weekAlcohol.reduce((sum, log) => sum + (log.units || 0), 0)

  // Goal: 2 drinks per week (hardcoded for now, could be from user_discovery_profile)
  const weeklyGoal = 2
  const isAboveGoal = weeklyTotal > weeklyGoal

  return {
    unitsConsumed,
    contexts,
    triggers,
    weeklyTotal: Number(weeklyTotal.toFixed(1)),
    isAboveGoal,
  }
}

function calculateSpendingSummary(todaySpending: any[], weekSpending: any[]): DailyContext['spendingSummary'] {
  const totalSpent = todaySpending.reduce((sum, log) => sum + Number(log.amount || 0), 0)
  const impulseCount = todaySpending.filter(log => log.was_impulse).length
  const impulseTotalSpent = todaySpending.filter(log => log.was_impulse).reduce((sum, log) => sum + Number(log.amount || 0), 0)
  const emotionalTriggers = [...new Set(todaySpending.map(log => log.emotion).filter(Boolean))]
  const weeklyTotal = weekSpending.reduce((sum, log) => sum + Number(log.amount || 0), 0)

  return {
    totalSpent: Number(totalSpent.toFixed(2)),
    impulseCount,
    impulseTotalSpent: Number(impulseTotalSpent.toFixed(2)),
    emotionalTriggers,
    weeklyTotal: Number(weeklyTotal.toFixed(2)),
  }
}

function calculateGoalProgress(activeGoals: any[], todayGoalSessions: any[]): DailyContext['goalProgress'] {
  const timeSpentMinutes = todayGoalSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
  const progressMade = todayGoalSessions.some(session => session.progress_made)
  const blockers = [...new Set(todayGoalSessions.flatMap(session => session.blockers || []))]

  return {
    activeGoals: activeGoals.length,
    timeSpentMinutes,
    progressMade,
    blockers,
  }
}

function analyzeOverallContext(summaries: {
  painSummary: DailyContext['painSummary']
  exerciseSummary: DailyContext['exerciseSummary']
  alcoholSummary: DailyContext['alcoholSummary']
  spendingSummary: DailyContext['spendingSummary']
  goalProgress: DailyContext['goalProgress']
}) {
  const observations: string[] = []
  const anomalies: string[] = []
  const patterns: string[] = []
  const suggestions: string[] = []
  const advice: string[] = []
  const celebrations: string[] = []
  const concerns: string[] = []

  let positiveSignals = 0
  let negativeSignals = 0

  // Pain Analysis
  if (summaries.painSummary.morningPain !== null) {
    if (summaries.painSummary.trend === 'improving') {
      observations.push('Pain levels are trending downward')
      celebrations.push('Your pain management is working!')
      positiveSignals += 2
    } else if (summaries.painSummary.trend === 'worsening') {
      observations.push('Pain levels have been increasing')
      concerns.push('Pain has been higher than usual this week')
      suggestions.push('Let\'s talk about what\'s changed recently')
      negativeSignals += 2
    }

    if (summaries.painSummary.comparedToAverage > 1) {
      anomalies.push(`Morning pain is ${summaries.painSummary.comparedToAverage} points above average`)
      negativeSignals++
    } else if (summaries.painSummary.comparedToAverage < -1) {
      anomalies.push(`Morning pain is ${Math.abs(summaries.painSummary.comparedToAverage)} points below average`)
      positiveSignals++
    }
  }

  // Exercise Analysis
  if (summaries.exerciseSummary.didExercise) {
    observations.push(`Completed ${summaries.exerciseSummary.sessionCount} exercise session(s) today`)
    positiveSignals++

    if (summaries.exerciseSummary.painReduction && summaries.exerciseSummary.painReduction > 1) {
      observations.push(`Exercise reduced pain by ${summaries.exerciseSummary.painReduction} points`)
      patterns.push('Exercise is effectively reducing pain')
      positiveSignals++
    }

    if (summaries.exerciseSummary.effectiveness && summaries.exerciseSummary.effectiveness >= 4) {
      celebrations.push('High-quality exercise session today!')
      positiveSignals++
    }
  } else if (summaries.exerciseSummary.skippedDays >= 2) {
    observations.push(`No exercise for ${summaries.exerciseSummary.skippedDays} days`)
    concerns.push('Exercise streak has broken')
    suggestions.push('What\'s making it hard to exercise right now?')
    negativeSignals += 2
  }

  // Alcohol Analysis
  if (summaries.alcoholSummary.unitsConsumed > 0) {
    observations.push(`${summaries.alcoholSummary.unitsConsumed} units of alcohol consumed`)

    if (summaries.alcoholSummary.contexts.includes('stress')) {
      patterns.push('Drinking in response to stress')
      suggestions.push('Let\'s explore other stress management strategies')
      negativeSignals++
    }

    if (summaries.alcoholSummary.isAboveGoal) {
      concerns.push(`Weekly alcohol goal exceeded (${summaries.alcoholSummary.weeklyTotal} units)`)
      negativeSignals++
    }
  }

  // Spending Analysis
  if (summaries.spendingSummary.impulseCount > 0) {
    observations.push(`${summaries.spendingSummary.impulseCount} impulse purchase(s) today`)

    if (summaries.spendingSummary.emotionalTriggers.length > 0) {
      patterns.push(`Impulse spending triggered by: ${summaries.spendingSummary.emotionalTriggers.join(', ')}`)
      suggestions.push('What were you feeling before that purchase?')
      negativeSignals++
    }
  }

  // Goal Progress
  if (summaries.goalProgress.timeSpentMinutes > 0) {
    observations.push(`${summaries.goalProgress.timeSpentMinutes} minutes on goals today`)
    positiveSignals++

    if (summaries.goalProgress.progressMade) {
      celebrations.push('Made progress on your goals today!')
      positiveSignals++
    }

    if (summaries.goalProgress.blockers.length > 0) {
      observations.push(`Blockers encountered: ${summaries.goalProgress.blockers.join(', ')}`)
      suggestions.push('Need help working through those blockers?')
    }
  }

  // Determine overall sentiment
  let sentiment: 'struggling' | 'neutral' | 'progressing' | 'thriving'
  const sentimentScore = positiveSignals - negativeSignals

  if (sentimentScore >= 3) sentiment = 'thriving'
  else if (sentimentScore >= 1) sentiment = 'progressing'
  else if (sentimentScore >= -1) sentiment = 'neutral'
  else sentiment = 'struggling'

  // Engagement score (0-10)
  const hasActivity = (
    summaries.painSummary.morningPain !== null ||
    summaries.exerciseSummary.didExercise ||
    summaries.alcoholSummary.unitsConsumed > 0 ||
    summaries.spendingSummary.totalSpent > 0 ||
    summaries.goalProgress.timeSpentMinutes > 0
  )

  const activityCount = [
    summaries.painSummary.morningPain !== null,
    summaries.exerciseSummary.didExercise,
    summaries.alcoholSummary.unitsConsumed > 0,
    summaries.spendingSummary.totalSpent > 0,
    summaries.goalProgress.timeSpentMinutes > 0,
  ].filter(Boolean).length

  const engagementScore = hasActivity ? Math.min(10, 4 + activityCount * 1.2) : 2

  return {
    overallSentiment: sentiment,
    keyObservations: observations,
    anomalies,
    patternsDetected: patterns,
    suggestedConversationTopics: suggestions,
    proactiveAdvice: advice,
    celebrationWorthy: celebrations,
    concerns,
    engagementScore: Math.round(engagementScore),
  }
}

/**
 * Saves the daily context to the database
 */
export async function saveDailyContext(context: DailyContext): Promise<void> {
  const supabase = await createClient()

  await supabase.from('daily_context_snapshots').upsert({
    snapshot_date: context.date,
    pain_summary: context.painSummary,
    exercise_summary: context.exerciseSummary,
    alcohol_summary: context.alcoholSummary,
    spending_summary: context.spendingSummary,
    goal_progress: context.goalProgress,
    overall_sentiment: context.overallSentiment,
    key_observations: context.keyObservations,
    anomalies: context.anomalies,
    patterns_detected: context.patternsDetected,
    suggested_conversation_topics: context.suggestedConversationTopics,
    proactive_advice: context.proactiveAdvice,
    celebration_worthy: context.celebrationWorthy,
    concerns: context.concerns,
    engagement_score: context.engagementScore,
    last_interaction: context.lastInteraction,
  }, {
    onConflict: 'snapshot_date',
  })
}

/**
 * Gets AI memories about the user
 */
export async function getUserMemories(limit: number = 20): Promise<UserMemory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ai_memory')
    .select('*')
    .eq('is_active', true)
    .order('importance', { ascending: false })
    .order('last_referenced_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map(row => ({
    id: row.id,
    memoryType: row.memory_type,
    category: row.category,
    keyFact: row.key_fact,
    context: row.context,
    confidence: row.confidence,
    importance: row.importance,
    lastReferencedAt: row.last_referenced_at,
    referenceCount: row.reference_count,
    createdAt: row.created_at,
  }))
}

/**
 * Saves a new memory about the user
 */
export async function saveMemory(memory: {
  memoryType: string
  category: string
  keyFact: string
  context?: string
  confidence?: number
  importance?: number
  learnedFrom: string
  sourceConversationId?: string
}): Promise<void> {
  const supabase = await createClient()

  await supabase.from('ai_memory').insert({
    memory_type: memory.memoryType,
    category: memory.category,
    key_fact: memory.keyFact,
    context: memory.context,
    confidence: memory.confidence ?? 0.8,
    importance: memory.importance ?? 5,
    learned_from: memory.learnedFrom,
    source_conversation_id: memory.sourceConversationId,
  })
}

/**
 * Updates reference count when a memory is used
 */
export async function referenceMemory(memoryId: string): Promise<void> {
  const supabase = await createClient()

  await supabase.rpc('increment_memory_reference', { memory_id: memoryId })
}

/**
 * Gets undelivered proactive insights
 */
export async function getProactiveInsights(limit: number = 5): Promise<ProactiveInsight[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proactive_insights')
    .select('*')
    .is('delivered_at', null)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map(row => ({
    id: row.id,
    category: row.insight_category,
    title: row.title,
    message: row.message,
    detailedReasoning: row.detailed_reasoning,
    priority: row.priority,
    createdAt: row.created_at,
    delivered: !!row.delivered_at,
  }))
}