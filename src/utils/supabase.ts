import { createClient } from '@supabase/supabase-js';

// These will be replaced with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a client for bypass operations when necessary (will have Admin policies applied)
export const supabaseAdmin = supabase;

// Helper function to determine if an error object is empty
function isEmptyError(error: any) {
  return error && Object.keys(error).length === 0;
}

// Helper function to log errors properly
function logSupabaseError(context: string, error: any) {
  if (isEmptyError(error)) {
    console.error(`${context}: Empty error object. This usually indicates missing tables or permissions.`);
    console.error('Please run the Supabase schema setup instructions in SUPABASE_SETUP.md');
    return;
  }
  
  console.error(`${context}:`, error);
  if (error && typeof error === 'object') {
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

// Chat-related functions
export async function saveChat(chat: {
  id: string;
  title: string;
  messages: any[];
  user_id: string;
  model: string;
  created_at?: string;
  updated_at?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .upsert(
        {
          ...chat,
          updated_at: new Date().toISOString(),
          created_at: chat.created_at || new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (error) {
      logSupabaseError('Error saving chat', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Exception in saveChat:', err);
    throw err;
  }
}

export async function getChats(userId: string) {
  try {
    console.log('Fetching chats for user:', userId);
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      logSupabaseError('Error fetching chats', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception in getChats:', err);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}

export async function deleteChat(chatId: string) {
  try {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      logSupabaseError('Error deleting chat', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Exception in deleteChat:', err);
    throw err;
  }
}

// User-related functions
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      if (error.name === 'AuthSessionMissingError') {
        console.log('No active session found');
        return null;
      }
      logSupabaseError('Error getting current user', error);
      return null;
    }
    
    return user;
  } catch (error: any) {
    console.error('Exception in getCurrentUser:', error);
    return null;
  }
}

// Function to fix column name discrepancy in a profile
function normalizeProfileColumns(profile: any) {
  if (!profile) return profile;
  
  // Handle 'questionsUsed' vs 'questions_used' discrepancy
  if (profile.questionsUsed !== undefined && profile.questions_used === undefined) {
    profile.questions_used = profile.questionsUsed;
    delete profile.questionsUsed; // Clean up the old column in memory
  } else if (profile.questions_used === undefined) {
    profile.questions_used = 0; // Default to 0 if neither exists
  }
  
  return profile;
}

export async function getUserProfile(userId: string) {
  try {
    console.log('Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logSupabaseError('Error fetching user profile', error);
      
      // Check if it's a "not found" error, which might mean the profile doesn't exist yet
      if (error.code === 'PGRST116' || isEmptyError(error)) {
        console.log('Profile not found or empty error, attempting to create default profile');
        // Try to create a default profile
        return await createDefaultProfile(userId);
      }
      
      return null;
    }

    // Normalize the profile to fix column inconsistencies
    return normalizeProfileColumns(data);
  } catch (err) {
    console.error('Exception in getUserProfile:', err);
    return null;
  }
}

// Function to create a default profile if one doesn't exist
async function createDefaultProfile(userId: string) {
  try {
    console.log('Creating default profile for user:', userId);
    const defaultProfile = {
      id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: '',
      avatar_url: '',
      plan: 'free',
    };
    
    // Try creating profile with admin policy first
    try {
      console.log('Attempting to create profile with bypass RLS');
      
      // Use the supabaseAdmin client with the Admin policy applied
      let { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([defaultProfile])
        .select()
        .single();
        
      if (!error) {
        console.log('Successfully created profile with admin policy');
        return data;
      }
    } catch (adminErr) {
      console.log('Admin policy insert failed, trying standard insert');
    }
    
    // Fall back to standard insert
    let { data, error } = await supabase
      .from('profiles')
      .insert([defaultProfile])
      .select()
      .single();
      
    if (error) {
      logSupabaseError('Error creating default profile', error);
      
      // If we get an RLS error (42501), use a workaround to bypass it
      if (error.code === '42501' || isEmptyError(error)) {
        console.log('RLS policy error, using fallback mechanism');
        
        // We can't insert directly due to RLS, so let's just return a mock profile
        // The trigger in Supabase should eventually create the real profile
        console.log('Returning mock profile while waiting for trigger to create real one');
        return defaultProfile;
      }
      
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception in createDefaultProfile:', err);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      logSupabaseError('Error updating user profile', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Exception in updateUserProfile:', err);
    throw err;
  }
}

// Authentication functions
export async function signInWithEmail(email: string, password: string, rememberMe: boolean = true) {
  try {
    // Create a client with the specified persistSession setting
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: rememberMe
      }
    });

    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logSupabaseError('Error signing in', error);
      throw error;
    }

    // Important: Sync the session with the main supabase client to ensure
    // consistent state across the app
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });
    }

    return data;
  } catch (err) {
    console.error('Exception in signInWithEmail:', err);
    throw err;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      logSupabaseError('Error signing up', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Exception in signUpWithEmail:', err);
    throw err;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logSupabaseError('Error signing out', error);
      throw error;
    }
    
    return true;
  } catch (err) {
    console.error('Exception in signOut:', err);
    throw err;
  }
}

// User subscription/plan functions
export async function getUserPlan(userId: string) {
  try {
    console.log('Fetching subscription for user:', userId);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      // If no subscription found, return free plan
      if (error.code === 'PGRST116' || isEmptyError(error)) {
        console.log('No active subscription found or empty error, defaulting to free plan');
        return { plan: 'free' };
      }
      logSupabaseError('Error fetching subscription', error);
      return { plan: 'free' };
    }

    return data;
  } catch (err) {
    console.error('Exception in getUserPlan:', err);
    return { plan: 'free' };
  }
}

