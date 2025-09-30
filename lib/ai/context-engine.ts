import { createClient } from '@/lib/supabase/server'

export interface UserContext {
  recentActivities: any[]
  healthTrends: {
    averagePainLevel: number
    exerciseFrequency: number
    alcoholConsumption: number
  }
  spendingTrends: {
    totalThisWeek: number
    topCategory: string
    impulseCount: number
  }
  nutritionTrends: {
    averageCalories: number
    mealsPerDay: number
    topMealType: string
  }
  memories: any[]
  goals: any[]
  patterns: string[]
}

/**
 * Get comprehensive user context for AI conversations
 */
export async function getUserContext(userId: string): Promise<UserContext> {
  const supabase = await createClient()
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Recent activities (last 7 days)
  const { data: activities } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  // Health trends
  const { data: painLogs } = await supabase
    .from('pain_logs')
    .select('level')
    .eq('user_id', userId)
    .gte('logged_at', sevenDaysAgo.toISOString())

  const { data: exerciseLogs } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', sevenDaysAgo.toISOString())

  const { data: alcoholLogs } = await supabase
    .from('alcohol_logs')
    .select('units')
    .eq('user_id', userId)
    .gte('logged_at', sevenDaysAgo.toISOString())

  // Spending trends
  const { data: spending } = await supabase
    .from('spending')
    .select('amount, category, is_impulse')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())

  // Nutrition trends
  const { data: foodLogs } = await supabase
    .from('food_logs')
    .select('calories, meal_type')
    .eq('user_id', userId)
    .gte('logged_at', sevenDaysAgo.toISOString())

  // AI Memories
  const { data: memories } = await supabase
    .from('ai_memory')
    .select('*')
    .eq('user_id', userId)
    .order('importance', { ascending: false })
    .limit(10)

  // Goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')

  // Calculate trends
  const averagePainLevel =
    painLogs && painLogs.length > 0
      ? painLogs.reduce((sum, log) => sum + log.level, 0) / painLogs.length
      : 0

  const exerciseFrequency = exerciseLogs?.length || 0

  const alcoholConsumption =
    alcoholLogs && alcoholLogs.length > 0
      ? alcoholLogs.reduce((sum, log) => sum + (log.units || 0), 0)
      : 0

  const totalSpending =
    spending && spending.length > 0
      ? spending.reduce((sum, s) => sum + s.amount, 0)
      : 0

  const impulseCount =
    spending && spending.length > 0
      ? spending.filter((s) => s.is_impulse).length
      : 0

  const topCategory =
    spending && spending.length > 0
      ? getMostFrequent(spending.map((s) => s.category))
      : 'none'

  const averageCalories =
    foodLogs && foodLogs.length > 0
      ? foodLogs.reduce((sum, log) => sum + log.calories, 0) / foodLogs.length
      : 0

  const mealsPerDay =
    foodLogs && foodLogs.length > 0 ? foodLogs.length / 7 : 0

  const topMealType =
    foodLogs && foodLogs.length > 0
      ? getMostFrequent(foodLogs.map((f) => f.meal_type))
      : 'none'

  // Detect patterns
  const patterns = detectPatterns({
    averagePainLevel,
    exerciseFrequency,
    alcoholConsumption,
    impulseCount,
    averageCalories,
  })

  return {
    recentActivities: activities || [],
    healthTrends: {
      averagePainLevel,
      exerciseFrequency,
      alcoholConsumption,
    },
    spendingTrends: {
      totalThisWeek: totalSpending,
      topCategory,
      impulseCount,
    },
    nutritionTrends: {
      averageCalories,
      mealsPerDay,
      topMealType,
    },
    memories: memories || [],
    goals: goals || [],
    patterns,
  }
}

/**
 * Store important information in AI memory
 */
