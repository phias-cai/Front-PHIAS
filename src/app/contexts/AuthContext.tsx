// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { supabase, UserProfile, UserRole } from '../../lib/supabase'

export type { UserRole }

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  profile: UserProfile
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isFetchingRef = useRef(false)

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    // Prevenir fetches concurrentes
    if (isFetchingRef.current) {
      console.log('⏭️ [FetchProfile] Ya hay fetch en progreso, omitiendo...')
      return null
    }

    isFetchingRef.current = true
    
    try {
      console.log('🔍 [FetchProfile] Iniciando para userId:', userId)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('📊 [FetchProfile] Resultado:', {
        hasProfile: !!profile,
        hasError: !!error,
        errorCode: error?.code,
        errorMsg: error?.message,
        profileEmail: profile?.email
      })

      if (error) {
        console.error('❌ [FetchProfile] Error:', error)
        isFetchingRef.current = false
        return null
      }

      if (!profile) {
        console.error('❌ [FetchProfile] No profile returned')
        isFetchingRef.current = false
        return null
      }

      console.log('✅ [FetchProfile] Success:', profile.email)

      const userProfile = {
        id: profile.id,
        name: profile.nombres,
        email: profile.email,
        role: profile.rol,
        avatar: profile.avatar_url,
        profile: profile
      }

      isFetchingRef.current = false
      return userProfile
    } catch (error) {
      console.error('❌ [FetchProfile] Exception:', error)
      isFetchingRef.current = false
      return null
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) return false

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id)
        if (userProfile) {
          setUser(userProfile)
          return true
        }
      }

      return false
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    supabase.auth.signOut()
    setUser(null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          if (profile) setUser(profile)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          if (profile) setUser(profile)
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}