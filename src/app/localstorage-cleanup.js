// Script to clean up localStorage and session storage to fix auth issues
export function cleanupLocalStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('Cleaning up localStorage from previous projects');
    // Keep only our app-specific items
    const keysToKeep = ['user', 'auth_successful'];
    
    // Create an array of keys to remove
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key) && 
          (key.includes('firestore') || 
           key.includes('firebase') || 
           key.includes('tax-insight-storage') || 
           key.includes('aureus'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove the problematic keys
    keysToRemove.forEach(key => {
      console.log('Removing localStorage item:', key);
      localStorage.removeItem(key);
    });
    
    return keysToRemove.length > 0;
  } catch (error) {
    console.error('Error cleaning up localStorage:', error);
    return false;
  }
}

// Function to reset all authentication related storage
export function resetAuthStorage() {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('🚨 EMERGENCY RESET: Clearing all auth-related storage');
    
    // Clear auth-related localStorage items
    const authItems = [
      'authenticated', 
      'auth_successful', 
      'auth_user_id',
      'user',
      'firebase:authUser:'
    ];
    
    // Find and remove auth items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // Check if the key contains any of the auth items
        if (authItems.some(item => key.includes(item))) {
          console.log('Removing auth localStorage item:', key);
          localStorage.removeItem(key);
        }
      }
    }
    
    // Clear all sessionStorage
    console.log('Clearing all sessionStorage');
    sessionStorage.clear();
    
    // Clear cookies
    console.log('Clearing all cookies');
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    
    console.log('🔄 Auth storage reset complete. Page should be reloaded.');
    return true;
  } catch (error) {
    console.error('Error resetting auth storage:', error);
    return false;
  }
}

// Emergency function to detect and break redirect loops
export function detectAndBreakRedirectLoop() {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check for recent page loads
    const now = Date.now();
    const lastLoad = parseInt(sessionStorage.getItem('last_page_load') || '0', 10);
    sessionStorage.setItem('last_page_load', now.toString());
    
    // Count number of page loads in the last few seconds
    const pageLoadCount = parseInt(sessionStorage.getItem('page_load_count') || '0', 10);
    sessionStorage.setItem('page_load_count', (pageLoadCount + 1).toString());
    
    // If page loaded within the last 1000ms, it's likely a loop
    // Or if we've loaded too many times in the last few seconds
    if ((lastLoad && (now - lastLoad < 1000)) || pageLoadCount > 5) {
      console.error('🚨 REDIRECT LOOP DETECTED! Breaking loop...');
      
      // First set a flag to prevent future redirects BEFORE resetting auth storage
      // This ensures even if resetAuthStorage fails, we have the flag set
      sessionStorage.setItem('loop_detected', 'true');
      sessionStorage.setItem('emergency_override', 'true');
      
      // Do a complete reset of auth storage
      resetAuthStorage();
      
      // Reset all redirect counter variables
      sessionStorage.removeItem('redirect_count');
      sessionStorage.removeItem('auth_check_count');
      
      // If we're on an auth page, redirect away from it to break the loop
      if (window.location.pathname.includes('/auth')) {
        console.log('Redirecting to home page to break loop');
        
        // Add a delay to ensure all storage changes are processed
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
        
        return true;
      }
    }
    
    // Reset the page load count after some time if no loop is detected
    setTimeout(() => {
      if (parseInt(sessionStorage.getItem('page_load_count') || '0') <= 5) {
        sessionStorage.setItem('page_load_count', '0');
      }
    }, 5000);
    
    return false;
  } catch (error) {
    console.error('Error detecting redirect loop:', error);
    return false;
  }
}
