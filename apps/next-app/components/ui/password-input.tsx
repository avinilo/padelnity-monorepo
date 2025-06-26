"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PasswordInputProps extends React.ComponentProps<"input"> {
  error?: string
  success?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, success, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          <input
            type="password"
            className={cn(
              "flex h-14 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm box-border",
              error && "border-red-500 focus-visible:ring-red-500",
              success && !error && "border-green-500 focus-visible:ring-green-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        <div className="mt-1 min-h-[16px]">
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput } 