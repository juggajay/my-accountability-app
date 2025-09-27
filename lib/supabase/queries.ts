import { createClient } from './server'
import type { DailyLog, Exercise, ExerciseSession, AlcoholLog, SpendingLog, Goal, Pattern, Insight } from '../types'

export async function getDailyLog(date: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('log_date', date)
    .single()
  
  if (error) return null
  return data as DailyLog
}

export async function getWeekLogs(startDate: Date) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .gte('log_date', startDate.toISOString())
    .order('log_date', { ascending: true })
  
  if (error) return []
  return data as DailyLog[]
}

export async function getRecentExerciseSessions(limit = 7) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercise_sessions')
    .select('*')
    .order('performed_at', { ascending: false })
    .limit(limit)
  
  if (error) return []
  return data as ExerciseSession[]
}

export async function getActiveGoals(limit = 3) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('status', 'active')
    .order('priority', { ascending: true })
    .limit(limit)
  
  if (error) return []
  return data as Goal[]
}

export async function getRecentInsights(limit = 3) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .is('acknowledged_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) return []
  return data as Insight[]
}

export async function getExercises(category?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true })
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) return []
  return data as Exercise[]
}

export async function getRecentAlcoholLogs(days = 7) {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('alcohol_logs')
    .select('*')
    .gte('logged_at', startDate.toISOString())
    .order('logged_at', { ascending: false })
  
  if (error) return []
  return data as AlcoholLog[]
}

export async function getRecentSpendingLogs(days = 7) {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('spending_logs')
    .select('*')
    .gte('logged_at', startDate.toISOString())
    .order('logged_at', { ascending: false })
  
  if (error) return []
  return data as SpendingLog[]
}

export async function getActivePatterns() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('patterns')
    .select('*')
    .eq('is_active', true)
    .order('confidence_score', { ascending: false })
  
  if (error) return []
  return data as Pattern[]
}