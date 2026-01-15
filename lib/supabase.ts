import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for client-side operations (read-only for public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Types
export interface Paragraph {
  id: string
  content: string
  created_at: string
  drift_level: number
  sequence: number
}

export interface StoryState {
  id: string
  current_drift: number
  motifs: string[]
  last_update: string | null
  last_paragraph_id: string | null
}
