'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PremiumCard } from '@/components/ui/PremiumCard'
import { Apple, Flame, TrendingUp, Clock, Camera } from 'lucide-react'

interface NutritionSummary {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  meal_count: number
  water_intake: number
}

interface FoodLog {
  id: string
  meal_type: string
  description: string
  calories: number
  protein: number | null
  carbs: number | null
  fat: number | null
  logged_at: string
  photo_url: string | null
}

export function NutritionDashboard() {
  const [summary, setSummary] = useState<NutritionSummary | null>(null)
  const [recentMeals, setRecentMeals] = useState<FoodLog[]>([])
  const [goals, setGoals] = useState({
    daily_calorie_goal: 2000,
    protein_goal: 150,
    carb_goal: 200,
    fat_goal: 65,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNutritionData()
  }, [])

  async function loadNutritionData() {
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      // Load today's summary
      const { data: summaryData } = await supabase
        .from('daily_nutrition_summary')
        .select('*')
        .eq('date', today)
        .single()

      if (summaryData) {
        setSummary(summaryData)
      }

      // Load nutrition goals
      const { data: goalsData } = await supabase
        .from('nutrition_goals')
        .select('*')
        .single()

      if (goalsData) {
        setGoals(goalsData)
      }

      // Load recent meals
      const { data: mealsData } = await supabase
        .from('food_logs')
        .select('*')
        .gte('logged_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('logged_at', { ascending: false })
        .limit(10)

      if (mealsData) {
        setRecentMeals(mealsData)
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-white/5 rounded-2xl" />
        <div className="h-96 bg-white/5 rounded-2xl" />
      </div>
    )
  }

  const calorieProgress = summary
    ? (summary.total_calories / goals.daily_calorie_goal) * 100
    : 0
  const proteinProgress = summary
    ? (summary.total_protein / goals.protein_goal) * 100
    : 0
  const carbProgress = summary ? (summary.total_carbs / goals.carb_goal) * 100 : 0
  const fatProgress = summary ? (summary.total_fat / goals.fat_goal) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <PremiumCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Apple className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Today's Nutrition</h2>
              <p className="text-sm text-white/60">
                {summary?.meal_count || 0} meals logged
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {summary?.total_calories || 0}
            </div>
            <div className="text-sm text-white/60">
              / {goals.daily_calorie_goal} cal
            </div>
          </div>
        </div>

        {/* Macros Progress */}
        <div className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-white">Calories</span>
              </div>
              <span className="text-sm text-white/60">
                {summary?.total_calories || 0} / {goals.daily_calorie_goal}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(calorieProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">Protein</span>
              <span className="text-sm text-white/60">
                {summary?.total_protein.toFixed(0) || 0}g / {goals.protein_goal}g
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(proteinProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">Carbs</span>
              <span className="text-sm text-white/60">
                {summary?.total_carbs.toFixed(0) || 0}g / {goals.carb_goal}g
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(carbProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">Fat</span>
              <span className="text-sm text-white/60">
                {summary?.total_fat.toFixed(0) || 0}g / {goals.fat_goal}g
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(fatProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Recent Meals */}
      <PremiumCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Recent Meals</h2>
        </div>

        {recentMeals.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No meals logged yet</p>
            <p className="text-sm text-white/40 mt-2">
              Upload a photo or describe your meal to the AI
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  {meal.photo_url && (
                    <img
                      src={meal.photo_url}
                      alt={meal.description}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80">
                        {meal.meal_type}
                      </span>
                      <span className="text-xs text-white/40">
                        {new Date(meal.logged_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-white mb-2">{meal.description}</p>
                    <div className="flex gap-4 text-xs text-white/60">
                      <span>{meal.calories} cal</span>
                      {meal.protein && <span>{meal.protein.toFixed(0)}g protein</span>}
                      {meal.carbs && <span>{meal.carbs.toFixed(0)}g carbs</span>}
                      {meal.fat && <span>{meal.fat.toFixed(0)}g fat</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>
    </div>
  )
}