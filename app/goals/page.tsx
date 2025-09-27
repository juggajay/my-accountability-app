'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PremiumCard } from '@/components/ui/premium-card'
import { ProgressRing } from '@/components/ui/progress-ring'
import { format } from 'date-fns'

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      const result = await response.json()
      if (result.success) {
        setGoals(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true
    if (filter === 'active') return goal.progress_percentage < 100
    if (filter === 'completed') return goal.progress_percentage >= 100
    return true
  })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: 'text-success-500',
      finance: 'text-warning-500',
      personal: 'text-primary-500',
      career: 'text-danger-500',
    }
    return colors[category] || 'text-neutral-500'
  }

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      health: '💪',
      finance: '💰',
      personal: '🎯',
      career: '🚀',
    }
    return emojis[category] || '📌'
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Goals
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Track your progress
            </p>
          </div>
          <Link
            href="/goals/new"
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
          >
            + New Goal
          </Link>
        </div>

        <div className="flex gap-2">
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <PremiumCard key={i} className="h-64 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
            ))}
          </div>
        ) : filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map(goal => (
              <Link key={goal.id} href={`/goals/${goal.id}`}>
                <PremiumCard className="hover:scale-105 transition-transform cursor-pointer h-full">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryEmoji(goal.category)}</span>
                        <span className={`text-xs font-medium capitalize ${getCategoryColor(goal.category)}`}>
                          {goal.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < goal.priority ? 'text-warning-500' : 'text-neutral-300'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-1">{goal.title}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {goal.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <ProgressRing
                        progress={goal.progress_percentage}
                        size={80}
                        strokeWidth={6}
                        color="primary"
                        showPercentage={true}
                      />
                      <div className="text-right">
                        <div className="text-sm text-neutral-500">Target</div>
                        <div className="text-sm font-medium">
                          {format(new Date(goal.target_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>

                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                        <div className="text-xs text-neutral-500">
                          {goal.milestones.filter((m: any) => m.completed).length} / {goal.milestones.length} milestones
                        </div>
                      </div>
                    )}
                  </div>
                </PremiumCard>
              </Link>
            ))}
          </div>
        ) : (
          <PremiumCard className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              No {filter !== 'all' && filter} goals yet. Create your first goal to get started!
            </p>
            <Link
              href="/goals/new"
              className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
            >
              Create Goal
            </Link>
          </PremiumCard>
        )}
      </div>
    </div>
  )
}