export async function storeMemory(
  userId: string,
  memoryType: 'preference' | 'trigger' | 'goal' | 'fact' | 'pattern',
  content: string,
  importance: number = 5
) {
  const supabase = await createClient()

  await supabase.from('ai_memory').insert({
    user_id: userId,
    memory_type: memoryType,
    content,
    importance,
    created_at: new Date().toISOString(),
  })
}

/**
 * Generate context summary for AI
 */
export function generateContextSummary(context: UserContext): string {
  let summary = '**User Context Summary:**\n\n'

  // Health insights
  if (context.healthTrends.averagePainLevel > 0) {
    summary += `🩺 **Health:** Average pain level ${context.healthTrends.averagePainLevel.toFixed(1)}/10 this week. `
    if (context.healthTrends.exerciseFrequency > 0) {
      summary += `Exercised ${context.healthTrends.exerciseFrequency} times. `
    }
    if (context.healthTrends.alcoholConsumption > 0) {
      summary += `${context.healthTrends.alcoholConsumption.toFixed(1)} alcohol units consumed. `
    }
    summary += '\n\n'
  }

  // Spending insights
  if (context.spendingTrends.totalThisWeek > 0) {
    summary += `💰 **Spending:** $${context.spendingTrends.totalThisWeek.toFixed(2)} this week. `
    if (context.spendingTrends.impulseCount > 0) {
      summary += `${context.spendingTrends.impulseCount} impulse purchases. `
    }
    summary += `Top category: ${context.spendingTrends.topCategory}.\n\n`
  }

  // Nutrition insights
  if (context.nutritionTrends.averageCalories > 0) {
    summary += `🍎 **Nutrition:** ${context.nutritionTrends.averageCalories.toFixed(0)} avg calories/day. `
    summary += `${context.nutritionTrends.mealsPerDay.toFixed(1)} meals/day.\n\n`
  }

  // Patterns
  if (context.patterns.length > 0) {
    summary += `📊 **Patterns:**\n${context.patterns.map((p) => `- ${p}`).join('\n')}\n\n`
  }

  // Goals
  if (context.goals.length > 0) {
    summary += `🎯 **Active Goals:**\n${context.goals.slice(0, 3).map((g) => `- ${g.title}`).join('\n')}\n\n`
  }

  // Important memories
  if (context.memories.length > 0) {
    summary += `🧠 **Things I remember about you:**\n${context.memories.slice(0, 5).map((m) => `- ${m.content}`).join('\n')}`
  }

  return summary
}

/**
 * Detect behavioral patterns
 */
function detectPatterns(data: {
  averagePainLevel: number
  exerciseFrequency: number
  alcoholConsumption: number
  impulseCount: number
  averageCalories: number
}): string[] {
  const patterns: string[] = []

  if (data.averagePainLevel > 6) {
    patterns.push('High pain levels - may need more rest or medical attention')
  }

  if (data.exerciseFrequency === 0 && data.averagePainLevel > 5) {
    patterns.push('No exercise logged while experiencing pain - could benefit from gentle movement')
  }

  if (data.alcoholConsumption > 7) {
    patterns.push('Alcohol consumption above recommended limits (>7 units/week)')
  }

  if (data.impulseCount > 3) {
    patterns.push('Frequent impulse purchases - may indicate stress or emotional spending')
  }

  if (data.averageCalories > 2500) {
    patterns.push('Higher than average calorie intake')
  } else if (data.averageCalories < 1500 && data.averageCalories > 0) {
    patterns.push('Lower than average calorie intake - ensure adequate nutrition')
  }

  if (data.exerciseFrequency >= 3 && data.averagePainLevel < 5) {
    patterns.push('Great exercise consistency with manageable pain levels!')
  }

  return patterns
}

/**
 * Get most frequent item in array
 */
function getMostFrequent(arr: string[]): string {
  const counts: { [key: string]: number } = {}
  let maxCount = 0
  let mostFrequent = arr[0] || 'none'

  arr.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1
    if (counts[item] > maxCount) {
      maxCount = counts[item]
      mostFrequent = item
    }
  })

  return mostFrequent
}