'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className
}: SliderProps) {
  const percentage = ((value[0] - min) / (max - min)) * 100
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([Number(e.target.value)])
  }
  
  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div className="relative w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
        <div 
          className="absolute h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="absolute w-full h-2 opacity-0 cursor-pointer"
      />
      <div 
        className="absolute w-5 h-5 bg-white dark:bg-neutral-900 border-2 border-primary-500 rounded-full shadow-md transition-all"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  )
}