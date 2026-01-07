// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('='.repeat(50))
console.log('🔍 SUPABASE CONNECTION TEST')
console.log('='.repeat(50))
console.log('URL definida:', !!supabaseUrl)
console.log('URL valor:', supabaseUrl)
console.log('KEY definida:', !!supabaseAnonKey)
console.log('KEY primeros chars:', supabaseAnonKey?.substring(0, 30))
console.log('='.repeat(50))

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 🔧 EXPONER EN WINDOW PARA TESTING (solo desarrollo)
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase
}

console.log('✅ Cliente de Supabase creado')

export type UserRole = 'admin' | 'coordinador' | 'instructor' | 'asistente'

export interface UserProfile {
  id: string
  nombres: string
  email: string
  rol: UserRole
  telefono?: string
  avatar_url?: string
  documento?: string
  area?: string
  is_active: boolean
  created_at: string
  updated_at: string
}