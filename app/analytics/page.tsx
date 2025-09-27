'use client'

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30)
  const [painData, setPainData] = useState<any[]>([])
  const [spendingData, setSpendingData] = useState<any[]>([])
  const [alcoholData, setAlcoholData] = useState<any[]>([])
  const [exerciseData, setExerciseData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const [pain, spending, alcohol, exercise] = await Promise.all([
        fetch(`/api/tracking/pain?days=${timeRange}`).then(r => r.json()),
        fetch(`/api/tracking/spending?days=${timeRange}`).then(r => r.json()),
        fetch(`/api/tracking/alcohol?days=${timeRange}`).then(r => r.json()),
        fetch(`/api/exercises/session?days=${timeRange}`).then(r => r.json()),
      ])

      if (pain.success) {
        const formatted = pain.data.map((log: any) => ({
          date: format(new Date(log.log_date), 'MMM d'),
          pain: log.morning_pain,
          energy: log.morning_energy,
          mood: log.morning_mood,
        })).reverse()
        setPainData(formatted)
      }

      if (spending.success) {
        const categoryTotals = spending.data.reduce((acc: any, log: any) => {
          acc[log.category] = (acc[log.category] || 0) + log.amount
          return acc
        }, {})
        
        const formatted = Object.entries(categoryTotals).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: Number(value),
        }))
        setSpendingData(formatted)
      }

      if (alcohol.success) {
        const weeklyData = alcohol.data.reduce((acc: any, log: any) => {
          const week = format(new Date(log.logged_at), 'MMM d')
          if (!acc[week]) acc[week] = 0
          acc[week] += log.units
          return acc
        }, {})
        
        const formatted = Object.entries(weeklyData).map(([date, units]) => ({
          date,
          units: Number(units),
        }))
        setAlcoholData(formatted.slice(-10))
      }

      if (exercise.success) {
        const formatted = exercise.data.map((session: any) => ({
          date: format(new Date(session.completed_at), 'MMM d'),
          painBefore: session.pain_before,
          painAfter: session.pain_after,
          effectiveness: session.effectiveness_rating,
        })).reverse()
        setExerciseData(formatted)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#ec4899']

  const totalSpending = spendingData.reduce((sum, item) => sum + item.value, 0)
  const avgPain = painData.length > 0 
    ? (painData.reduce((sum, item) => sum + (item.pain || 0), 0) / painData.length).toFixed(1)
    : 0
  const avgEnergy = painData.length > 0
    ? (painData.reduce((sum, item) => sum + (item.energy || 0), 0) / painData.length).toFixed(1)
    : 0
  const totalExercises = exerciseData.length

  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-neutral-400 mt-2">Track your progress over time</p>
          </div>

          <div className="flex gap-2">
            {[7, 14, 30, 60, 90].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === days
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-neutral-400">
            Loading analytics...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <PremiumCard>
                <div className="text-sm text-neutral-400">Avg Pain Level</div>
                <div className="text-3xl font-bold text-primary-400 mt-1">{avgPain}/10</div>
                <div className="text-xs text-neutral-500 mt-1">Last {timeRange} days</div>
              </PremiumCard>

              <PremiumCard>
                <div className="text-sm text-neutral-400">Avg Energy</div>
                <div className="text-3xl font-bold text-success-400 mt-1">{avgEnergy}/10</div>
                <div className="text-xs text-neutral-500 mt-1">Last {timeRange} days</div>
              </PremiumCard>

              <PremiumCard>
                <div className="text-sm text-neutral-400">Total Spending</div>
                <div className="text-3xl font-bold text-warning-400 mt-1">${totalSpending.toFixed(0)}</div>
                <div className="text-xs text-neutral-500 mt-1">Last {timeRange} days</div>
              </PremiumCard>

              <PremiumCard>
                <div className="text-sm text-neutral-400">Exercise Sessions</div>
                <div className="text-3xl font-bold text-primary-400 mt-1">{totalExercises}</div>
                <div className="text-xs text-neutral-500 mt-1">Last {timeRange} days</div>
              </PremiumCard>
            </div>

            {painData.length > 0 && (
              <PremiumCard>
                <h2 className="text-xl font-bold mb-4 text-white">Pain, Energy & Mood Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={painData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="date" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
                      labelStyle={{ color: '#fafafa' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="pain" stroke="#ef4444" name="Pain" strokeWidth={2} />
                    <Line type="monotone" dataKey="energy" stroke="#22c55e" name="Energy" strokeWidth={2} />
                    <Line type="monotone" dataKey="mood" stroke="#0ea5e9" name="Mood" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </PremiumCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spendingData.length > 0 && (
                <PremiumCard>
                  <h2 className="text-xl font-bold mb-4 text-white">Spending by Category</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={spendingData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {spendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </PremiumCard>
              )}

              {alcoholData.length > 0 && (
                <PremiumCard>
                  <h2 className="text-xl font-bold mb-4 text-white">Alcohol Consumption</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={alcoholData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis dataKey="date" stroke="#a3a3a3" />
                      <YAxis stroke="#a3a3a3" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
                      />
                      <Bar dataKey="units" fill="#eab308" name="Units" />
                    </BarChart>
                  </ResponsiveContainer>
                </PremiumCard>
              )}
            </div>

            {exerciseData.length > 0 && (
              <PremiumCard>
                <h2 className="text-xl font-bold mb-4 text-white">Exercise Effectiveness</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={exerciseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="date" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="painBefore" stroke="#ef4444" name="Pain Before" strokeWidth={2} />
                    <Line type="monotone" dataKey="painAfter" stroke="#22c55e" name="Pain After" strokeWidth={2} />
                    <Line type="monotone" dataKey="effectiveness" stroke="#0ea5e9" name="Rating" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </PremiumCard>
            )}
          </>
        )}
      </div>
    </div>
  )
}