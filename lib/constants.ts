export const PAIN_LEVELS = [
  { value: 0, label: "No Pain", emoji: "😊", color: "success" },
  { value: 1, label: "Minimal", emoji: "🙂", color: "success" },
  { value: 2, label: "Mild", emoji: "😌", color: "success" },
  { value: 3, label: "Uncomfortable", emoji: "😐", color: "warning" },
  { value: 4, label: "Moderate", emoji: "😕", color: "warning" },
  { value: 5, label: "Distracting", emoji: "😣", color: "warning" },
  { value: 6, label: "Distressing", emoji: "😖", color: "danger" },
  { value: 7, label: "Intense", emoji: "😫", color: "danger" },
  { value: 8, label: "Severe", emoji: "😭", color: "danger" },
  { value: 9, label: "Unbearable", emoji: "😱", color: "danger" },
  { value: 10, label: "Worst", emoji: "🤯", color: "danger" }
] as const

export const DRINK_TYPES = [
  { type: "beer", emoji: "🍺", units: 1.0, label: "Beer" },
  { type: "wine", emoji: "🍷", units: 1.5, label: "Wine" },
  { type: "spirit", emoji: "🥃", units: 2.0, label: "Spirit" },
  { type: "cocktail", emoji: "🍹", units: 2.5, label: "Cocktail" }
] as const

export const ALCOHOL_CONTEXTS = [
  "social",
  "stress",
  "celebration",
  "habit",
  "other"
] as const

export const SPENDING_CATEGORIES = [
  { value: "food", label: "Food & Dining", icon: "🍔" },
  { value: "transport", label: "Transportation", icon: "🚗" },
  { value: "entertainment", label: "Entertainment", icon: "🎮" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "health", label: "Health & Fitness", icon: "💊" },
  { value: "subscriptions", label: "Subscriptions", icon: "📱" },
  { value: "utilities", label: "Utilities", icon: "💡" },
  { value: "other", label: "Other", icon: "💰" }
] as const

export const EMOTIONS = [
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "sad", emoji: "😢", label: "Sad" },
  { value: "stressed", emoji: "😰", label: "Stressed" },
  { value: "bored", emoji: "😑", label: "Bored" },
  { value: "anxious", emoji: "😟", label: "Anxious" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "other", emoji: "🤔", label: "Other" }
] as const

export const GOAL_CATEGORIES = [
  { value: "health", label: "Health", icon: "💪", color: "success" },
  { value: "career", label: "Career", icon: "💼", color: "primary" },
  { value: "personal", label: "Personal", icon: "🎯", color: "warning" },
  { value: "finance", label: "Finance", icon: "💰", color: "success" },
  { value: "learning", label: "Learning", icon: "📚", color: "primary" },
  { value: "other", label: "Other", icon: "✨", color: "neutral" }
] as const

export const GOAL_STATUS = [
  "active",
  "paused",
  "completed",
  "abandoned"
] as const

export const PRIORITY_LEVELS = [
  { value: 1, label: "Low", color: "neutral" },
  { value: 2, label: "Medium-Low", color: "primary" },
  { value: 3, label: "Medium", color: "warning" },
  { value: 4, label: "Medium-High", color: "warning" },
  { value: 5, label: "High", color: "danger" }
] as const

export const EXERCISE_CATEGORIES = [
  "stretching",
  "strengthening",
  "mobility",
  "core",
  "balance",
  "cardio",
  "yoga",
  "pilates"
] as const

export const DIFFICULTY_LEVELS = [
  { value: 1, label: "Very Easy", color: "success" },
  { value: 2, label: "Easy", color: "success" },
  { value: 3, label: "Moderate", color: "warning" },
  { value: 4, label: "Challenging", color: "warning" },
  { value: 5, label: "Advanced", color: "danger" }
] as const

export const PATTERN_CATEGORIES = [
  "correlation",
  "trigger",
  "success",
  "warning",
  "prediction"
] as const

export const INSIGHT_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent"
] as const

export const INTERVENTION_DELIVERY_METHODS = [
  "notification",
  "in_app",
  "email",
  "sms"
] as const

export const DEFAULT_EXERCISE_DURATION = 60 // seconds
export const DEFAULT_ROUTINE_DURATION = 15 // minutes
export const MIN_PATTERN_CONFIDENCE = 0.7
export const HIGH_RISK_THRESHOLD = 0.7
export const WEEKLY_ALCOHOL_LIMIT = 14 // units per week
export const DAILY_ALCOHOL_LIMIT = 3 // units per day