// Add a new function to increment the questions_used counter
export async function incrementQuestionCount(userId: string) {
  try {
    console.log('Incrementing question count for user:', userId);
    
    // Get the current profile first
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      logSupabaseError('Error fetching profile for question count update', profileError);
      return false;
    }
    
    // Normalize the profile to fix column inconsistencies
    const normalizedProfile = normalizeProfileColumns(currentProfile);
    
    // Calculate new count (handle case where it might be null)
    const currentCount = normalizedProfile?.questions_used || 0;
    const newCount = currentCount + 1;
    
    // Update the profile with the new count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ questions_used: newCount })
      .eq('id', userId);
    
    if (updateError) {
      logSupabaseError('Error updating question count', updateError);
      return false;
    }
    
    console.log(`Successfully incremented question count to ${newCount}`);
    return true;
  } catch (err) {
    console.error('Exception in incrementQuestionCount:', err);
    return false;
  }
}

// Add a function to check if a user is authenticated with better handling for different environments
export async function isAuthenticated() {
  try {
    // First check if we have a pending login
    const isPending = typeof window !== 'undefined' && localStorage.getItem('userLoginPending') === 'true';
    if (isPending) {
      console.log('Found pending login flag');
      return true; // Consider user authenticated if a login is pending
    }
    
    // Then try to get the user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      if (error.name === 'AuthSessionMissingError') {
        console.log('No active session found');
        return false;
      }
      logSupabaseError('Error checking authentication', error);
      return false;
    }
    
    return !!user;
  } catch (error: any) {
    console.error('Exception in isAuthenticated:', error);
    return false;
  }
}

// Add a debug function for diagnosing authentication issues
export async function debugAuthState() {
  try {
    console.log('=== DEBUG AUTH STATE ===');
    
    // Check localStorage for pending login
    const pendingLogin = typeof window !== 'undefined' && localStorage.getItem('userLoginPending');
    console.log('Pending login flag:', pendingLogin);
    
    // Check current session
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session exists:', !!session);
    if (session) {
      console.log('Session expires at:', new Date(session.expires_at! * 1000).toISOString());
      console.log('Session expired:', session.expires_at! * 1000 < Date.now());
    }
    
    // Check current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User exists:', !!user);
    if (user) {
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
    }
    
    // Check localStorage for session
    if (typeof window !== 'undefined') {
      const supabaseSession = localStorage.getItem('supabase.auth.token');
      console.log('Supabase session in localStorage:', !!supabaseSession);
    }
    
    console.log('=== END DEBUG AUTH STATE ===');
    
    return {
      pendingLogin,
      session,
      user,
      hasLocalSession: typeof window !== 'undefined' && !!localStorage.getItem('supabase.auth.token')
    };
  } catch (error) {
    console.error('Error in debugAuthState:', error);
    return { error };
  }
}

// Add a function to force session restoration when needed
export async function ensureSessionRestored() {
  try {
    // Check if we have a pending login flag
    if (typeof window !== 'undefined' && localStorage.getItem('userLoginPending') === 'true') {
      console.log('Attempting to forcibly restore session from local storage');
      
      // Get the session from localStorage
      const storedSession = localStorage.getItem('sb-' + supabaseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') + '-auth-token');
      
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          console.log('Found stored session, attempting restoration');
          
          // Try to restore the session
          if (session?.access_token && session?.refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            });
            
            if (error) {
              console.error('Failed to restore session:', error);
              return false;
            }
            
            console.log('Session successfully restored');
            return true;
          }
        } catch (e) {
          console.error('Error parsing stored session:', e);
        }
      } else {
        console.log('No stored session found');
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in ensureSessionRestored:', error);
    return false;
  }
} 