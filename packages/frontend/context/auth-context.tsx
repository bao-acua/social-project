'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { trpc } from '@/lib/trpc'

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const

export interface User {
  id: string
  username: string
  fullName: string
  initials: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  register: (
    username: string,
    fullName: string,
    password: string,
    role: 'user' | 'admin'
  ) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEYS.USER)
  if (!stored) return null
  try {
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

function setStoredAuth(token: string, user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

function clearStoredAuth(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  const utils = trpc.useUtils()

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setStoredAuth(data.token, data.user)
      setUser(data.user)
      setHasToken(true)
      utils.auth.me.invalidate()
    },
  })

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setStoredAuth(data.token, data.user)
      setUser(data.user)
      setHasToken(true)
      utils.auth.me.invalidate()
    },
  })

  const {
    data: meData,
    isLoading: isMeLoading,
    error: meError,
  } = trpc.auth.me.useQuery(undefined, {
    enabled: hasToken && isInitialized,
    retry: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    const storedUser = getStoredUser()
    const token = getStoredToken()

    setHasToken(!!token)

    if (token && storedUser) {
      setUser(storedUser)
    } else if (token && !storedUser) {
      clearStoredAuth()
      setHasToken(false)
    }

    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    if (meError) {
      clearStoredAuth()
      setUser(null)
      setHasToken(false)
      return
    }

    if (meData) {
      const token = getStoredToken()
      if (token) {
        setStoredAuth(token, meData)
        setUser(meData)
      }
    }
  }, [meData, meError, isInitialized])

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        loginMutation.mutate(
          { username, password },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        )
      })
    },
    [loginMutation]
  )

  const register = useCallback(
    async (
      username: string,
      fullName: string,
      password: string,
      role: 'user' | 'admin' = 'user'
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        registerMutation.mutate(
          { username, password, fullName, role },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        )
      })
    },
    [registerMutation]
  )

  const logout = useCallback(() => {
    clearStoredAuth()
    setUser(null)
    setHasToken(false)
    utils.auth.me.reset()
  }, [utils])

  const isLoading = useMemo(
    () => !isInitialized || isMeLoading || loginMutation.isPending || registerMutation.isPending,
    [isInitialized, isMeLoading, loginMutation.isPending, registerMutation.isPending]
  )

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      register,
      isLoading,
    }),
    [user, login, logout, register, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

