import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createElement } from 'react'
import type { User } from '@supabase/supabase-js'
import { getCurrentUser, onAuthChange, signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut } from '../lib/api/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, emoji?: string, color?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u)
      setLoading(false)
    }).catch(() => setLoading(false))

    const { data: { subscription } } = onAuthChange(u => {
      setUser(u)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    await apiSignIn(email, password)
  }

  const signUp = async (email: string, password: string, name: string, emoji?: string, color?: string) => {
    await apiSignUp(email, password, name, emoji, color)
  }

  const signOut = async () => {
    await apiSignOut()
  }

  return createElement(
    AuthContext.Provider,
    { value: { user, loading, signIn, signUp, signOut } },
    children,
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
