import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    console.log('Creating new Supabase client instance');
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { 
        persistSession: true,
        storageKey: 'supabase.auth.token',  // Use a consistent storage key
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
};

// Export supabase directly for backward compatibility
export const supabase = getSupabase();

// Export Admin client for convenience
export const supabaseAdmin = supabase;

// Expose a function to clear the instance (mainly for testing)
export const clearSupabaseInstance = () => {
  supabaseInstance = null;
}; 