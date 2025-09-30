'use client'

/**
 * Proactive Insights Widget
 * Displays AI-generated observations, suggestions, and questions without user prompting
 */

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Sparkles, TrendingUp, AlertCircle, Trophy, MessageCircle, Target } from 'lucide-react'

interface ProactiveInsight {
  id: string
  category: 'observation' | 'suggestion' | 'concern' | 'celebration' | 'question' | 'pattern_alert'
  title: string
  message: string
  priority: number
  createdAt: string
}

const categoryConfig = {
  observation: {
    icon: Sparkles,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    label: 'Observation',
  },
  suggestion: {
    icon: Target,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    label: 'Suggestion',
  },
  concern: {
    icon: AlertCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    label: 'Check-in',
  },
  celebration: {
    icon: Trophy,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    label: 'Win',
  },
  question: {
    icon: MessageCircle,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    label: 'Question',
  },
  pattern_alert: {
    icon: TrendingUp,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    label: 'Pattern Detected',
  },
}

export function ProactiveInsights() {
  const [insights, setInsights] = useState<ProactiveInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ai/proactive')

      if (!response.ok) {
        throw new Error('Failed to fetch insights')
      }

      const data = await response.json()

      if (data.success) {
        setInsights(data.data.insights || [])
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (err: any) {
      console.error('Error fetching insights:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = (insightId: string) => {
    setDismissedIds(prev => new Set(prev).add(insightId))

    // Mark as viewed in the backend
    fetch(`/api/ai/proactive/${insightId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: 'neutral' }),
    }).catch(console.error)
  }

  const handleFeedback = async (insightId: string, feedback: 'helpful' | 'not_helpful') => {
    try {
      await fetch(`/api/ai/proactive/${insightId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })

      setDismissedIds(prev => new Set(prev).add(insightId))
    } catch (err) {
      console.error('Error submitting feedback:', err)
    }
  }

  const visibleInsights = insights
    .filter(insight => !dismissedIds.has(insight.id))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)

  if (loading) {
    return (
      <PremiumCard variant="glass">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
      </PremiumCard>
    )
  }

  if (error) {
    return (
      <PremiumCard variant="glass">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
        <p className="text-sm text-red-400">Unable to load insights. Try refreshing.</p>
      </PremiumCard>
    )
  }

  if (visibleInsights.length === 0) {
    return (
      <PremiumCard variant="glass">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
        <p className="text-sm text-white/60">
          Keep logging your activities and I'll share personalized insights based on your patterns.
        </p>
      </PremiumCard>
    )
  }

  return (
    <PremiumCard variant="glass">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-primary-400" />
        <h3 className="text-lg font-semibold">AI Insights</h3>
      </div>

      <div className="space-y-4">
        {visibleInsights.map(insight => {
          const config = categoryConfig[insight.category]
          const Icon = config.icon

          return (
            <div
              key={insight.id}
              className="relative group"
            >
              <div className={`p-4 rounded-lg border border-white/5 ${config.bg} transition-all hover:border-white/10`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <button
                        onClick={() => handleDismiss(insight.id)}
                        className="text-white/40 hover:text-white/60 text-xs"
                      >
                        Dismiss
                      </button>
                    </div>

                    <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {insight.message}
                    </p>

                    {/* Feedback buttons */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => handleFeedback(insight.id, 'helpful')}
                        className="text-xs text-white/50 hover:text-green-400 transition-colors"
                      >
                        👍 Helpful
                      </button>
                      <button
                        onClick={() => handleFeedback(insight.id, 'not_helpful')}
                        className="text-xs text-white/50 hover:text-red-400 transition-colors"
                      >
                        👎 Not helpful
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {insights.length > visibleInsights.length && (
        <button
          onClick={() => setDismissedIds(new Set())}
          className="mt-4 w-full text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          Show more insights
        </button>
      )}
    </PremiumCard>
  )
}