'use client'

import { useState, useEffect } from 'react'
import { MorningCheckIn, MorningCheckInData } from '@/components/tracking/morning-checkin'
import { PremiumCard } from '@/components/ui/premium-card'
import { format } from 'date-fns'

export default function PainTrackingPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [todayLog, setTodayLog] = useState<any>(null)

  useEffect(() => {
    fetchTodayLog()
  }, [])

  const fetchTodayLog = async () => {
    try {
      const response = await fetch('/api/tracking/pain?days=1')
      const result = await response.json()
      if (result.success && result.data.length > 0) {
        setTodayLog(result.data[0])
      }
    } catch (error) {
      console.error('Failed to fetch today log:', error)
    }
  }

  const handleSubmit = async (data: MorningCheckInData) => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/tracking/pain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setSaveMessage('✅ Saved successfully!')
        setTodayLog(result.data)
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Pain Tracking
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {saveMessage && (
          <div className="mb-4 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100">
            {saveMessage}
          </div>
        )}

        <MorningCheckIn
          onSubmit={handleSubmit}
          initialData={todayLog}
        />

        {todayLog && (
          <PremiumCard className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Today&apos;s Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Pain</p>
                <p className="text-2xl font-bold text-warning-500">{todayLog.morning_pain}/10</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Energy</p>
                <p className="text-2xl font-bold text-success-500">{todayLog.morning_energy}/10</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Mood</p>
                <p className="text-2xl font-bold text-primary-500">{todayLog.morning_mood}/10</p>
              </div>
            </div>
          </PremiumCard>
        )}
      </div>
    </div>
  )
}