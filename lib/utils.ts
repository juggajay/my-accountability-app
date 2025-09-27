import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}

export function getDayCount(startDate?: Date): number {
  const start = startDate || new Date("2025-01-01") // Default start date
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function calculateStreak(sessions: any[]): number {
  if (!sessions || sessions.length === 0) return 0
  
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < sessions.length; i++) {
    const sessionDate = new Date(sessions[i].performed_at)
    sessionDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === i) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

export function calculateTrend(current: number, average: number): number {
  if (!current || !average) return 0
  return Math.round(((current - average) / average) * 100)
}

export function calculateRecoveryScore(todayLog: any, weekLogs: any[]) {
  if (!todayLog) {
    return {
      overall: 0,
      energy: 0,
      painFree: 0
    }
  }
  
  const energyScore = todayLog.morning_energy ? (todayLog.morning_energy / 10) * 100 : 0
  const painScore = todayLog.morning_pain ? ((10 - todayLog.morning_pain) / 10) * 100 : 0
  
  const weekAvgPain = weekLogs?.reduce((acc, log) => acc + (log.morning_pain || 0), 0) / (weekLogs?.length || 1)
  const improvementScore = weekAvgPain > todayLog.morning_pain ? 75 : 50
  
  return {
    overall: Math.round((energyScore + painScore + improvementScore) / 3),
    energy: Math.round(energyScore),
    painFree: Math.round(painScore)
  }
}

export function getNextExerciseTime(): string {
  const hour = new Date().getHours()
  if (hour < 10) return "This Morning"
  if (hour < 14) return "After Lunch"
  if (hour < 18) return "This Evening"
  return "Tomorrow Morning"
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}