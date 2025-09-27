'use client'

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

const DRINK_TYPES = [
  { id: 'beer', label: 'Beer', emoji: '🍺', defaultUnits: 1 },
  { id: 'wine', label: 'Wine', emoji: '🍷', defaultUnits: 1.5 },
  { id: 'spirits', label: 'Spirits', emoji: '🥃', defaultUnits: 1 },
  { id: 'cocktail', label: 'Cocktail', emoji: '🍹', defaultUnits: 2 },
]

const CONTEXTS = [
  { id: 'social', label: 'Social', emoji: '👥' },
  { id: 'stress', label: 'Stress', emoji: '😰' },
  { id: 'celebration', label: 'Celebration', emoji: '🎉' },
  { id: 'habit', label: 'Habit', emoji: '🔄' },
]

export default function AlcoholTrackingPage() {
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null)
  const [units, setUnits] = useState(1)
  const [context, setContext] = useState<string>('social')
  const [location, setLocation] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [weeklyLogs, setWeeklyLogs] = useState<any[]>([])

  useEffect(() => {
    fetchWeeklyLogs()
  }, [])

  const fetchWeeklyLogs = async () => {
    try {
      const response = await fetch('/api/tracking/alcohol?days=7')
      const result = await response.json()
      if (result.success) {
        setWeeklyLogs(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const handleDrinkSelect = (drinkId: string) => {
    setSelectedDrink(drinkId)
    const drink = DRINK_TYPES.find(d => d.id === drinkId)
    if (drink) {
      setUnits(drink.defaultUnits)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDrink) return

    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/tracking/alcohol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drink_type: selectedDrink,
          units,
          context,
          location: location.trim() || undefined,
          cost: cost ? parseFloat(cost) : undefined,
          notes: notes.trim() || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSaveMessage('✅ Logged successfully!')
        setSelectedDrink(null)
        setLocation('')
        setCost('')
        setNotes('')
        fetchWeeklyLogs()
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('❌ Failed to save')
      }
    } catch (error) {
      setSaveMessage('❌ Error saving data')
      console.error('Submit error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const totalUnitsThisWeek = weeklyLogs.reduce((sum, log) => sum + (log.units || 0), 0)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Alcohol Tracking
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {saveMessage && (
          <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100">
            {saveMessage}
          </div>
        )}

        <PremiumCard>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">This Week</h3>
            <div className="text-3xl font-bold text-primary-500">
              {totalUnitsThisWeek.toFixed(1)} <span className="text-lg text-neutral-500">units</span>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {weeklyLogs.length} drinks logged
            </div>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                totalUnitsThisWeek > 14 ? 'bg-danger-500' : totalUnitsThisWeek > 10 ? 'bg-warning-500' : 'bg-success-500'
              }`}
              style={{ width: `${Math.min((totalUnitsThisWeek / 14) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2">Recommended limit: 14 units/week</p>
        </PremiumCard>

        <PremiumCard variant="glass">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Quick Log</h2>
              <div className="grid grid-cols-2 gap-4">
                {DRINK_TYPES.map(drink => (
                  <button
                    key={drink.id}
                    type="button"
                    onClick={() => handleDrinkSelect(drink.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDrink === drink.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{drink.emoji}</div>
                    <div className="font-medium">{drink.label}</div>
                    <div className="text-xs text-neutral-500">{drink.defaultUnits} units</div>
                  </button>
                ))}
              </div>
            </div>

            {selectedDrink && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Units</label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={units}
                    onChange={(e) => setUnits(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-2xl font-bold text-primary-500">{units}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Context</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTEXTS.map(ctx => (
                      <button
                        key={ctx.id}
                        type="button"
                        onClick={() => setContext(ctx.id)}
                        className={`p-3 rounded-lg border transition-all ${
                          context === ctx.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        <span className="mr-2">{ctx.emoji}</span>
                        {ctx.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location (Optional)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Home, Bar, Restaurant..."
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cost (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any triggers or thoughts?"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 resize-none"
                  />
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? 'Saving...' : 'Log Drink'}
                </Button>
              </>
            )}
          </form>
        </PremiumCard>

        {weeklyLogs.length > 0 && (
          <PremiumCard>
            <h3 className="font-semibold mb-4">Recent Logs</h3>
            <div className="space-y-3">
              {weeklyLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <div>
                    <div className="font-medium capitalize">{log.drink_type}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {format(new Date(log.logged_at), 'MMM d, h:mm a')} • {log.context}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary-500">{log.units}</div>
                    <div className="text-xs text-neutral-500">units</div>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}
      </div>
    </div>
  )
}