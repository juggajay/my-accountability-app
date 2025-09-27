'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { PainSlider } from '@/components/tracking/pain-slider'

export default function GenerateRoutinePage() {
  const [painLevel, setPainLevel] = useState(5)
  const [painLocation, setPainLocation] = useState('')
  const [energyLevel, setEnergyLevel] = useState(5)
  const [focus, setFocus] = useState<string>('pain_relief')
  const [duration, setDuration] = useState<string>('medium')
  const [isGenerating, setIsGenerating] = useState(false)
  const [routine, setRoutine] = useState<any>(null)

  const FOCUS_OPTIONS = [
    { id: 'pain_relief', label: 'Pain Relief', emoji: '🩹' },
    { id: 'mobility', label: 'Mobility', emoji: '🤸' },
    { id: 'strength', label: 'Strength', emoji: '💪' },
    { id: 'flexibility', label: 'Flexibility', emoji: '🧘' },
  ]

  const DURATION_OPTIONS = [
    { id: 'short', label: '5-10 min', emoji: '⚡' },
    { id: 'medium', label: '15-20 min', emoji: '⏱️' },
    { id: 'long', label: '30+ min', emoji: '🏃' },
  ]

  const handleGenerate = async () => {
    setIsGenerating(true)
    setRoutine(null)

    try {
      const response = await fetch('/api/ai/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          painLevel,
          painLocation: painLocation.trim() || undefined,
          energyLevel,
          preferences: {
            duration,
            focus,
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        setRoutine(result.data)
      } else {
        console.error('Generation failed:', result.error)
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            AI Exercise Generator
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Get a personalized routine based on your current state
          </p>
        </div>

        <PremiumCard variant="glass">
          <div className="space-y-6">
            <h2 className="text-xl font-bold">How are you feeling?</h2>

            <div>
              <PainSlider
                value={painLevel}
                onChange={setPainLevel}
                label="Current Pain Level"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Pain Location (Optional)</label>
              <input
                type="text"
                value={painLocation}
                onChange={(e) => setPainLocation(e.target.value)}
                placeholder="e.g., lower back, shoulders, knees"
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
            </div>

            <div>
              <PainSlider
                value={energyLevel}
                onChange={setEnergyLevel}
                label="Energy Level"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Focus Area</label>
              <div className="grid grid-cols-4 gap-2">
                {FOCUS_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFocus(opt.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      focus === opt.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="text-xs">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDuration(opt.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      duration === opt.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="text-xs">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? 'Generating...' : '✨ Generate Routine'}
            </Button>
          </div>
        </PremiumCard>

        {routine && (
          <PremiumCard variant="gradient">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{routine.routine_name}</h2>
                  <div className="flex gap-4 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <span>⏱️ {routine.duration_minutes} minutes</span>
                    <span>📊 Difficulty: {routine.difficulty}/5</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <div className="font-medium mb-1">Why this routine?</div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300">
                  {routine.rationale}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold">Exercises</h3>
                {routine.exercises.map((exercise: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-white dark:bg-neutral-900/50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{i + 1}. {exercise.name}</h4>
                      <span className="text-sm text-neutral-500">
                        {Math.floor(exercise.duration_seconds / 60)}:{(exercise.duration_seconds % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {exercise.instructions}
                    </p>
                    <div className="text-xs text-success-600 dark:text-success-400 mb-1">
                      💡 {exercise.benefits}
                    </div>
                    {exercise.modifications && (
                      <div className="text-xs text-neutral-500">
                        🔄 Modification: {exercise.modifications}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button className="w-full">
                Start This Routine
              </Button>
            </div>
          </PremiumCard>
        )}
      </div>
    </div>
  )
}