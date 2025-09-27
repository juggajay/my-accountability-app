'use client'

import Link from 'next/link'
import { PremiumCard } from '@/components/ui/premium-card'
import type { Exercise } from '@/lib/types'

interface ExerciseCardProps {
  exercise: Exercise
}

const DIFFICULTY_LABELS = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Moderate',
  4: 'Intermediate',
  5: 'Advanced',
}

const DIFFICULTY_COLORS = {
  1: 'text-success-500',
  2: 'text-success-400',
  3: 'text-warning-500',
  4: 'text-danger-400',
  5: 'text-danger-500',
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const difficultyLabel = DIFFICULTY_LABELS[exercise.difficulty as keyof typeof DIFFICULTY_LABELS] || 'Unknown'
  const difficultyColor = DIFFICULTY_COLORS[exercise.difficulty as keyof typeof DIFFICULTY_COLORS] || 'text-neutral-500'
  const durationMinutes = Math.ceil(exercise.duration_seconds / 60)

  return (
    <Link href={`/exercises/${exercise.id}`}>
      <PremiumCard className="hover:scale-105 transition-transform cursor-pointer h-full">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
              {exercise.name}
            </h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 ${difficultyColor}`}>
              {difficultyLabel}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="text-primary-500">⏱</span>
              {durationMinutes}m
            </span>
            <span className="capitalize">{exercise.category}</span>
          </div>

          {exercise.benefits && exercise.benefits.length > 0 && (
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                {exercise.benefits[0]}
              </p>
            </div>
          )}

          {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {exercise.equipment_needed.slice(0, 3).map((item, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </PremiumCard>
    </Link>
  )
}