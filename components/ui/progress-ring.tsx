'use client'

import { cn } from '@/lib/utils'
import type { ColorVariant } from '@/lib/types'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: ColorVariant
  showPercentage?: boolean
  label?: string
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  color = 'primary',
  showPercentage = true,
  label 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  
  const colors = {
    primary: 'stroke-primary-500',
    success: 'stroke-success-500',
    warning: 'stroke-warning-500',
    danger: 'stroke-danger-500'
  }
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-neutral-200 dark:text-neutral-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={cn(colors[color], 'transition-all duration-700 ease-out')}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      
      <div className="absolute flex flex-col items-center">
        {showPercentage && (
          <span className="text-2xl font-bold tabular-nums">
            {progress}%
          </span>
        )}
        {label && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}