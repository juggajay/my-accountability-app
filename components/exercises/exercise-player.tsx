'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PremiumCard } from '@/components/ui/premium-card'
import type { Exercise } from '@/lib/types'

interface ExercisePlayerProps {
  exercise: Exercise
  onComplete: (feedback: SessionFeedback) => void
}

export interface SessionFeedback {
  pain_before: number
  pain_after: number
  energy_before: number
  energy_after: number
  effectiveness_rating: number
  notes?: string
}

export function ExercisePlayer({ exercise, onComplete }: ExercisePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(exercise.duration_seconds)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  
  const [painBefore, setPainBefore] = useState(5)
  const [painAfter, setPainAfter] = useState(5)
  const [energyBefore, setEnergyBefore] = useState(5)
  const [energyAfter, setEnergyAfter] = useState(5)
  const [effectiveness, setEffectiveness] = useState(3)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false)
            setShowFeedback(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, timeRemaining])

  const handleStart = () => {
    setSessionStarted(true)
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleResume = () => {
    setIsPlaying(true)
  }

  const handleComplete = () => {
    const feedback: SessionFeedback = {
      pain_before: painBefore,
      pain_after: painAfter,
      energy_before: energyBefore,
      energy_after: energyAfter,
      effectiveness_rating: effectiveness,
      notes: notes.trim() || undefined,
    }
    onComplete(feedback)
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  if (showFeedback) {
    return (
      <PremiumCard variant="glass">
        <h3 className="text-2xl font-bold mb-6">How did it go?</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Pain After</label>
            <input
              type="range"
              min="0"
              max="10"
              value={painAfter}
              onChange={(e) => setPainAfter(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-2xl font-bold text-warning-500">{painAfter}/10</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Energy After</label>
            <input
              type="range"
              min="0"
              max="10"
              value={energyAfter}
              onChange={(e) => setEnergyAfter(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-2xl font-bold text-success-500">{energyAfter}/10</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Effectiveness (1-5)</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setEffectiveness(rating)}
                  className={`text-3xl transition-transform ${
                    effectiveness >= rating ? 'scale-125' : 'opacity-30'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did this exercise feel?"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            />
          </div>

          <Button onClick={handleComplete} className="w-full">
            Complete Session
          </Button>
        </div>
      </PremiumCard>
    )
  }

  return (
    <PremiumCard variant="glass">
      {!sessionStarted ? (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Before You Start</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Current Pain Level</label>
            <input
              type="range"
              min="0"
              max="10"
              value={painBefore}
              onChange={(e) => setPainBefore(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-2xl font-bold text-warning-500">{painBefore}/10</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Energy Level</label>
            <input
              type="range"
              min="0"
              max="10"
              value={energyBefore}
              onChange={(e) => setEnergyBefore(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-2xl font-bold text-success-500">{energyBefore}/10</div>
          </div>

          <Button onClick={handleStart} className="w-full">
            Start Exercise
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-7xl font-bold tabular-nums text-primary-500">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 mt-2">
              {Math.round((1 - timeRemaining / exercise.duration_seconds) * 100)}% Complete
            </div>
          </div>

          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-1000"
              style={{ width: `${(1 - timeRemaining / exercise.duration_seconds) * 100}%` }}
            />
          </div>

          <div className="flex gap-4">
            {isPlaying ? (
              <Button onClick={handlePause} variant="secondary" className="flex-1">
                Pause
              </Button>
            ) : (
              <Button onClick={handleResume} className="flex-1">
                Resume
              </Button>
            )}
            <Button
              onClick={() => setShowFeedback(true)}
              variant="secondary"
              className="flex-1"
            >
              Finish Early
            </Button>
          </div>
        </div>
      )}
    </PremiumCard>
  )
}