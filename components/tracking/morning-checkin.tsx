'use client'

import { useState } from 'react'
import { PainSlider } from './pain-slider'
import { Button } from '@/components/ui/button'
import { PremiumCard } from '@/components/ui/premium-card'

interface MorningCheckInProps {
  onSubmit: (data: MorningCheckInData) => Promise<void>
  initialData?: Partial<MorningCheckInData>
}

export interface MorningCheckInData {
  morning_pain: number
  morning_energy: number
  morning_mood: number
  notes?: string
}

export function MorningCheckIn({ onSubmit, initialData }: MorningCheckInProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pain, setPain] = useState(initialData?.morning_pain ?? 5)
  const [energy, setEnergy] = useState(initialData?.morning_energy ?? 5)
  const [mood, setMood] = useState(initialData?.morning_mood ?? 5)
  const [notes, setNotes] = useState(initialData?.notes ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSubmit({
        morning_pain: pain,
        morning_energy: energy,
        morning_mood: mood,
        notes: notes.trim() || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PremiumCard variant="glass">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Good Morning! ☀️</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            How are you feeling today?
          </p>
        </div>

        <PainSlider
          label="Pain Level"
          value={pain}
          onChange={setPain}
        />

        <div className="space-y-4">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Energy Level
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value))}
            className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-6
                       [&::-webkit-slider-thumb]:h-6
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-success-500
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:shadow-medium
                       [&::-moz-range-thumb]:w-6
                       [&::-moz-range-thumb]:h-6
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-success-500
                       [&::-moz-range-thumb]:cursor-pointer
                       [&::-moz-range-thumb]:border-0"
          />
          <div className="text-center">
            <span className="text-2xl font-bold tabular-nums text-success-500">{energy}</span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">/10</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Mood
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={mood}
            onChange={(e) => setMood(parseInt(e.target.value))}
            className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-6
                       [&::-webkit-slider-thumb]:h-6
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-primary-500
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:shadow-medium
                       [&::-moz-range-thumb]:w-6
                       [&::-moz-range-thumb]:h-6
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-primary-500
                       [&::-moz-range-thumb]:cursor-pointer
                       [&::-moz-range-thumb]:border-0"
          />
          <div className="text-center">
            <span className="text-2xl font-bold tabular-nums text-primary-500">{mood}</span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">/10</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you sleep? Any specific concerns?"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700
                       bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100
                       placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : 'Save Morning Check-In'}
        </Button>
      </form>
    </PremiumCard>
  )
}