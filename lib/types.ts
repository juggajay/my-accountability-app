export interface HealthProfile {
  id: string
  pain_areas: Record<string, any>
  pain_triggers: string[]
  severity_baseline: number
  condition_duration: string
  medical_history: Record<string, any>
  exercise_preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface DailyLog {
  id: string
  log_date: string
  morning_pain?: number
  morning_energy?: number
  morning_mood?: number
  evening_pain?: number
  evening_reflection?: string
  sleep_quality?: number
  notes?: string
  weather?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  category: string
  difficulty: number
  duration_seconds: number
  instructions: string[]
  benefits: string[]
  contraindications: string[]
  video_url?: string
  thumbnail_url?: string
  equipment_needed: string[]
  created_at: string
}

export interface ExerciseSession {
  id: string
  performed_at: string
  planned_exercises: Record<string, any>[]
  completed_exercises: Record<string, any>[]
  total_duration_minutes: number
  pain_before?: number
  pain_during?: number
  pain_after?: number
  energy_before?: number
  energy_after?: number
  effectiveness_rating?: number
  notes?: string
  skipped_reason?: string
  created_at: string
}

export interface AlcoholLog {
  id: string
  logged_at: string
  drink_type: string
  units: number
  alcohol_percentage?: number
  volume_ml?: number
  context?: 'social' | 'stress' | 'celebration' | 'habit' | 'other'
  location?: string
  trigger?: string
  cost?: number
  notes?: string
  next_day_effects?: Record<string, any>
}

export interface SpendingLog {
  id: string
  logged_at: string
  amount: number
  category: string
  subcategory?: string
  description?: string
  merchant?: string
  payment_method?: string
  was_planned: boolean
  was_impulse: boolean
  emotion?: 'happy' | 'sad' | 'stressed' | 'bored' | 'anxious' | 'neutral' | 'other'
  necessity_score?: number
  receipt_url?: string
  notes?: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  category: 'health' | 'career' | 'personal' | 'finance' | 'learning' | 'other'
  target_date?: string
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  priority: number
  progress_percentage: number
  milestones: Record<string, any>[]
  success_metrics: Record<string, any>
  created_at: string
  updated_at: string
}

export interface GoalSession {
  id: string
  goal_id: string
  started_at: string
  ended_at?: string
  duration_minutes?: number
  focus_quality?: number
  progress_made?: string
  blockers?: string[]
  notes?: string
  created_at: string
}

export interface Pattern {
  id: string
  pattern_type: string
  category: 'correlation' | 'trigger' | 'success' | 'warning' | 'prediction'
  title: string
  description: string
  confidence_score: number
  impact_score: number
  data: Record<string, any>
  discovered_at: string
  validated_at?: string
  is_active: boolean
  user_feedback?: 'helpful' | 'not_helpful' | 'neutral'
}

export interface Insight {
  id: string
  insight_type: string
  category: string
  title: string
  description: string
  action_items: Record<string, any>[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  related_patterns?: string[]
  created_at: string
  acknowledged_at?: string
  was_helpful?: boolean
  resulted_in_action?: boolean
}

export interface Intervention {
  id: string
  trigger_type: string
  risk_score: number
  intervention_text: string
  alternative_action?: string
  delivered_at: string
  delivery_method: 'notification' | 'in_app' | 'email' | 'sms'
  user_response?: 'accepted' | 'dismissed' | 'snoozed' | 'ignored'
  response_time_seconds?: number
  was_effective?: boolean
  outcome_notes?: string
}

export interface CoachConversation {
  id: string
  message_role: 'user' | 'assistant' | 'system'
  message_content: string
  message_metadata?: Record<string, any>
  tokens_used?: number
  created_at: string
}

export interface AIRoutine {
  routine_name: string
  total_duration: number
  difficulty: 'easy' | 'moderate' | 'challenging'
  exercises: {
    name: string
    duration_seconds: number
    reps?: number
    sets?: number
    instructions: string[]
    modifications?: string
    target_area: string
    caution?: string
  }[]
}

export interface RecoveryScore {
  overall: number
  energy: number
  painFree: number
}

export type ColorVariant = 'primary' | 'success' | 'warning' | 'danger'
export type CardVariant = 'default' | 'glass' | 'gradient' | 'metric'