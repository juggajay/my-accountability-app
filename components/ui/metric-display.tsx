import { cn } from '@/lib/utils'
import type { ColorVariant } from '@/lib/types'

interface MetricDisplayProps {
  label: string
  value: number | string
  unit?: string
  trend?: number
  color?: ColorVariant
}

export function MetricDisplay({ 
  label, 
  value, 
  unit, 
  trend, 
  color = 'primary' 
}: MetricDisplayProps) {
  const colors = {
    primary: 'text-primary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    danger: 'text-danger-500'
  }
  
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent 
                      rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-4">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          {label}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className={cn('text-3xl font-bold tabular-nums', colors[color])}>
            {value}
          </span>
          {unit && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {unit}
            </span>
          )}
          {trend !== undefined && trend !== 0 && (
            <span className={cn(
              'text-xs font-medium',
              trend > 0 ? 'text-success-500' : 'text-danger-500'
            )}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}