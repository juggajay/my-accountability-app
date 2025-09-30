import { PremiumCard } from '@/components/ui/premium-card'
import { MetricDisplay } from '@/components/ui/metric-display'
import { ProgressRing } from '@/components/ui/progress-ring'
import { ProactiveInsights } from '@/components/ai/ProactiveInsights'
import { getDailyLog, getWeekLogs, getRecentExerciseSessions, getActiveGoals, getRecentInsights } from '@/lib/supabase/queries'
import { calculateRecoveryScore, calculateStreak, calculateTrend, getTimeOfDay, getDayCount } from '@/lib/utils'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  const [
    todayLog,
    weekLogs,
    recentSessions,
    activeGoals,
    recentInsights
  ] = await Promise.all([
    getDailyLog(today),
    getWeekLogs(sevenDaysAgo),
    getRecentExerciseSessions(7),
    getActiveGoals(3),
    getRecentInsights(3)
  ])
  
  const painAverage = weekLogs.reduce((acc, log) => acc + (log.morning_pain || 0), 0) / (weekLogs.length || 1)
  const exerciseStreak = calculateStreak(recentSessions)
  const recoveryScore = calculateRecoveryScore(todayLog, weekLogs)
  
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Premium gradient header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
        
        <div className="relative px-6 py-8">
          <h1 className="text-3xl font-sans font-bold text-neutral-900 dark:text-white">
            Good {getTimeOfDay()}!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {format(new Date(), 'EEEE, MMMM d')} • Day {getDayCount()} of recovery
          </p>
        </div>
      </div>
      
      <div className="px-6 -mt-4 pb-8 space-y-6">
        {/* Recovery Score Overview */}
        <PremiumCard variant="glass">
          <h2 className="text-lg font-semibold mb-4">Today&apos;s Recovery Score</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <ProgressRing 
                progress={recoveryScore.overall} 
                color="primary" 
                label="Overall" 
              />
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing 
                progress={recoveryScore.energy} 
                color="success" 
                label="Energy" 
              />
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing 
                progress={recoveryScore.painFree} 
                color="warning" 
                label="Pain Free" 
              />
            </div>
          </div>
        </PremiumCard>
        
        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <PremiumCard variant="metric">
            <MetricDisplay
              label="Pain Level"
              value={todayLog?.morning_pain || '-'}
              unit="/10"
              trend={todayLog?.morning_pain ? calculateTrend(todayLog.morning_pain, painAverage) : undefined}
              color={todayLog?.morning_pain && todayLog.morning_pain < 5 ? 'success' : 'warning'}
            />
          </PremiumCard>

          <PremiumCard variant="metric">
            <MetricDisplay
              label="Exercise Streak"
              value={exerciseStreak}
              unit="days"
              trend={exerciseStreak > 3 ? 10 : 0}
              color="primary"
            />
          </PremiumCard>
        </div>

        {/* Proactive AI Insights */}
        <ProactiveInsights />

        {/* Active Goals */}
        {activeGoals && activeGoals.length > 0 && (
          <PremiumCard>
            <h3 className="text-lg font-semibold mb-4">Active Goals</h3>
            <div className="space-y-3">
              {activeGoals.map(goal => (
                <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Priority {goal.priority}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-500">{goal.progress_percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}
        
        {/* Recent Insights */}
        {recentInsights && recentInsights.length > 0 && (
          <PremiumCard variant="gradient">
            <h3 className="text-lg font-semibold mb-4">💡 Recent Insights</h3>
            <div className="space-y-3">
              {recentInsights.map(insight => (
                <div key={insight.id} className="p-3 rounded-lg bg-white/50 dark:bg-neutral-900/50">
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{insight.description}</p>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}
        
        {/* Getting Started Message */}
        {!todayLog && (
          <PremiumCard variant="gradient">
            <h3 className="text-lg font-semibold mb-2">Welcome to Your Accountability Journey!</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Start by logging your morning pain level and energy to get personalized insights and exercise routines.
            </p>
          </PremiumCard>
        )}
      </div>
    </div>
  )
}