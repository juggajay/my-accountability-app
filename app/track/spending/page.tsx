'use client'

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

const CATEGORIES = [
  { id: 'food', label: 'Food', emoji: '🍔' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'subscriptions', label: 'Subscriptions', emoji: '📱' },
  { id: 'health', label: 'Health', emoji: '💊' },
  { id: 'other', label: 'Other', emoji: '💰' },
]

const EMOTIONS = [
  { id: 'happy', emoji: '😊' },
  { id: 'sad', emoji: '😢' },
  { id: 'stressed', emoji: '😰' },
  { id: 'neutral', emoji: '😑' },
  { id: 'anxious', emoji: '😟' },
  { id: 'bored', emoji: '😐' },
]

export default function SpendingTrackingPage() {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [description, setDescription] = useState('')
  const [emotion, setEmotion] = useState('neutral')
  const [isImpulse, setIsImpulse] = useState(false)
  const [isPlanned, setIsPlanned] = useState(true)
  const [necessity, setNecessity] = useState(3)
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [monthlyLogs, setMonthlyLogs] = useState<any[]>([])

  useEffect(() => {
    fetchMonthlyLogs()
  }, [])

  const fetchMonthlyLogs = async () => {
    try {
      const response = await fetch('/api/tracking/spending?days=30')
      const result = await response.json()
      if (result.success) {
        setMonthlyLogs(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return

    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/tracking/spending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description: description.trim() || undefined,
          emotion,
          was_impulse: isImpulse,
          was_planned: isPlanned,
          necessity_score: necessity,
          notes: notes.trim() || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSaveMessage('✅ Logged successfully!')
        setAmount('')
        setDescription('')
        setNotes('')
        setIsImpulse(false)
        setIsPlanned(true)
        setNecessity(3)
        fetchMonthlyLogs()
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

  const totalSpent = monthlyLogs.reduce((sum, log) => sum + (log.amount || 0), 0)
  const impulseSpent = monthlyLogs.filter(log => log.was_impulse).reduce((sum, log) => sum + (log.amount || 0), 0)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Spending Tracker
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>

        {saveMessage && (
          <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100">
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <PremiumCard>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Spent</div>
            <div className="text-3xl font-bold text-primary-500">${totalSpent.toFixed(2)}</div>
            <div className="text-xs text-neutral-500">{monthlyLogs.length} transactions</div>
          </PremiumCard>
          <PremiumCard variant="gradient">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Impulse Spending</div>
            <div className="text-3xl font-bold text-warning-500">${impulseSpent.toFixed(2)}</div>
            <div className="text-xs text-neutral-500">
              {totalSpent > 0 ? Math.round((impulseSpent / totalSpent) * 100) : 0}% of total
            </div>
          </PremiumCard>
        </div>

        <PremiumCard variant="glass">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold">Log Purchase</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-neutral-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full pl-10 pr-4 py-3 text-2xl font-bold rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
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
              <label className="block text-sm font-medium mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you buy?"
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">How were you feeling?</label>
              <div className="flex gap-2 justify-between">
                {EMOTIONS.map(emo => (
                  <button
                    key={emo.id}
                    type="button"
                    onClick={() => setEmotion(emo.id)}
                    className={`text-4xl transition-all ${
                      emotion === emo.id ? 'scale-125' : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    {emo.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPlanned}
                  onChange={(e) => setIsPlanned(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300"
                />
                <span className="text-sm">Planned purchase</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isImpulse}
                  onChange={(e) => setIsImpulse(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300"
                />
                <span className="text-sm text-warning-600">Impulse buy</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Necessity (1-5): {necessity}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={necessity}
                onChange={(e) => setNecessity(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Want</span>
                <span>Need</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any thoughts about this purchase?"
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 resize-none"
              />
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Log Purchase'}
            </Button>
          </form>
        </PremiumCard>

        {monthlyLogs.length > 0 && (
          <PremiumCard>
            <h3 className="font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-2">
              {monthlyLogs.slice(0, 10).map(log => (
                <div key={log.id} className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <div>
                    <div className="font-medium">{log.description || log.category}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {format(new Date(log.logged_at), 'MMM d, h:mm a')}
                      {log.was_impulse && <span className="ml-2 text-warning-600">⚡ Impulse</span>}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-primary-500">${log.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}
      </div>
    </div>
  )
}