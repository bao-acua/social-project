'use client'

import { validatePassword, getStrengthTextColor, type PasswordValidation } from '@/lib/password-utils'
import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const validation: PasswordValidation = validatePassword(password)
  const { strength, feedback, score } = validation

  // Determine how many segments should be filled (out of 4)
  const getFilledSegments = () => {
    if (score >= 4.5) return 4 // Strong
    if (score >= 3) return 3   // Good
    if (score >= 2) return 2   // Fair
    return 1                    // Weak
  }

  const filledSegments = getFilledSegments()

  // Get color for each segment based on how many are filled
  const getSegmentColor = (index: number) => {
    if (index >= filledSegments) return 'bg-gray-200'

    // All filled segments use the strength color
    switch (strength) {
      case 'weak':
        return 'bg-red-500'
      case 'fair':
        return 'bg-orange-500'
      case 'good':
        return 'bg-yellow-500'
      case 'strong':
        return 'bg-green-500'
      default:
        return 'bg-gray-200'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password strength:</span>
        <span className={cn('text-sm font-medium capitalize', getStrengthTextColor(strength))}>
          {strength}
        </span>
      </div>

      {/* Segmented strength indicator */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              'h-2 flex-1 rounded-full transition-all duration-300',
              getSegmentColor(index)
            )}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {feedback}
      </p>
    </div>
  )
}
