import { User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin, getSupabase } from './supabaseClient';

// These URLs are now derived from the supabaseClient
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

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

// Function to get all files uploaded by a user
export async function getUserFiles(userId: string) {
  try {
    console.log('Fetching files for user:', userId);
    
    // First fetch the file metadata from the files table
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logSupabaseError('Error fetching user files', error);
      return [];
    }

    // Enhance file entries with complete URLs and any additional storage info
    if (data && data.length > 0) {
      return data.map(file => ({
        ...file,
        // Add any additional transformations or computed properties here
        created_at_formatted: file.created_at ? new Date(file.created_at as string).toLocaleString() : 'Unknown date'
      }));
    }

    return data || [];
  } catch (err) {
    console.error('Exception in getUserFiles:', err);
    return [];
  }
}

// Function to delete a user file
export async function deleteUserFile(fileId: string, filePath: string) {
  try {
    // First delete file from storage
    const { error: storageError } = await supabase.storage
      .from('user_files')
      .remove([filePath]);
      
    if (storageError) {
      logSupabaseError('Error deleting file from storage', storageError);
      throw storageError;
    }
    
    // Then remove the file record from the database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
      
    if (dbError) {
      logSupabaseError('Error deleting file record from database', dbError);
      throw dbError;
    }
    
    return true;
  } catch (err) {
    console.error('Exception in deleteUserFile:', err);
    throw err;
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
    console.log('Signing in with email', { email, rememberMe });
    
    // Use the singleton Supabase client instead of creating a new one
    const supabaseClient = getSupabase();
    
    // Use the client for sign in
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logSupabaseError('Error signing in', error);
      throw error;
    }

    console.log('Sign in successful');
    return data;
  } catch (err) {
    console.error('Exception in signInWithEmail:', err);
    throw err;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    // Use the singleton client
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
    // Use the singleton client
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
    
    if (!userId) {
      console.warn('No user ID provided for getUserPlan, defaulting to free plan');
      return { plan: 'free' };
    }
    
    // Get the supabase instance
    const supabaseClient = getSupabase();
    
    // Make the request with proper headers
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      // Check for 406 Not Acceptable, which could indicate RLS policy issue
      if (error.code === '406' || error.message?.includes('406')) {
        console.warn('Received 406 Not Acceptable error - likely missing RLS policy');
        
        // Attempt to ensure the policy exists (this will mostly just log what needs to be done)
        await ensureSubscriptionPolicy();
        
        // Log a message suggesting how to fix it
        console.warn('⚠️ You need to set up proper RLS policies in your Supabase dashboard');
        console.warn('Use the SQL in the logs above to create the necessary policy');
        
        return { plan: 'free' };
      }
      
      // If no subscription found, return free plan
      if (error.code === 'PGRST116' || isEmptyError(error)) {
        console.log('No active subscription found or empty error, defaulting to free plan');
        return { plan: 'free' };
      }
      
      // Log the specific error details to help debug
      console.error('Subscription error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      logSupabaseError('Error fetching subscription', error);
      return { plan: 'free' };
    }

    // Validate the data returned
    if (!data || !data.plan) {
      console.warn('Subscription data is missing plan information, defaulting to free plan');
      return { plan: 'free' };
    }

    console.log('Successfully retrieved subscription plan:', data.plan);
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
    // First check if we already have a valid session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('Valid session already exists');
      return true;
    }
    
    // Check if we have a pending login flag
    const pendingLogin = typeof window !== 'undefined' && localStorage.getItem('userLoginPending') === 'true';
    
    // Helper function to get cookies by name
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
          return cookie.substring(name.length + 1);
        }
      }
      return null;
    };
    
    // Get the storage key that Supabase uses - should be consistent with supabaseClient
    const getStorageKey = () => {
      // Try the consistent key from supabaseClient first
      const standardKey = 'supabase.auth.token';
      // Fallback to the old format if needed
      const legacyKey = 'sb-' + supabaseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') + '-auth-token';
      
      // Check which key exists in localStorage
      if (localStorage.getItem(standardKey)) {
        return standardKey;
      }
      return legacyKey;
    };
    
    // Check for auth_user_id cookie as alternative auth method
    const authUserIdCookie = getCookie('auth_user_id');
    
    if (pendingLogin || authUserIdCookie) {
      console.log('Attempting to restore session from backup sources');
      
      // Try restore from localStorage first
      const storageKey = getStorageKey();
      const storedSession = localStorage.getItem(storageKey);
      
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
            
            if (!error) {
              console.log('Session successfully restored from localStorage');
              localStorage.removeItem('userLoginPending'); // Clear the pending flag
              return true;
            } else {
              console.error('Failed to restore session from localStorage:', error);
            }
          }
        } catch (e) {
          console.error('Error parsing stored session:', e);
        }
      } else {
        console.log('No stored session found in localStorage');
      }
      
      // If we have a user ID from cookie but couldn't restore session,
      // try clearing everything and re-routing back to login for a fresh start
      if (authUserIdCookie) {
        console.log('Found auth_user_id cookie, redirecting to login for session recovery');
        
        // Clear existing auth state
        await supabase.auth.signOut();
        
        // Clear local storage items that might be causing conflict
        if (typeof window !== 'undefined') {
          // Store the user ID for recovery
          localStorage.setItem('recoveringSession', authUserIdCookie);
          
          // Redirect to login for full authentication
          if (!window.location.pathname.includes('/login')) {
            // Refresh the singleton instance before navigating
            import('./supabaseClient').then(({ clearSupabaseInstance, getSupabase }) => {
              clearSupabaseInstance();
              getSupabase(); // This will create a fresh instance
              window.location.href = `/login?recover=${authUserIdCookie}`;
            });
            return true; // Return true to prevent further processing
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in ensureSessionRestored:', error);
    return false;
  }
}

// Add a function to detect and prevent localStorage clearing
export function detectLocalStorageClearing() {
  if (typeof window === 'undefined') return;
  
  console.log('Setting up localStorage protection');
  
  // Track which extension might be clearing storage
  const originalClear = localStorage.clear;
  const originalRemoveItem = localStorage.removeItem;
  const originalSetItem = localStorage.setItem;
  
  // Create a backup variable in memory
  const tokenBackup = {
    key: '',
    value: ''
  };
  
  // Get the storage key that Supabase uses - should be consistent with supabaseClient
  const getStorageKey = () => {
    // Try the consistent key from supabaseClient first
    const standardKey = 'supabase.auth.token';
    // Fallback to the old format if needed
    const legacyKey = 'sb-' + supabaseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') + '-auth-token';
    
    // Check which key exists in localStorage
    if (localStorage.getItem(standardKey)) {
      return standardKey;
    }
    return legacyKey;
  };
  
  // Save the auth token in a memory backup if it gets set
  localStorage.setItem = function(key: string, value: string) {
    const result = originalSetItem.call(localStorage, key, value);
    
    // If this is the auth token, back it up
    if (key === 'supabase.auth.token' || (key.includes('sb-') && key.includes('-auth-token'))) {
      console.log('Backing up auth token in memory');
      tokenBackup.key = key;
      tokenBackup.value = value;
      
      // Also set a cookie to ensure we don't lose the auth
      try {
        const userData = JSON.parse(value);
        document.cookie = `auth_user_id=${userData.user.id}; path=/; max-age=86400`;
      } catch (e) {
        console.error('Failed to set auth cookie from token:', e);
      }
    }
    
    return result;
  };
  
  localStorage.clear = function() {
    console.warn('localStorage.clear detected - this may interfere with authentication');
    console.trace('Storage clear stack trace');
    
    const result = originalClear.call(localStorage);
    
    // Restore the auth token if we have a backup
    if (tokenBackup.key && tokenBackup.value) {
      console.log('Restoring auth token from memory backup');
      originalSetItem.call(localStorage, tokenBackup.key, tokenBackup.value);
      
      // Also set a cookie to ensure we don't lose the auth
      try {
        const userData = JSON.parse(tokenBackup.value);
        document.cookie = `auth_user_id=${userData.user.id}; path=/; max-age=86400`;
      } catch (e) {
        console.error('Failed to set auth cookie from backup:', e);
      }
    }
    
    return result;
  };
  
  localStorage.removeItem = function(key: string) {
    // If removing our auth token, log it but still allow it to be removed
    if (key === 'supabase.auth.token' || (key.includes('sb-') && key.includes('-auth-token'))) {
      console.warn(`Removing auth token: ${key} - This might be intentional for logout`);
    } else {
      console.log('Removing localStorage item:', key);
    }
    
    return originalRemoveItem.call(localStorage, key);
  };
  
  // Set up observer to watch for localStorage changes
  let cleanupCounter = 0;
  
  const observer = new MutationObserver(() => {
    const storageKey = getStorageKey();
    const hasAuthToken = localStorage.getItem(storageKey);
    
    if (!hasAuthToken && tokenBackup.key && tokenBackup.value) {
      cleanupCounter++;
      console.log(`Auth token was cleared (${cleanupCounter} times), attempting to restore from backup`);
      
      // Restore from backup
      originalSetItem.call(localStorage, tokenBackup.key, tokenBackup.value);
      
      // Also set a cookie for middleware authentication
      try {
        const userData = JSON.parse(tokenBackup.value);
        document.cookie = `auth_user_id=${userData.user.id}; path=/; max-age=86400`;
      } catch (e) {
        console.error('Failed to set auth cookie:', e);
      }
      
      // If too many clearings, trigger a page refresh to get a fresh authentication state
      if (cleanupCounter >= 3) {
        console.warn('Multiple localStorage cleanups detected, refreshing to reinitialize session');
        // Use the singleton approach to clear and re-create the instance
        import('./supabaseClient').then(({ clearSupabaseInstance, getSupabase }) => {
          clearSupabaseInstance();
          getSupabase(); // This will create a fresh instance
          setTimeout(() => window.location.reload(), 500);
        });
      }
    }
  });
  
  // Start observing
  observer.observe(document, { childList: true, subtree: true });
}

// Function to check if the required RLS policies exist for a specific table
export async function checkTablePolicies(tableName: string) {
  try {
    // This requires admin privileges, so use with caution
    const { data, error } = await supabaseAdmin
      .rpc('check_table_policies', { table_name: tableName })
      .select('*');
    
    if (error) {
      console.error(`Failed to check policies for ${tableName}:`, error);
      return null;
    }
    
    // Filter for the specific table policies
    return data;
  } catch (err) {
    console.error(`Exception checking policies for ${tableName}:`, err);
    return null;
  }
}

// Function to ensure the required RLS policy for subscriptions exists
export async function ensureSubscriptionPolicy() {
  try {
    // First check if we already have proper policies
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('count(*)')
      .limit(1);
      
    if (!error) {
      console.log('Subscription table access works - policy may already exist');
      return true;
    }
    
    // If we get a 406 error, it likely means we need to add a policy
    console.log('Attempting to create subscription policy');
    
    // This SQL statement should be run by someone with admin access
    const sql = `
      BEGIN;
      -- Enable RLS on subscriptions table if not already enabled
      ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for users to read their own subscriptions if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'subscriptions' 
          AND policyname = 'Users can read their own subscriptions'
        ) THEN
          CREATE POLICY "Users can read their own subscriptions" 
          ON public.subscriptions
          FOR SELECT 
          USING (auth.uid() = user_id);
        END IF;
      END
      $$;
      COMMIT;
    `;
    
    // This would require service role access, not available in client
    console.log('SQL to run in Supabase Dashboard:', sql);
    
    return false;
  } catch (err) {
    console.error('Exception in ensureSubscriptionPolicy:', err);
    return false;
  }
} 