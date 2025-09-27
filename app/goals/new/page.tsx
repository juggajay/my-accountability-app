'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'

const CATEGORIES = [
  { id: 'health', label: 'Health', emoji: '💪' },
  { id: 'finance', label: 'Finance', emoji: '💰' },
  { id: 'personal', label: 'Personal', emoji: '🎯' },
  { id: 'career', label: 'Career', emoji: '🚀' },
]

export default function NewGoalPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('health')
  const [targetDate, setTargetDate] = useState('')
  const [priority, setPriority] = useState(3)
  const [milestones, setMilestones] = useState<Array<{ title: string; due_date: string }>>([])
  const [milestoneInput, setMilestoneInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const addMilestone = () => {
    if (milestoneInput.trim()) {
      setMilestones([...milestones, { title: milestoneInput.trim(), due_date: '', completed: false }])
      setMilestoneInput('')
    }
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          target_date: targetDate,
          priority,
          milestones: milestones.length > 0 ? milestones : undefined,
          progress_percentage: 0,
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push('/goals')
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <div>
          <button
            onClick={() => router.push('/goals')}
            className="text-primary-500 hover:text-primary-600 mb-4"
          >
            ← Back to Goals
          </button>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Create New Goal
          </h1>
        </div>

        <PremiumCard variant="glass">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Goal Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Run a 5K marathon"
                required
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What do you want to achieve and why?"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      category === cat.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="text-xs">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Date *</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Priority: {priority}
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`text-4xl transition-all ${
                      p <= priority ? 'scale-110' : 'opacity-30'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Milestones (Optional)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={milestoneInput}
                  onChange={(e) => setMilestoneInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                  placeholder="Add a milestone..."
                  className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Add
                </button>
              </div>
              {milestones.length > 0 && (
                <div className="space-y-2">
                  {milestones.map((milestone, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      <span>{milestone.title}</span>
                      <button
                        type="button"
                        onClick={() => removeMilestone(i)}
                        className="text-danger-500 hover:text-danger-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? 'Creating...' : 'Create Goal'}
            </Button>
          </form>
        </PremiumCard>
      </div>
    </div>
  )
}