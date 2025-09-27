'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const PAIN_LEVELS = [
  { value: 0, emoji: '😊', label: 'No Pain', color: 'text-success-500' },
  { value: 1, emoji: '🙂', label: 'Minimal', color: 'text-success-400' },
  { value: 2, emoji: '😌', label: 'Mild', color: 'text-success-300' },
  { value: 3, emoji: '😐', label: 'Noticeable', color: 'text-warning-500' },
  { value: 4, emoji: '😕', label: 'Moderate', color: 'text-warning-400' },
  { value: 5, emoji: '😣', label: 'Distracting', color: 'text-warning-300' },
  { value: 6, emoji: '😖', label: 'Distressing', color: 'text-danger-500' },
  { value: 7, emoji: '😫', label: 'Intense', color: 'text-danger-400' },
  { value: 8, emoji: '😩', label: 'Severe', color: 'text-danger-300' },
  { value: 9, emoji: '😭', label: 'Unbearable', color: 'text-danger-200' },
  { value: 10, emoji: '🥵', label: 'Worst', color: 'text-danger-100' },
]

interface PainSliderProps {
  value: number
  onChange: (value: number) => void
  label?: string
  className?: string
}

export function PainSlider({ value, onChange, label, className }: PainSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const currentLevel = PAIN_LEVELS[value]

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      
      <div className="text-center space-y-2">
        <div className={cn('text-6xl transition-transform duration-200', isDragging && 'scale-110')}>
          {currentLevel.emoji}
        </div>
        <div>
          <div className="text-3xl font-bold tabular-nums">
            {value}
          </div>
          <div className={cn('text-sm font-medium', currentLevel.color)}>
            {currentLevel.label}
          </div>
        </div>
      </div>

      <div className="relative pt-8">
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-6
                     [&::-webkit-slider-thumb]:h-6
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-primary-500
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-medium
                     [&::-webkit-slider-thumb]:transition-all
                     [&::-webkit-slider-thumb]:hover:scale-110
                     [&::-moz-range-thumb]:w-6
                     [&::-moz-range-thumb]:h-6
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-primary-500
                     [&::-moz-range-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:shadow-medium
                     [&::-moz-range-thumb]:transition-all
                     [&::-moz-range-thumb]:hover:scale-110"
        />
        
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-neutral-400">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  )
}