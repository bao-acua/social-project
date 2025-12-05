'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FormField } from '@/components/form-field'
import { PasswordStrengthIndicator } from '@/components/password-strength-indicator'
import { useAuth } from '@/context/auth-context'
import { getErrorMessage } from '@/lib/error-utils'
import { ErrorMessage } from '@/components/error-message'
import { validatePassword, validateUsername } from '@/lib/password-utils'

function SelectRole({ role, setRole }: { role: string, setRole: (role: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="role">Role</Label>
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger id="role">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function RegisterForm() {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [rePasswordError, setRePasswordError] = useState('')
  const router = useRouter()
  const { register } = useAuth()

  // Validate username in real-time
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)

    if (value) {
      const validation = validateUsername(value)
      setUsernameError(validation.isValid ? '' : validation.error || '')
    } else {
      setUsernameError('')
    }
  }

  // Validate re-password in real-time
  const handleRePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRePassword(value)

    if (value && password) {
      setRePasswordError(value !== password ? 'Passwords do not match' : '')
    } else {
      setRePasswordError('')
    }
  }

  // Check if password is valid
  const passwordValidation = useMemo(() => validatePassword(password), [password])

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const usernameValidation = validateUsername(username)
    return (
      username.trim() !== '' &&
      usernameValidation.isValid &&
      fullName.trim() !== '' &&
      password !== '' &&
      passwordValidation.isValid &&
      rePassword !== '' &&
      password === rePassword
    )
  }, [username, fullName, password, rePassword, passwordValidation.isValid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Final validation before submit
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.isValid) {
      setError(usernameValidation.error || 'Invalid username')
      return
    }

    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }

    if (!passwordValidation.isValid) {
      setError('Password is not strong enough')
      return
    }

    if (password !== rePassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await register(username, fullName, password, role)
      router.push('/timeline')
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', err)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create a new account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="username"
            label="Username"
            type="text"
            placeholder="Enter your username (letters and numbers only)"
            value={username}
            onChange={handleUsernameChange}
            error={usernameError}
          />
          <FormField
            id="fullName"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <div className="space-y-3">
            <FormField
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPasswordToggle={true}
            />
            {password && <PasswordStrengthIndicator password={password} />}
          </div>
          <FormField
            id="rePassword"
            label="Re-enter Password"
            type="password"
            placeholder="Re-enter your password"
            value={rePassword}
            onChange={handleRePasswordChange}
            error={rePasswordError}
            showPasswordToggle={true}
          />
          <SelectRole role={role} setRole={setRole} />

          {error && <ErrorMessage error={error} />}
          <Button type="submit" className="w-full" disabled={!isFormValid}>
            Sign Up
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
