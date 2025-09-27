'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ExercisePlayer, SessionFeedback } from '@/components/exercises/exercise-player'
import { PremiumCard } from '@/components/ui/premium-card'
import type { Exercise } from '@/lib/types'

export default function ExerciseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPlayer, setShowPlayer] = useState(false)

  useEffect(() => {
    fetchExercise()
  }, [params.id])

  const fetchExercise = async () => {
    try {
      const response = await fetch(`/api/exercises/${params.id}`)
      const result = await response.json()
      if (result.success) {
        setExercise(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch exercise:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async (feedback: SessionFeedback) => {
    try {
      const response = await fetch('/api/exercises/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: params.id,
          duration_minutes: Math.ceil((exercise?.duration_seconds || 0) / 60),
          completed_exercises: [{ name: exercise?.name, duration: exercise?.duration_seconds }],
          ...feedback,
        }),
      })

      if (response.ok) {
        router.push('/exercises?completed=true')
      }
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading exercise...</p>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">Exercise not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <button
          onClick={() => router.push('/exercises')}
          className="text-primary-500 hover:text-primary-600 flex items-center gap-2"
        >
          ← Back to Library
        </button>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            {exercise.name}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-neutral-600 dark:text-neutral-400">
            <span className="capitalize">{exercise.category}</span>
            <span>•</span>
            <span>Difficulty: {exercise.difficulty}/5</span>
            <span>•</span>
            <span>{Math.ceil(exercise.duration_seconds / 60)} minutes</span>
          </div>
        </div>

        {showPlayer ? (
          <ExercisePlayer exercise={exercise} onComplete={handleComplete} />
        ) : (
          <>
            <PremiumCard>
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <ol className="space-y-3 list-decimal list-inside">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="text-neutral-700 dark:text-neutral-300">
                    {step}
                  </li>
                ))}
              </ol>
            </PremiumCard>

            {exercise.benefits && exercise.benefits.length > 0 && (
              <PremiumCard variant="gradient">
                <h2 className="text-xl font-semibold mb-4">✨ Benefits</h2>
                <ul className="space-y-2">
                  {exercise.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-success-500 mt-1">✓</span>
                      <span className="text-neutral-700 dark:text-neutral-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </PremiumCard>
            )}

            {exercise.contraindications && exercise.contraindications.length > 0 && (
              <PremiumCard>
                <h2 className="text-xl font-semibold mb-4 text-warning-600">⚠️ Important</h2>
                <ul className="space-y-2">
                  {exercise.contraindications.map((warning, i) => (
                    <li key={i} className="text-neutral-700 dark:text-neutral-300">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </PremiumCard>
            )}

            <button
              onClick={() => setShowPlayer(true)}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
            >
              Start Exercise
            </button>
          </>
        )}
      </div>
    </div>
  )
}