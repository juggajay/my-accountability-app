'use client'

import { useState, useEffect } from 'react'
import { ExerciseCard } from '@/components/exercises/exercise-card'
import { PremiumCard } from '@/components/ui/premium-card'
import type { Exercise } from '@/lib/types'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏋️' },
  { id: 'stretching', label: 'Stretching', icon: '🧘' },
  { id: 'core', label: 'Core', icon: '💪' },
  { id: 'strengthening', label: 'Strength', icon: '🏋️' },
  { id: 'mobility', label: 'Mobility', icon: '🤸' },
  { id: 'balance', label: 'Balance', icon: '⚖️' },
]

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchExercises()
  }, [])

  useEffect(() => {
    filterExercises()
  }, [exercises, selectedCategory, searchTerm])

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises')
      const result = await response.json()
      if (result.success) {
        setExercises(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterExercises = () => {
    let filtered = exercises

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(term) ||
        ex.category.toLowerCase().includes(term)
      )
    }

    setFilteredExercises(filtered)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Exercise Library
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {exercises.length} exercises for sciatica recovery
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700
                       bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100
                       placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-medium'
                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PremiumCard key={i} className="h-48 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
            ))}
          </div>
        ) : filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map(exercise => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        ) : (
          <PremiumCard className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400">
              No exercises found. Try a different category or search term.
            </p>
          </PremiumCard>
        )}
      </div>
    </div>
  )
}