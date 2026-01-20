import { useState, useEffect, useCallback } from 'react'
import {
  getCurrentUser,
  signOut as amplifySignOut,
  fetchAuthSession,
} from 'aws-amplify/auth'

interface AuthUser {
  userId: string
  email?: string
}

interface UseAuthReturn {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signOut: () => Promise<void>
  getAccessToken: () => Promise<string | null>
  checkAuth: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser({
        userId: currentUser.userId,
        email: currentUser.signInDetails?.loginId,
      })
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const signOut = async () => {
    try {
      await amplifySignOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.idToken?.toString() || null
    } catch {
      return null
    }
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    signOut,
    getAccessToken,
    checkAuth,
  }
}
