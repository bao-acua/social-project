export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordValidation {
  strength: PasswordStrength
  score: number
  feedback: string
  isValid: boolean
}

export function validatePassword(password: string): PasswordValidation {
  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      feedback: 'Password is required',
      isValid: false,
    }
  }

  let score = 0
  const feedback: string[] = []

  // Length check
  if (password.length >= 8) {
    score += 1
  } else if (password.length >= 6) {
    score += 0.5
    feedback.push('Use at least 8 characters')
  } else {
    feedback.push('Password must be at least 6 characters')
  }

  // Contains lowercase
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add lowercase letters')
  }

  // Contains uppercase
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add uppercase letters')
  }

  // Contains number
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Add numbers')
  }

  // Contains special character
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add special characters')
  }

  // Determine strength
  let strength: PasswordStrength
  if (score >= 4.5) {
    strength = 'strong'
  } else if (score >= 3) {
    strength = 'good'
  } else if (score >= 2) {
    strength = 'fair'
  } else {
    strength = 'weak'
  }

  // Password is valid if length is at least 6 and score is at least 2
  const isValid = password.length >= 6 && score >= 2

  return {
    strength,
    score,
    feedback: feedback.length > 0 ? feedback.join(', ') : 'Password looks good!',
    isValid,
  }
}

export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500'
    case 'fair':
      return 'bg-orange-500'
    case 'good':
      return 'bg-yellow-500'
    case 'strong':
      return 'bg-green-500'
  }
}

export function getStrengthTextColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'text-red-500'
    case 'fair':
      return 'text-orange-500'
    case 'good':
      return 'text-yellow-500'
    case 'strong':
      return 'text-green-500'
  }
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username) {
    return { isValid: false, error: 'Username is required' }
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' }
  }

  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters and numbers' }
  }

  return { isValid: true }
}
