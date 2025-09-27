'use client'

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'

export default function InsightsPage() {
  const [insights, setInsights] = useState<string>('')
  const [dataPoints, setDataPoints] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [days, setDays] = useState(30)

  const fetchInsights = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/ai/analyze-patterns?days=${days}`)
      const result = await response.json()

      if (result.success) {
        setInsights(result.insights)
        setDataPoints(result.dataPoints)
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  const formatInsights = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.trim().startsWith('##')) {
        return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('##', '').trim()}</h3>
      }
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return <li key={i} className="ml-4 mb-1">{line.replace(/^[-•]\s*/, '')}</li>
      }
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return <div key={i} className="font-semibold mt-3 mb-1">{line.replace(/\*\*/g, '')}</div>
      }
      if (line.trim()) {
        return <p key={i} className="mb-2">{line}</p>
      }
      return <br key={i} />
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            AI Insights
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Pattern analysis and personalized recommendations
          </p>
        </div>

        <div className="flex gap-2">
          {[7, 14, 30, 60].map(d => (
            <button
              key={d}
              onClick={() => {
                setDays(d)
                fetchInsights()
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                days === d
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>

        {dataPoints && (
          <div className="grid grid-cols-4 gap-4">
            <PremiumCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500">{dataPoints.painLogs}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Pain Logs</div>
              </div>
            </PremiumCard>
            <PremiumCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-success-500">{dataPoints.exerciseSessions}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Exercises</div>
              </div>
            </PremiumCard>
            <PremiumCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning-500">{dataPoints.spendingLogs}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Purchases</div>
              </div>
            </PremiumCard>
            <PremiumCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-danger-500">{dataPoints.alcoholLogs}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Alcohol Logs</div>
              </div>
            </PremiumCard>
          </div>
        )}

        <PremiumCard variant="glass">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-4">🧠</div>
              <div className="text-neutral-600 dark:text-neutral-400">
                Analyzing your patterns...
              </div>
            </div>
          ) : insights ? (
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-neutral-800 dark:text-neutral-200">
                {formatInsights(insights)}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-600 dark:text-neutral-400">
              No insights available yet. Keep tracking to build your data!
            </div>
          )}
        </PremiumCard>

        <Button onClick={fetchInsights} disabled={isLoading} className="w-full">
          {isLoading ? 'Analyzing...' : '🔄 Refresh Insights'}
        </Button>
      </div>
    </div>
  )
}