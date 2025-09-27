import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface PremiumCardProps {
  variant?: 'default' | 'glass' | 'gradient' | 'metric'
  children: ReactNode
  className?: string
}

export function PremiumCard({ 
  variant = 'default', 
  children, 
  className 
}: PremiumCardProps) {
  const variants = {
    default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
    glass: 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-700/50',
    gradient: 'bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20',
    metric: 'bg-neutral-50 dark:bg-neutral-900/50 border-2 border-neutral-200 dark:border-neutral-800'
  }
  
  return (
    <div className={cn(
      'rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300',
      variants[variant],
      className
    )}>
      {children}
    </div>
  )
}