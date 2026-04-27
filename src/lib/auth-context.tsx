'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<{ error?: string }>
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => ({}),
  signInWithEmail: async () => ({}),
  signUpWithEmail: async () => ({}),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupabase().auth.getUser().then((res) => {
      setUser(res.data.user)
      setLoading(false)
    })

    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) return { error: error.message }
    return {}
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) return { error: error.message }
    // session이 즉시 생성되면 confirm 불필요. 아니면 메일 확인 필요.
    if (!data.session && data.user) return { needsConfirmation: true }
    return {}
  }

  const signOut = async () => {
    await getSupabase().auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
