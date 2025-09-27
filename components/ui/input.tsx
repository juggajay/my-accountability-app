import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-700",
          "bg-white dark:bg-neutral-900 px-3 py-2 text-sm",
          "ring-offset-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:ring-offset-neutral-950",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }